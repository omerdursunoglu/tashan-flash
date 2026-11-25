import * as THREE from 'three';

export class StoneStairs {
  /**
   * High-detail, architecturally authentic Ottoman stone staircase.
   * Ascends from courtyard ground (±0.00m) to upper gallery walkway (+4.60m).
   * 
   * @param {Object} options
   * @param {number} options.stepCount - Number of steps (27)
   * @param {number} options.stepWidth - Width of flight (1.60m)
   * @param {number} options.stepTread - Depth of tread (0.32m)
   * @param {number} options.stepRiser - Height of riser (0.17037m)
   * @param {number} options.landingDepth - Depth of top landing platform (2.00m)
   * @param {Object} materials - MaterialManager
   */
  static createStairs(options, materials) {
    const {
      stepCount = 27,
      stepWidth = 1.60,
      stepTread = 0.32,
      stepRiser = 0.17037, // 4.60m / 27
      landingDepth = 2.00
    } = options;

    const group = new THREE.Group();
    const stoneMat = materials.getMaterial('stone', 1.0, 1.0);
    const brickMat = materials.getMaterial('brick', 1.0, 1.0);

    const totalRun = stepCount * stepTread;   // 8.64m
    const totalRise = stepCount * stepRiser; // 4.60m
    const parapetHeight = 0.95;
    const parapetThick = 0.22;

    // ========================================================
    // 1. STEPS (Individual heavy dressed stone blocks)
    // ========================================================
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepRiser, stepTread);
    const stepsMeshGroup = new THREE.Group();

    for (let i = 0; i < stepCount; i++) {
      const stepMesh = new THREE.Mesh(stepGeo, stoneMat);
      const z = - (i + 0.5) * stepTread;
      const y = (i + 0.5) * stepRiser;
      stepMesh.position.set(0, y, z);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      stepMesh.userData.noCollision = true; // Use smooth collision ramp for physics
      stepsMeshGroup.add(stepMesh);
    }
    group.add(stepsMeshGroup);

    // ========================================================
    // 2. TOP LANDING PLATFORM (Upper floor gallery bridge)
    // ========================================================
    // Flat stone platform at +4.60m that connects flush with the upper gallery
    const landingGeo = new THREE.BoxGeometry(stepWidth, 0.25, landingDepth);
    const landingMesh = new THREE.Mesh(landingGeo, stoneMat);
    landingMesh.position.set(0, totalRise - 0.125, -totalRun - landingDepth / 2);
    landingMesh.castShadow = true;
    landingMesh.receiveShadow = true;
    landingMesh.name = 'stairs_landing';
    group.add(landingMesh);

    // ========================================================
    // 3. UNDER-STAIR MASONRY FOUNDATION (Strictly below treads)
    // ========================================================
    // Authentic solid stone/brick wedge supporting the steps
    // Never pokes above the steps; top surface is at step bottom
    const wedgeShape = new THREE.Shape();
    wedgeShape.moveTo(0, 0);
    wedgeShape.lineTo(0, 0.05);
    wedgeShape.lineTo(-totalRun, totalRise);
    wedgeShape.lineTo(-totalRun, 0);
    wedgeShape.closePath();

    const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, {
      steps: 1,
      depth: stepWidth,
      bevelEnabled: false
    });
    // Rotate to orient along Z
    wedgeGeo.rotateY(-Math.PI / 2);
    wedgeGeo.translate(-stepWidth / 2, 0, 0);

    const wedgeMesh = new THREE.Mesh(wedgeGeo, brickMat);
    wedgeMesh.castShadow = true;
    wedgeMesh.receiveShadow = true;
    group.add(wedgeMesh);

    // Masonry vault pier under the top landing
    const pierUnderLandingGeo = new THREE.BoxGeometry(stepWidth, totalRise - 0.25, landingDepth);
    const pierUnderLanding = new THREE.Mesh(pierUnderLandingGeo, brickMat);
    pierUnderLanding.position.set(0, (totalRise - 0.25) / 2, -totalRun - landingDepth / 2);
    pierUnderLanding.castShadow = true;
    pierUnderLanding.receiveShadow = true;
    group.add(pierUnderLanding);

    // ========================================================
    // 4. SOLID STONE SIDE PARAPETS (Korkuluk Duvarları)
    // ========================================================
    // Continuous stone balustrade along the open sides of the flight and landing
    const totalFlightLength = totalRun + landingDepth;
    const parapetShape = new THREE.Shape();
    parapetShape.moveTo(0, 0);
    parapetShape.lineTo(0, parapetHeight);
    parapetShape.lineTo(-totalRun, totalRise + parapetHeight);
    parapetShape.lineTo(-totalFlightLength, totalRise + parapetHeight);
    parapetShape.lineTo(-totalFlightLength, 0);
    parapetShape.closePath();

    const makeParapet = (sideX) => {
      const geo = new THREE.ExtrudeGeometry(parapetShape, {
        steps: 1,
        depth: parapetThick,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02
      });
      // Rotate -90 deg Y so X becomes Z (pointing towards negative Z)
      geo.rotateY(-Math.PI / 2);
      geo.translate(sideX, 0, 0);

      const pMesh = new THREE.Mesh(geo, stoneMat);
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      return pMesh;
    };

    // Right Parapet (East side, facing the open courtyard)
    const rightParapet = makeParapet(stepWidth / 2);
    group.add(rightParapet);

    // Left Parapet (West side)
    const leftParapet = makeParapet(-stepWidth / 2 - parapetThick);
    group.add(leftParapet);

    // ========================================================
    // 5. ULTRA-SMOOTH BVH COLLISION RAMPS FOR PLAYER
    // ========================================================
    // Smooth angled plane exactly along the step incline
    const rampLength = Math.sqrt(totalRun * totalRun + totalRise * totalRise);
    const rampAngle = Math.atan2(totalRise, totalRun);
    const rampGeo = new THREE.BoxGeometry(stepWidth + 0.1, 0.16, rampLength);
    const rampMat = new THREE.MeshBasicMaterial({ visible: false });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    // Center of flight
    rampMesh.position.set(0, totalRise / 2 + 0.02, -totalRun / 2);
    // Positive rotation around X pitches the ramp UP towards negative Z
    rampMesh.rotation.x = rampAngle;
    rampMesh.name = 'collider_stairs_ramp';
    group.add(rampMesh);

    // Landing collider
    const landingColGeo = new THREE.BoxGeometry(stepWidth + 0.1, 0.20, landingDepth);
    const landingColMesh = new THREE.Mesh(landingColGeo, rampMat);
    landingColMesh.position.set(0, totalRise - 0.10, -totalRun - landingDepth / 2);
    landingColMesh.name = 'collider_stairs_landing';
    group.add(landingColMesh);

    return {
      group,
      totalRun,
      totalRise,
      landingDepth,
      totalLength: totalFlightLength
    };
  }
}
