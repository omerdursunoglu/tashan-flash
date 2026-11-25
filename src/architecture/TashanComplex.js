import * as THREE from 'three';
import { ArchBay } from './ArchBay.js';
import { VaultCeiling } from './VaultCeiling.js';
import { ShopFacade } from './ShopFacade.js';
import { StoneStairs } from './StoneStairs.js';
import { MainPortal } from './MainPortal.js';
import { RoofSystem } from './RoofSystem.js';
import { CourtyardProps } from './CourtyardProps.js';

export class TashanComplex {
  constructor(materials) {
    this.materials = materials;
    this.root = new THREE.Group();
    this.colliders = [];
    this.lanterns = [];
  }

  build() {
    const materials = this.materials;
    const stoneMat = materials.getMaterial('stone', 1.0, 1.0);
    const brickMat = materials.getMaterial('brick', 1.2, 1.2);
    const cobbleMat = materials.getMaterial('cobble', 25.0, 15.0);
    const upperFloorMat = materials.getMaterial('stone', 15.0, 8.0);

    // Architectural dimensions
    const baySpan = 3.80;
    const numBaysX = 14; // North & South rows (53.2m)
    const numBaysZ = 7;  // East & West rows (26.6m)
    const corridorDepth = 3.20;
    const groundFloorHeight = 4.60;
    const upperFloorHeight = 4.20;
    const totalEavesHeight = groundFloorHeight + upperFloorHeight; // 8.80m

    const halfX = (numBaysX * baySpan) / 2; // 26.60m
    const halfZ = (numBaysZ * baySpan) / 2; // 13.30m

    // Exterior perimeter wall coordinates
    const outerWallX = halfX + corridorDepth + 4.50; // ~34.3m
    const outerWallZ = halfZ + corridorDepth + 4.50; // ~21.0m
    const wallThick = 1.00;

    // ==========================================
    // 1. FLOORS & PAVING
    // ==========================================
    // A. Central Courtyard and Exterior Surrounding Stone Paving (±0.00m)
    // Extends 30m beyond exterior walls so outside the Taçkapı is solid street stone
    const groundPavingL = outerWallX * 2 + 35.0;
    const groundPavingW = outerWallZ * 2 + 35.0;
    const courtFloorGeo = new THREE.PlaneGeometry(groundPavingL, groundPavingW);
    const courtFloor = new THREE.Mesh(courtFloorGeo, cobbleMat);
    courtFloor.rotation.x = -Math.PI / 2;
    courtFloor.position.y = 0;
    courtFloor.receiveShadow = true;
    courtFloor.name = 'floor_ground';
    this.root.add(courtFloor);
    this.colliders.push(courtFloor);

    // Corner Masonry Piers tying the 4 wings together into a solid structure
    const cornerPierW = baySpan * 0.45;
    const cornerPierGeo = new THREE.BoxGeometry(cornerPierW, totalEavesHeight, cornerPierW);
    const corners = [
      { x: -halfX, z: -halfZ },
      { x: halfX, z: -halfZ },
      { x: -halfX, z: halfZ },
      { x: halfX, z: halfZ }
    ];
    corners.forEach((c) => {
      const pier = new THREE.Mesh(cornerPierGeo, stoneMat);
      pier.position.set(c.x, totalEavesHeight / 2, c.z);
      pier.castShadow = true;
      pier.receiveShadow = true;
      this.root.add(pier);
      this.colliders.push(pier);
    });

    // B. Upper Floor Gallery Walkway (Ring floor at +4.60m)
    const ringOuterL = (halfX + corridorDepth) * 2;
    const ringOuterW = (halfZ + corridorDepth) * 2;
    const ringInnerL = halfX * 2;
    const ringInnerW = halfZ * 2;

    const upperFloorShape = new THREE.Shape();
    upperFloorShape.moveTo(-ringOuterL / 2, -ringOuterW / 2);
    upperFloorShape.lineTo(ringOuterL / 2, -ringOuterW / 2);
    upperFloorShape.lineTo(ringOuterL / 2, ringOuterW / 2);
    upperFloorShape.lineTo(-ringOuterL / 2, ringOuterW / 2);
    upperFloorShape.closePath();

    const upperInnerHole = new THREE.Path();
    upperInnerHole.moveTo(-ringInnerL / 2, -ringInnerW / 2);
    upperInnerHole.lineTo(ringInnerL / 2, -ringInnerW / 2);
    upperInnerHole.lineTo(ringInnerL / 2, ringInnerW / 2);
    upperInnerHole.lineTo(-ringInnerL / 2, ringInnerW / 2);
    upperInnerHole.closePath();
    upperFloorShape.holes.push(upperInnerHole);

    const upperFloorGeo = new THREE.ExtrudeGeometry(upperFloorShape, {
      steps: 1,
      depth: 0.25,
      bevelEnabled: false
    });
    upperFloorGeo.rotateX(Math.PI / 2);
    upperFloorGeo.translate(0, groundFloorHeight, 0);

    const upperFloorMesh = new THREE.Mesh(upperFloorGeo, upperFloorMat);
    upperFloorMesh.receiveShadow = true;
    upperFloorMesh.castShadow = true;
    upperFloorMesh.name = 'floor_upper';
    this.root.add(upperFloorMesh);
    this.colliders.push(upperFloorMesh);

    // ==========================================
    // 2. ARCADES, VAULTS & SHOP FACADES (2 FLOORS)
    // ==========================================
    // Helper function to build a side arcade
    const buildArcadeSide = (count, isAlongX, sign) => {
      for (let i = 0; i < count; i++) {
        const offset = -((count - 1) * baySpan) / 2 + i * baySpan;

        // Skip middle bays on West ground floor where monumental portal connects!
        const isWestPortalZone = (!isAlongX && sign < 0 && Math.abs(offset) < baySpan * 1.2);

        // GROUND FLOOR BAY
        if (!isWestPortalZone) {
          const bayG = ArchBay.createBay({
            span: baySpan,
            height: groundFloorHeight,
            springY: 2.80,
            apexY: 4.10,
            depth: 0.65,
            pillarWidth: 0.65,
            hasBalustrade: false
          }, materials);

          // Vault Ceiling
          const vaultG = VaultCeiling.createVault({
            width: baySpan,
            depth: corridorDepth,
            springY: 3.20,
            rise: 0.85
          }, materials);

          // Shop Facade
          const shopG = ShopFacade.createFacade({
            width: baySpan,
            height: groundFloorHeight,
            wallThickness: 0.80,
            hasWindow: (i % 2 === 0)
          }, materials);
          shopG.position.z = -corridorDepth;

          const bayUnitG = new THREE.Group();
          bayUnitG.add(bayG);
          bayUnitG.add(vaultG);
          bayUnitG.add(shopG);

          // Position & orient the bay unit
          if (isAlongX) {
            bayUnitG.position.set(offset, 0, sign * halfZ);
            bayUnitG.rotation.y = (sign > 0) ? Math.PI : 0;
          } else {
            bayUnitG.position.set(sign * halfX, 0, offset);
            bayUnitG.rotation.y = (sign > 0) ? -Math.PI / 2 : Math.PI / 2;
          }
          this.root.add(bayUnitG);
          this.colliders.push(bayUnitG);
        }

        // UPPER FLOOR BAY (1. KAT)
        // Open balustrade at South Bay 0 where the monumental stone stairs connect to the gallery
        const isStairsOpening = (isAlongX && sign < 0 && i === 0);
        const bayU = ArchBay.createBay({
          span: baySpan,
          height: upperFloorHeight,
          springY: 2.50,
          apexY: 3.75,
          depth: 0.60,
          pillarWidth: 0.60,
          hasBalustrade: !isStairsOpening // Open gallery entry for stairs!
        }, materials);

        // Vault Ceiling Upper
        const vaultU = VaultCeiling.createVault({
          width: baySpan,
          depth: corridorDepth,
          springY: 2.90,
          rise: 0.75
        }, materials);

        // Shop Facade Upper
        const shopU = ShopFacade.createFacade({
          width: baySpan,
          height: upperFloorHeight,
          wallThickness: 0.80,
          hasWindow: true
        }, materials);
        shopU.position.z = -corridorDepth;

        const bayUnitU = new THREE.Group();
        bayUnitU.add(bayU);
        bayUnitU.add(vaultU);
        bayUnitU.add(shopU);
        bayUnitU.position.y = groundFloorHeight;

        if (isAlongX) {
          bayUnitU.position.set(offset, groundFloorHeight, sign * halfZ);
          bayUnitU.rotation.y = (sign > 0) ? Math.PI : 0;
        } else {
          bayUnitU.position.set(sign * halfX, groundFloorHeight, offset);
          bayUnitU.rotation.y = (sign > 0) ? -Math.PI / 2 : Math.PI / 2;
        }
        this.root.add(bayUnitU);
        this.colliders.push(bayUnitU);
      }
    };

    // Build 4 sides
    buildArcadeSide(numBaysX, true, -1); // South Arcade (14 bays)
    buildArcadeSide(numBaysX, true, 1);  // North Arcade (14 bays)
    buildArcadeSide(numBaysZ, false, 1); // East Arcade (7 bays)
    buildArcadeSide(numBaysZ, false, -1); // West Arcade (7 bays with portal opening)

    // ==========================================
    // 3. MONUMENTAL TAÇKAPI (Main Entrance Portal)
    // ==========================================
    const portalWidth = 8.40;
    const portalDepth = outerWallX - halfX; // Exactly bridges inner arcade to outer wall face (~7.70m)
    const portal = MainPortal.createPortal({
      width: portalWidth,
      height: totalEavesHeight,
      depth: portalDepth
    }, materials);
    portal.position.set(-halfX, 0, 0);
    portal.rotation.y = -Math.PI / 2; // Facing outward towards West (-X)
    this.root.add(portal);
    this.colliders.push(portal);

    // ==========================================
    // 4. STONE STAIRCASE (Merdivenler)
    // ==========================================
    // Situated at South-West courtyard corner, leading smoothly to 2nd floor gallery
    const stairsObj = StoneStairs.createStairs({
      stepCount: 27,
      stepWidth: 1.60,
      stepTread: 0.32,
      stepRiser: 0.17037,
      landingDepth: 2.00
    }, materials);

    // Starts at courtyard level (z = -3.86m) and ascends southward towards the South gallery walkway (+4.60m)
    // Connecting flush at bay 0 of South arcade (x = -24.70m, z = -13.30m)
    stairsObj.group.position.set(-24.70, 0, -3.86);
    stairsObj.group.rotation.y = 0;
    this.root.add(stairsObj.group);
    this.colliders.push(stairsObj.group);

    // ==========================================
    // 5. EXTERIOR PERIMETER WALLS
    // ==========================================
    // Authentic thick Ottoman exterior walls backing the shop rooms
    const buildOuterWall = (w, h, d, x, y, z) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, stoneMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = 'outer_wall';
      this.root.add(mesh);
      this.colliders.push(mesh);
    };

    // North & South Outer Walls
    buildOuterWall(outerWallX * 2, totalEavesHeight, wallThick, 0, totalEavesHeight / 2, outerWallZ);
    buildOuterWall(outerWallX * 2, totalEavesHeight, wallThick, 0, totalEavesHeight / 2, -outerWallZ);
    // East Outer Wall
    buildOuterWall(wallThick, totalEavesHeight, outerWallZ * 2, outerWallX, totalEavesHeight / 2, 0);
    // West Outer Wall (left & right flanking the monumental portal opening)
    const westSegmentL = (outerWallZ * 2 - portalWidth) / 2;
    buildOuterWall(wallThick, totalEavesHeight, westSegmentL, -outerWallX, totalEavesHeight / 2, -outerWallZ + westSegmentL / 2);
    buildOuterWall(wallThick, totalEavesHeight, westSegmentL, -outerWallX, totalEavesHeight / 2, outerWallZ - westSegmentL / 2);

    // ==========================================
    // 6. ROOF SYSTEM (Terracotta Hip Roof)
    // ==========================================
    const roof = RoofSystem.createRoof({
      outerLength: outerWallX * 2 + 1.2,
      outerWidth: outerWallZ * 2 + 1.2,
      courtyardLength: halfX * 2 - 0.4,
      courtyardWidth: halfZ * 2 - 0.4,
      baseY: totalEavesHeight,
      roofHeight: 3.10,
      eavesOverhang: 0.90
    }, materials);
    this.root.add(roof);

    // ==========================================
    // 7. COURTYARD PROPS (Pool, Trees, Tables, Lanterns)
    // ==========================================
    const props = CourtyardProps.createProps(materials);
    this.root.add(props.group);
    this.colliders.push(...props.colliders);
    this.lanterns.push(...props.lanterns);

    return {
      group: this.root,
      colliders: this.colliders,
      lanterns: this.lanterns
    };
  }
}
