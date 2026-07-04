/* ============================================================
   كريب حكاية — Crepe Hekaya
   Hero 3D Crepe — Premium Cinematic Build
   Three.js v0.170 + GSAP + PostProcessing + PBR + Env Map
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/postprocessing/SMAAPass.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

export class HeroCrepe3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null;
    this.clock = new THREE.Clock();

    // Animation elements
    this.crepeGroup = null;
    this.crepeBase = null;
    this.leftFlap = null;
    this.rightFlap = null;
    this.fillingsGroup = null;
    this.steamSprites = [];

    this.animTimeline = null;
    this.init();
  }

  init() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 480;

    // ── Scene ────────────────────────────────────────────────
    this.scene = new THREE.Scene();

    // ── Camera ───────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 4.5, 9);

    // ── Renderer ─────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // ── Environment Map (IBL) ────────────────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const envScene = new RoomEnvironment(this.renderer);
    this.envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    this.scene.environment = this.envMap;
    envScene.dispose();
    pmremGenerator.dispose();

    // ── Post-Processing ──────────────────────────────────────
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom — warm golden glow on hot crepe edges
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.35,   // strength
      0.6,    // radius
      0.82    // threshold
    );
    this.composer.addPass(bloomPass);
    this.bloomPass = bloomPass;

    // SMAA Anti-aliasing — crisp edges
    const smaaPass = new SMAAPass(width, height);
    this.composer.addPass(smaaPass);
    this.smaaPass = smaaPass;

    // ── Controls ─────────────────────────────────────────────
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 15;
    this.controls.target.set(0, 0.4, 0);

    // ── Lighting rig ─────────────────────────────────────────
    // Warm ambient
    const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.5);
    this.scene.add(ambientLight);

    // Key spotlight (shadow caster) — warm restaurant light
    const mainLight = new THREE.SpotLight(0xffb347, 5.0, 22, Math.PI / 4, 0.45, 1.0);
    mainLight.position.set(5, 8, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0003;
    mainLight.shadow.radius = 3;
    this.scene.add(mainLight);

    // Fill light — softer orange
    const fillLight = new THREE.PointLight(0xff8c42, 1.8, 16);
    fillLight.position.set(-5, 4, 3);
    this.scene.add(fillLight);

    // Warm rim light from behind — makes edges glow
    const rimLight = new THREE.DirectionalLight(0xff6b35, 1.8);
    rimLight.position.set(0, 3, -8);
    this.scene.add(rimLight);

    // Subtle cool accent from bottom
    const accentLight = new THREE.PointLight(0x4a90d9, 0.4, 10);
    accentLight.position.set(0, -2, 5);
    this.scene.add(accentLight);

    // ── Build Scene ──────────────────────────────────────────
    this.crepeGroup = new THREE.Group();
    this.scene.add(this.crepeGroup);

    this.buildPlate();
    this.buildCrepeStructure();
    this.buildSteam();

    // ── Resize ───────────────────────────────────────────────
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    this.animate();
    this.playCinematicAnimation();
  }

  /* ──────────────────────────────────────────────────────────
     Premium Slate Plate
     ────────────────────────────────────────────────────────── */
  buildPlate() {
    // Dark luxury plate — deep navy velvet
    const plateGeo = new THREE.CylinderGeometry(2.6, 2.4, 0.12, 64);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x1a1a2e),
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      envMapIntensity: 0.8
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -1.15;
    plate.receiveShadow = true;
    this.scene.add(plate);

    // Royal gold boundary ring with emissive glow
    const ringGeo = new THREE.TorusGeometry(2.45, 0.022, 12, 80);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd4af37),
      roughness: 0.08,
      metalness: 0.95,
      emissive: new THREE.Color(0xff8c00),
      emissiveIntensity: 0.3,
      envMapIntensity: 1.2
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.08;
    this.scene.add(ring);

    // Inner decorative ring (subtle)
    const innerRingGeo = new THREE.TorusGeometry(1.8, 0.008, 8, 64);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.4
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -1.08;
    this.scene.add(innerRing);
  }

  /* ──────────────────────────────────────────────────────────
     Crepe Structure — Realistic PBR Dough with Sheen
     ────────────────────────────────────────────────────────── */
  buildCrepeStructure() {
    // PBR crepe dough material — golden with silky sheen
    const crepeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xD4922A),
      roughness: 0.55,
      metalness: 0.0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.5,
      sheen: 0.8,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color(0xF0C060),
      side: THREE.DoubleSide,
      envMapIntensity: 0.6
    });

    this.crepeBase = new THREE.Group();
    this.crepeGroup.add(this.crepeBase);

    // Central triangular zone
    const baseGeo = new THREE.ConeGeometry(1.6, 2.5, 3, 1, false, 0, Math.PI);
    // Add subtle waviness to the dough geometry
    const basePos = baseGeo.attributes.position;
    for (let i = 0; i < basePos.count; i++) {
      const x = basePos.getX(i);
      const y = basePos.getY(i);
      const z = basePos.getZ(i);
      const wave = Math.sin(x * 6) * Math.cos(y * 6) * 0.02;
      basePos.setZ(i, z + wave);
    }
    baseGeo.computeVertexNormals();

    const baseMesh = new THREE.Mesh(baseGeo, crepeMat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = 0.2;
    baseMesh.scale.set(1.0, 1.0, 0.03);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.crepeBase.add(baseMesh);

    // Baked spots with burnt brown
    this.addCookedSpots(baseMesh, 12);

    // Left Flap (hinge on left edge)
    this.leftFlap = new THREE.Group();
    this.leftFlap.position.set(-0.8, 0, 0);
    this.crepeBase.add(this.leftFlap);

    const leftGeo = new THREE.ConeGeometry(1.2, 2.3, 3, 1, false, Math.PI, Math.PI);
    const leftMesh = new THREE.Mesh(leftGeo, crepeMat);
    leftMesh.position.set(0.6, 0, 0.01);
    leftMesh.rotation.x = -Math.PI / 2;
    leftMesh.scale.set(1.0, 1.0, 0.03);
    leftMesh.castShadow = true;
    this.leftFlap.add(leftMesh);
    this.addCookedSpots(leftMesh, 8);

    // Right Flap (hinge on right edge)
    this.rightFlap = new THREE.Group();
    this.rightFlap.position.set(0.8, 0, 0);
    this.crepeBase.add(this.rightFlap);

    const rightGeo = new THREE.ConeGeometry(1.2, 2.3, 3, 1, false, 0, Math.PI);
    const rightMesh = new THREE.Mesh(rightGeo, crepeMat);
    rightMesh.position.set(-0.6, 0, 0.02);
    rightMesh.rotation.x = -Math.PI / 2;
    rightMesh.scale.set(1.0, 1.0, 0.03);
    rightMesh.castShadow = true;
    this.rightFlap.add(rightMesh);
    this.addCookedSpots(rightMesh, 8);

    // Fillings group
    this.fillingsGroup = new THREE.Group();
    this.fillingsGroup.position.set(0, 0.2, 0.1);
    this.crepeBase.add(this.fillingsGroup);

    this.buildFillings();
  }

  addCookedSpots(parentMesh, count) {
    const spotGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const spotMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x3D1503),
      roughness: 0.95,
      metalness: 0.0
    });
    for (let i = 0; i < count; i++) {
      const spot = new THREE.Mesh(spotGeo, spotMat);
      spot.position.set(
        (Math.random() - 0.5) * 1.0,
        (Math.random() - 0.5) * 1.5,
        0.05
      );
      spot.scale.set(1.2 + Math.random() * 0.6, 0.1, 1.2 + Math.random() * 0.6);
      spot.rotation.set(Math.random(), Math.random(), Math.random());
      parentMesh.add(spot);
    }
  }

  /* ──────────────────────────────────────────────────────────
     Premium Fillings — PBR Materials
     ────────────────────────────────────────────────────────── */
  buildFillings() {
    // ── Lettuce — natural green, wavy organic shapes ─────────
    const leafGeo = new THREE.SphereGeometry(0.18, 8, 8);
    // Displace for organic wavy shape
    const leafPos = leafGeo.attributes.position;
    for (let i = 0; i < leafPos.count; i++) {
      const x = leafPos.getX(i);
      const y = leafPos.getY(i);
      const z = leafPos.getZ(i);
      leafPos.setZ(i, z + Math.sin(x * 8) * 0.04 + Math.cos(y * 6) * 0.03);
    }
    leafGeo.computeVertexNormals();

    const leafMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x43A047),
      roughness: 0.7,
      metalness: 0.0,
      sheen: 0.3,
      sheenColor: new THREE.Color(0x81C784),
      envMapIntensity: 0.4
    });
    this.lettuceItems = [];
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.scale.set(1.6, 0.12, 1.2);
      leaf.position.set(
        (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 1.2,
        0.05
      );
      leaf.rotation.set(Math.random() * 0.4, Math.random() * 0.4, Math.random() * Math.PI);
      this.fillingsGroup.add(leaf);
      this.lettuceItems.push(leaf);
    }

    // ── Chicken chunks — golden fried with procedural roughness ──
    const meatGeo = new THREE.IcosahedronGeometry(0.14, 0);
    // Deform for organic irregular shape
    const meatPos = meatGeo.attributes.position;
    for (let i = 0; i < meatPos.count; i++) {
      const x = meatPos.getX(i);
      const y = meatPos.getY(i);
      const z = meatPos.getZ(i);
      const noise = (Math.random() - 0.5) * 0.04;
      meatPos.setX(i, x + noise);
      meatPos.setY(i, y + noise);
      meatPos.setZ(i, z + noise);
    }
    meatGeo.computeVertexNormals();

    const meatMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xC17817),
      roughness: 0.75,
      metalness: 0.0,
      clearcoat: 0.08,
      envMapIntensity: 0.5
    });
    this.meatItems = [];
    for (let i = 0; i < 6; i++) {
      const meat = new THREE.Mesh(meatGeo, meatMat);
      meat.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 1.1,
        0.1
      );
      meat.rotation.set(Math.random(), Math.random(), Math.random());
      meat.castShadow = true;
      this.fillingsGroup.add(meat);
      this.meatItems.push(meat);
    }

    // ── Cheese strands — semi-transparent, stretchy glow ─────
    const cheeseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xFFE082),
      roughness: 0.25,
      metalness: 0.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      transmission: 0.15,
      thickness: 0.5,
      envMapIntensity: 0.8,
      emissive: new THREE.Color(0xFFCC02),
      emissiveIntensity: 0.08
    });
    this.cheeseItems = [];
    for (let i = 0; i < 10; i++) {
      const cheeseGeo = new THREE.CylinderGeometry(
        0.02 + Math.random() * 0.015,
        0.02 + Math.random() * 0.015,
        0.35 + Math.random() * 0.15,
        8
      );
      const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
      cheese.rotation.set(Math.PI / 2, Math.random() - 0.5, Math.random() * Math.PI);
      cheese.position.set(
        (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 1.3,
        0.12
      );
      this.fillingsGroup.add(cheese);
      this.cheeseItems.push(cheese);
    }

    // ── Sauce drizzle — glossy wet clearcoat ─────────────────
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.4, -0.8, 0.2),
      new THREE.Vector3(-0.15, -0.35, 0.24),
      new THREE.Vector3(0.2, 0.05, 0.22),
      new THREE.Vector3(-0.1, 0.45, 0.25),
      new THREE.Vector3(0.25, 0.85, 0.23)
    ]);
    const sauceGeo = new THREE.TubeGeometry(curve, 48, 0.055, 10, false);
    const sauceMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xC62828),
      roughness: 0.08,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.0,
      emissive: new THREE.Color(0x8B0000),
      emissiveIntensity: 0.05
    });
    this.sauceMesh = new THREE.Mesh(sauceGeo, sauceMat);
    this.sauceMesh.castShadow = true;
    this.fillingsGroup.add(this.sauceMesh);
  }

  /* ──────────────────────────────────────────────────────────
     Steam — Sprite-based Volumetric Puffs
     ────────────────────────────────────────────────────────── */
  buildSteam() {
    // Create a procedural circular gradient texture for steam puffs
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.4, 'rgba(255, 245, 230, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 240, 220, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const steamTexture = new THREE.CanvasTexture(canvas);

    const steamCount = 18;
    this.steamSprites = [];

    for (let i = 0; i < steamCount; i++) {
      const spriteMat = new THREE.SpriteMaterial({
        map: steamTexture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.3, 0.3, 1);

      // Initialize at random positions above the crepe
      sprite.position.set(
        (Math.random() - 0.5) * 0.8,
        0.3 + Math.random() * 1.5,
        (Math.random() - 0.5) * 0.8
      );

      // Store lifecycle data
      sprite.userData = {
        baseX: sprite.position.x,
        speed: 0.003 + Math.random() * 0.004,
        swaySpeed: 1.5 + Math.random() * 2,
        swayAmount: 0.002 + Math.random() * 0.003,
        maxHeight: 2.5 + Math.random() * 0.5,
        maxScale: 0.4 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      };

      this.scene.add(sprite);
      this.steamSprites.push(sprite);
    }
  }

  /* ──────────────────────────────────────────────────────────
     Cinematic Animation Timeline
     ────────────────────────────────────────────────────────── */
  playCinematicAnimation() {
    // Initialize hidden state
    this.crepeBase.scale.set(0, 0, 0);
    this.leftFlap.rotation.y = 0;
    this.rightFlap.rotation.y = 0;

    this.lettuceItems.forEach(l => l.scale.set(0, 0, 0));
    this.meatItems.forEach(m => {
      m.position.z = 2.0;
      m.scale.set(0, 0, 0);
    });
    this.cheeseItems.forEach(c => c.scale.set(0, 0, 0));
    this.sauceMesh.scale.set(0, 0, 0);

    this.animTimeline = gsap.timeline({ repeat: -1, repeatDelay: 3.0 });

    this.animTimeline
      // Step 1: Crepe dough appears with elastic bounce
      .to(this.crepeBase.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.3,
        ease: 'back.out(1.4)'
      })

      // Step 2: Lettuce scatters in
      .to(this.lettuceItems.map(l => l.scale), {
        x: 1.6, y: 0.12, z: 1.2,
        duration: 0.6,
        stagger: 0.04,
        ease: 'bounce.out'
      }, '-=0.4')

      // Step 3: Meat chunks drop from above
      .to(this.meatItems.map(m => m.position), {
        z: 0.1,
        duration: 0.8,
        stagger: 0.07,
        ease: 'bounce.out'
      }, '-=0.2')
      .to(this.meatItems.map(m => m.scale), {
        x: 1, y: 1, z: 1,
        duration: 0.4,
        stagger: 0.07
      }, '-=0.8')

      // Step 4: Cheese melts in and sags
      .to(this.cheeseItems.map(c => c.scale), {
        x: 1, y: 1, z: 1,
        duration: 0.9,
        stagger: 0.035,
        ease: 'power2.out'
      }, '-=0.3')
      .to(this.cheeseItems.map(c => c.position), {
        z: 0.04,
        duration: 0.9,
        stagger: 0.035
      }, '-=0.9')

      // Step 5: Sauce drizzle appears
      .to(this.sauceMesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.0,
        ease: 'power1.inOut'
      }, '-=0.2')

      // Step 6: Fold the crepe envelope
      .to(this.leftFlap.rotation, {
        y: Math.PI / 1.15,
        duration: 0.9,
        ease: 'power3.inOut'
      })
      .to(this.leftFlap.position, {
        z: 0.05,
        duration: 0.9
      }, '-=0.9')
      .to(this.rightFlap.rotation, {
        y: -Math.PI / 1.15,
        duration: 0.9,
        ease: 'power3.inOut'
      }, '-=0.6')
      .to(this.rightFlap.position, {
        z: 0.1,
        duration: 0.9
      }, '-=0.9')

      // Step 7: Camera dolly + hero rotation
      .to(this.camera.position, {
        y: 2.2, z: 7.5,
        duration: 1.5,
        ease: 'power2.out'
      }, '-=0.4')
      .to(this.crepeGroup.rotation, {
        y: Math.PI * 2,
        duration: 3.5,
        ease: 'sine.inOut'
      }, '-=1.0')

      // Reset camera
      .to(this.camera.position, {
        y: 4.5, z: 9,
        duration: 1.2,
        ease: 'power2.inOut'
      });
  }

  /* ──────────────────────────────────────────────────────────
     Render Loop
     ────────────────────────────────────────────────────────── */
  onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloomPass?.setSize?.(w, h);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    this.controls?.update();

    // Floating idle
    if (this.crepeGroup && !gsap.isTweening(this.crepeGroup.rotation)) {
      this.crepeGroup.position.y = Math.sin(elapsed * 1.5) * 0.06;
      this.crepeGroup.rotation.y += 0.003;
    }

    // Animate steam sprites — rise, sway, fade, respawn
    for (const sprite of this.steamSprites) {
      const ud = sprite.userData;
      sprite.position.y += ud.speed;
      sprite.position.x = ud.baseX + Math.sin(elapsed * ud.swaySpeed + ud.phase) * ud.swayAmount * 30;

      // Progress ratio (0 → 1) over the lifetime
      const progress = (sprite.position.y - 0.3) / (ud.maxHeight - 0.3);

      if (progress < 0.2) {
        // Fade in
        sprite.material.opacity = progress * 2;
        const s = progress * 5 * ud.maxScale;
        sprite.scale.set(s, s, 1);
      } else if (progress < 0.7) {
        // Full
        sprite.material.opacity = 0.35;
        sprite.scale.set(ud.maxScale, ud.maxScale, 1);
      } else {
        // Fade out
        const fadeProgress = (progress - 0.7) / 0.3;
        sprite.material.opacity = 0.35 * (1 - fadeProgress);
        const s = ud.maxScale * (1 + fadeProgress * 0.5);
        sprite.scale.set(s, s, 1);
      }

      // Respawn
      if (sprite.position.y > ud.maxHeight) {
        sprite.position.y = 0.3;
        sprite.position.x = (Math.random() - 0.5) * 0.8;
        sprite.position.z = (Math.random() - 0.5) * 0.8;
        ud.baseX = sprite.position.x;
        ud.phase = Math.random() * Math.PI * 2;
      }
    }

    // Render via post-processing pipeline
    this.composer.render();
  }

  replay() {
    if (this.animTimeline) {
      this.animTimeline.restart();
    }
  }

  dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.animTimeline) {
      this.animTimeline.kill();
    }

    this.controls?.dispose();

    // Dispose steam sprites
    for (const sprite of this.steamSprites) {
      sprite.material.map?.dispose();
      sprite.material.dispose();
      this.scene.remove(sprite);
    }

    if (this.envMap) {
      this.envMap.dispose();
    }

    if (this.composer) {
      this.composer.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement?.remove();
    }

    this.scene?.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
