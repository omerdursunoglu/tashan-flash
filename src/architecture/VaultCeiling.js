import * as THREE from 'three';

export class VaultCeiling {
  /**
   * Creates a vaulted ceiling module covering an arcade bay
   * @param {Object} options
   * @param {number} options.width - Bay span (3.80m)
   * @param {number} options.depth - Arcade corridor depth (3.20m)
   * @param {number} options.springY - Spring height (start of curve)
   * @param {number} options.rise - Vault height rise (e.g. 0.85m)
   * @param {Object} materials - MaterialManager
   */
  static createVault(options, materials) {
    const {
      width = 3.80,
      depth = 3.20,
      springY = 3.20,
      rise = 0.85
    } = options;

    const group = new THREE.Group();
    const plasterMat = materials.getMaterial('plaster', 2.0, 2.0);
    const brickMat = materials.getMaterial('brick', 1.0, 1.0);

    // 1. Vault Curved Surface (Curved grid geometry)
    const segX = 16;
    const segZ = 12;
    const vaultGeo = new THREE.PlaneGeometry(width, depth, segX, segZ);

    const pos = vaultGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); // from -width/2 to width/2
      const z = pos.getY(i); // in PlaneGeometry, Y is the 2nd axis (depth)

      // Dome / groin vault curve: parabolic rise from both X and Z borders
      const nx = (x / (width / 2)); // -1 to 1
      const nz = (z / (depth / 2)); // -1 to 1
      
      const factorX = Math.max(0, 1 - nx * nx);
      const factorZ = Math.max(0, 1 - nz * nz);
      // Vault elevation
      const vaultH = rise * (factorX * 0.7 + factorZ * 0.3);

      pos.setZ(i, -vaultH); // curved into depth
    }
    vaultGeo.computeVertexNormals();

    // Rotate plane so it lies horizontally overhead facing down
    const vaultMesh = new THREE.Mesh(vaultGeo, plasterMat);
    vaultMesh.rotation.x = Math.PI / 2;
    vaultMesh.position.set(0, springY, -depth / 2);
    vaultMesh.receiveShadow = true;
    group.add(vaultMesh);

    // 2. Transverse Arch Ribs (Kemer Kaburgaları) between bays
    const ribShape = new THREE.Shape();
    const ribWidth = 0.35;
    const ribThickness = 0.25;

    ribShape.moveTo(-depth / 2, 0);
    ribShape.lineTo(-depth / 2, rise + ribThickness);
    ribShape.lineTo(depth / 2, rise + ribThickness);
    ribShape.lineTo(depth / 2, 0);
    ribShape.lineTo(depth / 2 - 0.1, 0);

    // Inner arch
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const z = THREE.MathUtils.lerp(depth / 2 - 0.1, -depth / 2 + 0.1, t);
      const nz = (z / (depth / 2));
      const y = rise * Math.max(0, 1 - nz * nz);
      ribShape.lineTo(z, y);
    }
    ribShape.lineTo(-depth / 2, 0);

    const ribGeo = new THREE.ExtrudeGeometry(ribShape, {
      steps: 1,
      depth: ribWidth,
      bevelEnabled: false
    });
    ribGeo.rotateY(Math.PI / 2);
    ribGeo.translate(-ribWidth / 2, springY, -depth / 2);

    const ribLeft = new THREE.Mesh(ribGeo, brickMat);
    ribLeft.position.x = -width / 2;
    ribLeft.castShadow = true;
    ribLeft.receiveShadow = true;
    group.add(ribLeft);

    return group;
  }
}
