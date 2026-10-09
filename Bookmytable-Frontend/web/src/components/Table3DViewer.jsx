import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Sparkles, Info } from "lucide-react";
import modernDiningTableAsset from "@/assets/modern_dining_table.glb";

// ── Cinematic Camera Waypoints Mapped to Scroll Progress ─────────────────────
// Waypoints choreograph a physical walk-through around the dining table.
const WAYPOINTS = [
  // Phase 1 (0.00): Establishing Wide Shot — Full table, crystal glasses, warm ambient glow
  { progress: 0.0,  pos: [2.8, 1.85, 3.1],   target: [0, 0.72, 0],         rotY: 0.0 },
  // Phase 2 (0.33): Intimacy & Seating — Eye-level diner view showing fine linen & crystal
  { progress: 0.33, pos: [1.6, 1.15, 2.05],  target: [-0.12, 0.75, 0.12], rotY: 0.32 },
  // Phase 3 (0.66): Acoustic Spacing & Details — Sweeping diagonal showing table geometry
  { progress: 0.66, pos: [-1.8, 1.3, 1.85],  target: [0.1, 0.76, -0.08],  rotY: 0.70 },
  // Phase 4 (1.00): Hero Reservation Angle — Elevated welcoming composition framing next step
  { progress: 1.0,  pos: [2.2, 1.9, 2.5],    target: [0, 0.73, 0],         rotY: 1.05 },
];

function getCameraWaypoint(p) {
  const clamped = Math.max(0, Math.min(1, p));
  let seg = 0;
  if (clamped >= WAYPOINTS[2].progress) {
    seg = 2;
  } else if (clamped >= WAYPOINTS[1].progress) {
    seg = 1;
  }
  const w1 = WAYPOINTS[seg];
  const w2 = WAYPOINTS[seg + 1];
  const range = w2.progress - w1.progress;
  const rawT = (clamped - w1.progress) / range;
  // Smoothstep easing for silky transitions between waypoints
  const t = rawT * rawT * (3 - 2 * rawT);

  return {
    posX: w1.pos[0] + (w2.pos[0] - w1.pos[0]) * t,
    posY: w1.pos[1] + (w2.pos[1] - w1.pos[1]) * t,
    posZ: w1.pos[2] + (w2.pos[2] - w1.pos[2]) * t,
    targetX: w1.target[0] + (w2.target[0] - w1.target[0]) * t,
    targetY: w1.target[1] + (w2.target[1] - w1.target[1]) * t,
    targetZ: w1.target[2] + (w2.target[2] - w1.target[2]) * t,
    rotY: w1.rotY + (w2.rotY - w1.rotY) * t,
  };
}

export default function Table3DViewer({ scrollProgressRef }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // References for Three.js instances
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const pivotRef = useRef(null);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let isDisposed = false;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Pivot group to rotate model cleanly around its geometric center
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);
    pivotRef.current = pivotGroup;

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const initialWp = WAYPOINTS[0];
    camera.position.set(...initialWp.pos);
    camera.lookAt(...initialWp.target);
    cameraRef.current = camera;

    // 3. Renderer with luxury tone mapping & soft shadows
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights: Fine-dining warm candlelit & golden hour illumination
    const ambientLight = new THREE.AmbientLight(0x422a18, 1.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffa452, 3.4);
    mainLight.position.set(3.5, 6, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    mainLight.shadow.camera.left = -3;
    mainLight.shadow.camera.right = 3;
    mainLight.shadow.camera.top = 3;
    mainLight.shadow.camera.bottom = -3;
    mainLight.shadow.bias = -0.0006;
    mainLight.shadow.normalBias = 0.02;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x884522, 1.1);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0xff7b22, 2.9, 8, 1.5);
    accentLight.position.set(0, 2.3, 0);
    scene.add(accentLight);

    // 5. Shadow catcher plane
    const shadowGeo = new THREE.PlaneGeometry(20, 20);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.52 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // Subtle warm reflective floor disc
    const discGeo = new THREE.CircleGeometry(3.8, 64);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x1f160e,
      transparent: true,
      opacity: 0.45,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = -Math.PI / 2;
    discMesh.position.y = -0.002;
    scene.add(discMesh);

    // 6. Load GLTF Modern Dining Table Model
    const loader = new GLTFLoader();
    const candidateUrls = [
      modernDiningTableAsset,
      "/models/modern_dining_table.glb",
      "/src/assets/modern_dining_table.glb",
    ];

    function tryLoad(urlIndex) {
      if (isDisposed) return;
      if (urlIndex >= candidateUrls.length) {
        setLoadError("Unable to load dining model. Please check connection.");
        return;
      }

      const currentUrl = candidateUrls[urlIndex];
      loader.load(
        currentUrl,
        (gltf) => {
          if (isDisposed) return;
          const model = gltf.scene;

          // Configure shadows & material highlights
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = Math.max(0.24, child.material.roughness || 0.6);
                child.material.envMapIntensity = 1.25;
              }
            }
          });

          // Measure bounding box and scale
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const targetSize = 2.45;
          const scale = maxDim > 0 ? targetSize / maxDim : 1;
          model.scale.setScalar(scale);

          // Center model horizontally and align base with floor at y = 0
          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.x = -center.x;
          model.position.y = -box.min.y;
          model.position.z = -center.z;

          pivotGroup.add(model);

          setIsLoaded(true);
          setLoadingProgress(100);

          // Gentle scale entrance pop
          model.scale.multiplyScalar(0.92);
          gsap.to(model.scale, {
            x: scale,
            y: scale,
            z: scale,
            duration: 1.2,
            ease: "power2.out",
          });
        },
        (xhr) => {
          if (xhr.lengthComputable && xhr.total > 0) {
            const percent = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
            setLoadingProgress(percent);
          } else {
            setLoadingProgress((prev) => (prev < 90 ? prev + 8 : prev));
          }
        },
        (err) => {
          console.warn(`Failed loading model from ${currentUrl}, trying fallback...`, err);
          tryLoad(urlIndex + 1);
        }
      );
    }

    tryLoad(0);

    // 7. Mouse subtle parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onPointerMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetMouseX = (e.clientX - halfW) / halfW;
      targetMouseY = (e.clientY - halfH) / halfH;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // 8. Dynamic Animation Loop with GSAP Scroll Lerp
    const currentCamPos = new THREE.Vector3(...initialWp.pos);
    const currentLookAt = new THREE.Vector3(...initialWp.target);
    let currentModelRotY = 0;

    function animate() {
      if (isDisposed) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Read live scroll progress from parent GSAP ScrollTrigger
      const p = scrollProgressRef?.current ?? 0;
      const wp = getCameraWaypoint(p);

      // Responsive adjustments for mobile vs desktop
      const isMobile = window.innerWidth < 768;
      const distMult = isMobile ? 1.38 : 1.0;
      const yShift = isMobile ? 0.08 : 0;

      // Smooth mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const targetX = wp.posX * distMult + mouseX * 0.12;
      const targetY = wp.posY * distMult - mouseY * 0.08 + yShift;
      const targetZ = wp.posZ * distMult;

      // Camera position lerp (silky inertia)
      currentCamPos.x += (targetX - currentCamPos.x) * 0.08;
      currentCamPos.y += (targetY - currentCamPos.y) * 0.08;
      currentCamPos.z += (targetZ - currentCamPos.z) * 0.08;
      camera.position.copy(currentCamPos);

      // LookAt target lerp
      const targetLookX = wp.targetX + mouseX * 0.03;
      const targetLookY = wp.targetY + yShift;
      const targetLookZ = wp.targetZ;

      currentLookAt.x += (targetLookX - currentLookAt.x) * 0.08;
      currentLookAt.y += (targetLookY - currentLookAt.y) * 0.08;
      currentLookAt.z += (targetLookZ - currentLookAt.z) * 0.08;
      camera.lookAt(currentLookAt);

      // Smooth model rotation lerp
      currentModelRotY += (wp.rotY - currentModelRotY) * 0.08;
      if (pivotRef.current) {
        pivotRef.current.rotation.y = currentModelRotY;
      }

      renderer.render(scene, camera);
    }
    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#0a0806]"
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full block"
      />

      {/* Atmospheric Vignette & Contrast Gradients for Foreground Text Legibility */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(200,164,110,0.06) 0%, rgba(10,8,6,0.3) 60%, rgba(10,8,6,0.85) 100%)",
        }}
      />
      <div 
        className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-gradient-to-b from-[#0a0806] via-[#0a0806]/60 to-transparent" 
      />
      <div 
        className="absolute inset-x-0 bottom-0 h-36 pointer-events-none bg-gradient-to-t from-[#0a0806] via-[#0a0806]/70 to-transparent" 
      />

      {/* Loading Overlay */}
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0806]/95 backdrop-blur-md z-30 transition-opacity duration-700">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#c8a46e]/20 border-t-[#c8a46e] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#c8a46e] animate-pulse" />
            </div>
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#c8a46e] font-medium mb-2">
            Fine Dining Virtual Space
          </span>
          <h4 className="text-lg md:text-xl font-serif text-white font-medium mb-4">
            Curating 3D Dining Atmosphere...
          </h4>
          <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c8a46e] to-[#e4c28d] transition-all duration-300 ease-out"
              style={{ width: `${Math.max(12, loadingProgress)}%` }}
            />
          </div>
          <span className="text-xs text-neutral-400 mt-2 font-mono">
            {loadingProgress}% loaded
          </span>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-30">
          <Info className="w-10 h-10 text-amber-500 mb-3" />
          <p className="text-white font-serif text-lg mb-2">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 text-xs uppercase tracking-widest text-[#c8a46e] border border-[#c8a46e]/40 rounded hover:bg-[#c8a46e]/10 transition-colors"
          >
            Reload Experience
          </button>
        </div>
      )}
    </div>
  );
}
