import * as THREE from 'three';

export class CourtyardProps {
  /**
   * Generates realistic courtyard atmospheric details
   * @param {Object} materials - MaterialManager
   * @returns {Object} { group, lanterns, colliders }
   */
  static createProps(materials) {
    const group = new THREE.Group();
    const colliders = [];
    const lanterns = [];

    const stoneMat = materials.getMaterial('stone', 1.0, 1.0);
    const woodMat = materials.getMaterial('wood', 2.0, 2.0);
    const ironMat = materials.iron;
    const waterMat = materials.water;
    const glowMat = materials.lanternGlow;
    const foliageMat = materials.foliage;

    // 1. CENTRAL OCTAGONAL STONE FOUNTAIN POOL (Şadırvan / Havuz)
    const poolGroup = new THREE.Group();
    const poolRadius = 3.80;
    const poolHeight = 0.80;
    const rimThickness = 0.38;

    // Outer octagonal stone step plinth
    const stepPlinthGeo = new THREE.CylinderGeometry(poolRadius + 0.50, poolRadius + 0.50, 0.18, 8);
    const stepPlinth = new THREE.Mesh(stepPlinthGeo, stoneMat);
    stepPlinth.position.y = 0.09;
    stepPlinth.receiveShadow = true;
    poolGroup.add(stepPlinth);
    colliders.push(stepPlinth);

    // Main octagonal stone basin
    const basinGeo = new THREE.CylinderGeometry(
      poolRadius,
      poolRadius,
      poolHeight,
      8,
      1,
      false
    );
    const basinMesh = new THREE.Mesh(basinGeo, stoneMat);
    basinMesh.position.y = poolHeight / 2 + 0.18;
    basinMesh.castShadow = true;
    basinMesh.receiveShadow = true;
    poolGroup.add(basinMesh);
    colliders.push(basinMesh);

    // Inner water surface
    const waterGeo = new THREE.CylinderGeometry(
      poolRadius - rimThickness,
      poolRadius - rimThickness,
      0.1,
      16
    );
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = poolHeight + 0.12;
    poolGroup.add(waterMesh);

    // Central tiered stone fountain nozzle / pillar
    const spoutPillarGeo = new THREE.CylinderGeometry(0.35, 0.50, 1.60, 8);
    const spoutPillar = new THREE.Mesh(spoutPillarGeo, stoneMat);
    spoutPillar.position.y = 1.0;
    spoutPillar.castShadow = true;
    poolGroup.add(spoutPillar);

    const spoutBowlGeo = new THREE.CylinderGeometry(0.90, 0.40, 0.35, 8);
    const spoutBowl = new THREE.Mesh(spoutBowlGeo, stoneMat);
    spoutBowl.position.y = 1.80;
    spoutBowl.castShadow = true;
    poolGroup.add(spoutBowl);

    poolGroup.position.set(0, 0, 0);
    group.add(poolGroup);

    // 2. STONE-BORDERED PLANTERS & LAYERED PLANE TREES (Çınar Ağaçları)
    const treePositions = [
      { x: -14.0, z: -6.5 },
      { x: 14.0, z: -6.5 },
      { x: -14.0, z: 6.5 },
      { x: 14.0, z: 6.5 }
    ];

    treePositions.forEach((pos) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(pos.x, 0, pos.z);

      // Octagonal stone planter border
      const planterBorderGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.50, 8, 1, false);
      const planter = new THREE.Mesh(planterBorderGeo, stoneMat);
      planter.position.y = 0.25;
      planter.castShadow = true;
      planter.receiveShadow = true;
      treeGroup.add(planter);
      colliders.push(planter);

      // Soil / earth
      const soilGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.1, 8);
      const soilMat = materials.getMaterial('wood', 0.5, 0.5);
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.42;
      treeGroup.add(soil);

      // Trunk (Curved segmented tree trunk)
      const trunkGeo = new THREE.CylinderGeometry(0.30, 0.45, 4.4, 8);
      const trunkMesh = new THREE.Mesh(trunkGeo, woodMat);
      trunkMesh.position.y = 2.2;
      trunkMesh.castShadow = true;
      treeGroup.add(trunkMesh);
      colliders.push(trunkMesh);

      // Layered Branches & Foliage (multi-angle cross quads with alpha leaf texture)
      const canopyGroup = new THREE.Group();
      canopyGroup.position.y = 4.2;

      const layerCount = 6;
      for (let l = 0; l < layerCount; l++) {
        const ly = l * 0.65;
        const radius = (1.0 - l * 0.13) * 3.2;

        for (let a = 0; a < 6; a++) {
          const angle = (a / 6) * Math.PI * 2 + (l * 0.5);
          const leafQuadGeo = new THREE.PlaneGeometry(radius * 0.95, radius * 0.75);
          const leafQuad = new THREE.Mesh(leafQuadGeo, foliageMat);

          leafQuad.position.set(
            Math.cos(angle) * (radius * 0.45),
            ly + Math.sin(a) * 0.18,
            Math.sin(angle) * (radius * 0.45)
          );
          leafQuad.rotation.y = angle + Math.PI / 2;
          leafQuad.rotation.x = 0.22 * (l % 2 === 0 ? 1 : -1);
          leafQuad.castShadow = true;
          canopyGroup.add(leafQuad);
        }
      }
      treeGroup.add(canopyGroup);
      group.add(treeGroup);
    });

    // 3. TEA GARDEN WOODEN TABLES & CHAIRS (Geleneksel Ahşap Çay Masaları)
    const seatingClusters = [
      { x: -6.0, z: -7.5 },
      { x: 6.0, z: -7.5 },
      { x: -6.0, z: 7.5 },
      { x: 6.0, z: 7.5 },
      { x: -18.0, z: 0.0 },
      { x: 18.0, z: 0.0 }
    ];

    const tableTopGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16);
    const tableLegGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8);
    const stoolTopGeo = new THREE.BoxGeometry(0.35, 0.05, 0.35);
    const stoolLegGeo = new THREE.BoxGeometry(0.04, 0.40, 0.04);

    seatingClusters.forEach((cluster) => {
      const clusterGroup = new THREE.Group();
      clusterGroup.position.set(cluster.x, 0, cluster.z);

      // Table Top with dark weathered wood texture
      const tableTop = new THREE.Mesh(tableTopGeo, woodMat);
      tableTop.position.y = 0.68;
      tableTop.castShadow = true;
      clusterGroup.add(tableTop);

      const tableLeg = new THREE.Mesh(tableLegGeo, ironMat);
      tableLeg.position.y = 0.34;
      tableLeg.castShadow = true;
      clusterGroup.add(tableLeg);

      // Table base
      const tableBaseGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.04, 12);
      const tableBase = new THREE.Mesh(tableBaseGeo, ironMat);
      tableBase.position.y = 0.02;
      clusterGroup.add(tableBase);

      // 4 Stools around table
      for (let s = 0; s < 4; s++) {
        const sAngle = (s / 4) * Math.PI * 2;
        const dist = 0.85;
        const stoolGroup = new THREE.Group();
        stoolGroup.position.set(Math.cos(sAngle) * dist, 0, Math.sin(sAngle) * dist);

        const seat = new THREE.Mesh(stoolTopGeo, woodMat);
        seat.position.y = 0.42;
        seat.castShadow = true;
        stoolGroup.add(seat);

        const offsets = [-0.13, 0.13];
        offsets.forEach((ox) => {
          offsets.forEach((oz) => {
            const leg = new THREE.Mesh(stoolLegGeo, woodMat);
            leg.position.set(ox, 0.20, oz);
            stoolGroup.add(leg);
          });
        });

        clusterGroup.add(stoolGroup);
      }

      group.add(clusterGroup);
    });

    // 4. HANGING WROUGHT IRON LANTERNS (Dövme Demir Fenerler)
    const lanternGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.35, 6);
    const lanternCapGeo = new THREE.ConeGeometry(0.16, 0.15, 6);
    const chainGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.60, 4);

    function createLantern(x, y, z) {
      const lGroup = new THREE.Group();
      lGroup.position.set(x, y, z);

      const chain = new THREE.Mesh(chainGeo, ironMat);
      chain.position.y = -0.30;
      lGroup.add(chain);

      const cap = new THREE.Mesh(lanternCapGeo, ironMat);
      cap.position.y = -0.60;
      cap.castShadow = true;
      lGroup.add(cap);

      const body = new THREE.Mesh(lanternGeo, glowMat);
      body.position.y = -0.80;
      lGroup.add(body);

      const light = new THREE.PointLight(0xff9933, 2.0, 8.0, 1.8);
      light.position.y = -0.80;
      light.castShadow = false;
      lGroup.add(light);

      lanterns.push({ group: lGroup, light, baseIntensity: 2.0 });
      return lGroup;
    }

    for (let lx = -22.0; lx <= 22.0; lx += 7.6) {
      group.add(createLantern(lx, 3.85, -13.8));
      group.add(createLantern(lx, 3.85, 13.8));
    }
    for (let lz = -10.0; lz <= 10.0; lz += 7.6) {
      group.add(createLantern(-26.5, 3.85, lz));
      group.add(createLantern(26.5, 3.85, lz));
    }

    return { group, colliders, lanterns };
  }
}
