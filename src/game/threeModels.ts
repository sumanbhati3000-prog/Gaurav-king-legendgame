import * as THREE from 'three';
import { Enemy, Player } from '../types/game';

// Materials cache for optimal performance and memory efficiency
export interface MaterialLibrary {
  stoneFloor: THREE.MeshStandardMaterial;
  castleWall: THREE.MeshStandardMaterial;
  stonePillar: THREE.MeshStandardMaterial;
  royalCarpet: THREE.MeshStandardMaterial;
  carpetTrim: THREE.MeshStandardMaterial;
  goldTrim: THREE.MeshStandardMaterial;
  throneVelvet: THREE.MeshStandardMaterial;
  playerRobe: THREE.MeshStandardMaterial;
  playerArmor: THREE.MeshStandardMaterial;
  steelBlade: THREE.MeshStandardMaterial;
  kingRobe: THREE.MeshStandardMaterial;
  kingGoldCrown: THREE.MeshStandardMaterial;
  kingRuby: THREE.MeshStandardMaterial;
  guardArmor: THREE.MeshStandardMaterial;
  guardHalberd: THREE.MeshStandardMaterial;
  bruteArmor: THREE.MeshStandardMaterial;
  scoutArmor: THREE.MeshStandardMaterial;
  torchWood: THREE.MeshStandardMaterial;
  torchIron: THREE.MeshStandardMaterial;
  portalCore: THREE.MeshBasicMaterial;
  portalRing: THREE.MeshBasicMaterial;
  hurtFlashMat: THREE.MeshBasicMaterial;
}

export function createMaterialLibrary(): MaterialLibrary {
  // Procedural royal red stone flagstone texture
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fctx = floorCanvas.getContext('2d')!;

  // Vibrant royal red flagstone base
  fctx.fillStyle = '#dc2626';
  fctx.fillRect(0, 0, 512, 512);

  // Alternating red stone tiles
  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      fctx.fillStyle = isAlt ? '#ef4444' : '#b91c1c';
      fctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
    }
  }

  // Deep wine/carmine mortar grout seams
  fctx.strokeStyle = '#7f1d1d';
  fctx.lineWidth = 4;
  for (let x = 0; x <= 512; x += tileSize) {
    fctx.beginPath();
    fctx.moveTo(x, 0);
    fctx.lineTo(x, 512);
    fctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    fctx.beginPath();
    fctx.moveTo(0, y);
    fctx.lineTo(512, y);
    fctx.stroke();
  }

  // Scarlet flecks and subtle royal courtyard stone texture
  for (let i = 0; i < 400; i++) {
    fctx.fillStyle = Math.random() > 0.5 ? 'rgba(254, 202, 202, 0.25)' : 'rgba(153, 27, 27, 0.4)';
    fctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }

  const floorTexture = new THREE.CanvasTexture(floorCanvas);
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(18, 12);
  floorTexture.colorSpace = THREE.SRGBColorSpace;

  return {
    stoneFloor: new THREE.MeshStandardMaterial({
      map: floorTexture,
      color: 0xef4444, // Vibrant, unmistakably red courtyard ground
      roughness: 0.65,
      metalness: 0.1,
    }),
    castleWall: new THREE.MeshStandardMaterial({
      color: 0x242730,
      roughness: 0.9,
      metalness: 0.15,
    }),
    stonePillar: new THREE.MeshStandardMaterial({
      color: 0x3a3f4d,
      roughness: 0.8,
      metalness: 0.2,
    }),
    royalCarpet: new THREE.MeshStandardMaterial({
      color: 0x881313,
      roughness: 0.95,
      metalness: 0.05,
    }),
    carpetTrim: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.8,
    }),
    goldTrim: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.9,
    }),
    throneVelvet: new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.9,
      metalness: 0.1,
    }),
    playerRobe: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.7,
      metalness: 0.2,
    }),
    playerArmor: new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.6,
    }),
    steelBlade: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    }),
    kingRobe: new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.65,
      metalness: 0.3,
    }),
    kingGoldCrown: new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.18,
      metalness: 0.95,
    }),
    kingRuby: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.6,
    }),
    guardArmor: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
      metalness: 0.85,
    }),
    guardHalberd: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.9,
    }),
    bruteArmor: new THREE.MeshStandardMaterial({
      color: 0x581c87,
      roughness: 0.4,
      metalness: 0.75,
    }),
    scoutArmor: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.5,
      metalness: 0.7,
    }),
    torchWood: new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.85,
    }),
    torchIron: new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.5,
      metalness: 0.8,
    }),
    portalCore: new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    }),
    portalRing: new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
    }),
    hurtFlashMat: new THREE.MeshBasicMaterial({
      color: 0xffffff,
    }),
  };
}

// Composite 3–12 Part Procedural Player Model (Chutiya with Combat Gun)
export function createPlayerMesh(mats: MaterialLibrary): {
  group: THREE.Group;
  gunGroup: THREE.Group;
  muzzleFlashMesh: THREE.Mesh;
  capeMesh: THREE.Mesh;
} {
  const group = new THREE.Group();

  // 1. Torso / Tunic
  const torsoGeo = new THREE.CylinderGeometry(0.55, 0.75, 1.4, 8);
  const torso = new THREE.Mesh(torsoGeo, mats.playerRobe);
  torso.position.y = 1.3;
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  // 2. Leather Armor Pauldrons
  const pauldronGeo = new THREE.BoxGeometry(1.6, 0.35, 0.9);
  const pauldron = new THREE.Mesh(pauldronGeo, mats.playerArmor);
  pauldron.position.y = 1.95;
  pauldron.castShadow = true;
  group.add(pauldron);

  // 3. Hooded Head
  const headGeo = new THREE.SphereGeometry(0.48, 8, 8);
  const head = new THREE.Mesh(headGeo, mats.playerArmor);
  head.position.y = 2.4;
  head.castShadow = true;
  group.add(head);

  // 4. Stealth Visor Eyes
  const visorGeo = new THREE.BoxGeometry(0.42, 0.12, 0.2);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 2.38, 0.42);
  group.add(visor);

  // 5. Flowing Cape (mesh positioned behind torso)
  const capeGeo = new THREE.PlaneGeometry(1.1, 1.8, 4, 4);
  const cape = new THREE.Mesh(capeGeo, mats.playerRobe);
  cape.position.set(0, 1.25, -0.6);
  cape.rotation.x = 0.15;
  cape.castShadow = true;
  group.add(cape);

  // 6. Right Arm & 3D Combat Gun (Blaster Handgun)
  const armGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.9, 6);
  const arm = new THREE.Mesh(armGeo, mats.playerArmor);
  arm.position.set(0.85, 1.5, 0.4);
  arm.rotation.x = Math.PI / 2.3;
  group.add(arm);

  // Gun Group (positioned in hand, pointed forward)
  const gunGroup = new THREE.Group();
  gunGroup.position.set(0.85, 1.45, 0.85);

  // Gun Handle / Grip
  const gripGeo = new THREE.BoxGeometry(0.14, 0.45, 0.22);
  const grip = new THREE.Mesh(gripGeo, mats.playerArmor);
  grip.rotation.x = -0.25;
  gunGroup.add(grip);

  // Gun Slide / Receiver
  const slideGeo = new THREE.BoxGeometry(0.18, 0.22, 0.85);
  const slide = new THREE.Mesh(slideGeo, mats.steelBlade);
  slide.position.set(0, 0.2, 0.25);
  gunGroup.add(slide);

  // Gun Barrel Core
  const barrelGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8);
  const barrel = new THREE.Mesh(barrelGeo, mats.castleWall);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.2, 0.45);
  gunGroup.add(barrel);

  // Laser Sight Emitter
  const sightGeo = new THREE.BoxGeometry(0.08, 0.08, 0.2);
  const sight = new THREE.Mesh(sightGeo, mats.goldTrim);
  sight.position.set(0, 0.35, 0.15);
  gunGroup.add(sight);

  // 3D Muzzle Flash Mesh (scaled up when firing, hidden otherwise)
  const flashGeo = new THREE.ConeGeometry(0.3, 0.7, 6);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0 });
  const muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
  muzzleFlash.rotation.x = -Math.PI / 2;
  muzzleFlash.position.set(0, 0.2, 0.95);
  gunGroup.add(muzzleFlash);

  group.add(gunGroup);

  return { group, gunGroup, muzzleFlashMesh: muzzleFlash, capeMesh: cape };
}

// Composite 3–12 Part Procedural King Gaurav Model
export function createKingGauravMesh(mats: MaterialLibrary): {
  group: THREE.Group;
  auraLight: THREE.PointLight;
  crownMesh: THREE.Mesh;
} {
  const group = new THREE.Group();

  // 1. Heavy Robed Torso
  const torsoGeo = new THREE.CylinderGeometry(0.85, 1.1, 1.9, 10);
  const torso = new THREE.Mesh(torsoGeo, mats.kingRobe);
  torso.position.y = 1.6;
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  // 2. Royal Crimson Mantle / Cape
  const mantleGeo = new THREE.CylinderGeometry(1.2, 1.4, 2.0, 10, 1, true, -Math.PI * 0.7, Math.PI * 1.4);
  const mantle = new THREE.Mesh(mantleGeo, mats.royalCarpet);
  mantle.position.y = 1.5;
  mantle.castShadow = true;
  group.add(mantle);

  // 3. Gold Embroidered Trim Collar
  const collarGeo = new THREE.TorusGeometry(1.05, 0.16, 8, 16);
  const collar = new THREE.Mesh(collarGeo, mats.goldTrim);
  collar.position.y = 2.45;
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  // 4. Royal Head
  const headGeo = new THREE.SphereGeometry(0.65, 10, 10);
  const head = new THREE.Mesh(headGeo, mats.playerArmor);
  head.position.y = 3.0;
  head.castShadow = true;
  group.add(head);

  // 5. Glowing Menacing Crimson Eyes
  const eyeGeo = new THREE.SphereGeometry(0.12, 6, 6);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.25, 3.05, 0.55);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.25, 3.05, 0.55);
  group.add(eyeL);
  group.add(eyeR);

  // 6. 3-Point Royal Gold Crown
  const crownGeo = new THREE.CylinderGeometry(0.7, 0.65, 0.5, 6);
  const crown = new THREE.Mesh(crownGeo, mats.kingGoldCrown);
  crown.position.y = 3.65;
  crown.castShadow = true;
  group.add(crown);

  // Crown Rubies
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI) / 1.5 - Math.PI / 2;
    const rubyGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const ruby = new THREE.Mesh(rubyGeo, mats.kingRuby);
    ruby.position.set(Math.cos(angle) * 0.68, 3.75, Math.sin(angle) * 0.68);
    group.add(ruby);
  }

  // 7. Royal Scepter in Hand
  const scepterGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6);
  const scepter = new THREE.Mesh(scepterGeo, mats.goldTrim);
  scepter.position.set(1.2, 1.8, 0.3);
  scepter.rotation.x = Math.PI / 6;
  group.add(scepter);

  const orbGeo = new THREE.SphereGeometry(0.28, 8, 8);
  const orb = new THREE.Mesh(orbGeo, mats.kingRuby);
  orb.position.set(1.2, 2.8, 0.9);
  group.add(orb);

  // 8. Ominous Crimson Radiant Aura Point Light
  const auraLight = new THREE.PointLight(0xef4444, 2.5, 12, 1.5);
  auraLight.position.set(0, 2.2, 0);
  group.add(auraLight);

  return { group, auraLight, crownMesh: crown };
}

// Composite 3–12 Part Procedural Guard / Scout / Brute Model
export function createEnemyMesh(
  enemy: Enemy,
  mats: MaterialLibrary
): { group: THREE.Group } {
  const group = new THREE.Group();
  const isBrute = enemy.type === 'brute';
  const isScout = enemy.type === 'scout';

  const scale = isBrute ? 1.3 : isScout ? 0.85 : 1.0;
  const matArmor = isBrute ? mats.bruteArmor : isScout ? mats.scoutArmor : mats.guardArmor;

  // 1. Armored Torso
  const torsoGeo = new THREE.CylinderGeometry(0.55 * scale, 0.7 * scale, 1.5 * scale, 8);
  const torso = new THREE.Mesh(torsoGeo, matArmor);
  torso.position.y = 1.3 * scale;
  torso.castShadow = true;
  group.add(torso);

  // 2. Heavy Pauldrons
  const pauldronGeo = new THREE.BoxGeometry(1.6 * scale, 0.4 * scale, 0.9 * scale);
  const pauldron = new THREE.Mesh(pauldronGeo, matArmor);
  pauldron.position.y = 1.95 * scale;
  pauldron.castShadow = true;
  group.add(pauldron);

  // 3. Armored Greathelm
  const helmGeo = new THREE.CylinderGeometry(0.48 * scale, 0.5 * scale, 0.75 * scale, 8);
  const helm = new THREE.Mesh(helmGeo, matArmor);
  helm.position.y = 2.45 * scale;
  helm.castShadow = true;
  group.add(helm);

  // Visor Slit
  const slitGeo = new THREE.BoxGeometry(0.45 * scale, 0.1 * scale, 0.2 * scale);
  const slitMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const slit = new THREE.Mesh(slitGeo, slitMat);
  slit.position.set(0, 2.45 * scale, 0.45 * scale);
  group.add(slit);

  // Helmet Plume / Spikes
  const plumeGeo = new THREE.ConeGeometry(0.18 * scale, 0.6 * scale, 6);
  const plumeMat = new THREE.MeshStandardMaterial({ color: isBrute ? 0x9333ea : 0xf97316 });
  const plume = new THREE.Mesh(plumeGeo, plumeMat);
  plume.position.set(0, 2.95 * scale, -0.1 * scale);
  plume.rotation.x = -Math.PI / 6;
  group.add(plume);

  // Weapon: Halberd / Hammer / Dagger
  if (isBrute) {
    // Heavy Spiked War Hammer
    const shaftGeo = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 2.4 * scale, 6);
    const shaft = new THREE.Mesh(shaftGeo, mats.torchWood);
    shaft.position.set(0.9 * scale, 1.5 * scale, 0.3 * scale);
    shaft.rotation.x = Math.PI / 4;
    group.add(shaft);

    const headGeo = new THREE.BoxGeometry(0.7 * scale, 0.6 * scale, 0.6 * scale);
    const mHead = new THREE.Mesh(headGeo, matArmor);
    mHead.position.set(0.9 * scale, 2.3 * scale, 1.1 * scale);
    group.add(mHead);
  } else if (isScout) {
    // Twin Daggers
    const d1Geo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.9 * scale, 4);
    const d1 = new THREE.Mesh(d1Geo, mats.steelBlade);
    d1.position.set(0.7 * scale, 1.1 * scale, 0.4 * scale);
    d1.rotation.x = Math.PI / 3;
    group.add(d1);
  } else {
    // Royal Halberd
    const shaftGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.2, 6);
    const shaft = new THREE.Mesh(shaftGeo, mats.torchWood);
    shaft.position.set(0.85, 1.7, 0.4);
    shaft.rotation.x = Math.PI / 6;
    group.add(shaft);

    const bladeGeo = new THREE.BoxGeometry(0.65, 0.85, 0.08);
    const axe = new THREE.Mesh(bladeGeo, mats.guardHalberd);
    axe.position.set(0.85, 3.1, 1.2);
    axe.castShadow = true;
    group.add(axe);
  }

  return { group };
}

// Procedural 3D Stone Pillar
export function createPillarMesh(width: number, height: number, mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  const radius = width * 0.45;
  const pillarHeight = 5.5;

  // Base Pedestal
  const baseGeo = new THREE.BoxGeometry(width, 1.0, width);
  const base = new THREE.Mesh(baseGeo, mats.stonePillar);
  base.position.y = 0.5;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Column Shaft
  const shaftGeo = new THREE.CylinderGeometry(radius * 0.88, radius, pillarHeight, 12);
  const shaft = new THREE.Mesh(shaftGeo, mats.stonePillar);
  shaft.position.y = 0.5 + pillarHeight / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  // Capital / Crown
  const capGeo = new THREE.BoxGeometry(width * 1.08, 0.8, width * 1.08);
  const cap = new THREE.Mesh(capGeo, mats.stonePillar);
  cap.position.y = 0.5 + pillarHeight + 0.4;
  cap.castShadow = true;
  group.add(cap);

  return group;
}

// Procedural 3D Throne Dais
export function createThroneDaisMesh(mats: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();

  // Tier 1 Platform
  const t1Geo = new THREE.BoxGeometry(16, 0.6, 20);
  const t1 = new THREE.Mesh(t1Geo, mats.castleWall);
  t1.position.y = 0.3;
  t1.receiveShadow = true;
  group.add(t1);

  // Tier 2 Platform
  const t2Geo = new THREE.BoxGeometry(12, 0.8, 14);
  const t2 = new THREE.Mesh(t2Geo, mats.castleWall);
  t2.position.y = 1.0;
  t2.receiveShadow = true;
  group.add(t2);

  // Red Velvet Carpet Steps
  const stepGeo = new THREE.BoxGeometry(6, 0.85, 14);
  const step = new THREE.Mesh(stepGeo, mats.royalCarpet);
  step.position.y = 1.0;
  group.add(step);

  // Throne Chair Base
  const seatGeo = new THREE.BoxGeometry(3.6, 1.2, 3.2);
  const seat = new THREE.Mesh(seatGeo, mats.throneVelvet);
  seat.position.set(0, 2.0, -1);
  seat.castShadow = true;
  group.add(seat);

  // Throne Gold Trim
  const trimGeo = new THREE.BoxGeometry(3.8, 1.25, 3.4);
  const trim = new THREE.Mesh(trimGeo, mats.goldTrim);
  trim.position.set(0, 1.95, -1);
  group.add(trim);

  // Throne High Backrest
  const backGeo = new THREE.BoxGeometry(3.6, 4.0, 0.6);
  const back = new THREE.Mesh(backGeo, mats.throneVelvet);
  back.position.set(0, 4.0, -2.4);
  back.castShadow = true;
  group.add(back);

  // Throne Crown Arch
  const crownGeo = new THREE.ConeGeometry(2.0, 1.8, 5);
  const throneCrown = new THREE.Mesh(crownGeo, mats.goldTrim);
  throneCrown.position.set(0, 6.4, -2.4);
  group.add(throneCrown);

  return group;
}

// Procedural 3D Exit Portal with swirling rings
export function createPortalMesh(mats: MaterialLibrary): {
  group: THREE.Group;
  ring1: THREE.Mesh;
  ring2: THREE.Mesh;
  light: THREE.PointLight;
} {
  const group = new THREE.Group();

  // Celestial Blue Point Light
  const light = new THREE.PointLight(0x38bdf8, 4.0, 22, 1.2);
  light.position.set(0, 3.0, 0);
  group.add(light);

  // Stone Portal Arch Pedestal
  const plinthGeo = new THREE.CylinderGeometry(5.2, 5.8, 0.8, 16);
  const plinth = new THREE.Mesh(plinthGeo, mats.stonePillar);
  plinth.position.y = 0.4;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Twin Obelisk Portal Pillars
  const obGeo = new THREE.BoxGeometry(1.2, 7.5, 1.2);
  const ob1 = new THREE.Mesh(obGeo, mats.stonePillar);
  ob1.position.set(-4.2, 4.0, 0);
  ob1.castShadow = true;
  const ob2 = new THREE.Mesh(obGeo, mats.stonePillar);
  ob2.position.set(4.2, 4.0, 0);
  ob2.castShadow = true;
  group.add(ob1);
  group.add(ob2);

  // Arch Lintels
  const lintelGeo = new THREE.BoxGeometry(9.6, 1.2, 1.4);
  const lintel = new THREE.Mesh(lintelGeo, mats.goldTrim);
  lintel.position.set(0, 8.0, 0);
  lintel.castShadow = true;
  group.add(lintel);

  // Swirling Cosmic Runic Ring 1
  const r1Geo = new THREE.TorusGeometry(3.6, 0.22, 8, 32);
  const ring1 = new THREE.Mesh(r1Geo, mats.portalCore);
  ring1.position.y = 4.2;
  group.add(ring1);

  // Counter-rotating Inner Ring 2
  const r2Geo = new THREE.TorusGeometry(2.4, 0.15, 8, 24);
  const ring2 = new THREE.Mesh(r2Geo, mats.portalRing);
  ring2.position.y = 4.2;
  group.add(ring2);

  // Central Event Horizon Vortex Disk
  const coreGeo = new THREE.CircleGeometry(2.0, 24);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 4.2;
  group.add(core);

  return { group, ring1, ring2, light };
}

// Procedural Torch Brazier with real point light
export function createTorchMesh(mats: MaterialLibrary): {
  group: THREE.Group;
  light: THREE.PointLight;
} {
  const group = new THREE.Group();

  // Stone Stand
  const standGeo = new THREE.CylinderGeometry(0.3, 0.5, 3.2, 8);
  const stand = new THREE.Mesh(standGeo, mats.torchIron);
  stand.position.y = 1.6;
  stand.castShadow = true;
  group.add(stand);

  // Iron Fire Bowl
  const bowlGeo = new THREE.CylinderGeometry(0.75, 0.35, 0.6, 8);
  const bowl = new THREE.Mesh(bowlGeo, mats.torchIron);
  bowl.position.y = 3.3;
  group.add(bowl);

  // Glowing Flame Core
  const flameGeo = new THREE.ConeGeometry(0.35, 0.8, 6);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.y = 3.8;
  group.add(flame);

  // Flickering Warm Light (optimized non-shadow point light)
  const light = new THREE.PointLight(0xf59e0b, 1.8, 16, 1.5);
  light.position.set(0, 3.8, 0);
  light.castShadow = false;
  group.add(light);

  return { group, light };
}
