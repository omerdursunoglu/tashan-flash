import * as THREE from 'three';

export class ArchBay {
  /**
   * @param {Object} options
   * @param {number} options.span - Width between pillar centers (3.80m)
   * @param {number} options.height - Total floor height (4.60m)
   * @param {number} options.springY - Height where arch curve begins (2.80m)
   * @param {number} options.apexY - Height of arch peak (4.10m)
   * @param {number} options.depth - Depth of arch & pillar (0.65m)
   * @param {number} options.pillarWidth - Width of pillar (0.65m)
   * @param {boolean} options.hasBalustrade - Whether to add railing
   * @param {Object} materials - MaterialManager
   */
  static createBay(options, materials) {
    const {
      span = 3.80,
      height = 4.60,
      springY = 2.80,
      apexY = 4.10,
      depth = 0.65,
      pillarWidth = 0.65,
      hasBalustrade = false
    } = options;

    const group = new THREE.Group();
    const stoneMat = materials.getMaterial('stone', 1.0, 1.0);
    const brickMat = materials.getMaterial('brick', 1.2, 1.2);
    const woodMat = materials.getMaterial('wood', 1.0, 1.0);
    const ironMat = materials.iron;

    // 1. STONE PILLAR (Ayak)
    // Pillar Plinth (Kaide)
    const plinthH = 0.40;
    const plinthGeo = new THREE.BoxGeometry(pillarWidth + 0.10, plinthH, depth + 0.10);
    const plinth = new THREE.Mesh(plinthGeo, stoneMat);
    plinth.position.set(-span / 2, plinthH / 2, 0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Pillar Shaft (Gövde)
    const shaftH = springY - plinthH - 0.30;
    const shaftGeo = new THREE.BoxGeometry(pillarWidth, shaftH, depth);
    const shaft = new THREE.Mesh(shaftGeo, stoneMat);
    shaft.position.set(-span / 2, plinthH + shaftH / 2, 0);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);

    // Pillar Capital (Başlık)
    const capitalH = 0.30;
    const capitalGeo = new THREE.BoxGeometry(pillarWidth + 0.08, capitalH, depth + 0.08);
    const capital = new THREE.Mesh(capitalGeo, stoneMat);
    capital.position.set(-span / 2, springY - capitalH / 2, 0);
    capital.castShadow = true;
    capital.receiveShadow = true;
    group.add(capital);

    // 2. TWO-CENTERED POINTED ARCH (Klasik Osmanlı Sivri Kemeri)
    const openingW = span - pillarWidth;
    const halfOpening = openingW / 2;
    const leftInnerX = -halfOpening;
    const rightInnerX = halfOpening;

    const archShape = new THREE.Shape();
    // Spandrel top outer box (full span coverage)
    archShape.moveTo(-span / 2, springY);
    archShape.lineTo(-span / 2, height);
    archShape.lineTo(span / 2, height);
    archShape.lineTo(span / 2, springY);
    archShape.lineTo(rightInnerX, springY);

    // True two-centered pointed arc calculations:
    // Left arc center is at (+centerOffset, springY)
    // Right arc center is at (-centerOffset, springY)
    const h = apexY - springY;
    const w = halfOpening;
    // Radius R such that (w + centerOffset)^2 + 0^2 = R^2 and (centerOffset)^2 + h^2 = R^2
    // w^2 + 2*w*c + c^2 = c^2 + h^2 => c = (h^2 - w^2) / (2*w)
    const centerOffset = Math.max(0.1, (h * h - w * w) / (2 * w));
    const R = Math.sqrt(centerOffset * centerOffset + h * h);

    const segs = 16;
    // Right side arc from rightInnerX up to (0, apexY)
    // Arc centered at (-centerOffset, springY)
    const rStartAngle = 0;
    const rEndAngle = Math.atan2(h, centerOffset);
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const angle = THREE.MathUtils.lerp(rStartAngle, rEndAngle, t);
      const x = -centerOffset + R * Math.cos(angle);
      const y = springY + R * Math.sin(angle);
      archShape.lineTo(x, y);
    }

    // Left side arc from (0, apexY) down to leftInnerX
    // Arc centered at (+centerOffset, springY)
    const lStartAngle = Math.PI - rEndAngle;
    const lEndAngle = Math.PI;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const angle = THREE.MathUtils.lerp(lStartAngle, lEndAngle, t);
      const x = centerOffset + R * Math.cos(angle);
      const y = springY + R * Math.sin(angle);
      archShape.lineTo(x, y);
    }

    archShape.lineTo(leftInnerX, springY);
    archShape.lineTo(-span / 2, springY);

    const extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: false
    };

    const archGeo = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
    archGeo.translate(0, 0, -depth / 2);
    archGeo.computeVertexNormals();

    const archMesh = new THREE.Mesh(archGeo, stoneMat);
    archMesh.castShadow = true;
    archMesh.receiveShadow = true;
    group.add(archMesh);

    // 3. KEYSTONE ACCENT (Kilit Taşı)
    const keystoneGeo = new THREE.BoxGeometry(0.32, 0.42, depth + 0.08);
    const keystone = new THREE.Mesh(keystoneGeo, brickMat);
    keystone.position.set(0, apexY + 0.14, 0);
    keystone.castShadow = true;
    keystone.receiveShadow = true;
    group.add(keystone);

    // Horizontal Brick Almaşık Belt across spandrel
    const beltGeo = new THREE.BoxGeometry(span, 0.22, depth + 0.04);
    const belt = new THREE.Mesh(beltGeo, brickMat);
    belt.position.set(0, height - 0.22, 0);
    belt.castShadow = true;
    belt.receiveShadow = true;
    group.add(belt);

    // 4. BALUSTRADE (Upper floor gallery railing)
    if (hasBalustrade) {
      const railGroup = new THREE.Group();
      const railL = span - pillarWidth;
      const railH = 0.95;

      // Bottom stone curb
      const curbGeo = new THREE.BoxGeometry(railL, 0.12, 0.22);
      const curb = new THREE.Mesh(curbGeo, stoneMat);
      curb.position.set(0, 0.06, 0);
      railGroup.add(curb);

      // Top handrail (Dark weathered wood)
      const topRailGeo = new THREE.BoxGeometry(railL, 0.10, 0.22);
      const topRail = new THREE.Mesh(topRailGeo, woodMat);
      topRail.position.set(0, railH - 0.05, 0);
      railGroup.add(topRail);

      // Wrought Iron Balusters (Non-glaring matte charcoal finish)
      const balusterCount = Math.floor(railL / 0.22);
      const balusterSpacing = railL / (balusterCount + 1);
      const balusterGeo = new THREE.CylinderGeometry(0.022, 0.022, railH - 0.22, 6);

      for (let i = 1; i <= balusterCount; i++) {
        const baluster = new THREE.Mesh(balusterGeo, ironMat);
        baluster.position.set(-railL / 2 + i * balusterSpacing, railH / 2, 0);
        baluster.castShadow = false;
        baluster.receiveShadow = true;
        railGroup.add(baluster);
      }

      group.add(railGroup);
    }

    return group;
  }
}
