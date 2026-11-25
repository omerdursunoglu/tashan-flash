import * as THREE from 'three';

export class RoofSystem {
  /**
   * Constructs the complete perimeter hip roof with wooden eaves and terracotta tiles
   * @param {Object} options
   * @param {number} options.outerLength - Total building length (80.8m)
   * @param {number} options.outerWidth - Total building width (52.6m)
   * @param {number} options.courtyardLength - Courtyard inner length (53.6m)
   * @param {number} options.courtyardWidth - Courtyard inner width (28.2m)
   * @param {number} options.baseY - Eaves height (+8.80m)
   * @param {number} options.roofHeight - Ridge rise (+2.80m)
   * @param {number} options.eavesOverhang - Projection (0.90m)
   * @param {Object} materials - MaterialManager
   */
  static createRoof(options, materials) {
    const {
      outerLength = 80.80,
      outerWidth = 52.60,
      courtyardLength = 53.60,
      courtyardWidth = 28.20,
      baseY = 8.80,
      roofHeight = 2.80,
      eavesOverhang = 0.90
    } = options;

    const group = new THREE.Group();
    const roofMat = materials.getMaterial('roof', 45.0, 25.0);
    const woodMat = materials.getMaterial('wood', 10.0, 1.0);
    const brickMat = materials.getMaterial('brick', 1.0, 1.0);

    // 1. TIMBER EAVES & FASCIA BOARDS (Ahşap Saçaklar)
    // Outer perimeter eaves
    const outL = outerLength + 2 * eavesOverhang;
    const outW = outerWidth + 2 * eavesOverhang;
    // Inner courtyard eaves
    const inL = courtyardLength - 2 * eavesOverhang;
    const inW = courtyardWidth - 2 * eavesOverhang;

    // Wooden Eaves Underbelly / Soffit (Saçak Altı Ahşap Kaplama)
    const soffitShape = new THREE.Shape();
    soffitShape.moveTo(-outL / 2, -outW / 2);
    soffitShape.lineTo(outL / 2, -outW / 2);
    soffitShape.lineTo(outL / 2, outW / 2);
    soffitShape.lineTo(-outL / 2, outW / 2);
    soffitShape.closePath();

    // Hole for open courtyard
    const courtyardHole = new THREE.Path();
    courtyardHole.moveTo(-inL / 2, -inW / 2);
    courtyardHole.lineTo(inL / 2, -inW / 2);
    courtyardHole.lineTo(inL / 2, inW / 2);
    courtyardHole.lineTo(-inL / 2, inW / 2);
    courtyardHole.closePath();
    soffitShape.holes.push(courtyardHole);

    const soffitGeo = new THREE.ExtrudeGeometry(soffitShape, {
      steps: 1,
      depth: 0.15,
      bevelEnabled: false
    });
    soffitGeo.rotateX(Math.PI / 2);
    soffitGeo.translate(0, baseY, 0);

    const soffitMesh = new THREE.Mesh(soffitGeo, woodMat);
    soffitMesh.castShadow = true;
    soffitMesh.receiveShadow = true;
    group.add(soffitMesh);

    // 2. TIMBER CORBEL BRACKETS (Ahşap Eli Böğründe / Payandalar)
    // Spaced around the inner courtyard eaves
    const bracketGeo = new THREE.BoxGeometry(0.12, 0.45, 0.65);
    const bracketSpacing = 2.40;

    // Along Courtyard North & South eaves
    for (let x = -inL / 2; x <= inL / 2; x += bracketSpacing) {
      // South eaves
      const bSouth = new THREE.Mesh(bracketGeo, woodMat);
      bSouth.position.set(x, baseY - 0.22, -courtyardWidth / 2 + 0.32);
      bSouth.castShadow = true;
      group.add(bSouth);

      // North eaves
      const bNorth = new THREE.Mesh(bracketGeo, woodMat);
      bNorth.position.set(x, baseY - 0.22, courtyardWidth / 2 - 0.32);
      bNorth.castShadow = true;
      group.add(bNorth);
    }

    // Along Courtyard East & West eaves
    const bracketGeoEW = new THREE.BoxGeometry(0.65, 0.45, 0.12);
    for (let z = -inW / 2; z <= inW / 2; z += bracketSpacing) {
      const bWest = new THREE.Mesh(bracketGeoEW, woodMat);
      bWest.position.set(-courtyardLength / 2 + 0.32, baseY - 0.22, z);
      bWest.castShadow = true;
      group.add(bWest);

      const bEast = new THREE.Mesh(bracketGeoEW, woodMat);
      bEast.position.set(courtyardLength / 2 - 0.32, baseY - 0.22, z);
      bEast.castShadow = true;
      group.add(bEast);
    }

    // 3. SLOPED ROOF PLANES (4-Sided Hip Roof Ring)
    // The roof has an exterior slope sloping down to outL/outW,
    // and an interior slope sloping down into inL/inW.
    // The central ridge runs midway between inner and outer walls.
    const midL = (outL + inL) / 2;
    const midW = (outW + inW) / 2;
    const ridgeY = baseY + roofHeight;

    const roofGroup = new THREE.Group();

    // Helper to build a sloped quad mesh with correct UVs
    function createSlopedRoofSection(p1, p2, p3, p4) {
      const geo = new THREE.BufferGeometry();
      // Vertices: p1, p2, p3, p4 (quad made of 2 triangles: 0,1,2 and 0,2,3)
      const vertices = new Float32Array([
        p1.x, p1.y, p1.z,
        p2.x, p2.y, p2.z,
        p3.x, p3.y, p3.z,
        p4.x, p4.y, p4.z
      ]);
      const indices = [0, 1, 2, 0, 2, 3];

      // UVs based on world distance
      const lenX = p1.distanceTo(p2);
      const lenZ = p2.distanceTo(p3);
      const uScale = lenX / 2.0;
      const vScale = lenZ / 2.0;

      const uvs = new Float32Array([
        0, 0,
        uScale, 0,
        uScale, vScale,
        0, vScale
      ]);

      geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, roofMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    // Ridge vertices (mid ring at height ridgeY)
    const rNW = new THREE.Vector3(-midL / 2, ridgeY, midW / 2);
    const rNE = new THREE.Vector3(midL / 2, ridgeY, midW / 2);
    const rSE = new THREE.Vector3(midL / 2, ridgeY, -midW / 2);
    const rSW = new THREE.Vector3(-midL / 2, ridgeY, -midW / 2);

    // Outer eaves vertices (at height baseY)
    const oNW = new THREE.Vector3(-outL / 2, baseY, outW / 2);
    const oNE = new THREE.Vector3(outL / 2, baseY, outW / 2);
    const oSE = new THREE.Vector3(outL / 2, baseY, -outW / 2);
    const oSW = new THREE.Vector3(-outL / 2, baseY, -outW / 2);

    // Inner eaves vertices (at height baseY)
    const iNW = new THREE.Vector3(-inL / 2, baseY, inW / 2);
    const iNE = new THREE.Vector3(inL / 2, baseY, inW / 2);
    const iSE = new THREE.Vector3(inL / 2, baseY, -inW / 2);
    const iSW = new THREE.Vector3(-inL / 2, baseY, -inW / 2);

    // Exterior Slopes (facing outward)
    roofGroup.add(createSlopedRoofSection(rSW, rSE, oSE, oSW)); // South Outer
    roofGroup.add(createSlopedRoofSection(rNE, rNW, oNW, oNE)); // North Outer
    roofGroup.add(createSlopedRoofSection(rSE, rNE, oNE, oSE)); // East Outer
    roofGroup.add(createSlopedRoofSection(rNW, rSW, oSW, oNW)); // West Outer

    // Interior Slopes (facing the courtyard)
    roofGroup.add(createSlopedRoofSection(iSW, iSE, rSE, rSW)); // South Inner
    roofGroup.add(createSlopedRoofSection(iNE, iNW, rNW, rNE)); // North Inner
    roofGroup.add(createSlopedRoofSection(iSE, iNE, rNE, rSE)); // East Inner
    roofGroup.add(createSlopedRoofSection(iNW, iSW, rSW, rNW)); // West Inner

    group.add(roofGroup);

    // 4. RIDGE TILES (Mahya Sırtı)
    // Dimensional terracotta ridge covers along the apex lines
    const ridgeThick = 0.35;
    const ridgeH = 0.15;
    const ridgeNorthGeo = new THREE.BoxGeometry(midL, ridgeH, ridgeThick);
    const ridgeNorth = new THREE.Mesh(ridgeNorthGeo, brickMat);
    ridgeNorth.position.set(0, ridgeY + 0.05, midW / 2);
    ridgeNorth.castShadow = true;
    group.add(ridgeNorth);

    const ridgeSouth = new THREE.Mesh(ridgeNorthGeo, brickMat);
    ridgeSouth.position.set(0, ridgeY + 0.05, -midW / 2);
    ridgeSouth.castShadow = true;
    group.add(ridgeSouth);

    const ridgeEWGeo = new THREE.BoxGeometry(ridgeThick, ridgeH, midW);
    const ridgeEast = new THREE.Mesh(ridgeEWGeo, brickMat);
    ridgeEast.position.set(midL / 2, ridgeY + 0.05, 0);
    ridgeEast.castShadow = true;
    group.add(ridgeEast);

    const ridgeWest = new THREE.Mesh(ridgeEWGeo, brickMat);
    ridgeWest.position.set(-midL / 2, ridgeY + 0.05, 0);
    ridgeWest.castShadow = true;
    group.add(ridgeWest);

    return group;
  }
}
