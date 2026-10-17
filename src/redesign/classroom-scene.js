import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createClassroom(host, { students, title, onSelect, onFailure, onProject }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-label', 'Mô hình phòng học 3D. Kéo để xoay; chọn học sinh bằng danh sách bên dưới hoặc chạm vào bàn.');
  renderer.domElement.setAttribute('role', 'img');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, .1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.minPolarAngle = .18;
  controls.maxPolarAngle = Math.PI / 2.3;
  controls.minZoom = .65;
  controls.maxZoom = 3;
  controls.enablePan = false;
  const materials = new Map();
  const material = color => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .82 }));
    return materials.get(color);
  };
  const box = (parent, size, position, color, radius = .04) => {
    const mesh = new THREE.Mesh(radius ? new RoundedBoxGeometry(...size, 2, radius) : new THREE.BoxGeometry(...size), material(color));
    mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const sphere = (parent, radius, position, color, scale = [1, 1, 1]) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), material(color));
    mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow = true; parent.add(mesh); return mesh;
  };
  const limb = (parent, a, b, radius, color) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), material(color));
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    mesh.castShadow = true; parent.add(mesh);
  };
  const text = (parent, content, position, width, height, background, color) => {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background; ctx.fillRect(0, 0, 768, 192);
    ctx.fillStyle = color; ctx.font = '600 72px "Segoe UI",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(content, 384, 100, 710);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
    mesh.position.set(...position); parent.add(mesh); return mesh;
  };
  const columns = students.length <= 6 ? 3 : students.length <= 16 ? 4 : 5;
  const rows = Math.ceil(students.length / columns);
  const roomWidth = columns * 2 + 2.4, roomDepth = Math.max(8, rows * 2.1 + 4.5), front = -roomDepth / 2;
  const room = new THREE.Group(); scene.add(room);
  box(room, [roomWidth + .4, .38, roomDepth + .4], [0, -.26, 0], '#c6cdbc', .08);
  box(room, [roomWidth, .14, roomDepth], [0, -.01, 0], '#ece9dc');
  for (let row = 0; row < Math.ceil(roomDepth / 1.4); row++) box(room, [roomWidth - .1, .008, .018], [0, .065, front + row * 1.4], '#d9d8cc', 0);
  const backWall = new THREE.Group(); room.add(backWall);
  box(backWall, [roomWidth, 3.35, .18], [0, 1.7, front], '#e8eee4');
  box(backWall, [roomWidth, .14, .23], [0, 3.4, front], '#b9cdbd');
  box(backWall, [5.05, 1.7, .13], [0, 2.05, front + .15], '#b6905f');
  box(backWall, [4.8, 1.45, .08], [0, 2.05, front + .24], '#285442');
  text(backWall, title, [0, 2.15, front + .29], 3.9, .95, '#285442', '#fff8e8');
  box(backWall, [5.1, .07, .28], [0, 1.18, front + .23], '#bd9e73');
  box(backWall, [.35, .035, .07], [1.5, 1.25, front + .28], '#f3edda', .01);
  const sideWall = new THREE.Group(); room.add(sideWall);
  const left = -roomWidth / 2;
  box(sideWall, [.18, 1.1, roomDepth], [left, .57, 0], '#e0e8df');
  box(sideWall, [.18, .65, roomDepth], [left, 3.05, 0], '#e8eee4');
  const windowCount = Math.ceil(roomDepth / 2.6), windowSpan = (roomDepth - .4) / windowCount;
  for (let i = 0; i <= windowCount; i++) {
    const z = front + .2 + i * windowSpan;
    box(sideWall, [.21, 2.5, .18], [left, 1.95, z], '#e8eee4');
    if (i === windowCount) continue;
    const glass = box(sideWall, [.055, 1.5, windowSpan - .18], [left, 1.95, z + windowSpan / 2], '#bad7df', .015);
    glass.material = new THREE.MeshStandardMaterial({ color: '#bad7df', transparent: true, opacity: .38, roughness: .35 });
    box(sideWall, [.24, .08, windowSpan], [left, 1.95, z + windowSpan / 2], '#f8f9ed');
    box(sideWall, [.25, .12, windowSpan], [left, 1.12, z + windowSpan / 2], '#b6c6b6');
  }
  const teacher = new THREE.Group(); teacher.position.set(1.3, 0, front + 1.4); room.add(teacher);
  box(teacher, [2.25, .15, .9], [0, 1.14, 0], '#d9b782');
  box(teacher, [1.95, 1, .65], [0, .56, 0], '#829c84');
  const laptop = box(teacher, [.65, .45, .055], [-.25, 1.46, 0], '#435467', .02); laptop.rotation.x = -.18;
  box(teacher, [.68, .035, .42], [-.25, 1.25, .2], '#607183', .01);
  box(teacher, [.35, .1, .45], [.7, 1.28, 0], '#fff4d9', .02);
  const pot = (x, z) => {
    const group = new THREE.Group(); group.position.set(x, 0, z); room.add(group);
    const planter = new THREE.Mesh(new THREE.CylinderGeometry(.32, .23, .48, 10), material('#c39a75')); planter.position.y = .28; planter.castShadow = true; group.add(planter);
    limb(group, [0, .5, 0], [0, 1.1, 0], .045, '#876948');
    sphere(group, .36, [0, 1.15, 0], '#7fa886', [1, 1.35, 1]); sphere(group, .27, [.18, .9, .08], '#98b995');
  };
  pot(roomWidth / 2 - .65, front + .7); pot(left + .6, front + .7);
  const desks = new Map(), targets = [], rings = new Map();
  const makePupil = index => {
    const person = new THREE.Group();
    const skin = ['#eac29f', '#d7a981', '#b98260'][index % 3], shirt = ['#4c8d78', '#7394ad', '#ca9b5f', '#a88d9e'][index % 4];
    box(person, [.48, .52, .36], [0, 1.04, .48], shirt, .1);
    sphere(person, .235, [0, 1.59, .45], skin, [1, 1.12, 1]);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.243, 12, 8, 0, Math.PI * 2, 0, 1.6), material('#504235'));
    hair.position.set(0, 1.64, .47); hair.castShadow = true; person.add(hair);
    for (const x of [-.085, .085]) sphere(person, .018, [x, 1.6, .228], '#3d3a34');
    for (const x of [-.14, .14]) {
      limb(person, [x, .85, .5], [x, .68, .09], .085, '#53657b'); limb(person, [x, .68, .09], [x, .28, .08], .065, '#53657b');
      box(person, [.18, .13, .3], [x, .23, -.01], '#445164', .045);
      limb(person, [x * 1.6, 1.19, .46], [x * 2, 1.04, .1], .065, skin); limb(person, [x * 2, 1.04, .1], [x * 1.3, 1.01, -.1], .055, skin);
    }
    return person;
  };
  students.forEach((student, index) => {
    const col = index % columns, row = Math.floor(index / columns), group = new THREE.Group();
    group.position.set((col - (columns - 1) / 2) * 1.95 + (col >= columns / 2 ? .28 : -.28), 0, front + 3.5 + row * 2.1);
    group.userData.studentId = student.id; room.add(group);
    box(group, [1.25, .12, .82], [0, .95, -.15], '#dfbf8d'); box(group, [1.13, .08, .72], [0, .86, -.15], '#b49367');
    for (const x of [-.48, .48]) for (const z of [-.44, .12]) box(group, [.07, .8, .07], [x, .46, z], '#768d86', .015);
    box(group, [.62, .11, .58], [0, .68, .62], '#64917f'); box(group, [.63, .52, .1], [0, 1.02, .89], '#64917f', .065);
    for (const x of [-.25, .25]) for (const z of [.41, .84]) box(group, [.055, .65, .055], [x, .34, z], '#6e827a', .01);
    const book = box(group, [.39, .035, .29], [-.2, 1.03, -.24], '#fff5da', .012); book.rotation.y = -.1;
    box(group, [.04, .045, .29], [-.39, 1.035, -.22], '#ad9372', .006);
    const number = text(group, String(index + 1).padStart(2, '0'), [.32, 1.018, -.25], .29, .13, '#dfbf8d', '#3b4a40'); number.rotation.x = -Math.PI / 2;
    const person = makePupil(index); group.add(person);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.76, .81, 40), new THREE.MeshBasicMaterial({ color: '#286149', side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(0, .075, .1); ring.visible = false; group.add(ring); rings.set(student.id, ring);
    const marker = box(group, [.29, .025, .12], [.32, 1.025, .08], '#9da599', .01);
    desks.set(student.id, { group, person, marker });
    group.traverse(object => { if (object.isMesh) { object.userData.studentId = student.id; targets.push(object); } });
  });
  scene.add(new THREE.HemisphereLight('#ffffff', '#a7b39b', 2.6));
  const sun = new THREE.DirectionalLight('#fff6e2', 3.2); sun.position.set(6, 13, 7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const shadowSpan = Math.max(roomWidth, roomDepth);
  Object.assign(sun.shadow.camera, { left: -shadowSpan, right: shadowSpan, top: shadowSpan, bottom: -shadowSpan, far: 55 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .025; sun.shadow.radius = 3; scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), new THREE.ShadowMaterial({ opacity: .13 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.48; ground.receiveShadow = true; scene.add(ground);
  let disposed = false, frame = 0, aspect = 1, selectedId = null;
  const render = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0; if (disposed) return;
      backWall.visible = camera.position.z >= front; sideWall.visible = camera.position.x >= left; renderer.render(scene, camera);
      const desk = desks.get(selectedId);
      if (desk) {
        const point = desk.group.position.clone().add(new THREE.Vector3(0, 2.2, .3)).project(camera);
        onProject({ x: (point.x + 1) * host.clientWidth / 2, y: (1 - point.y) * host.clientHeight / 2, visible: Math.abs(point.x) < 1 && Math.abs(point.y) < 1 });
      } else onProject({ visible: false });
    });
  };
  const fit = () => {
    const half = Math.max(roomWidth * .67, roomDepth * .64, 7), height = Math.max(half, Math.hypot(roomWidth, roomDepth) * .55 / aspect);
    camera.left = -height * aspect; camera.right = height * aspect; camera.top = height; camera.bottom = -height;
    camera.updateProjectionMatrix(); render();
  };
  const setView = view => {
    controls.target.set(0, .5, 0); camera.position.set(...(view === 'top' ? [.01, 24, 1] : [14, 13, 17])); camera.zoom = 1; controls.update(); fit();
  };
  const resize = new ResizeObserver(() => { const width = host.clientWidth, height = host.clientHeight; if (!width || !height) return; aspect = width / height; renderer.setSize(width, height); fit(); }); resize.observe(host);
  controls.addEventListener('change', render);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let down = null; const pointers = new Set();
  const pointerDown = e => { pointers.add(e.pointerId); down = pointers.size === 1 ? [e.clientX, e.clientY] : null; };
  const pointerUp = e => {
    pointers.delete(e.pointerId);
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) { down = null; return; }
    down = null; const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX - bounds.left) / bounds.width * 2 - 1, -(e.clientY - bounds.top) / bounds.height * 2 + 1); raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(targets).find(item => item.object.visible && item.object.parent.visible);
    if (hit) onSelect(hit.object.userData.studentId);
  };
  const pointerCancel = e => { pointers.delete(e.pointerId); down = null; };
  renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointerup', pointerUp); renderer.domElement.addEventListener('pointercancel', pointerCancel);
  const lost = e => { e.preventDefault(); onFailure(); }; renderer.domElement.addEventListener('webglcontextlost', lost);
  setView('perspective');
  return {
    setView,
    zoom(factor) { camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom); camera.updateProjectionMatrix(); render(); },
    rotate(direction) { const offset = camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * Math.PI / 8); camera.position.copy(controls.target).add(offset); controls.update(); render(); },
    select(id) { selectedId = id; rings.forEach((ring, key) => { ring.visible = key === id; }); render(); },
    updateAttendance(attendance) { desks.forEach(({ person, marker }, id) => { person.visible = attendance[id] === 'present'; marker.material = material(attendance[id] === 'present' ? '#286149' : attendance[id] === 'absent' ? '#a64c46' : '#929c92'); }); render(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointercancel', pointerCancel); renderer.domElement.removeEventListener('webglcontextlost', lost);
      const geometries = new Set(), textures = new Set(), allMaterials = new Set(materials.values());
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) allMaterials.add(object.material); });
      geometries.forEach(geometry => geometry.dispose()); allMaterials.forEach(mat => { if (mat.map) textures.add(mat.map); mat.dispose(); }); textures.forEach(texture => texture.dispose());
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    }
  };
}
