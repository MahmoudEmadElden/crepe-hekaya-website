/* ============================================================
   كريب حكاية — Crepe Hekaya
   3D Crepe Builder — Premium Interactive Build
   Three.js v0.170 + GSAP + PostProcessing + PBR + Env Map
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

export class BuilderCrepe3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null;
    this.clock = new THREE.Clock();
    
    // 3D groups
    this.crepeGroup = null;
    this.crepeShell = null;
    this.crepeShellMat = null;
    this.ingredients = {}; // key: ingredientId, value: Group of meshes
    
    this.init();
  }

  init() {
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 450;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 3.8, 7.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Environment Map (IBL)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const envScene = new RoomEnvironment(this.renderer);
    this.envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    this.scene.environment = this.envMap;
    envScene.dispose();
    pmremGenerator.dispose();

    // Post-Processing
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.3,   // strength
      0.5,   // radius
      0.85   // threshold
    );
    this.composer.addPass(bloomPass);
    this.bloomPass = bloomPass;

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 12;
    this.controls.target.set(0, 0.2, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.55);
    this.scene.add(ambientLight);

    const mainLight = new THREE.SpotLight(0xffb347, 4.5, 20, Math.PI / 4, 0.45, 1.0);
    mainLight.position.set(4, 7, 3);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0004;
    this.scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xff8c42, 1.6, 14);
    fillLight.position.set(-4, 3, 2);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff6b35, 1.5);
    rimLight.position.set(0, 3, -7);
    this.scene.add(rimLight);

    // Crepe base group
    this.crepeGroup = new THREE.Group();
    this.scene.add(this.crepeGroup);

    // Plate & Crepe Shell
    this.buildPlate();
    this.buildFoldedShell();

    // Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    this.animate();
  }

  buildPlate() {
    const plateGeo = new THREE.CylinderGeometry(2.3, 2.1, 0.1, 64);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x1a1a2e),
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.5,
      envMapIntensity: 0.7
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -1.25;
    plate.receiveShadow = true;
    this.scene.add(plate);

    // Gold inner rim
    const ringGeo = new THREE.TorusGeometry(2.15, 0.018, 10, 64);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd4af37),
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color(0xff8c00),
      emissiveIntensity: 0.25
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.19;
    this.scene.add(ring);
  }

  buildFoldedShell() {
    // Back Shell geometry (rounded flat triangle)
    const backShape = new THREE.Shape();
    backShape.moveTo(0, -1.4);
    backShape.quadraticCurveTo(0.7, -0.5, 1.4, 1.3);
    backShape.quadraticCurveTo(0, 1.6, -1.4, 1.3);
    backShape.quadraticCurveTo(-0.7, -0.5, 0, -1.4);

    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };

    const backGeo = new THREE.ExtrudeGeometry(backShape, extrudeSettings);
    
    // Add displacement noise
    const backPos = backGeo.attributes.position;
    for (let i = 0; i < backPos.count; i++) {
      const x = backPos.getX(i);
      const y = backPos.getY(i);
      const z = backPos.getZ(i);
      const noise = Math.sin(x * 5) * Math.cos(y * 5) * 0.05 + (Math.random() - 0.5) * 0.015;
      backPos.setZ(i, z + noise);
    }
    backGeo.computeVertexNormals();

    this.crepeShellMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xD4922A),
      roughness: 0.55,
      metalness: 0.0,
      clearcoat: 0.1,
      sheen: 0.8,
      sheenColor: new THREE.Color(0xF0C060),
      side: THREE.DoubleSide,
      envMapIntensity: 0.6
    });

    const backMesh = new THREE.Mesh(backGeo, this.crepeShellMat);
    backMesh.position.set(0, -0.3, -0.05);
    backMesh.castShadow = true;
    backMesh.receiveShadow = true;
    this.crepeGroup.add(backMesh);
    this.crepeShell = backMesh;

    // Cooked spots
    const spotGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const spotMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x3D1503), roughness: 0.95 });
    for (let i = 0; i < 8; i++) {
      const spot = new THREE.Mesh(spotGeo, spotMat);
      spot.position.set((Math.random() - 0.5) * 1.5, -0.5 + Math.random() * 1.5, 0.05);
      spot.scale.set(1.5, 0.1, 1.5);
      spot.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2);
      backMesh.add(spot);
    }

    // Front Flap Shell
    const frontShape = new THREE.Shape();
    frontShape.moveTo(0, -1.4);
    frontShape.quadraticCurveTo(0.65, -0.5, 1.3, 0.25);
    frontShape.lineTo(-1.3, 0.25);
    frontShape.quadraticCurveTo(-0.65, -0.5, 0, -1.4);

    const frontGeo = new THREE.ExtrudeGeometry(frontShape, extrudeSettings);
    
    const frontPos = frontGeo.attributes.position;
    for (let i = 0; i < frontPos.count; i++) {
      const x = frontPos.getX(i);
      const y = frontPos.getY(i);
      const z = frontPos.getZ(i);
      const noise = Math.sin(x * 5) * Math.cos(y * 5) * 0.035 + (Math.random() - 0.5) * 0.012;
      frontPos.setZ(i, z + noise);
    }
    frontGeo.computeVertexNormals();

    const frontMesh = new THREE.Mesh(frontGeo, this.crepeShellMat);
    frontMesh.position.set(0, -0.3, 0.12);
    frontMesh.rotation.x = -0.05;
    frontMesh.castShadow = true;
    frontMesh.receiveShadow = true;
    this.crepeGroup.add(frontMesh);

    for (let i = 0; i < 6; i++) {
      const spot = new THREE.Mesh(spotGeo, spotMat);
      spot.position.set((Math.random() - 0.5) * 1.3, -1.0 + Math.random() * 1.0, 0.05);
      spot.scale.set(1.5, 0.1, 1.5);
      spot.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2);
      frontMesh.add(spot);
    }

    this.crepeGroup.rotation.x = 0.25;
    this.crepeGroup.position.y = 0.2;
  }

  setBreadType(type) {
    if (!this.crepeShellMat) return;
    
    if (type === 'chocolate') {
      gsap.to(this.crepeShellMat.color, { r: 0.35, g: 0.18, b: 0.1, duration: 0.5 });
    } else {
      gsap.to(this.crepeShellMat.color, { r: 0.83, g: 0.57, b: 0.16, duration: 0.5 });
    }
  }

  updateIngredient(id, visible) {
    if (visible) {
      if (this.ingredients[id]) return;
      
      const group = new THREE.Group();
      this.buildIngredientMesh(id, group);
      group.scale.set(0, 0, 0);
      group.position.y = 2.0;
      this.crepeGroup.add(group);
      
      this.ingredients[id] = group;

      gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(1.5)' });
      gsap.to(group.position, { y: 0, duration: 0.6, ease: 'bounce.out' });
    } else {
      const group = this.ingredients[id];
      if (!group) return;
      
      gsap.to(group.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          this.crepeGroup.remove(group);
          group.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          delete this.ingredients[id];
        }
      });
    }
  }

  buildIngredientMesh(id, group) {
    const count = 6;
    
    if (id.includes('chicken') || id.includes('pane') || id.includes('crispy') || id.includes('strips') || id.includes('zinger') || id.includes('shish') || id.includes('cordon')) {
      const geo = new THREE.IcosahedronGeometry(0.14, 0);
      const pos = geo.attributes.position;
      for(let j=0; j<pos.count; j++) {
        pos.setXYZ(j, pos.getX(j)+(Math.random()-0.5)*0.04, pos.getY(j)+(Math.random()-0.5)*0.04, pos.getZ(j)+(Math.random()-0.5)*0.04);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0xC17817), roughness: 0.75, clearcoat: 0.08, envMapIntensity: 0.5 });
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 1.3, 0.3 + (Math.random() - 0.5) * 0.4, 0.02 + (Math.random() - 0.5) * 0.06);
        mesh.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        mesh.castShadow = true;
        group.add(mesh);
      }
    } else if (id.includes('meat') || id.includes('kofta') || id.includes('burger') || id.includes('hotdog') || id.includes('sausage')) {
      const geo = id.includes('kofta') ? new THREE.CapsuleGeometry(0.06, 0.25, 4, 8) : new THREE.IcosahedronGeometry(0.13, 0);
      const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0x451a03), roughness: 0.75, envMapIntensity: 0.4 });
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 1.3, 0.3 + (Math.random() - 0.5) * 0.4, 0.02 + (Math.random() - 0.5) * 0.06);
        if (id.includes('kofta')) {
          mesh.rotation.set(Math.PI / 2, Math.random(), Math.random() * Math.PI);
        } else {
          mesh.rotation.set(Math.random(), Math.random(), Math.random());
        }
        mesh.castShadow = true;
        group.add(mesh);
      }
    } else if (id.includes('shrimp') || id.includes('seafood') || id.includes('tuna')) {
      const geo = new THREE.TorusGeometry(0.12, 0.04, 8, 16, Math.PI);
      const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0xfca5a5), roughness: 0.4, metalness: 0.1, clearcoat: 0.3 });
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 1.3, 0.3 + (Math.random() - 0.5) * 0.4, 0.02 + (Math.random() - 0.5) * 0.06);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.castShadow = true;
        group.add(mesh);
      }
    } else if (id.includes('mozzarella') || id.includes('cheddar') || id.includes('rumi') || id.includes('cheese')) {
      const color = id.includes('mozzarella') ? 0xfff9e6 : 0xffaa00;
      const cheeseMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: 0.25,
        clearcoat: 0.5,
        transmission: 0.15,
        thickness: 0.5,
        envMapIntensity: 0.8
      });
      for (let i = 0; i < 8; i++) {
        const p1 = new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.2 + Math.random() * 0.4, -0.02);
        const p2 = new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.1, 0.12);
        const control = new THREE.Vector3((p1.x + p2.x)/2, Math.min(p1.y, p2.y) - 0.12, (p1.z + p2.z)/2);
        const curve = new THREE.QuadraticBezierCurve3(p1, control, p2);
        const geo = new THREE.TubeGeometry(curve, 8, 0.025, 6, false);
        const mesh = new THREE.Mesh(geo, cheeseMat);
        mesh.castShadow = true;
        group.add(mesh);
      }
    } else if (id.includes('lettuce') || id.includes('vegetables') || id.includes('pepper') || id.includes('tomato') || id.includes('olive') || id.includes('jalapeno') || id.includes('onion')) {
      let color = 0x43A047;
      let geo = new THREE.SphereGeometry(0.12, 6, 6);
      if (id.includes('tomato')) {
        color = 0xef4444;
        geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      } else if (id.includes('olive')) {
        color = 0x1e293b;
        geo = new THREE.TorusGeometry(0.08, 0.03, 6, 12);
      } else if (id.includes('jalapeno')) {
        color = 0x15803d;
        geo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8);
      }
      
      const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), roughness: 0.6, sheen: 0.3 });
      for (let i = 0; i < 8; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 1.4, 0.3 + (Math.random() - 0.5) * 0.4, 0.02 + (Math.random() - 0.5) * 0.06);
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        mesh.castShadow = true;
        group.add(mesh);
      }
    } else {
      const points = [];
      const countPoints = 8;
      const color = id.includes('bbq') ? 0x611b02 : (id.includes('spicy') || id.includes('ketchup') ? 0xa80a0a : 0xf2ebc9);
      for (let k = 0; k < countPoints; k++) {
        const t = k / (countPoints - 1);
        const x = (t - 0.5) * 2.2;
        const y = 0.2 + Math.sin(t * Math.PI * 3.5) * 0.15;
        const z = 0.05 + Math.cos(t * Math.PI * 2) * 0.04;
        points.push(new THREE.Vector3(x, y, z));
      }
      const spline = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(spline, 24, 0.03, 8, false);
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      group.add(mesh);
    }
  }

  onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    this.controls?.update();

    if (this.crepeGroup) {
      this.crepeGroup.position.y = 0.2 + Math.sin(elapsed * 1.3) * 0.05;
      this.crepeGroup.rotation.y = elapsed * 0.06;
    }

    this.composer?.render();
  }

  clearAllIngredients() {
    Object.keys(this.ingredients).forEach(id => {
      this.updateIngredient(id, false);
    });
  }

  dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.controls?.dispose();
    if (this.envMap) this.envMap.dispose();
    if (this.composer) this.composer.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement?.remove();
    }
    this.scene?.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}
