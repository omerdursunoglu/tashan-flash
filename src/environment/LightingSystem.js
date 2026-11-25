import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class LightingSystem {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.dirLight = null;
    this.ambientLight = null;
    this.envMap = null;
    this.lanterns = [];
    this.currentMode = 'golden';

    this.initLights();
  }

  initLights() {
    // 1. Directional Sun/Moon Light
    this.dirLight = new THREE.DirectionalLight(0xffcaa0, 2.8);
    this.dirLight.position.set(-35, 24, -28);
    this.dirLight.castShadow = true;

    // Optimized high-performance 2048 shadow map
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 160;
    this.dirLight.shadow.camera.left = -55;
    this.dirLight.shadow.camera.right = 55;
    this.dirLight.shadow.camera.top = 55;
    this.dirLight.shadow.camera.bottom = -55;
    this.dirLight.shadow.bias = -0.0003;
    this.dirLight.shadow.normalBias = 0.03;

    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);

    // 2. Ambient Fill Light
    this.ambientLight = new THREE.AmbientLight(0x6e5238, 0.55);
    this.scene.add(this.ambientLight);

    // Set renderer settings (ToneMapping is handled in postprocessing pipeline)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.NoToneMapping;
  }

  async loadHDRI(url) {
    return new Promise((resolve) => {
      const loader = new RGBELoader();
      loader.load(
        url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          this.envMap = texture;
          this.scene.environment = texture;
          this.scene.background = texture;
          console.log('HDRI environment loaded.');
          resolve(texture);
        },
        undefined,
        (err) => {
          console.error('Failed to load HDRI:', err);
          // Fallback sky gradient
          this.scene.background = new THREE.Color(0xb59e82);
          resolve(null);
        }
      );
    });
  }

  registerLanterns(lanterns) {
    this.lanterns = lanterns || [];
    this.setTimeOfDay(this.currentMode);
  }

  setTimeOfDay(mode) {
    this.currentMode = mode;

    switch (mode) {
      case 'noon':
        // High noon bright daylight
        this.dirLight.color.setHex(0xfff5ea);
        this.dirLight.intensity = 3.2;
        this.dirLight.position.set(-15, 60, 15);
        this.ambientLight.color.setHex(0x758a9e);
        this.ambientLight.intensity = 0.65;
        this.renderer.toneMappingExposure = 1.0;

        // Dim lanterns during day
        this.lanterns.forEach(({ light }) => {
          if (light) light.intensity = 0.1;
        });
        break;

      case 'golden':
        // Warm afternoon golden hour (Default)
        this.dirLight.color.setHex(0xffc58f);
        this.dirLight.intensity = 2.8;
        this.dirLight.position.set(-35, 24, -28);
        this.ambientLight.color.setHex(0x6e5238);
        this.ambientLight.intensity = 0.55;
        this.renderer.toneMappingExposure = 1.1;

        // Warm subtle lantern glow
        this.lanterns.forEach(({ light }) => {
          if (light) light.intensity = 1.2;
        });
        break;

      case 'night':
        // Atmospheric twilight / night with glowing Ottoman lanterns
        this.dirLight.color.setHex(0x4a6282);
        this.dirLight.intensity = 0.45;
        this.dirLight.position.set(25, 35, 20);
        this.ambientLight.color.setHex(0x111622);
        this.ambientLight.intensity = 0.35;
        this.renderer.toneMappingExposure = 1.25;

        // Bright warm lanterns
        this.lanterns.forEach(({ light }) => {
          if (light) light.intensity = 3.5;
        });
        break;
    }
  }
}
