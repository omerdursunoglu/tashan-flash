import * as THREE from 'three';

export class MainPortal {
  /**
   * Monumental Ottoman Taçkapı (Entrance Portal)
   * @param {Object} options
   * @param {number} options.width - Portal total width (8.20m)
   * @param {number} options.height - Portal height (8.80m)
   * @param {number} options.depth - Tunnel depth from outer wall to courtyard (8.70m)
   * @param {Object} materials - MaterialManager
   */
  static createPortal(options, materials) {
    const {
      width = 8.40,
      height = 8.80,
      depth = 8.70
    } = options;

    const group = new THREE.Group();
    const stoneMat = materials.getMaterial('stone', 1.0, 1.0);
    const brickMat = materials.getMaterial('brick', 1.0, 1.0);
    const woodMat = materials.getMaterial('wood', 1.0, 1.0);
    const ironMat = materials.iron;

    const pylonW = 2.10;
    const openingW = width - (2 * pylonW); // 4.20m
    const springY = 4.80;
    const apexY = 7.00;

    // 1. Massive Stone Portal Pylons
    const pylonGeo = new THREE.BoxGeometry(pylonW, height, depth);
    const leftPylon = new THREE.Mesh(pylonGeo, stoneMat);
    leftPylon.position.set(-width / 2 + pylonW / 2, height / 2, depth / 2);
    leftPylon.castShadow = true;
    leftPylon.receiveShadow = true;
    group.add(leftPylon);

    const rightPylon = new THREE.Mesh(pylonGeo, stoneMat);
    rightPylon.position.set(width / 2 - pylonW / 2, height / 2, depth / 2);
    rightPylon.castShadow = true;
    rightPylon.receiveShadow = true;
    group.add(rightPylon);

    // 2. Front Monumental Eyvan Arch Facade
    const portalShape = new THREE.Shape();
    portalShape.moveTo(-width / 2, 0);
    portalShape.lineTo(-width / 2, height);
    portalShape.lineTo(width / 2, height);
    portalShape.lineTo(width / 2, 0);
    portalShape.lineTo(openingW / 2, 0);
    portalShape.lineTo(openingW / 2, springY);

    // Pointed arch curve
    const segs = 16;
    const h = apexY - springY;
    const halfW = openingW / 2;
    const centerOffset = Math.max(0.1, (h * h - halfW * halfW) / (2 * halfW));
    const R = Math.sqrt(centerOffset * centerOffset + h * h);
    const endAngle = Math.atan2(h, centerOffset);

    // Right arc
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const angle = THREE.MathUtils.lerp(0, endAngle, t);
      const x = -centerOffset + R * Math.cos(angle);
      const y = springY + R * Math.sin(angle);
      portalShape.lineTo(x, y);
    }
    // Left arc
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const angle = THREE.MathUtils.lerp(Math.PI - endAngle, Math.PI, t);
      const x = centerOffset + R * Math.cos(angle);
      const y = springY + R * Math.sin(angle);
      portalShape.lineTo(x, y);
    }
    portalShape.lineTo(-openingW / 2, 0);
    portalShape.closePath();

    const portalFaceGeo = new THREE.ExtrudeGeometry(portalShape, {
      steps: 1,
      depth: 1.10,
      bevelEnabled: false
    });
    portalFaceGeo.translate(0, 0, depth - 1.10);
    portalFaceGeo.computeVertexNormals();

    const portalFace = new THREE.Mesh(portalFaceGeo, stoneMat);
    portalFace.castShadow = true;
    portalFace.receiveShadow = true;
    group.add(portalFace);

    // 3. Ornate Inscription Plaque (Tarihi Kitabelik) above arch
    const plaqueGeo = new THREE.BoxGeometry(2.80, 0.85, 0.16);
    const plaque = new THREE.Mesh(plaqueGeo, brickMat);
    plaque.position.set(0, apexY + 0.65, depth + 0.05);
    plaque.castShadow = true;
    group.add(plaque);

    const plaqueBorderGeo = new THREE.BoxGeometry(3.10, 1.10, 0.10);
    const plaqueBorder = new THREE.Mesh(plaqueBorderGeo, stoneMat);
    plaqueBorder.position.set(0, apexY + 0.65, depth);
    group.add(plaqueBorder);

    // 4. Barrel Vault Passage along the full depth
    const vaultRadius = openingW / 2;
    const tunnelGeo = new THREE.CylinderGeometry(
      vaultRadius,
      vaultRadius,
      depth,
      24,
      1,
      true,
      0,
      Math.PI
    );
    tunnelGeo.rotateZ(Math.PI / 2);
    tunnelGeo.rotateY(Math.PI / 2);
    tunnelGeo.translate(0, springY, depth / 2);

    const tunnelMesh = new THREE.Mesh(tunnelGeo, brickMat);
    tunnelMesh.material.side = THREE.BackSide;
    tunnelMesh.receiveShadow = true;
    group.add(tunnelMesh);

    // 5. Heavy Timber Gates (Masif Çift Kanatlı Ahşap Avlu Kapısı)
    const gateW = (openingW - 0.10) / 2;
    const gateH = springY;
    const gateThick = 0.12;

    const gateGeo = new THREE.BoxGeometry(gateW, gateH, gateThick);

    // Left Wing (partially open 20 degrees into courtyard)
    const leftGate = new THREE.Mesh(gateGeo, woodMat);
    leftGate.position.set(-openingW / 2 + gateW / 2 + 0.05, gateH / 2, depth * 0.45);
    leftGate.rotation.y = 0.35;
    leftGate.castShadow = true;
    group.add(leftGate);

    // Right Wing
    const rightGate = new THREE.Mesh(gateGeo, woodMat);
    rightGate.position.set(openingW / 2 - gateW / 2 - 0.05, gateH / 2, depth * 0.45);
    rightGate.rotation.y = -0.35;
    rightGate.castShadow = true;
    group.add(rightGate);

    // Iron Banding and Bosses
    const ironBandGeo = new THREE.BoxGeometry(gateW, 0.08, 0.02);
    for (let by = 0.8; by <= gateH - 0.5; by += 1.2) {
      const b1 = new THREE.Mesh(ironBandGeo, ironMat);
      b1.position.set(0, by - gateH / 2, gateThick / 2 + 0.01);
      leftGate.add(b1);

      const b2 = new THREE.Mesh(ironBandGeo, ironMat);
      b2.position.set(0, by - gateH / 2, gateThick / 2 + 0.01);
      rightGate.add(b2);
    }

    return group;
  }
}
