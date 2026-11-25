import * as THREE from 'three';

export class MaterialManager {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.textures = {};
    this.materials = {};
    this.isLoaded = false;
  }

  async loadAll(onProgress) {
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    const assets = [
      { key: 'stone', path: `${base}assets/textures/stone`, diff: 'stone_diffuse.jpg', norm: 'stone_normal.jpg', rough: 'stone_roughness.jpg', ao: 'stone_ao.jpg' },
      { key: 'brick', path: `${base}assets/textures/brick`, diff: 'brick_diffuse.jpg', norm: 'brick_normal.jpg', rough: 'brick_roughness.jpg', ao: 'brick_ao.jpg' },
      { key: 'cobble', path: `${base}assets/textures/cobble`, diff: 'cobble_diffuse.jpg', norm: 'cobble_normal.jpg', rough: 'cobble_roughness.jpg', ao: 'cobble_ao.jpg' },
      { key: 'roof', path: `${base}assets/textures/roof`, diff: 'roof_diffuse.jpg', norm: 'roof_normal.jpg', rough: 'roof_roughness.jpg', ao: 'roof_ao.jpg' },
      { key: 'wood', path: `${base}assets/textures/wood`, diff: 'wood_diffuse.jpg', norm: 'wood_normal.jpg', rough: 'wood_roughness.jpg', ao: 'wood_ao.jpg' },
      { key: 'plaster', path: `${base}assets/textures/plaster`, diff: 'plaster_diffuse.jpg', norm: 'plaster_normal.jpg', rough: 'plaster_roughness.jpg', ao: 'plaster_ao.jpg' }
    ];

    let loadedCount = 0;
    const totalFiles = assets.length * 4;

    const loadTexture = (url, isSRGB = false) => {
      return new Promise((resolve) => {
        this.textureLoader.load(
          url,
          (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            if (isSRGB) {
              tex.colorSpace = THREE.SRGBColorSpace;
            }
            loadedCount++;
            if (onProgress) onProgress(loadedCount / totalFiles);
            resolve(tex);
          },
          undefined,
          (err) => {
            console.error(`Failed to load texture ${url}:`, err);
            resolve(null);
          }
        );
      });
    };

    for (const item of assets) {
      const [diff, norm, rough, ao] = await Promise.all([
        loadTexture(`${item.path}/${item.diff}`, true),
        loadTexture(`${item.path}/${item.norm}`, false),
        loadTexture(`${item.path}/${item.rough}`, false),
        loadTexture(`${item.path}/${item.ao}`, false)
      ]);

      this.textures[item.key] = { diff, norm, rough, ao };

      this.materials[item.key] = new THREE.MeshStandardMaterial({
        map: diff,
        normalMap: norm,
        roughnessMap: rough,
        aoMap: ao,
        roughness: 0.90,
        metalness: 0.02,
        aoMapIntensity: 1.2,
        normalScale: new THREE.Vector2(1.0, 1.0)
      });
    }

    // Custom material tuning
    if (this.materials.stone) {
      this.materials.stone.roughness = 0.88;
      this.materials.stone.normalScale.set(1.1, 1.1);
    }
    if (this.materials.brick) {
      this.materials.brick.roughness = 0.92;
      this.materials.brick.normalScale.set(1.2, 1.2);
    }
    if (this.materials.cobble) {
      this.materials.cobble.roughness = 0.82;
      this.materials.cobble.normalScale.set(1.3, 1.3);
    }
    if (this.materials.roof) {
      this.materials.roof.roughness = 0.95;
      this.materials.roof.normalScale.set(1.5, 1.5);
    }
    if (this.materials.wood) {
      this.materials.wood.roughness = 0.85;
      this.materials.wood.metalness = 0.02;
    }

    // 1. Authentic Ottoman Matte Wrought Iron (Dövme Demir / Paslı Ferforje)
    // Non-glaring dark charcoal finish
    this.materials.iron = new THREE.MeshStandardMaterial({
      color: 0x1e1f21,
      roughness: 0.82,
      metalness: 0.15
    });

    // 2. Warm Glowing Lantern Glass
    this.materials.lanternGlow = new THREE.MeshStandardMaterial({
      color: 0xffeedd,
      emissive: 0xff8c1a,
      emissiveIntensity: 2.2,
      roughness: 0.3,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92
    });

    // 3. Pool Water Material (Wet, reflective, realistic depth)
    this.materials.water = new THREE.MeshStandardMaterial({
      color: 0x1b3b44,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.85
    });

    // 4. Botanical Plane Tree Foliage Texture (Doğal Çınar Yaprağı Deseni)
    const leafCanvas = document.createElement('canvas');
    leafCanvas.width = 256;
    leafCanvas.height = 256;
    const ctx = leafCanvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);

    // Draw multi-lobed plane tree leaves with natural veins
    const drawLeaf = (cx, cy, scale, rot, baseCol) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.scale(scale, scale);

      ctx.fillStyle = baseCol;
      ctx.beginPath();
      // 5-lobed sycamore/plane tree leaf outline
      ctx.moveTo(0, 50);
      ctx.bezierCurveTo(-15, 30, -35, 40, -45, 10);
      ctx.bezierCurveTo(-30, 0, -40, -25, -25, -45);
      ctx.bezierCurveTo(-10, -35, 0, -60, 0, -60);
      ctx.bezierCurveTo(0, -60, 10, -35, 25, -45);
      ctx.bezierCurveTo(40, -25, 30, 0, 45, 10);
      ctx.bezierCurveTo(35, 40, 15, 30, 0, 50);
      ctx.fill();

      // Leaf veins
      ctx.strokeStyle = 'rgba(25, 45, 15, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.lineTo(0, -50);
      ctx.moveTo(0, 10);
      ctx.lineTo(-30, -15);
      ctx.moveTo(0, 10);
      ctx.lineTo(30, -15);
      ctx.stroke();

      ctx.restore();
    };

    // Cluster leaves
    drawLeaf(128, 128, 1.3, 0, '#355424');
    drawLeaf(70, 90, 0.95, -0.4, '#2e4a1e');
    drawLeaf(186, 90, 0.95, 0.4, '#3d5e2a');
    drawLeaf(128, 60, 0.85, 0.1, '#456b2f');
    drawLeaf(80, 170, 0.9, -0.8, '#2b441c');
    drawLeaf(176, 170, 0.9, 0.8, '#325022');

    const foliageTex = new THREE.CanvasTexture(leafCanvas);
    foliageTex.wrapS = THREE.RepeatWrapping;
    foliageTex.wrapT = THREE.RepeatWrapping;
    foliageTex.repeat.set(1.5, 1.5);
    foliageTex.colorSpace = THREE.SRGBColorSpace;

    this.materials.foliage = new THREE.MeshStandardMaterial({
      map: foliageTex,
      color: 0x41662d,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.45
    });

    this.isLoaded = true;
    return this.materials;
  }

  get iron() {
    return this.materials.iron || new THREE.MeshStandardMaterial({ color: 0x1f2022, roughness: 0.85, metalness: 0.1 });
  }

  get foliage() {
    return this.materials.foliage || new THREE.MeshStandardMaterial({ color: 0x3d5e2a, roughness: 0.85 });
  }

  get water() {
    return this.materials.water || new THREE.MeshStandardMaterial({ color: 0x1b3b44, roughness: 0.1, transparent: true, opacity: 0.85 });
  }

  get lanternGlow() {
    return this.materials.lanternGlow || new THREE.MeshStandardMaterial({ color: 0xffeedd, emissive: 0xff8c1a, emissiveIntensity: 2.0 });
  }

  getMaterial(key, repeatU = 1, repeatV = 1) {
    if (this[key]) return this[key];
    if (!this.materials[key]) return new THREE.MeshStandardMaterial({ color: 0x888888 });
    if (repeatU === 1 && repeatV === 1) return this.materials[key];

    const base = this.materials[key];
    const cloned = base.clone();

    if (base.map) {
      cloned.map = base.map.clone();
      cloned.map.repeat.set(repeatU, repeatV);
      cloned.map.needsUpdate = true;
    }
    if (base.normalMap) {
      cloned.normalMap = base.normalMap.clone();
      cloned.normalMap.repeat.set(repeatU, repeatV);
      cloned.normalMap.needsUpdate = true;
    }
    if (base.roughnessMap) {
      cloned.roughnessMap = base.roughnessMap.clone();
      cloned.roughnessMap.repeat.set(repeatU, repeatV);
      cloned.roughnessMap.needsUpdate = true;
    }
    if (base.aoMap) {
      cloned.aoMap = base.aoMap.clone();
      cloned.aoMap.repeat.set(repeatU, repeatV);
      cloned.aoMap.needsUpdate = true;
    }
    return cloned;
  }
}
