import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';

export class PostProcessingManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.composer = new EffectComposer(renderer, {
      depthBuffer: true,
      stencilBuffer: true,
      frameBufferType: THREE.HalfFloatType
    });

    // 1. Base Scene Render Pass with full depth write
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 2. N8AO Pass configured for safe rendering
    try {
      this.n8aoPass = new N8AOPostPass(scene, camera, window.innerWidth, window.innerHeight);
      this.n8aoPass.configuration.aoRadius = 1.8;
      this.n8aoPass.configuration.distanceFalloff = 1.0;
      this.n8aoPass.configuration.intensity = 1.0;
      this.n8aoPass.configuration.color = [0.0, 0.0, 0.0];
      this.n8aoPass.configuration.gammaCorrection = false;
      this.n8aoPass.enabled = false; // Enabled selectively after verifying depth buffer support
      this.composer.addPass(this.n8aoPass);
      console.log('N8AO ambient occlusion pass initialized.');
    } catch (e) {
      console.warn('N8AOPostPass setup warning:', e);
    }

    // 3. Bloom & Filmic Tone Mapping Effects
    const bloom = new BloomEffect({
      intensity: 0.25, // Subtle, realistic glare on lanterns
      luminanceThreshold: 0.90, // Only truly bright highlights bloom
      luminanceSmoothing: 0.15
    });

    const toneMapping = new ToneMappingEffect({
      mode: ToneMappingMode.ACES_FILMIC
    });

    const effectPass = new EffectPass(camera, bloom, toneMapping);
    this.composer.addPass(effectPass);
  }

  setSize(width, height) {
    this.composer.setSize(width, height);
    if (this.n8aoPass && this.n8aoPass.setSize) {
      this.n8aoPass.setSize(width, height);
    }
  }

  render() {
    this.composer.render();
  }
}
