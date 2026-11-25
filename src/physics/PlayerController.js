import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { MeshBVH, StaticGeometryGenerator, acceleratedRaycast } from 'three-mesh-bvh';

THREE.BufferGeometry.prototype.raycast = acceleratedRaycast;

export class PlayerController {
  constructor(camera, domElement, scene) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;

    this.controls = new PointerLockControls(camera, domElement);

    // Player dimensions
    this.playerRadius = 0.28;
    this.eyeHeight = 1.70;
    this.maxStepHeight = 0.38;

    this.position = new THREE.Vector3(0, 1.70, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Responsive movement speeds
    this.walkSpeed = 5.5;
    this.sprintSpeed = 10.5;
    this.flySpeed = 12.0;
    this.acceleration = 45.0;
    this.damping = 12.0;
    this.gravity = 24.0;
    this.jumpForce = 7.0;

    this.isGrounded = true;
    this.isFlying = false;

    // Key states
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      sprint: false,
      jump: false
    };

    // Mouse drag support when pointer is unlocked
    this.isMouseDown = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // BVH collider mesh
    this.colliderMesh = null;
    this.downRaycaster = new THREE.Raycaster();
    this.downRaycaster.firstHitOnly = true;

    this.forwardRaycaster = new THREE.Raycaster();
    this.forwardRaycaster.firstHitOnly = true;

    this.setupInputs();
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'KeyE':
          this.keys.up = true;
          break;
        case 'KeyQ':
          this.keys.down = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = true;
          break;
        case 'Space':
          if (!this.isFlying && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
          }
          this.keys.jump = true;
          break;
        case 'KeyV':
          this.toggleFlyMode();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'KeyE':
          this.keys.up = false;
          break;
        case 'KeyQ':
          this.keys.down = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
      }
    });

    // Mouse drag support when pointer is NOT locked
    this.domElement.addEventListener('mousedown', (e) => {
      if (!this.controls.isLocked) {
        this.isMouseDown = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown && !this.controls.isLocked) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        const sensitivity = 0.003;
        this.camera.rotation.y -= deltaX * sensitivity;
        this.camera.rotation.x -= deltaY * sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.camera.rotation.x));
        this.camera.rotation.z = 0;

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });
  }

  toggleFlyMode() {
    this.isFlying = !this.isFlying;
    this.velocity.set(0, 0, 0);
    const flyBtn = document.getElementById('fly-btn');
    if (flyBtn) {
      flyBtn.classList.toggle('active', this.isFlying);
      flyBtn.innerText = this.isFlying ? '🕊️ Serbest Uçuş (Açık)' : '🚶 Yürüme Modu';
    }
    console.log(`Fly mode: ${this.isFlying ? 'ON' : 'OFF'}`);
  }

  /**
   * Initializes simplified, ultra-fast BVH collider
   */
  initBVH(collidersGroup) {
    console.log('Building high-speed BVH collider...');
    const collisionGroup = new THREE.Group();

    const processObject = (obj) => {
      obj.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const isTiny = child.geometry.type === 'CylinderGeometry' && (child.geometry.parameters?.radiusTop < 0.06);
          const isLeaf = child.material?.transparent && child.material?.alphaTest;
          const isNoCol = child.userData?.noCollision === true;

          if (!isTiny && !isLeaf && !isNoCol) {
            try {
              child.updateWorldMatrix(true, false);
              const sourceGeo = child.geometry;
              const nonIndexed = sourceGeo.index ? sourceGeo.toNonIndexed() : sourceGeo.clone();

              const colGeo = new THREE.BufferGeometry();
              colGeo.setAttribute('position', nonIndexed.attributes.position.clone());
              colGeo.applyMatrix4(child.matrixWorld);

              const colMesh = new THREE.Mesh(colGeo);
              collisionGroup.add(colMesh);
            } catch (e) {
              // skip
            }
          }
        }
      });
    };

    if (Array.isArray(collidersGroup)) {
      collidersGroup.forEach((c) => processObject(c));
    } else {
      processObject(collidersGroup);
    }

    const staticGen = new StaticGeometryGenerator(collisionGroup);
    staticGen.attributes = ['position'];
    const mergedGeo = staticGen.generate();
    mergedGeo.boundsTree = new MeshBVH(mergedGeo, { maxLeafTris: 16 });

    this.colliderMesh = new THREE.Mesh(mergedGeo, new THREE.MeshBasicMaterial({ visible: false }));
    this.colliderMesh.name = 'unified_bvh_collider';
    this.scene.add(this.colliderMesh);
    console.log(`High-speed BVH collider ready (${mergedGeo.attributes.position.count / 3} tris).`);
  }

  teleport(x, y, z, lookTarget = null) {
    this.position.set(x, y, z);
    this.camera.position.set(x, y, z);
    this.velocity.set(0, 0, 0);

    if (lookTarget) {
      const dx = lookTarget.x - x;
      const dy = lookTarget.y - y;
      const dz = lookTarget.z - z;
      const yaw = Math.atan2(-dx, -dz);
      const distXZ = Math.sqrt(dx * dx + dz * dz);
      const pitch = Math.atan2(dy, distXZ);

      this.camera.rotation.set(0, 0, 0, 'YXZ');
      this.camera.rotation.y = yaw;
      this.camera.rotation.x = pitch;
      this.camera.rotation.z = 0;
    }
  }

  update(delta) {
    if (delta > 0.05) delta = 0.05; // clamp spikes

    // 1. Calculate desired movement direction relative to camera yaw
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);

    let moveDir = new THREE.Vector3();

    if (this.isFlying) {
      // Full 3D Flight (Fly Mode)
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      if (this.keys.forward) moveDir.add(forward);
      if (this.keys.backward) moveDir.sub(forward);
      if (this.keys.right) moveDir.add(right);
      if (this.keys.left) moveDir.sub(right);
      if (this.keys.up || this.keys.jump) moveDir.y += 1.0;
      if (this.keys.down) moveDir.y -= 1.0;

      if (moveDir.lengthSq() > 0.001) moveDir.normalize();

      const speed = this.keys.sprint ? this.flySpeed * 2.0 : this.flySpeed;
      this.position.addScaledVector(moveDir, speed * delta);
      this.camera.position.copy(this.position);
      return;
    }

    // Walking Mode
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (this.keys.forward) moveDir.add(forward);
    if (this.keys.backward) moveDir.sub(forward);
    if (this.keys.right) moveDir.add(right);
    if (this.keys.left) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) moveDir.normalize();

    const currentSpeed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;
    const targetVelX = moveDir.x * currentSpeed;
    const targetVelZ = moveDir.z * currentSpeed;

    // Smooth horizontal acceleration
    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1.0, this.acceleration * delta);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1.0, this.acceleration * delta);

    if (!isMoving) {
      this.velocity.x -= this.velocity.x * Math.min(1.0, this.damping * delta);
      this.velocity.z -= this.velocity.z * Math.min(1.0, this.damping * delta);
    }

    // 2. High-speed single-ray forward obstacle check (0.1ms per frame)
    if (this.colliderMesh && isMoving) {
      const horizontalMove = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
      const moveDistance = horizontalMove.length() * delta;
      const checkDir = horizontalMove.clone().normalize();

      // Probe forward at chest height (1.10m above feet) to check for solid walls
      const probeOrigin = new THREE.Vector3(
        this.position.x,
        this.position.y - this.eyeHeight + 1.10,
        this.position.z
      );

      this.forwardRaycaster.set(probeOrigin, checkDir);
      this.forwardRaycaster.far = this.playerRadius + moveDistance + 0.08;

      const hits = this.forwardRaycaster.intersectObject(this.colliderMesh);
      if (hits.length > 0) {
        for (let i = 0; i < hits.length; i++) {
          const hit = hits[i];
          const normal = hit.normal || (hit.face ? hit.face.normal : null);
          // Only vertical surfaces (walls, piers, closed railings) block motion; inclined slopes (ramps/stairs) do not!
          if (normal && Math.abs(normal.y) < 0.5) {
            const dot = this.velocity.x * normal.x + this.velocity.z * normal.z;
            if (dot < 0) {
              this.velocity.x -= normal.x * dot;
              this.velocity.z -= normal.z * dot;
            }
            break;
          }
        }
      }
    }

    // Apply horizontal position
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    // Outer courtyard bounding clamp (Prevents accidentally walking into the void)
    const maxBoundX = 40.0;
    const maxBoundZ = 28.0;
    this.position.x = Math.max(-maxBoundX, Math.min(maxBoundX, this.position.x));
    this.position.z = Math.max(-maxBoundZ, Math.min(maxBoundZ, this.position.z));

    // 3. Ultra-fast Ground / Floor / Stair Height Tracking via Single Downward Ray
    if (this.colliderMesh) {
      // Ray starts at knee height (0.60m above feet) to avoid interference with ceilings/vaults
      const rayOrigin = new THREE.Vector3(
        this.position.x,
        this.position.y - this.eyeHeight + 0.60,
        this.position.z
      );
      this.downRaycaster.set(rayOrigin, new THREE.Vector3(0, -1, 0));
      this.downRaycaster.far = 4.0;

      const groundHits = this.downRaycaster.intersectObject(this.colliderMesh);
      let groundHit = null;

      for (let i = 0; i < groundHits.length; i++) {
        const gh = groundHits[i];
        const normal = gh.normal || (gh.face ? gh.face.normal : null);
        // Only accept upward-facing walkable surfaces
        if (!normal || normal.y > 0.45) {
          groundHit = gh;
          break;
        }
      }

      if (groundHit && groundHit.point) {
        const groundY = groundHit.point.y;
        const targetEyeY = groundY + this.eyeHeight;

        const diffY = targetEyeY - this.position.y;

        if (diffY > 0 && diffY <= 1.5) {
          // Smoothly climb stairs, steps, or ramps
          this.position.y += diffY * Math.min(1.0, 25.0 * delta);
          this.velocity.y = 0;
          this.isGrounded = true;
        } else if (diffY < 0 && Math.abs(diffY) <= 1.5) {
          // Smoothly step down
          this.position.y += diffY * Math.min(1.0, 25.0 * delta);
          this.velocity.y = 0;
          this.isGrounded = true;
        } else {
          // Airborne / falling
          this.velocity.y -= this.gravity * delta;
          this.position.y += this.velocity.y * delta;
          if (this.position.y <= targetEyeY) {
            this.position.y = targetEyeY;
            this.velocity.y = 0;
            this.isGrounded = true;
          }
        }
      } else {
        // Fallback ground level (±0.00m)
        const defaultEyeY = this.eyeHeight;
        if (this.position.y > defaultEyeY) {
          this.velocity.y -= this.gravity * delta;
          this.position.y += this.velocity.y * delta;
          if (this.position.y <= defaultEyeY) {
            this.position.y = defaultEyeY;
            this.velocity.y = 0;
            this.isGrounded = true;
          }
        } else {
          this.position.y = defaultEyeY;
          this.velocity.y = 0;
          this.isGrounded = true;
        }
      }
    } else {
      this.position.y = this.eyeHeight;
    }

    // Sync camera position
    this.camera.position.copy(this.position);
  }
}
