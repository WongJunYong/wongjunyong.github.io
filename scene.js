/* =========================================================
   WONG JUN YONG — THREE.JS SCENES
   Hero: interactive "knowledge graph" globe with data pulses
   Contact: reactive particle wave field
   ========================================================= */
import * as THREE from 'three';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.innerWidth < 900;
const BRONZE = new THREE.Color('#c48c66');
const PAPER = new THREE.Color('#f6f3ee');

function makeRenderer(canvas) {
  try {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setClearColor(0x000000, 0);
    return r;
  } catch (e) {
    console.warn('WebGL unavailable', e);
    return null;
  }
}

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.3, 'rgba(255,255,255,0.85)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}
const DOT = dotTexture();

function visibilityGate(el, cb) {
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; cb(visible); }, { threshold: 0 }).observe(el);
  return () => visible;
}

/* ===================== HERO ===================== */
(function hero() {
  const canvas = document.getElementById('hero3d');
  if (!canvas) return;
  const renderer = makeRenderer(canvas);
  if (!renderer) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0c0c0e, 0.045);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const world = new THREE.Group();
  scene.add(world);
  const globe = new THREE.Group();
  world.add(globe);

  // --- Knowledge nodes on a sphere (fibonacci) ---
  const NODE_COUNT = isMobile() ? 220 : 380;
  const R = 4.2;
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const jitter = 1 + (Math.random() - 0.5) * 0.08;
    nodes.push(new THREE.Vector3(
      R * jitter * Math.cos(theta) * Math.sin(phi),
      R * jitter * Math.sin(theta) * Math.sin(phi),
      R * jitter * Math.cos(phi)
    ));
  }
  const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodes);
  const nodeColors = new Float32Array(NODE_COUNT * 3);
  nodes.forEach((_, i) => {
    const c = Math.random() < 0.18 ? BRONZE : PAPER;
    nodeColors.set([c.r, c.g, c.b], i * 3);
  });
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
  const nodeMat = new THREE.PointsMaterial({ size: 0.13, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.95 });
  globe.add(new THREE.Points(nodeGeo, nodeMat));

  // --- Edges between near neighbours ---
  const edges = [];
  const linePos = [];
  const maxDist = R * 0.42;
  for (let i = 0; i < NODE_COUNT; i++) {
    let links = 0;
    for (let j = i + 1; j < NODE_COUNT && links < 3; j++) {
      if (nodes[i].distanceTo(nodes[j]) < maxDist && Math.random() < 0.55) {
        edges.push([i, j]); links++;
        linePos.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: BRONZE, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
  globe.add(new THREE.LineSegments(lineGeo, lineMat));

  // --- Inner wireframe core + rings ---
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.55, 1),
    new THREE.MeshBasicMaterial({ color: BRONZE, wireframe: true, transparent: true, opacity: 0.35 })
  );
  globe.add(core);
  const coreGlow = new THREE.Points(new THREE.IcosahedronGeometry(1.55, 1), new THREE.PointsMaterial({ size: 0.18, map: DOT, color: BRONZE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  globe.add(coreGlow);

  const ringMat = new THREE.MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
  const rings = [5.3, 6.1].map((r, k) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.012, 128), ringMat.clone());
    m.rotation.x = Math.PI / 2 + (k ? 0.5 : -0.35);
    m.rotation.y = k ? 0.3 : -0.2;
    world.add(m); return m;
  });
  // orbiting satellites on rings
  const sats = rings.map((ring, k) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: BRONZE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.35); ring.add(s); s.userData = { r: k ? 6.1 : 5.3, speed: k ? -0.35 : 0.5 }; return s;
  });

  // --- Data pulses travelling along edges ---
  const PULSES = isMobile() ? 28 : 60;
  const pulseGeo = new THREE.BufferGeometry();
  const pulsePos = new Float32Array(PULSES * 3);
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const pulseMat = new THREE.PointsMaterial({ size: 0.2, map: DOT, color: 0xffd2b0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  globe.add(new THREE.Points(pulseGeo, pulseMat));
  const pulses = Array.from({ length: PULSES }, () => ({ e: edges[(Math.random() * edges.length) | 0], t: Math.random(), s: 0.25 + Math.random() * 0.6 }));

  // --- Ambient dust field ---
  const DUST = isMobile() ? 500 : 1100;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 40;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 4;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.05, map: DOT, color: PAPER, transparent: true, opacity: 0.5, depthWrite: false }));
  scene.add(dust);

  // --- Interaction ---
  const pointer = new THREE.Vector2(0, 0), target = new THREE.Vector2(0, 0);
  let scrollP = 0, burst = 0;
  window.addEventListener('pointermove', e => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });
  window.addEventListener('scroll', () => { scrollP = Math.min(1, window.scrollY / window.innerHeight); }, { passive: true });
  canvas.parentElement.addEventListener('click', e => { if (!e.target.closest('a,button,.cv-card')) burst = 1; });

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (isMobile()) { world.position.set(0.8, 0.4, -4.8); world.scale.setScalar(0.85); }
    else { world.position.set(3.2, 0, 0); world.scale.setScalar(1); }
  }
  window.addEventListener('resize', layout);
  layout();

  const isVisible = visibilityGate(canvas, v => { if (v) loop(); });
  const clock = new THREE.Clock();
  let raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    if (!isVisible()) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    pointer.lerp(target, 0.05);

    const spin = reduceMotion ? 0 : 1;
    globe.rotation.y += dt * 0.12 * spin + burst * 0.08;
    globe.rotation.x = pointer.y * 0.35 + Math.sin(t * 0.3) * 0.05;
    world.rotation.y = pointer.x * 0.45;
    world.rotation.z = pointer.x * -0.05;
    core.rotation.x -= dt * 0.4 * spin; core.rotation.y += dt * 0.3 * spin;
    coreGlow.rotation.copy(core.rotation);
    const pulseScale = 1 + Math.sin(t * 2) * 0.04 + burst * 0.5;
    core.scale.setScalar(pulseScale); coreGlow.scale.setScalar(pulseScale);
    burst *= 0.92;

    sats.forEach(s => { const a = t * s.userData.speed; s.position.set(Math.cos(a) * s.userData.r, Math.sin(a) * s.userData.r, 0); });

    for (let i = 0; i < PULSES; i++) {
      const p = pulses[i];
      p.t += dt * p.s * (1 + burst * 4);
      if (p.t > 1) { p.t = 0; p.e = edges[(Math.random() * edges.length) | 0]; }
      const a = nodes[p.e[0]], b = nodes[p.e[1]];
      pulsePos[i * 3] = a.x + (b.x - a.x) * p.t;
      pulsePos[i * 3 + 1] = a.y + (b.y - a.y) * p.t;
      pulsePos[i * 3 + 2] = a.z + (b.z - a.z) * p.t;
    }
    pulseGeo.attributes.position.needsUpdate = true;

    dust.rotation.y = t * 0.01 + pointer.x * 0.05;
    dust.position.y = scrollP * 2;

    camera.position.z = 14 + scrollP * 5;
    camera.position.y = scrollP * -1.5;
    lineMat.opacity = 0.22 + burst * 0.4;
    renderer.render(scene, camera);
  }
  loop();
})();

/* ===================== CONTACT WAVE ===================== */
(function contact() {
  const canvas = document.getElementById('contact3d');
  if (!canvas) return;
  const renderer = makeRenderer(canvas);
  if (!renderer) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 4.5, 11);
  camera.lookAt(0, 0, 0);

  const COLS = isMobile() ? 60 : 110, ROWS = isMobile() ? 34 : 54, GAP = 0.32;
  const count = COLS * ROWS;
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    const k = (i * ROWS + j) * 3;
    pos[k] = (i - COLS / 2) * GAP; pos[k + 1] = 0; pos[k + 2] = (j - ROWS / 2) * GAP;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(pts);

  const mouse = new THREE.Vector2(99, 99), mTarget = new THREE.Vector2(99, 99);
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera({ x: nx, y: ny }, camera);
    if (ray.ray.intersectPlane(plane, hit)) mTarget.set(hit.x, hit.z);
  });
  canvas.parentElement.addEventListener('pointerleave', () => mTarget.set(99, 99));

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', layout); layout();

  const isVisible = visibilityGate(canvas, v => { if (v) loop(); });
  const clock = new THREE.Clock();
  const tmp = new THREE.Color();
  let raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    if (!isVisible()) return;
    raf = requestAnimationFrame(loop);
    const t = clock.getElapsedTime() * (reduceMotion ? 0.2 : 1);
    mouse.lerp(mTarget, 0.08);
    for (let i = 0; i < count; i++) {
      const k = i * 3, x = pos[k], z = pos[k + 2];
      const d = Math.hypot(x - mouse.x, z - mouse.y);
      const bump = Math.exp(-d * d * 0.35) * 1.6;
      const y = Math.sin(x * 0.45 + t) * 0.35 + Math.cos(z * 0.5 + t * 0.8) * 0.35 + bump;
      pos[k + 1] = y;
      const m = Math.min(1, (y + 0.7) / 2.4);
      tmp.copy(PAPER).lerp(BRONZE, m).multiplyScalar(0.35 + m * 0.9);
      col[k] = tmp.r; col[k + 1] = tmp.g; col[k + 2] = tmp.b;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    pts.rotation.y = Math.sin(t * 0.1) * 0.15;
    renderer.render(scene, camera);
  }
  loop();
})();
