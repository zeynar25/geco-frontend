import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ParkMap3D({
  modelPath = "/models/map.glb",
  distanceFactor = 1.4,
  onModelLoad,
}) {
  const containerRef = useRef(null);
  // Parent component may show its own loading UI via `onModelLoad`

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f4f4);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2; // Do not go below ground

    const loader = new GLTFLoader();

    let model = null;

    loader.load(
      modelPath,
      (gltf) => {
        model = gltf.scene;

        // compute bounds, scale model to a reasonable size and center it.
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 6 / maxDim;
        model.scale.setScalar(scale);

        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        scene.add(model);

        // recompute bounds after scaling/centering and position camera closer
        const boxAfter = new THREE.Box3().setFromObject(model);
        const sphere = new THREE.Sphere();
        boxAfter.getBoundingSphere(sphere);

        // place camera so the model fills more of the view
        const radius = sphere.radius || Math.max(size.x, size.y, size.z) * 0.5;
        const camDist = Math.max(2, radius * distanceFactor);
        camera.position.set(
          sphere.center.x,
          sphere.center.y + radius * 0.6,
          sphere.center.z + camDist
        );
        camera.lookAt(sphere.center);

        // set controls target to model center and tighten zoom limits
        controls.target.copy(sphere.center);
        controls.minDistance = Math.max(1, radius * 0.5);
        controls.maxDistance = Math.max(10, radius * 4);
        controls.update();
        // hide loader once model and camera are positioned
        if (typeof onModelLoad === "function") onModelLoad(true);
      },
      undefined,
      (error) => {
        console.error("Error loading 3D park model:", error);
        if (typeof onModelLoad === "function") onModelLoad(false);
      }
    );

    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (model) {
        // Slow auto-rotation: was 0.0025, halve it for a gentler spin
        model.rotation.y += 0.00125;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || width;
      const newHeight = container.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, distanceFactor, onModelLoad]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] bg-white"
      aria-label="3D view of CvSU Agri-Eco Tourism Park"
    >
      {/* Loading overlay removed: parent should show loading state via `onModelLoad` */}
    </div>
  );
}
