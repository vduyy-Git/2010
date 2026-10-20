import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CONFIG = window.SAKURA_CONFIG;
const host = document.querySelector('#scene-host');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const random = (min, max) => min + Math.random() * (max - min);
const petalTransform = new THREE.Object3D();

try {
  startExperience();
} catch (error) {
  console.error('Không thể khởi tạo khu vườn 3D:', error);
  window.showSakuraFallback?.();
}

function startExperience() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x21132f, 0.022);

  const compactView = innerWidth < 700;
  const camera = new THREE.PerspectiveCamera(compactView ? 52 : 39, innerWidth / innerHeight, 0.1, 90);
  camera.position.set(compactView ? 10 : 8.8, compactView ? 8 : 7.2, compactView ? 17 : 12.5);
  camera.lookAt(0, 2.7, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Cảnh 3D của chú thỏ và cây anh đào; kéo để xoay, cuộn để phóng to');
  renderer.domElement.tabIndex = 0;
  host.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2.75, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minDistance = compactView ? 11 : 8.2;
  controls.maxDistance = compactView ? 26 : 19;
  controls.minPolarAngle = 0.48;
  controls.maxPolarAngle = 1.42;
  controls.rotateSpeed = 0.48;
  controls.zoomSpeed = 0.65;
  controls.update();
  controls.saveState();
  renderer.domElement.style.cursor = 'grab';

  scene.add(new THREE.HemisphereLight(0xd9caff, 0x161729, 1.55));
  const moonLight = new THREE.DirectionalLight(0xd9c6ff, 2.5);
  moonLight.position.set(-5, 10, 6);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.left = -9;
  moonLight.shadow.camera.right = 9;
  moonLight.shadow.camera.top = 10;
  moonLight.shadow.camera.bottom = -8;
  moonLight.shadow.bias = -0.001;
  scene.add(moonLight);
  const warmLight = new THREE.PointLight(0xf19caf, 16, 17, 2);
  warmLight.position.set(1, 3.5, 2.8);
  scene.add(warmLight);
  const blossomGlow = new THREE.PointLight(0xe954bb, 13, 10, 2);
  blossomGlow.position.set(0, 5.5, 0);
  scene.add(blossomGlow);

  createMoon(scene);
  const stars = createStars(scene);
  createGround(scene);
  const tree = createCherryTree(scene);
  const lanterns = createLanterns(scene);
  const bunny = createBunny(scene);
  const gifts = createGifts(scene);
  const petals = createFallingPetals(scene);
  const giftMotion = gifts.map((gift, index) => ({
    root: gift,
    angle: gift.userData.orbitAngle,
    radius: gift.userData.orbitRadius,
    baseY: gift.userData.baseY,
    phase: index * 1.7
  }));

  document.querySelector('#reset-camera').addEventListener('click', () => controls.reset());

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const giftMeshes = gifts.flatMap(gift => gift.userData.hitMeshes);
  let hoveredGift = null;

  function setHovered(gift) {
    if (hoveredGift === gift) return;
    if (hoveredGift) hoveredGift.userData.materials.forEach(material => material.emissive.setHex(0x000000));
    hoveredGift = gift;
    if (hoveredGift) hoveredGift.userData.materials.forEach(material => material.emissive.setHex(0x38202c));
    renderer.domElement.style.cursor = hoveredGift ? 'pointer' : 'grab';
  }

  function giftAt(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(giftMeshes, false)[0]?.object;
    return hit?.userData.giftRoot || null;
  }

  renderer.domElement.addEventListener('pointermove', event => setHovered(giftAt(event)));
  renderer.domElement.addEventListener('pointerleave', () => setHovered(null));
  renderer.domElement.addEventListener('click', event => {
    const gift = giftAt(event);
    if (gift) window.openSakuraGift?.(gift.userData.giftId, renderer.domElement);
  });

  const resize = () => {
    const width = host.clientWidth || innerWidth;
    const height = host.clientHeight || innerHeight;
    camera.aspect = width / height;
    camera.fov = width < 700 ? 52 : 39;
    controls.minDistance = width < 700 ? 11 : 8.2;
    controls.maxDistance = width < 700 ? 26 : 19;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', resize, { passive: true });

  const clock = new THREE.Clock();
  let frame = 0;
  let lastTime = 0;
  let bunnyRunAngle = 0;
  let rabbitCycle = 0;
  let jumpClock = 0;
  let jumpProgress = -1;
  const resetRabbitIdle = () => { jumpClock = 0; };
  document.addEventListener('pointerdown', resetRabbitIdle, { passive: true });
  document.addEventListener('keydown', resetRabbitIdle);
  window.addEventListener('wheel', resetRabbitIdle, { passive: true });
  function animate(now = 0) {
    if (document.hidden) return;
    frame = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    lastTime += delta;

    if (!reducedMotion) {
      tree.rotation.z = Math.sin(lastTime * 0.38) * 0.009;
      tree.rotation.x = Math.sin(lastTime * 0.29) * 0.006;
      stars.material.opacity = 0.68 + Math.sin(lastTime * 0.7) * 0.12;
      animatePetals(petals, delta);

      // The little rabbit trots for a moment, then pauses to look around.
      rabbitCycle = (rabbitCycle + delta) % 6.4;
      const rabbitIsRunning = rabbitCycle < 2.35 && jumpProgress < 0;
      if (rabbitIsRunning) bunnyRunAngle += delta * 0.72;
      bunny.root.position.x = Math.cos(bunnyRunAngle) * 2.45;
      bunny.root.position.z = Math.sin(bunnyRunAngle) * 2.15;
      bunny.root.rotation.y = -bunnyRunAngle + (rabbitIsRunning ? 0 : Math.sin(lastTime * 1.35) * 0.12);
      bunny.root.position.y = 0.03;
      bunny.head.rotation.y = rabbitIsRunning ? 0 : Math.sin(lastTime * 1.2) * 0.3;
      bunny.leftEar.rotation.z = Math.sin(lastTime * (rabbitIsRunning ? 1.15 : 2.1)) * 0.035;
      bunny.rightEar.rotation.z = 0.08 + Math.sin(lastTime * 0.92 + 1.3) * 0.03;
      bunny.body.scale.y = 1 + (rabbitIsRunning ? Math.abs(Math.sin(lastTime * 8.5)) * 0.035 : Math.sin(lastTime * 2.2) * 0.008);
      bunny.paws.forEach((paw, index) => {
        paw.rotation.x = rabbitIsRunning ? Math.sin(lastTime * 8.5 + (index % 2 ? Math.PI : 0)) * 0.24 : 0;
      });

      const giftDialogOpen = document.querySelector('#photo-dialog').classList.contains('is-open');
      if (giftDialogOpen) jumpClock = 0;
      if (jumpProgress < 0 && !giftDialogOpen) {
        jumpClock += delta;
        if (jumpClock >= 7) { jumpClock = 0; jumpProgress = 0; }
      }
      if (jumpProgress >= 0) {
        jumpProgress += delta / 0.95;
        if (jumpProgress >= 1) jumpProgress = -1;
        const arc = jumpProgress < 1 ? Math.sin(jumpProgress * Math.PI) : 0;
        bunny.root.position.y = 0.03 + arc * 0.82;
        bunny.body.rotation.x = jumpProgress < 1 ? -arc * 0.16 : 0;
        bunny.catchPetal.visible = jumpProgress > 0.48 && jumpProgress < 0.83;
      } else {
        bunny.body.rotation.x = 0;
        bunny.catchPetal.visible = false;
      }

      giftMotion.forEach(item => {
        item.angle += delta * 0.055;
        item.root.position.set(
          Math.cos(item.angle) * item.radius,
          item.baseY + Math.sin(lastTime * 0.8 + item.phase) * 0.13,
          Math.sin(item.angle) * item.radius
        );
        item.root.rotation.y = item.angle * 0.42;
      });
      lanterns.forEach((lantern, index) => {
        lantern.root.position.y = lantern.baseY + Math.sin(lastTime * 0.65 + lantern.phase) * 0.11;
        lantern.root.rotation.z = Math.sin(lastTime * 0.48 + lantern.phase) * 0.035;
        lantern.glow.intensity = 3.8 + Math.sin(lastTime * 1.7 + index) * 0.45;
      });
    }

    // Damping needs an update each frame; render at a reduced rate on smaller displays.
    controls.update();
    if (now - animate.lastRender > (innerWidth < 700 ? 28 : 16)) {
      renderer.render(scene, camera);
      animate.lastRender = now;
    }
  }
  animate.lastRender = 0;
  function resume() {
    cancelAnimationFrame(frame);
    if (!document.hidden) animate();
  }
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pageshow', resume);
  renderer.render(scene, camera);
  window.activateSakuraScene?.();
}

function createMoon(scene) {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 28, 20),
    new THREE.MeshBasicMaterial({ color: 0xffe3c8 })
  );
  moon.position.set(-7.8, 8.4, -8.5);
  scene.add(moon);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.86, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xf4b9c9, transparent: true, opacity: 0.13, side: THREE.BackSide })
  );
  halo.position.copy(moon.position);
  scene.add(halo);
}

function createStars(scene) {
  const positions = [];
  for (let i = 0; i < 300; i++) {
    positions.push(random(-15, 15), random(3.3, 14), random(-13, -7));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffe9db, size: 0.055, transparent: true, opacity: 0.82, sizeAttenuation: true }));
  scene.add(stars);
  return stars;
}

function createLanterns(scene) {
  const lanterns = [];
  const placements = [
    [-5.7, 4.4, 0.2], [-4.3, 5.7, -1.1], [5.6, 4.1, -0.3],
    [4.5, 5.5, 1.1], [6.5, 6.1, -1.8], [-6.7, 6.2, -1.6]
  ];
  const paper = new THREE.MeshStandardMaterial({ color: 0xff9a46, emissive: 0xff581e, emissiveIntensity: 1.15, roughness: 0.62 });
  const frame = new THREE.MeshStandardMaterial({ color: 0x8b482f, emissive: 0x4b211c, emissiveIntensity: 0.18, roughness: 0.75 });
  placements.forEach(([x, y, z], index) => {
    const root = new THREE.Group();
    root.position.set(x, y, z);
    root.rotation.y = index * 0.8;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.3), paper);
    body.castShadow = true;
    root.add(body);
    for (const capY of [-0.24, 0.24]) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 4), frame);
      cap.position.y = capY;
      cap.rotation.y = Math.PI / 4;
      root.add(cap);
    }
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 12, Math.PI), frame);
    handle.position.y = 0.3;
    handle.rotation.z = Math.PI;
    root.add(handle);
    const glow = new THREE.PointLight(0xff984b, 3.8, 4.8, 2);
    glow.position.set(0, 0, 0.12);
    root.add(glow);
    scene.add(root);
    lanterns.push({ root, glow, baseY: y, phase: index * 1.23 });
  });
  return lanterns;
}

function createGround(scene) {
  const ground = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.8, 2),
    new THREE.MeshStandardMaterial({ color: 0x211a2b, roughness: 0.97, metalness: 0.02, flatShading: true })
  );
  ground.scale.set(1, 0.17, 0.84);
  ground.position.y = -0.68;
  ground.receiveShadow = true;
  scene.add(ground);

  const path = new THREE.Mesh(
    new THREE.RingGeometry(1.9, 2.45, 56),
    new THREE.MeshStandardMaterial({ color: 0x594052, roughness: 0.9, side: THREE.DoubleSide })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.08;
  scene.add(path);

  const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x88707f, roughness: 0.87 });
  for (let i = 0; i < 9; i++) {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.34, 0.09, 7), stoneMaterial);
    stone.position.set(random(-0.35, 0.35), 0.06, 2.05 + i * 0.48);
    stone.rotation.y = random(-0.3, 0.3);
    stone.receiveShadow = true;
    scene.add(stone);
  }
}

function createBranch(points, radius, material, parent, tipRadius = radius * 0.22) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  const tubularSegments = Math.max(14, points.length * 10);
  const radialSegments = 9;
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions = [];
  const indices = [];
  for (let ring = 0; ring <= tubularSegments; ring++) {
    const t = ring / tubularSegments;
    const point = curve.getPointAt(t);
    const taper = THREE.MathUtils.lerp(radius, tipRadius, Math.pow(t, 0.82));
    for (let side = 0; side <= radialSegments; side++) {
      const angle = (side / radialSegments) * Math.PI * 2;
      const normal = frames.normals[ring].clone().multiplyScalar(Math.cos(angle));
      const binormal = frames.binormals[ring].clone().multiplyScalar(Math.sin(angle));
      const vertex = point.clone().add(normal.add(binormal).multiplyScalar(taper));
      positions.push(vertex.x, vertex.y, vertex.z);
      if (ring < tubularSegments && side < radialSegments) {
        const a = ring * (radialSegments + 1) + side;
        const b = a + radialSegments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const branch = new THREE.Mesh(geometry, material);
  branch.castShadow = true;
  branch.receiveShadow = true;
  parent.add(branch);
  return branch;
}

function createCherryTree(scene) {
  const treeRoot = new THREE.Group();
  treeRoot.position.y = 0.01;
  scene.add(treeRoot);

  const bark = new THREE.MeshStandardMaterial({ color: 0x432733, roughness: 0.94, flatShading: true });
  const barkLight = new THREE.MeshStandardMaterial({ color: 0x613644, roughness: 0.92, flatShading: true });
  createBranch([[0, 0, 0], [-0.09, 0.65, 0.03], [0.14, 1.45, -0.08], [0.02, 2.35, 0.05], [0.27, 3.32, -0.02], [0.08, 4.15, 0.05]], 0.55, bark, treeRoot, 0.12);
  createBranch([[0, 0.05, 0], [-0.42, 0.12, 0.12], [-0.82, 0.02, 0.2]], 0.21, barkLight, treeRoot, 0.035);
  createBranch([[0, 0.05, 0], [0.43, 0.11, -0.09], [0.84, 0.02, -0.24]], 0.19, bark, treeRoot, 0.032);
  createBranch([[0, 0.05, 0], [0.05, 0.12, 0.48], [0.24, 0.01, 0.8]], 0.17, barkLight, treeRoot, 0.03);
  createBranch([[0.05, 0.05, 0], [-0.12, 0.12, -0.48], [-0.3, 0.01, -0.78]], 0.17, bark, treeRoot, 0.03);

  const canopy = new THREE.Group();
  canopy.position.set(0.08, 3.3, 0);
  treeRoot.add(canopy);

  const branchCount = 11;
  for (let i = 0; i < branchCount; i++) {
    const angle = (i / branchCount) * Math.PI * 2 + random(-0.16, 0.16);
    const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const startY = random(-0.72, 0.05);
    const reach = random(2.6, 3.75);
    const tipY = random(1.0, 2.0);
    createBranch(
      [[0, startY, 0], [direction.x * 0.72, startY + 0.26, direction.z * 0.72], [direction.x * reach * 0.58, tipY * 0.58, direction.z * reach * 0.58], [direction.x * reach, tipY, direction.z * reach]],
      random(0.2, 0.27), i % 2 ? bark : barkLight, canopy, 0.045
    );
    for (const t of [0.46, 0.72]) {
      const side = i % 2 ? 1 : -1;
      const perpendicular = new THREE.Vector3(-direction.z * side, 0, direction.x * side);
      const startX = direction.x * reach * t;
      const startZ = direction.z * reach * t;
      const y = startY + t * (tipY - startY) + 0.28;
      createBranch(
        [[startX, y, startZ], [startX + perpendicular.x * 0.35, y + 0.26, startZ + perpendicular.z * 0.35], [startX + direction.x * 0.9 + perpendicular.x * 0.72, y + 0.73, startZ + direction.z * 0.9 + perpendicular.z * 0.72]],
        0.082, barkLight, canopy, 0.022
      );
      const twigStart = new THREE.Vector3(startX + direction.x * 0.48, y + 0.42, startZ + direction.z * 0.48);
      for (const twigSide of [-1, 1]) {
        const twigDirection = direction.clone().multiplyScalar(0.62).add(perpendicular.clone().multiplyScalar(twigSide * 0.48)).normalize();
        createBranch(
          [[twigStart.x, twigStart.y, twigStart.z], [twigStart.x + twigDirection.x * 0.28, twigStart.y + 0.18, twigStart.z + twigDirection.z * 0.28], [twigStart.x + twigDirection.x * 0.68, twigStart.y + 0.47, twigStart.z + twigDirection.z * 0.68]],
          0.035, barkLight, canopy, 0.008
        );
      }
    }
  }

  const petalGeometry = new THREE.SphereGeometry(1, 8, 7);
  const centerGeometry = new THREE.SphereGeometry(1, 7, 6);
  const leafGeometry = new THREE.ConeGeometry(1, 1, 5, 1);
  const petalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.53, emissive: 0xc32788, emissiveIntensity: 0.46 });
  const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffde9d, roughness: 0.62, emissive: 0x573d17, emissiveIntensity: 0.12 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x56785c, roughness: 0.83 });
  const blossoms = [];
  const blossomCount = 820;
  for (let i = 0; i < blossomCount; i++) {
    let x, y, z;
    do {
      x = random(-3.75, 3.75);
      y = random(-0.3, 2.55);
      z = random(-2.35, 2.35);
    } while ((x / 3.85) ** 2 + ((y - 1.05) / 1.72) ** 2 + (z / 2.48) ** 2 > 1);

    const base = new THREE.Vector3(x, y, z);
    const localBloomCount = Math.random() < 0.56 ? 2 : 1;
    for (let b = 0; b < localBloomCount; b++) {
      const center = base.clone().add(new THREE.Vector3(random(-0.16, 0.16), random(-0.12, 0.16), random(-0.13, 0.13)));
      const colorPick = Math.random() < 0.22 ? 1 : 0;
      for (let petal = 0; petal < 5; petal++) {
        const angle = (petal / 5) * Math.PI * 2 + random(-0.12, 0.12);
        const pos = center.clone().add(new THREE.Vector3(Math.cos(angle) * 0.072, Math.sin(angle) * 0.072, random(-0.035, 0.035)));
        const rotation = new THREE.Euler(random(-0.18, 0.18), random(-0.24, 0.24), angle + Math.PI / 2);
        blossoms.push({ position: pos, rotation, scale: new THREE.Vector3(random(0.066, 0.09), random(0.094, 0.125), 0.035), colorPick });
      }
      blossoms.push({ center, isCenter: true });
    }
  }

  const petalCount = blossoms.filter(bloom => !bloom.isCenter).length;
  const centerCount = blossoms.length - petalCount;
  const petalMesh = new THREE.InstancedMesh(petalGeometry, petalMaterial, petalCount);
  const centerMesh = new THREE.InstancedMesh(centerGeometry, centerMaterial, centerCount);
  const leafMesh = new THREE.InstancedMesh(leafGeometry, leafMaterial, 180);
  const dummy = new THREE.Object3D();
  let p = 0, c = 0;
  blossoms.forEach(bloom => {
    if (bloom.isCenter) {
      dummy.position.copy(bloom.center);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.023);
      dummy.updateMatrix();
      centerMesh.setMatrixAt(c++, dummy.matrix);
    } else {
      dummy.position.copy(bloom.position);
      dummy.rotation.copy(bloom.rotation);
      dummy.scale.copy(bloom.scale);
      dummy.updateMatrix();
      petalMesh.setMatrixAt(p, dummy.matrix);
      petalMesh.setColorAt(p++, bloom.colorPick ? new THREE.Color(0xffc2f2) : new THREE.Color(0xf16ac2));
    }
  });
  [petalMesh, centerMesh].forEach(mesh => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.instanceMatrix.needsUpdate = true;
    canopy.add(mesh);
  });
  if (petalMesh.instanceColor) petalMesh.instanceColor.needsUpdate = true;

  for (let i = 0; i < 180; i++) {
    const angle = random(0, Math.PI * 2);
    const radius = random(1.1, 3.15);
    dummy.position.set(Math.cos(angle) * radius, random(-0.45, 2.2), Math.sin(angle) * radius * 0.68);
    dummy.rotation.set(random(-0.4, 0.4), angle, random(-0.7, 0.7));
    dummy.scale.set(random(0.055, 0.12), random(0.22, 0.4), random(0.035, 0.065));
    dummy.updateMatrix();
    leafMesh.setMatrixAt(i, dummy.matrix);
  }
  leafMesh.instanceMatrix.needsUpdate = true;
  canopy.add(leafMesh);

  treeRoot.traverse(object => {
    if (object.isMesh) object.castShadow = true;
  });
  return canopy;
}

function createBunny(scene) {
  const root = new THREE.Group();
  root.position.set(2.45, 0.03, 0);
  root.scale.setScalar(0.46);
  scene.add(root);
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf0e8db, roughness: 0.9 });
  const warmIvory = new THREE.MeshStandardMaterial({ color: 0xe2d5c9, roughness: 0.92 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xd78e9e, roughness: 0.82 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x352833, roughness: 0.48 });
  const body = new THREE.Group();
  root.add(body);
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 18), ivory);
  bodyMesh.position.set(0, 0.55, 0);
  bodyMesh.scale.set(0.72, 1.05, 0.63);
  bodyMesh.castShadow = true;
  body.add(bodyMesh);
  const head = new THREE.Group();
  head.position.set(0, 1.27, 0.13);
  body.add(head);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.39, 24, 20), ivory);
  headMesh.position.set(0, 0, 0);
  headMesh.castShadow = true;
  head.add(headMesh);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), warmIvory);
  muzzle.position.set(0, -0.1, 0.33);
  muzzle.scale.set(1.25, 0.72, 0.68);
  head.add(muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), pink);
  nose.position.set(0, -0.06, 0.435);
  nose.scale.set(1, 0.72, 0.58);
  head.add(nose);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), dark);
    eye.position.set(side * 0.155, 0.07, 0.34);
    eye.scale.set(0.82, 1.15, 0.55);
    head.add(eye);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), new THREE.MeshStandardMaterial({ color: 0xe9aab1, transparent: true, opacity: 0.62, roughness: 0.88 }));
    cheek.position.set(side * 0.22, -0.1, 0.31);
    cheek.scale.set(1.12, 0.55, 0.45);
    head.add(cheek);
  }

  const ears = [];
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.17, 0.29, -0.03);
    head.add(ear);
    const outer = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 16), ivory);
    outer.position.y = 0.36;
    outer.scale.set(0.66, 1.95, 0.5);
    outer.castShadow = true;
    ear.add(outer);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.082, 16, 12), pink);
    inner.position.set(0, 0.37, 0.063);
    inner.scale.set(0.63, 1.6, 0.22);
    ear.add(inner);
    ear.rotation.z = side === -1 ? -0.12 : 0.18;
    ears.push(ear);
  }

  const paws = [];
  for (const [side, front] of [[-1, true], [1, true], [-1, false], [1, false]]) {
    const paw = new THREE.Group();
    paw.position.set(side * (front ? 0.2 : 0.24), front ? 0.38 : 0.24, front ? 0.28 : -0.17);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), warmIvory);
    foot.position.set(0, -0.11, 0.02);
    foot.scale.set(front ? 0.72 : 1.05, 0.72, front ? 0.68 : 1.15);
    foot.castShadow = true;
    paw.add(foot);
    body.add(paw);
    paws.push(paw);
  }
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), ivory);
  tail.position.set(0, 0.52, -0.38);
  root.add(tail);

  const catchPetal = new THREE.Mesh(
    new THREE.SphereGeometry(1, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xffb7c9, emissive: 0x612a3e, emissiveIntensity: 0.12, roughness: 0.5 })
  );
  catchPetal.position.set(0, -0.06, 0.49);
  catchPetal.scale.set(0.035, 0.075, 0.018);
  catchPetal.rotation.z = -0.45;
  catchPetal.visible = false;
  head.add(catchPetal);

  return { root, body, head, paws, leftEar: ears[0], rightEar: ears[1], catchPetal };
}

function createGifts(scene) {
  const gifts = [];
  const boxGeometry = new THREE.BoxGeometry(0.52, 0.42, 0.46);
  const lidGeometry = new THREE.BoxGeometry(0.58, 0.12, 0.52);
  const bowLoopGeometry = new THREE.TorusGeometry(0.085, 0.022, 7, 14);
  const ribbonXGeometry = new THREE.BoxGeometry(0.1, 0.54, 0.48);
  const ribbonZGeometry = new THREE.BoxGeometry(0.55, 0.54, 0.09);

  CONFIG.gifts.forEach((gift, index) => {
    const angle = -Math.PI * 0.12 + index / CONFIG.gifts.length * Math.PI * 2;
    const radius = 3.7 + (index % 2) * 0.28;
    const baseY = 1.55 + (index % 3) * 0.58;
    const root = new THREE.Group();
    root.position.set(Math.cos(angle) * radius, baseY, Math.sin(angle) * radius);
    root.scale.setScalar(0.62);
    root.rotation.y = angle * 0.42;
    root.userData.giftId = gift.id;
    root.userData.materials = [];
    root.userData.hitMeshes = [];
    root.userData.orbitAngle = angle;
    root.userData.orbitRadius = radius;
    root.userData.baseY = baseY;
    scene.add(root);

    const boxMaterial = new THREE.MeshStandardMaterial({ color: gift.color, roughness: 0.58, metalness: 0.025 });
    const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xf4d9aa, roughness: 0.5, metalness: 0.08 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.y = 0.27;
    box.castShadow = true;
    box.receiveShadow = true;
    root.add(box);
    const lid = new THREE.Mesh(lidGeometry, boxMaterial);
    lid.position.y = 0.54;
    lid.castShadow = true;
    root.add(lid);
    const ribbonX = new THREE.Mesh(ribbonXGeometry, ribbonMaterial);
    ribbonX.position.y = 0.31;
    root.add(ribbonX);
    const ribbonZ = new THREE.Mesh(ribbonZGeometry, ribbonMaterial);
    ribbonZ.position.y = 0.31;
    root.add(ribbonZ);
    for (const side of [-1, 1]) {
      const loop = new THREE.Mesh(bowLoopGeometry, ribbonMaterial);
      loop.position.set(side * 0.085, 0.66, 0.035);
      loop.rotation.set(0, side * 0.18, side * 0.35);
      root.add(loop);
    }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), ribbonMaterial);
    knot.position.set(0, 0.65, 0.04);
    root.add(knot);

    root.traverse(object => {
      if (!object.isMesh) return;
      object.userData.giftRoot = root;
      object.castShadow = true;
      if (object.material?.emissive) root.userData.materials.push(object.material);
      root.userData.hitMeshes.push(object);
    });
    gifts.push(root);
  });
  return gifts;
}

function createFallingPetals(scene) {
  const count = reducedMotion ? 22 : (innerWidth < 700 ? 64 : 94);
  const geometry = new THREE.SphereGeometry(1, 7, 6);
  const material = new THREE.MeshStandardMaterial({ color: 0xf4b4c6, roughness: 0.52, emissive: 0x401827, emissiveIntensity: 0.08, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.castShadow = false;
  const petals = [];
  for (let i = 0; i < count; i++) {
    petals.push({ x: random(-5.8, 5.8), y: random(0.3, 8.5), z: random(-4.5, 4.5), speed: random(0.34, 0.92), phase: random(0, Math.PI * 2), spin: random(-1.8, 1.8), size: random(0.045, 0.09) });
  }
  updatePetalMatrices(mesh, petals);
  scene.add(mesh);
  return { mesh, petals };
}

function animatePetals(system, delta) {
  for (const petal of system.petals) {
    petal.y -= petal.speed * delta;
    petal.phase += delta * 0.7;
    petal.x += Math.sin(petal.phase) * delta * 0.17;
    petal.z += Math.cos(petal.phase * 0.67) * delta * 0.1;
    petal.spin += delta * 0.42;
    if (petal.y < 0.08) {
      petal.y = random(6.5, 8.8);
      petal.x = random(-5.8, 5.8);
      petal.z = random(-4.5, 4.5);
    }
  }
  updatePetalMatrices(system.mesh, system.petals);
}

function updatePetalMatrices(mesh, petals) {
  petals.forEach((petal, index) => {
    petalTransform.position.set(petal.x, petal.y, petal.z);
    petalTransform.rotation.set(petal.spin * 0.7, petal.phase, petal.spin);
    petalTransform.scale.set(petal.size * 0.72, petal.size * 1.35, petal.size * 0.22);
    petalTransform.updateMatrix();
    mesh.setMatrixAt(index, petalTransform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}
