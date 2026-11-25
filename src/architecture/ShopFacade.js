import * as THREE from 'three';

export class ShopFacade {
  /**
   * @param {Object} options
   * @param {number} options.width - Width of the shop bay (3.80m)
   * @param {number} options.height - Floor height (4.60m)
   * @param {number} options.wallThickness - Wall depth (0.80m)
   * @param {boolean} options.hasWindow - Whether this shop has a side arched window
   * @param {Object} materials - MaterialManager
   */
  static createFacade(options, materials) {
    const {
      width = 3.80,
      height = 4.60,
      wallThickness = 0.80,
      hasWindow = true
    } = options;

    const group = new THREE.Group();
    const stoneMat = materials.getMaterial('stone', 1.0, 1.0);
    const brickMat = materials.getMaterial('brick', 1.2, 1.2);
    const woodMat = materials.getMaterial('wood', 1.0, 1.0);
    const ironMat = materials.iron;

    // 1. RECESSED DOORWAY (Gömme Taş Söveli Kapı)
    const doorWidth = 1.10;
    const doorHeight = 2.20;
    const doorRecess = 0.40;
    const doorX = hasWindow ? -0.85 : 0;

    // Left and Right Wall sections around door
    const leftWallWidth = (width / 2) + (doorX - doorWidth / 2);
    const leftWallGeo = new THREE.BoxGeometry(leftWallWidth, height, wallThickness);
    const leftWall = new THREE.Mesh(leftWallGeo, stoneMat);
    leftWall.position.set(-width / 2 + leftWallWidth / 2, height / 2, -wallThickness / 2);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    const rightStartX = hasWindow ? (doorX + doorWidth / 2) : (doorWidth / 2);
    const rightWallWidth = (width / 2) - rightStartX;
    
    if (hasWindow) {
      // If there is a window, divide the right section into:
      // pillar between door and window, window opening (top & bottom walls), and far right wall
      const windowWidth = 0.90;
      const windowHeight = 1.30;
      const windowSillY = 0.90;
      const windowX = 0.95;

      // Wall between door and window
      const midWidth = (windowX - windowWidth / 2) - (doorX + doorWidth / 2);
      const midGeo = new THREE.BoxGeometry(midWidth, height, wallThickness);
      const midWall = new THREE.Mesh(midGeo, stoneMat);
      midWall.position.set((doorX + doorWidth / 2) + midWidth / 2, height / 2, -wallThickness / 2);
      midWall.castShadow = true;
      midWall.receiveShadow = true;
      group.add(midWall);

      // Wall below window (parapet)
      const belowWinGeo = new THREE.BoxGeometry(windowWidth, windowSillY, wallThickness);
      const belowWin = new THREE.Mesh(belowWinGeo, stoneMat);
      belowWin.position.set(windowX, windowSillY / 2, -wallThickness / 2);
      belowWin.castShadow = true;
      belowWin.receiveShadow = true;
      group.add(belowWin);

      // Wall above window (lintel)
      const aboveWinH = height - (windowSillY + windowHeight);
      const aboveWinGeo = new THREE.BoxGeometry(windowWidth, aboveWinH, wallThickness);
      const aboveWin = new THREE.Mesh(aboveWinGeo, stoneMat);
      aboveWin.position.set(windowX, height - aboveWinH / 2, -wallThickness / 2);
      aboveWin.castShadow = true;
      aboveWin.receiveShadow = true;
      group.add(aboveWin);

      // Wall to the right of window
      const farRightW = (width / 2) - (windowX + windowWidth / 2);
      const farRightGeo = new THREE.BoxGeometry(farRightW, height, wallThickness);
      const farRight = new THREE.Mesh(farRightGeo, stoneMat);
      farRight.position.set(width / 2 - farRightW / 2, height / 2, -wallThickness / 2);
      farRight.castShadow = true;
      farRight.receiveShadow = true;
      group.add(farRight);

      // Wrought Iron Window Grilles (Ferforje Parmaklıklar)
      const grilleCount = 4;
      const grilleGeo = new THREE.CylinderGeometry(0.015, 0.015, windowHeight, 6);
      for (let i = 0; i < grilleCount; i++) {
        const gx = (windowX - windowWidth / 2) + (i + 0.5) * (windowWidth / grilleCount);
        const bar = new THREE.Mesh(grilleGeo, ironMat);
        bar.position.set(gx, windowSillY + windowHeight / 2, -doorRecess);
        bar.castShadow = false;
        bar.receiveShadow = true;
        group.add(bar);
      }
      // Horizontal crossbars
      const hBarGeo = new THREE.BoxGeometry(windowWidth, 0.02, 0.02);
      const hBar1 = new THREE.Mesh(hBarGeo, ironMat);
      hBar1.position.set(windowX, windowSillY + windowHeight * 0.33, -doorRecess);
      group.add(hBar1);
      const hBar2 = new THREE.Mesh(hBarGeo, ironMat);
      hBar2.position.set(windowX, windowSillY + windowHeight * 0.66, -doorRecess);
      group.add(hBar2);

      // Wooden Shutter (Açık ahşap kepenk)
      const shutterGeo = new THREE.BoxGeometry(0.42, windowHeight, 0.04);
      const shutterLeft = new THREE.Mesh(shutterGeo, woodMat);
      shutterLeft.position.set(windowX - windowWidth / 2 - 0.20, windowSillY + windowHeight / 2, -0.05);
      shutterLeft.rotation.y = 0.35;
      shutterLeft.castShadow = true;
      group.add(shutterLeft);

      const shutterRight = new THREE.Mesh(shutterGeo, woodMat);
      shutterRight.position.set(windowX + windowWidth / 2 + 0.20, windowSillY + windowHeight / 2, -0.05);
      shutterRight.rotation.y = -0.35;
      shutterRight.castShadow = true;
      group.add(shutterRight);
    } else {
      const rightWallGeo = new THREE.BoxGeometry(rightWallWidth, height, wallThickness);
      const rightWall = new THREE.Mesh(rightWallGeo, stoneMat);
      rightWall.position.set(width / 2 - rightWallWidth / 2, height / 2, -wallThickness / 2);
      rightWall.castShadow = true;
      rightWall.receiveShadow = true;
      group.add(rightWall);
    }

    // Wall section above door (Lintel & Spandrel)
    const aboveDoorH = height - doorHeight;
    const aboveDoorGeo = new THREE.BoxGeometry(doorWidth, aboveDoorH, wallThickness);
    const aboveDoor = new THREE.Mesh(aboveDoorGeo, stoneMat);
    aboveDoor.position.set(doorX, height - aboveDoorH / 2, -wallThickness / 2);
    aboveDoor.castShadow = true;
    aboveDoor.receiveShadow = true;
    group.add(aboveDoor);

    // Stone Arch Jambs around door (Söve)
    const jambGeo = new THREE.BoxGeometry(0.12, doorHeight, doorRecess);
    const jambLeft = new THREE.Mesh(jambGeo, stoneMat);
    jambLeft.position.set(doorX - doorWidth / 2 + 0.06, doorHeight / 2, -doorRecess / 2);
    group.add(jambLeft);

    const jambRight = new THREE.Mesh(jambGeo, stoneMat);
    jambRight.position.set(doorX + doorWidth / 2 - 0.06, doorHeight / 2, -doorRecess / 2);
    group.add(jambRight);

    // Arched Stone Lintel over Door
    const lintelGeo = new THREE.BoxGeometry(doorWidth + 0.20, 0.35, doorRecess + 0.05);
    const lintel = new THREE.Mesh(lintelGeo, brickMat);
    lintel.position.set(doorX, doorHeight + 0.175, -doorRecess / 2);
    lintel.castShadow = true;
    group.add(lintel);

    // Wooden Door (Masif Ahşap Kapı) inside recess
    const doorLeafW = (doorWidth - 0.12) / 2;
    const doorLeafGeo = new THREE.BoxGeometry(doorLeafW, doorHeight - 0.04, 0.06);
    
    // Left Leaf
    const leafLeft = new THREE.Mesh(doorLeafGeo, woodMat);
    leafLeft.position.set(doorX - doorLeafW / 2, (doorHeight - 0.04) / 2, -doorRecess);
    leafLeft.castShadow = true;
    group.add(leafLeft);

    // Right Leaf
    const leafRight = new THREE.Mesh(doorLeafGeo, woodMat);
    leafRight.position.set(doorX + doorLeafW / 2, (doorHeight - 0.04) / 2, -doorRecess);
    leafRight.castShadow = true;
    group.add(leafRight);

    // Iron Door Handle and Knockers (Kapı Tokmağı)
    const knockerGeo = new THREE.TorusGeometry(0.04, 0.01, 8, 16);
    const knockerLeft = new THREE.Mesh(knockerGeo, ironMat);
    knockerLeft.position.set(doorX - 0.10, 1.05, -doorRecess + 0.04);
    group.add(knockerLeft);

    const knockerRight = new THREE.Mesh(knockerGeo, ironMat);
    knockerRight.position.set(doorX + 0.10, 1.05, -doorRecess + 0.04);
    group.add(knockerRight);

    // Horizontal Brick Almaşık Belt across the top
    const beltGeo = new THREE.BoxGeometry(width, 0.22, 0.06);
    const belt = new THREE.Mesh(beltGeo, brickMat);
    belt.position.set(0, height - 0.30, 0.03);
    group.add(belt);

    return group;
  }
}
