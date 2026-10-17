import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FuelProduct, SimulatorStep } from '../../types/petrol';

interface PetrolPumpSceneProps {
  currentFuel: FuelProduct;
  step: SimulatorStep;
  dispensedLitres: number;
  totalCost: number;
  isTriggerPressed: boolean;
  cameraPreset: 'station' | 'dispenser' | 'nozzle' | 'car' | 'exploded';
  explodedSeparation: number; // 0 to 1
  onStepAction?: (action: string) => void;
  currencySymbol?: string;
  stationName?: string;
}

// Module-level reusable math objects to avoid garbage collection in the render loop
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export const PetrolPumpScene: React.FC<PetrolPumpSceneProps> = ({
  currentFuel,
  step,
  dispensedLitres,
  totalCost,
  isTriggerPressed,
  cameraPreset,
  explodedSeparation,
  stationName = 'DIL FARAZ PETROLEUM',
  currencySymbol = '₨'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Mutable refs to hold Three.js references across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  // Dynamic mesh and component references
  const nozzleGroupRef = useRef<THREE.Group | null>(null);
  const hoseMeshRef = useRef<THREE.Mesh | null>(null);
  const triggerLeverRef = useRef<THREE.Mesh | null>(null);
  const carFuelLidRef = useRef<THREE.Group | null>(null);
  const fuelCapRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const dispenserLcdCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dispenserLcdTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const totemCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const totemTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Exploded view component references
  const panelLeftRef = useRef<THREE.Mesh | null>(null);
  const panelRightRef = useRef<THREE.Mesh | null>(null);
  const panelFrontRef = useRef<THREE.Mesh | null>(null);
  const internalMeterRef = useRef<THREE.Group | null>(null);
  const internalMotorRef = useRef<THREE.Group | null>(null);
  const internalValveRef = useRef<THREE.Group | null>(null);

  // Store latest props in refs for animation loop
  const propsRef = useRef({
    currentFuel,
    step,
    dispensedLitres,
    totalCost,
    isTriggerPressed,
    cameraPreset,
    explodedSeparation,
    stationName,
    currencySymbol
  });
  propsRef.current = {
    currentFuel,
    step,
    dispensedLitres,
    totalCost,
    isTriggerPressed,
    cameraPreset,
    explodedSeparation,
    stationName,
    currencySymbol
  };

  // Helper to update the 2D canvas for the dispenser digital screen
  const updateDispenserCanvas = () => {
    const canvas = dispenserLcdCanvasRef.current;
    const texture = dispenserLcdTextureRef.current;
    if (!canvas || !texture) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { dispensedLitres, totalCost, currentFuel, currencySymbol, stationName } = propsRef.current;

    // Background: dark LCD with backplate grid
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header strip
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, canvas.width, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stationName.toUpperCase(), canvas.width / 2, 32);

    // Fuel Type Badge
    ctx.fillStyle = currentFuel.color;
    ctx.fillRect(20, 58, canvas.width - 40, 32);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText(`${currentFuel.name.toUpperCase()} (${currentFuel.code})`, canvas.width / 2, 80);

    // 1. Total Price Display
    ctx.fillStyle = '#111827';
    ctx.fillRect(20, 100, canvas.width - 40, 75);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 100, canvas.width - 40, 75);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`TOTAL AMOUNT (${currencySymbol})`, 32, 120);

    ctx.fillStyle = '#22c55e'; // Bright digital green
    ctx.font = 'bold 38px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(totalCost.toFixed(2), canvas.width - 35, 162);

    // 2. Volume Dispensed (Litres)
    ctx.fillStyle = '#111827';
    ctx.fillRect(20, 185, canvas.width - 40, 75);
    ctx.strokeRect(20, 185, canvas.width - 40, 75);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VOLUME (LITRES)', 32, 205);

    ctx.fillStyle = '#38bdf8'; // Digital sky blue
    ctx.font = 'bold 38px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(dispensedLitres.toFixed(2), canvas.width - 35, 247);

    // 3. Price per Litre
    ctx.fillStyle = '#111827';
    ctx.fillRect(20, 270, canvas.width - 40, 52);
    ctx.strokeRect(20, 270, canvas.width - 40, 52);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`UNIT RATE / L (${currencySymbol})`, 32, 292);

    ctx.fillStyle = '#f59e0b'; // Amber
    ctx.font = 'bold 24px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(currentFuel.pricePerLitre.toFixed(2), canvas.width - 35, 308);

    // Footer notice
    ctx.fillStyle = '#4b5563';
    ctx.font = '10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED ACCURACY • PTB / OIML R117 APPROVED', canvas.width / 2, 342);

    texture.needsUpdate = true;
  };

  // Helper to draw totem price sign
  const updateTotemCanvas = () => {
    const canvas = totemCanvasRef.current;
    const texture = totemTextureRef.current;
    if (!canvas || !texture) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red/White Top Brand Banner
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, canvas.width, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DIL FARAZ', canvas.width / 2, 45);
    ctx.font = '600 20px "Inter", sans-serif';
    ctx.fillText('PETROLEUM', canvas.width / 2, 80);

    // Price items
    const items = [
      { name: 'SUPER 92', price: '268.50', color: '#10b981' },
      { name: 'DIESEL V', price: '279.80', color: '#f59e0b' },
      { name: 'HI-OCTANE', price: '308.00', color: '#06b6d4' },
      { name: 'CNG GAS', price: '215.00', color: '#a855f7' }
    ];

    items.forEach((item, index) => {
      const y = 140 + index * 85;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(15, y, canvas.width - 30, 70);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(15, y, canvas.width - 30, 70);

      ctx.fillStyle = item.color;
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, 30, y + 30);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 28px "Share Tech Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(item.price, canvas.width - 30, y + 50);
    });

    texture.needsUpdate = true;
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0b1120');
    scene.fog = new THREE.FogExp2('#0b1120', 0.015);

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go underground
    controls.minDistance = 1.5;
    controls.maxDistance = 25;
    controls.target.set(0, 1.8, 0);

    // --- 2. Environment Map (RoomEnvironment) ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // --- 3. Studio Lighting Rig ---
    // Warm Key Light (casts shadow)
    const keyLight = new THREE.DirectionalLight('#fff5ea', 2.8);
    keyLight.position.set(6, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 25;
    const shadowD = 7;
    keyLight.shadow.camera.left = -shadowD;
    keyLight.shadow.camera.right = shadowD;
    keyLight.shadow.camera.top = shadowD;
    keyLight.shadow.camera.bottom = -shadowD;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Cool fill light (Hemisphere)
    const hemiLight = new THREE.HemisphereLight('#60a5fa', '#1e293b', 1.1);
    scene.add(hemiLight);

    // Canopy Downlights (Spotlight over the pump)
    const pumpSpot = new THREE.SpotLight('#fef08a', 3.0, 15, Math.PI / 3, 0.4, 1.0);
    pumpSpot.position.set(0, 5.8, 0);
    pumpSpot.target.position.set(0, 0, 0);
    scene.add(pumpSpot);
    scene.add(pumpSpot.target);

    // --- 4. Ground, Pump Island & Canopy ---
    // Asphalt Ground
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#1a1f2c',
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road markings (yellow guidelines)
    const stripeGeo = new THREE.PlaneGeometry(0.2, 10);
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
    const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe1.rotation.x = -Math.PI / 2;
    stripe1.position.set(3.2, 0.01, 0);
    scene.add(stripe1);

    const stripe2 = stripe1.clone();
    stripe2.position.set(-3.2, 0.01, 0);
    scene.add(stripe2);

    // Concrete Raised Pump Island
    const islandGroup = new THREE.Group();
    const islandGeo = new THREE.BoxGeometry(1.8, 0.28, 4.4);
    const concreteMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.7,
      metalness: 0.05
    });
    const islandMesh = new THREE.Mesh(islandGeo, concreteMat);
    islandMesh.position.y = 0.14;
    islandMesh.castShadow = true;
    islandMesh.receiveShadow = true;
    islandGroup.add(islandMesh);

    // Island curb hazard stripes (yellow/black borders)
    const curbGeo = new THREE.BoxGeometry(1.84, 0.08, 4.44);
    const curbMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      roughness: 0.5
    });
    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    curbMesh.position.y = 0.04;
    islandGroup.add(curbMesh);

    // Safety Bollards on island edges (Yellow steel pipes)
    const bollardGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 16);
    const bollardMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      roughness: 0.3,
      metalness: 0.6
    });
    const bollard1 = new THREE.Mesh(bollardGeo, bollardMat);
    bollard1.position.set(0, 0.55, 1.9);
    bollard1.castShadow = true;
    islandGroup.add(bollard1);

    const bollard2 = bollard1.clone();
    bollard2.position.set(0, 0.55, -1.9);
    islandGroup.add(bollard2);

    scene.add(islandGroup);

    // Overhead Canopy Structure
    const canopyGroup = new THREE.Group();
    const canopyRoofGeo = new THREE.BoxGeometry(8, 0.4, 9);
    const canopyRoofMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.3,
      roughness: 0.4
    });
    const canopyRoof = new THREE.Mesh(canopyRoofGeo, canopyRoofMat);
    canopyRoof.position.set(0, 6.2, 0);
    canopyRoof.castShadow = true;
    canopyGroup.add(canopyRoof);

    // Canopy Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 6.2, 24);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.8,
      roughness: 0.2
    });
    const pillar1 = new THREE.Mesh(pillarGeo, pillarMat);
    pillar1.position.set(-3.2, 3.1, -3.5);
    pillar1.castShadow = true;
    canopyGroup.add(pillar1);

    const pillar2 = pillar1.clone();
    pillar2.position.set(3.2, 3.1, -3.5);
    canopyGroup.add(pillar2);

    const pillar3 = pillar1.clone();
    pillar3.position.set(-3.2, 3.1, 3.5);
    canopyGroup.add(pillar3);

    const pillar4 = pillar1.clone();
    pillar4.position.set(3.2, 3.1, 3.5);
    canopyGroup.add(pillar4);

    // Canopy glowing fascia edge (Red brand trim)
    const fasciaGeo = new THREE.BoxGeometry(8.1, 0.3, 9.1);
    const fasciaMat = new THREE.MeshStandardMaterial({
      color: '#dc2626',
      emissive: '#7f1d1d',
      emissiveIntensity: 0.3,
      roughness: 0.2
    });
    const fasciaMesh = new THREE.Mesh(fasciaGeo, fasciaMat);
    fasciaMesh.position.set(0, 6.2, 0);
    canopyGroup.add(fasciaMesh);

    scene.add(canopyGroup);

    // --- 5. Station Totem Pole Price Board ---
    const totemGroup = new THREE.Group();
    totemGroup.position.set(-6.5, 0, 4);
    totemGroup.rotation.y = Math.PI / 4;

    const totemPoleGeo = new THREE.BoxGeometry(0.3, 5, 0.3);
    const totemPoleMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8 });
    const totemPole = new THREE.Mesh(totemPoleGeo, totemPoleMat);
    totemPole.position.y = 2.5;
    totemGroup.add(totemPole);

    // Totem screen canvas
    const totemCanvas = document.createElement('canvas');
    totemCanvas.width = 384;
    totemCanvas.height = 512;
    totemCanvasRef.current = totemCanvas;
    const totemTexture = new THREE.CanvasTexture(totemCanvas);
    totemTexture.colorSpace = THREE.SRGBColorSpace;
    totemTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    totemTextureRef.current = totemTexture;

    const totemBoardGeo = new THREE.BoxGeometry(1.6, 3.2, 0.2);
    const totemBoardMat = new THREE.MeshStandardMaterial({
      map: totemTexture,
      roughness: 0.2,
      metalness: 0.1
    });
    const totemBoard = new THREE.Mesh(totemBoardGeo, totemBoardMat);
    totemBoard.position.set(0, 3.4, 0);
    totemBoard.castShadow = true;
    totemGroup.add(totemBoard);

    scene.add(totemGroup);
    updateTotemCanvas();

    // --- 6. The Hero Petrol Pump Dispenser Machine ---
    const dispenserGroup = new THREE.Group();
    dispenserGroup.position.set(0, 0.28, 0); // Sits on top of concrete island

    // Stainless Steel Plinth
    const plinthGeo = new THREE.BoxGeometry(0.88, 0.14, 1.7);
    const stainlessMat = new THREE.MeshStandardMaterial({
      color: '#f1f5f9',
      metalness: 0.9,
      roughness: 0.2
    });
    const plinth = new THREE.Mesh(plinthGeo, stainlessMat);
    plinth.position.y = 0.07;
    plinth.castShadow = true;
    dispenserGroup.add(plinth);

    // Lower Main Steel Cabinet (Chassis)
    const cabinetGeo = new THREE.BoxGeometry(0.82, 1.25, 1.62);
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.35,
      metalness: 0.7
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.y = 0.76;
    cabinet.castShadow = true;
    dispenserGroup.add(cabinet);

    // Removable / Explodable side panels for exploded view
    const sidePanelGeo = new THREE.BoxGeometry(0.04, 1.2, 1.58);
    const panelPaintMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.4,
      roughness: 0.3
    });
    const panelRight = new THREE.Mesh(sidePanelGeo, panelPaintMat);
    panelRight.position.set(0.42, 0.76, 0);
    panelRightRef.current = panelRight;
    dispenserGroup.add(panelRight);

    const panelLeft = panelRight.clone();
    panelLeft.position.set(-0.42, 0.76, 0);
    panelLeftRef.current = panelLeft;
    dispenserGroup.add(panelLeft);

    // Upper Computing Head (Dispenser Display Head)
    const headGeo = new THREE.BoxGeometry(0.84, 0.95, 1.54);
    const headMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.2,
      metalness: 0.8
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.86;
    headMesh.castShadow = true;
    dispenserGroup.add(headMesh);

    // Top illuminated Crown "DIL FARAZ PETROLEUM"
    const crownGeo = new THREE.BoxGeometry(0.8, 0.24, 1.48);
    const crownMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      emissive: '#0369a1',
      emissiveIntensity: 0.6,
      roughness: 0.1
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.y = 2.45;
    crownMesh.castShadow = true;
    dispenserGroup.add(crownMesh);

    // Dispenser Digital LCD Display Screen (Front Face)
    const lcdCanvas = document.createElement('canvas');
    lcdCanvas.width = 512;
    lcdCanvas.height = 360;
    dispenserLcdCanvasRef.current = lcdCanvas;
    const lcdTexture = new THREE.CanvasTexture(lcdCanvas);
    lcdTexture.colorSpace = THREE.SRGBColorSpace;
    lcdTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    dispenserLcdTextureRef.current = lcdTexture;

    const screenGeo = new THREE.PlaneGeometry(0.95, 0.75);
    const screenMat = new THREE.MeshBasicMaterial({ map: lcdTexture });
    const screenFront = new THREE.Mesh(screenGeo, screenMat);
    screenFront.position.set(0.425, 1.86, 0);
    screenFront.rotation.y = Math.PI / 2;
    dispenserGroup.add(screenFront);

    // Duplicate screen for back side (so dual-sided fueling works)
    const screenBack = screenFront.clone();
    screenBack.position.set(-0.425, 1.86, 0);
    screenBack.rotation.y = -Math.PI / 2;
    dispenserGroup.add(screenBack);

    // Grade selection push buttons beneath display
    const btnGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
    const grades = [
      { color: '#10b981', z: -0.3 }, // Super 92
      { color: '#f59e0b', z: 0.0 },  // Diesel
      { color: '#06b6d4', z: 0.3 }   // Hi-Octane
    ];
    grades.forEach(g => {
      const btnMat = new THREE.MeshStandardMaterial({
        color: g.color,
        emissive: g.color,
        emissiveIntensity: 0.4,
        roughness: 0.2
      });
      const btn = new THREE.Mesh(btnGeo, btnMat);
      btn.rotation.z = Math.PI / 2;
      btn.position.set(0.43, 1.35, g.z);
      dispenserGroup.add(btn);
    });

    // Holster socket (where nozzle rests when idle)
    const holsterGeo = new THREE.BoxGeometry(0.16, 0.22, 0.2);
    const holsterMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.7 });
    const holster = new THREE.Mesh(holsterGeo, holsterMat);
    holster.position.set(0.38, 1.05, 0.65);
    dispenserGroup.add(holster);

    // Emergency Stop Button (ESD Red Mushroom Push)
    const esdBaseGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16);
    const esdBaseMat = new THREE.MeshStandardMaterial({ color: '#facc15' });
    const esdBase = new THREE.Mesh(esdBaseGeo, esdBaseMat);
    esdBase.rotation.z = Math.PI / 2;
    esdBase.position.set(0.43, 0.95, -0.6);
    dispenserGroup.add(esdBase);

    const esdMushroomGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.04, 16);
    const esdMushroomMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.2 });
    const esdMushroom = new THREE.Mesh(esdMushroomGeo, esdMushroomMat);
    esdMushroom.rotation.z = Math.PI / 2;
    esdMushroom.position.set(0.46, 0.95, -0.6);
    dispenserGroup.add(esdMushroom);

    // --- Internal Components (Visible in Exploded View) ---
    // 1. Piston Flow Meter Unit
    const internalMeter = new THREE.Group();
    const meterBodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16);
    const brassMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.85, roughness: 0.3 });
    const meterBody = new THREE.Mesh(meterBodyGeo, brassMat);
    internalMeter.add(meterBody);

    const meterEncoderGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const encoderMat = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.2 });
    const meterEncoder = new THREE.Mesh(meterEncoderGeo, encoderMat);
    meterEncoder.position.y = 0.22;
    internalMeter.add(meterEncoder);
    internalMeter.position.set(0, 0.8, 0.2);
    internalMeterRef.current = internalMeter;
    dispenserGroup.add(internalMeter);

    // 2. Explosion-Proof Electric Motor & Suction Pump
    const internalMotor = new THREE.Group();
    const motorGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.42, 16);
    const motorMat = new THREE.MeshStandardMaterial({ color: '#3b82f6', metalness: 0.7, roughness: 0.4 });
    const motorMesh = new THREE.Mesh(motorGeo, motorMat);
    motorMesh.rotation.x = Math.PI / 2;
    internalMotor.add(motorMesh);
    internalMotor.position.set(0, 0.45, -0.25);
    internalMotorRef.current = internalMotor;
    dispenserGroup.add(internalMotor);

    // 3. Dual Stage Solenoid Valve & Air Separator
    const internalValve = new THREE.Group();
    const valveGeo = new THREE.BoxGeometry(0.14, 0.24, 0.14);
    const valveMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.9, roughness: 0.15 });
    const valveMesh = new THREE.Mesh(valveGeo, valveMat);
    internalValve.add(valveMesh);
    internalValve.position.set(0, 1.1, -0.2);
    internalValveRef.current = internalValve;
    dispenserGroup.add(internalValve);

    scene.add(dispenserGroup);
    updateDispenserCanvas();

    // --- 7. The Refueling Nozzle (Pistol Grip, Aluminum Spout & Trigger) ---
    const nozzleGroup = new THREE.Group();
    nozzleGroupRef.current = nozzleGroup;

    // Pistol handle grip
    const handleGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.22, 12);
    const handleMat = new THREE.MeshStandardMaterial({
      color: '#10b981', // Matches fuel color
      roughness: 0.4,
      metalness: 0.3
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, -0.08, 0);
    handle.rotation.z = 0.25;
    nozzleGroup.add(handle);

    // Main aluminum valve body
    const nozzleBodyGeo = new THREE.BoxGeometry(0.06, 0.08, 0.14);
    const nozzleBodyMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.95,
      roughness: 0.15
    });
    const nozzleBody = new THREE.Mesh(nozzleBodyGeo, nozzleBodyMat);
    nozzleGroup.add(nozzleBody);

    // Aluminum Delivery Spout (Bent pipe with tip sensor)
    const spoutCurve = new THREE.CurvePath<THREE.Vector3>();
    const line1 = new THREE.LineCurve3(new THREE.Vector3(0, 0.02, 0.07), new THREE.Vector3(0, 0.08, 0.26));
    const line2 = new THREE.LineCurve3(new THREE.Vector3(0, 0.08, 0.26), new THREE.Vector3(0, 0.02, 0.42));
    spoutCurve.add(line1);
    spoutCurve.add(line2);
    const spoutGeo = new THREE.TubeGeometry(spoutCurve, 20, 0.012, 12, false);
    const spoutMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.95,
      roughness: 0.1
    });
    const spout = new THREE.Mesh(spoutGeo, spoutMat);
    nozzleGroup.add(spout);

    // Rubber Splash Guard / Vapor Collar
    const guardGeo = new THREE.ConeGeometry(0.05, 0.04, 16, 1, true);
    const guardMat = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.8 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.set(0, 0.05, 0.2);
    guard.rotation.x = Math.PI / 2;
    nozzleGroup.add(guard);

    // Interactive Trigger Guard & Squeeze Lever
    const guardLoopGeo = new THREE.TorusGeometry(0.045, 0.006, 8, 16, Math.PI);
    const guardLoopMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8 });
    const guardLoop = new THREE.Mesh(guardLoopGeo, guardLoopMat);
    guardLoop.position.set(0, -0.05, 0.02);
    guardLoop.rotation.y = Math.PI / 2;
    nozzleGroup.add(guardLoop);

    const triggerGeo = new THREE.BoxGeometry(0.014, 0.06, 0.014);
    const triggerMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3 });
    const triggerLever = new THREE.Mesh(triggerGeo, triggerMat);
    triggerLever.position.set(0, -0.04, 0.02);
    triggerLeverRef.current = triggerLever;
    nozzleGroup.add(triggerLever);

    // Place nozzle at resting holster initially
    nozzleGroup.position.set(0.48, 1.35, 0.65);
    nozzleGroup.rotation.set(-0.3, 0.1, -0.1);
    scene.add(nozzleGroup);

    // --- 8. Dynamic 3D Fuel Hose (Spline Tube) ---
    // Connects dispenser outlet on side to the nozzle base
    const initialHoseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.4, 2.1, 0.65), // Dispenser high outlet
      new THREE.Vector3(0.6, 1.2, 0.7),  // Catenary sag
      new THREE.Vector3(0.5, 0.8, 0.68),
      new THREE.Vector3(0.48, 1.22, 0.65) // Nozzle inlet base
    ]);
    const hoseGeo = new THREE.TubeGeometry(initialHoseCurve, 32, 0.024, 12, false);
    const hoseMat = new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.65,
      metalness: 0.2
    });
    const hoseMesh = new THREE.Mesh(hoseGeo, hoseMat);
    hoseMeshRef.current = hoseMesh;
    scene.add(hoseMesh);

    // --- 9. Customer Vehicle at Bay (Sedan with Functional Gas Cap) ---
    const carGroup = new THREE.Group();
    carGroup.position.set(2.4, 0, 0.2); // Parked parallel to pump island

    // Car Body Hull
    const carBodyGeo = new THREE.BoxGeometry(1.9, 0.75, 4.4);
    const carPaintMat = new THREE.MeshPhysicalMaterial({
      color: '#1e3a8a', // Deep royal metallic blue
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const carBody = new THREE.Mesh(carBodyGeo, carPaintMat);
    carBody.position.y = 0.58;
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Car Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.62, 2.3);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#0f172a',
      transmission: 0.6,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1
    });
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.15, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Wheels (4 wheels with rubber tires and alloy rims)
    const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.25, 24);
    const tireMat = new THREE.MeshStandardMaterial({ color: '#171717', roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.15 });

    const createWheel = (x: number, z: number) => {
      const wheel = new THREE.Group();
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheel.add(tire);

      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.26, 16);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);

      wheel.position.set(x, 0.36, z);
      return wheel;
    };

    carGroup.add(createWheel(0.95, 1.3));
    carGroup.add(createWheel(-0.95, 1.3));
    carGroup.add(createWheel(0.95, -1.3));
    carGroup.add(createWheel(-0.95, -1.3));

    // Car Fuel Inlet Flap (Left rear quarter panel, facing the pump!)
    const fuelDoorGroup = new THREE.Group();
    fuelDoorGroup.position.set(-0.95, 0.82, 1.0); // Exactly facing the pump!
    carFuelLidRef.current = fuelDoorGroup;

    // The door panel
    const doorFlapGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
    const doorFlap = new THREE.Mesh(doorFlapGeo, carPaintMat);
    doorFlap.rotation.z = Math.PI / 2;
    fuelDoorGroup.add(doorFlap);

    // Fuel inlet pipe hole inside
    const inletHoleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 16);
    const inletMat = new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.8 });
    const inletHole = new THREE.Mesh(inletHoleGeo, inletMat);
    inletHole.rotation.z = Math.PI / 2;
    inletHole.position.set(0.05, 0, 0);
    fuelDoorGroup.add(inletHole);

    // Fuel Cap (Screw type with tether)
    const capGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.03, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.4 });
    const fuelCap = new THREE.Mesh(capGeo, capMat);
    fuelCap.rotation.z = Math.PI / 2;
    fuelCap.position.set(-0.01, 0, 0);
    fuelCapRef.current = fuelCap;
    fuelDoorGroup.add(fuelCap);

    carGroup.add(fuelDoorGroup);
    scene.add(carGroup);

    // --- 10. Fuel Flow Particles (Spraying from nozzle into tank) ---
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: '#34d399',
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particles.visible = false;
    particlesRef.current = particles;
    scene.add(particles);

    // --- 11. Animation & Render Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const p = propsRef.current;

      // Update color tint of nozzle handle based on current selected fuel
      if (handleMat.color.getHexString() !== p.currentFuel.color.replace('#', '')) {
        handleMat.color.set(p.currentFuel.color);
        particleMat.color.set(p.currentFuel.color);
      }

      // 1. Camera Positioning based on preset (smooth damping)
      switch (p.cameraPreset) {
        case 'dispenser':
          _targetCamPos.set(1.6, 2.0, 0);
          _targetLookAt.set(0, 1.8, 0);
          break;
        case 'nozzle':
          _targetCamPos.set(1.2, 1.45, 0.9);
          _targetLookAt.set(0.4, 1.2, 0.6);
          break;
        case 'car':
          _targetCamPos.set(1.6, 1.2, 1.4);
          _targetLookAt.set(1.45, 0.85, 1.0);
          break;
        case 'exploded':
          _targetCamPos.set(2.2, 1.8, 1.8);
          _targetLookAt.set(0, 1.2, 0);
          break;
        case 'station':
        default:
          _targetCamPos.set(0, 4.2, 7.8);
          _targetLookAt.set(0.6, 1.4, 0);
          break;
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 3.5, delta);
      controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, 3.5, delta);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, 3.5, delta);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, 3.5, delta);
      controls.update();

      // 2. Exploded View Animations (Panels sliding out, revealing flow meter)
      const sep = p.explodedSeparation;
      if (panelRightRef.current) {
        const targetX = 0.42 + sep * 0.9;
        panelRightRef.current.position.x = THREE.MathUtils.damp(panelRightRef.current.position.x, targetX, 5, delta);
      }
      if (panelLeftRef.current) {
        const targetX = -0.42 - sep * 0.9;
        panelLeftRef.current.position.x = THREE.MathUtils.damp(panelLeftRef.current.position.x, targetX, 5, delta);
      }
      if (internalMeterRef.current) {
        const targetZ = 0.2 + sep * 0.5;
        internalMeterRef.current.position.z = THREE.MathUtils.damp(internalMeterRef.current.position.z, targetZ, 5, delta);
      }

      // 3. Step-by-Step Interactive Mechanics
      // (a) Car Fuel Lid opening/closing
      const lidOpen = [
        'open_fuel_cap',
        'insert_nozzle',
        'dispense',
        'auto_cutoff',
        'return_nozzle'
      ].includes(p.step);

      if (carFuelLidRef.current) {
        const targetLidAngle = lidOpen ? -1.2 : 0;
        carFuelLidRef.current.rotation.y = THREE.MathUtils.damp(carFuelLidRef.current.rotation.y, targetLidAngle, 6, delta);
      }

      // (b) Fuel Cap unscrewed and hanging
      const capUnscrewed = [
        'insert_nozzle',
        'dispense',
        'auto_cutoff'
      ].includes(p.step);

      if (fuelCapRef.current) {
        const targetCapY = capUnscrewed ? -0.15 : 0;
        const targetCapX = capUnscrewed ? -0.08 : -0.01;
        fuelCapRef.current.position.y = THREE.MathUtils.damp(fuelCapRef.current.position.y, targetCapY, 6, delta);
        fuelCapRef.current.position.x = THREE.MathUtils.damp(fuelCapRef.current.position.x, targetCapX, 6, delta);
      }

      // (c) Nozzle Position: Holster vs In Hand vs In Tank
      let targetNozzlePos = new THREE.Vector3(0.48, 1.35, 0.65);
      let targetNozzleRot = new THREE.Euler(-0.3, 0.1, -0.1);

      if (['insert_nozzle', 'dispense', 'auto_cutoff'].includes(p.step)) {
        // Inserted snugly into car tank inlet
        // Car tank inlet is at world: x = 2.4 - 0.95 = 1.45, y = 0.82, z = 0.2 + 1.0 = 1.2
        targetNozzlePos.set(1.42, 0.84, 1.22);
        targetNozzleRot.set(0.1, -Math.PI / 2 + 0.15, -0.3);
      } else if (['pick_nozzle', 'open_fuel_cap', 'return_nozzle'].includes(p.step)) {
        // Held in operator hand midway between pump and car
        targetNozzlePos.set(0.95, 1.2, 0.95);
        targetNozzleRot.set(0.2, 0.4, 0);
      }

      if (nozzleGroupRef.current) {
        nozzleGroupRef.current.position.x = THREE.MathUtils.damp(nozzleGroupRef.current.position.x, targetNozzlePos.x, 7, delta);
        nozzleGroupRef.current.position.y = THREE.MathUtils.damp(nozzleGroupRef.current.position.y, targetNozzlePos.y, 7, delta);
        nozzleGroupRef.current.position.z = THREE.MathUtils.damp(nozzleGroupRef.current.position.z, targetNozzlePos.z, 7, delta);

        nozzleGroupRef.current.rotation.x = THREE.MathUtils.damp(nozzleGroupRef.current.rotation.x, targetNozzleRot.x, 7, delta);
        nozzleGroupRef.current.rotation.y = THREE.MathUtils.damp(nozzleGroupRef.current.rotation.y, targetNozzleRot.y, 7, delta);
        nozzleGroupRef.current.rotation.z = THREE.MathUtils.damp(nozzleGroupRef.current.rotation.z, targetNozzleRot.z, 7, delta);
      }

      // (d) Dynamic Flexible Hose geometry update
      if (hoseMeshRef.current && nozzleGroupRef.current) {
        const dispenserOutlet = _vec3.set(0.4, 2.1, 0.65);
        const nozzleInlet = nozzleGroupRef.current.position.clone().add(new THREE.Vector3(-0.02, -0.1, -0.05));
        
        // Sag control point midway with gravity sag
        const midPoint = dispenserOutlet.clone().add(nozzleInlet).multiplyScalar(0.5);
        midPoint.y = Math.min(dispenserOutlet.y, nozzleInlet.y) - 0.35; // Natural catenary loop

        const newCurve = new THREE.CatmullRomCurve3([
          dispenserOutlet,
          midPoint,
          nozzleInlet
        ]);

        hoseMeshRef.current.geometry.dispose();
        hoseMeshRef.current.geometry = new THREE.TubeGeometry(newCurve, 24, 0.024, 10, false);
      }

      // (e) Trigger squeeze lever animation
      if (triggerLeverRef.current) {
        const targetTriggerRot = p.isTriggerPressed ? -0.35 : 0;
        triggerLeverRef.current.rotation.x = THREE.MathUtils.damp(triggerLeverRef.current.rotation.x, targetTriggerRot, 12, delta);
      }

      // (f) Fuel flow particle fountain into fuel tank neck
      if (particlesRef.current) {
        const isDispensing = p.step === 'dispense' && p.isTriggerPressed;
        particlesRef.current.visible = isDispensing;

        if (isDispensing && nozzleGroupRef.current) {
          const posAttr = particlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          const origin = nozzleGroupRef.current.position;

          for (let i = 0; i < particleCount; i++) {
            // Jitter spray
            const t = (clock.getElapsedTime() * 8 + i * 0.1) % 1;
            posArray[i * 3 + 0] = origin.x + 0.12 * t + (Math.random() - 0.5) * 0.02;
            posArray[i * 3 + 1] = origin.y - 0.06 * t + (Math.random() - 0.5) * 0.02;
            posArray[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.03;
          }
          posAttr.needsUpdate = true;
        }
      }

      // Keep digital screen updated with latest numbers
      updateDispenserCanvas();

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
