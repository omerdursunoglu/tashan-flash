import * as THREE from 'three';
import { MaterialManager } from './materials/MaterialManager.js';
import { TashanComplex } from './architecture/TashanComplex.js';
import { LightingSystem } from './environment/LightingSystem.js';
import { PlayerController } from './physics/PlayerController.js';
import { PostProcessingManager } from './rendering/PostProcessing.js';

class TokatTashanApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.progressBar = document.getElementById('progress-bar');
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingStatus = document.getElementById('loading-status');
    this.fpsCounter = document.getElementById('fps-counter');

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.materialManager = null;
    this.tashanComplex = null;
    this.lighting = null;
    this.player = null;
    this.postProcessing = null;

    this.clock = new THREE.Clock();
    this.frameCount = 0;
    this.lastFpsUpdate = 0;

    // Viewpoint presets calibrated for architectural inspection (zero roll, upright eye-level)
    this.viewPresets = {
      portal: {
        pos: new THREE.Vector3(-48.0, 2.8, 0.0),
        target: new THREE.Vector3(-34.0, 3.8, 0.0),
        label: '1. Taçkapı Dış Cephe'
      },
      courtyard: {
        pos: new THREE.Vector3(-18.0, 1.70, 0.0),
        target: new THREE.Vector3(15.0, 3.8, 0.0),
        label: '2. Avlu & 2 Katlı Revaklar'
      },
      arcade: {
        pos: new THREE.Vector3(10.0, 1.70, -14.9),
        target: new THREE.Vector3(-15.0, 1.70, -14.9),
        label: '3. Zemin Kat Revak Koridoru'
      },
      balcony: {
        pos: new THREE.Vector3(-22.0, 6.30, -14.9),
        target: new THREE.Vector3(0.0, 2.0, 0.0),
        label: '4. Üst Kat Revak Balkonu'
      },
      stairs: {
        pos: new THREE.Vector3(-20.5, 1.70, -1.5),
        target: new THREE.Vector3(-24.7, 2.5, -8.0),
        label: '5. Taş Merdiven ve Duvar Yakın Planı'
      }
    };
  }

  async init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );

    // Initial position in central courtyard looking towards fountain and East arcade
    this.camera.position.set(-15, 1.70, 0);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting System
    this.lighting = new LightingSystem(this.scene, this.renderer);

    // 4. Material Manager & PBR Textures
    this.loadingStatus.innerText = 'PBR dokular ve haritalar indiriliyor...';
    this.materialManager = new MaterialManager();
    await this.materialManager.loadAll((progress) => {
      this.progressBar.style.width = `${Math.round(progress * 60)}%`;
    });

    // 5. Load HDRI
    this.loadingStatus.innerText = 'Altın saat gökyüzü (HDRI) hazırlanıyor...';
    this.progressBar.style.width = '75%';
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    await this.lighting.loadHDRI(`${base}assets/hdri/kloppenheim_06_1k.hdr`);

    // 6. Build Tokat Taşhan Complex
    this.loadingStatus.innerText = 'Tokat Taşhan mimari elemanları inşa ediliyor...';
    this.progressBar.style.width = '85%';
    this.tashanComplex = new TashanComplex(this.materialManager);
    const complexData = this.tashanComplex.build();
    this.scene.add(complexData.group);

    // Register lanterns with lighting system
    this.lighting.registerLanterns(complexData.lanterns);

    // 7. Player Controller & BVH Collision
    this.loadingStatus.innerText = 'BVH fizik ve çarpışma ağı oluşturuluyor...';
    this.progressBar.style.width = '95%';
    this.player = new PlayerController(this.camera, this.renderer.domElement, this.scene);
    this.player.initBVH(complexData.colliders);
    this.player.teleport(-15, 1.70, 0, new THREE.Vector3(0, 1.5, 0));

    // 8. Post-Processing Pipeline (n8ao + bloom + tone mapping)
    this.loadingStatus.innerText = 'Post-processing ve N8AO aktif ediliyor...';
    this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);

    // 9. UI & Controls Listeners
    this.setupUI();

    // Finish loading
    this.progressBar.style.width = '100%';
    setTimeout(() => {
      this.loadingScreen.classList.add('fade-out');
    }, 400);

    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start loop
    this.animate();
  }

  setupUI() {
    // Click on canvas to lock pointer
    this.renderer.domElement.addEventListener('click', () => {
      if (!this.player.controls.isLocked) {
        this.player.controls.lock();
      }
    });

    // Time of day buttons
    const todButtons = document.querySelectorAll('.tod-btn[data-time]');
    todButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        todButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const time = btn.getAttribute('data-time');
        this.lighting.setTimeOfDay(time);
      });
    });

    // Fly Mode button
    const flyBtn = document.getElementById('fly-btn');
    if (flyBtn) {
      flyBtn.addEventListener('click', () => {
        if (this.player) this.player.toggleFlyMode();
      });
    }

    // View buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const viewKey = btn.getAttribute('data-view');
        this.switchView(viewKey);
      });
    });

    // Number keys 1-5 for fast viewpoint switching
    window.addEventListener('keydown', (e) => {
      const keyMap = {
        'Digit1': 'portal',
        'Digit2': 'courtyard',
        'Digit3': 'arcade',
        'Digit4': 'balcony',
        'Digit5': 'stairs'
      };
      if (keyMap[e.code]) {
        this.switchView(keyMap[e.code]);
      }
    });

    // Help toggle
    const toggleHelp = document.getElementById('toggle-help');
    const helpCard = document.getElementById('help-card');
    toggleHelp.addEventListener('click', () => {
      helpCard.classList.toggle('collapsed');
      toggleHelp.innerText = helpCard.classList.contains('collapsed') ? '+' : '_';
    });

    // Expose app instance globally for automated inspection tests
    window.__tashanApp = this;
  }

  switchView(viewKey) {
    const view = this.viewPresets[viewKey];
    if (view && this.player) {
      console.log(`Switching view to: ${view.label}`);
      this.player.teleport(view.pos.x, view.pos.y, view.pos.z, view.target);
    }
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.postProcessing) {
      this.postProcessing.setSize(width, height);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Update player movement and physics
    if (this.player) {
      this.player.update(delta);
    }

    // Atmospheric subtle lantern candle flicker
    if (this.lighting && this.lighting.lanterns) {
      const time = performance.now() * 0.003;
      this.lighting.lanterns.forEach((l, idx) => {
        if (l.light) {
          const mult = this.lighting.currentMode === 'night' ? 1.6 : (this.lighting.currentMode === 'golden' ? 0.7 : 0.05);
          const flicker = Math.sin(time + idx * 1.5) * 0.12;
          l.light.intensity = Math.max(0.05, (l.baseIntensity || 1.8) * mult + flicker);
        }
      });
    }

    // Render through postprocessing pipeline
    if (this.postProcessing) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // FPS Counter
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      if (this.fpsCounter) {
        this.fpsCounter.innerText = `${fps} FPS`;
      }
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  const app = new TokatTashanApp();
  app.init();
});
