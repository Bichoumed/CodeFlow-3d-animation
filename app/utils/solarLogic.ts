import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import AOS from 'aos';

// ============ CONFIGURATION GLOBALE ============
export interface SceneConfig {
    container: string;
    type: string;
    techType?: string;
}

export interface Stats {
    treesSaved: number;
    co2Saved: number;
    oilSaved: number;
    energyOutput: number;
    efficiency: number;
    temperature: number;
}

class SolarApp {
    scenes: { [key: string]: any } = {};
    stats: Stats = {
        treesSaved: 0,
        co2Saved: 0,
        oilSaved: 0,
        energyOutput: 250,
        efficiency: 22.5,
        temperature: 42
    };
    onStatsUpdate: ((stats: Stats) => void) | null = null;

    sceneConfigs: { [key: string]: SceneConfig } = {
        sun: { container: 'sun-3d', type: 'sun' },
        radiation: { container: 'radiation-scene', type: 'radiation' },
        process: { container: 'process-scene', type: 'process' },
        benefits: { container: 'benefits-scene', type: 'benefits' },
        challenges: { container: 'challenges-scene', type: 'challenges' },
        worldMap: { container: 'world-map-scene', type: 'worldMap' },
        comparison: { container: 'comparison-3d-scene', type: 'comparison' },
        tech1: { container: 'tech1-scene', type: 'tech', techType: 'paint' },
        tech2: { container: 'tech2-scene', type: 'tech', techType: 'road' },
        tech3: { container: 'tech3-scene', type: 'tech', techType: 'satellite' }
    };

    panelColor = 0x1E90FF;
    frameColor = 0xC0C0C0;


    loader = new GLTFLoader();

    constructor() { }

    loadModel(path: string, scale: number = 1, position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            this.loader.load(path, (gltf) => {
                const model = gltf.scene;
                model.scale.set(scale, scale, scale);
                model.position.copy(position);
                resolve(model);
            }, undefined, (error) => {
                console.error(`Error loading model ${path}:`, error);
                reject(error);
            });
        });
    }

    init(onStatsUpdate: (stats: Stats) => void) {
        this.onStatsUpdate = onStatsUpdate;
        console.log('Initialisation des scènes 3D...');

        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true
        });

        for (const [key, config] of Object.entries(this.sceneConfigs)) {
            try {
                this.scenes[key] = this.init3DScene(config.container, config.type, config.techType);
                if (this.scenes[key]) {
                    this.scenes[key].animate();
                }
            } catch (error) {
                console.error(`Erreur initialisation scène ${key}:`, error);
            }
        }

        this.initStats();
    }

    init3DScene(containerId: string, type: string, techType?: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            // console.warn(`Conteneur ${containerId} non trouvé`);
            return null;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(renderer.domElement);

        let updateFunction: (() => void) | undefined;
        let controls: OrbitControls | undefined;

        switch (type) {
            case 'sun':
                this.setupSunScene(scene, camera);
                break;
            case 'radiation':
                this.setupRadiationScene(scene, camera);
                controls = new OrbitControls(camera, renderer.domElement);
                break;
            case 'process':
                this.setupProcessScene(scene, camera);
                controls = new OrbitControls(camera, renderer.domElement);
                break;
            case 'benefits':
                this.setupBenefitsScene(scene, camera);
                break;
            case 'challenges':
                this.setupChallengesScene(scene, camera);
                break;
            case 'worldMap':
                this.setupWorldMapScene(scene, camera);
                controls = new OrbitControls(camera, renderer.domElement);
                break;
            case 'comparison':
                this.setupComparisonScene(scene, camera);
                break;
            case 'tech':
                this.setupTechScene(scene, camera, techType);
                break;
        }

        const resizeHandler = () => {
            if (!container) return;
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', resizeHandler);

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            if (updateFunction) {
                updateFunction();
            }

            if (controls) {
                controls.update();
            }

            renderer.render(scene, camera);
        };

        // Assign update function to the scene object so it can be updated externally
        const sceneObj = {
            scene,
            camera,
            renderer,
            controls,
            animate,
            stop: () => cancelAnimationFrame(animationId),
            resize: resizeHandler,
            updateFunction: null as (() => void) | null,
            setUpdateFunction: (fn: () => void) => { updateFunction = fn; }
        };

        // We need to capture the update function if it was set inside setup functions
        // But setup functions in original code set scenes[key].updateFunction
        // Here we need to bridge that.
        // Let's modify setup functions to return the update function or set it on the sceneObj.

        // Actually, the original code did `scenes.sun.updateFunction = ...`.
        // So I need to make sure `this.scenes[key]` is assigned BEFORE calling setup functions?
        // No, `init3DScene` returns the object.
        // So inside setup functions, I can't access `scenes[key]` yet.
        // I will modify setup functions to accept `sceneObj` or return `updateFunction`.

        // Let's pass a callback or object to setup functions.
        // Or better, let's attach `updateFunction` to `scene.userData` temporarily?

        // Let's refactor setup functions to return the update function.

        // Wait, I can just assign the scene object to `this.scenes[key]` AFTER `init3DScene` returns.
        // But the setup functions rely on `scenes.sun.updateFunction = ...` style.
        // I will change that pattern.

        return sceneObj;
    }

    // ... Setup functions ...

    async setupSunScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x050510); // Darker space background
        camera.position.set(0, 0, 12);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffaa00, 2, 50);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        // Load Sun Model
        try {
            const sunGroup = new THREE.Group();
            scene.add(sunGroup);

            // Try loading GLB, fallback to sphere if fails (or if file missing in dev)
            // const sunModel = await this.loadModel('/sun.glb', 2); 
            // For now, let's assume we might need to fallback or wrap it. 
            // Since user provided the path, we try to load it.

            // Note: In a real app, we'd handle the async better. 
            // Here we just fire and forget the load, adding to scene when ready.
            this.loader.load('/sun.glb', (gltf) => {
                const sun = gltf.scene;
                sun.scale.set(3, 3, 3);

                // Enhance material if possible
                sun.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                        m.emissive = new THREE.Color(0xff4400);
                        m.emissiveIntensity = 2;
                        m.toneMapped = false;
                    }
                });
                sunGroup.add(sun);
            }, undefined, (_err) => {
                // Fallback if model fails
                const geometry = new THREE.SphereGeometry(3, 64, 64);
                const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
                const sun = new THREE.Mesh(geometry, material);
                sunGroup.add(sun);
            });

            // Flares (Leaves/Petals around)
            const flareCount = 8;
            const flares = new THREE.Group();
            const flareGeo = new THREE.PlaneGeometry(2, 6);
            const flareMat = new THREE.MeshBasicMaterial({
                color: 0xff5500,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            for (let i = 0; i < flareCount; i++) {
                const flare = new THREE.Mesh(flareGeo, flareMat);
                flare.position.set(0, 0, 0);
                const angle = (i / flareCount) * Math.PI * 2;
                flare.rotation.z = angle;
                flare.translateY(4); // Move out from center
                flares.add(flare);
            }
            sunGroup.add(flares);

            // Particles Halo
            const particleCount = 200;
            const particlesGeo = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const speeds = new Float32Array(particleCount);

            for (let i = 0; i < particleCount; i++) {
                const r = 4 + Math.random() * 2;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);
                speeds[i] = 0.02 + Math.random() * 0.05;
            }
            particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particlesMat = new THREE.PointsMaterial({
                color: 0xffff00,
                size: 0.15,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            const particleSystem = new THREE.Points(particlesGeo, particlesMat);
            sunGroup.add(particleSystem);

            // Burst Particles
            const burstParticles = new THREE.Group();
            scene.add(burstParticles);

            const createBurst = () => {
                const count = 20;
                const geo = new THREE.BufferGeometry();
                const pos = [];
                const vel = [];
                for (let i = 0; i < count; i++) {
                    pos.push(0, 0, 0);
                    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(0.2 + Math.random() * 0.3);
                    vel.push(v.x, v.y, v.z);
                }
                geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
                const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true });
                const points = new THREE.Points(geo, mat);
                points.userData = { velocities: vel, age: 0 };
                burstParticles.add(points);
            };

            // Setup Update Function
            setTimeout(() => {
                if (this.scenes.sun) {
                    this.scenes.sun.setUpdateFunction(() => {
                        const time = Date.now() * 0.001;

                        // Rotate Sun
                        sunGroup.rotation.y = time * 0.1;
                        sunGroup.rotation.z = time * 0.05;

                        // Pulse Flares
                        const scale = 1 + 0.1 * Math.sin(time * 2);
                        flares.scale.set(scale, scale, scale);

                        // Animate Halo Particles
                        const posAttr = particlesGeo.attributes.position;
                        for (let i = 0; i < particleCount; i++) {
                            // Simple jitter or rotation could go here
                            // For now let's just rotate the whole system
                        }
                        particleSystem.rotation.y = -time * 0.2;

                        // Random Bursts
                        if (Math.random() < 0.02) createBurst();

                        // Update Bursts
                        for (let i = burstParticles.children.length - 1; i >= 0; i--) {
                            const p = burstParticles.children[i] as THREE.Points;
                            const positions = p.geometry.attributes.position.array as Float32Array;
                            const vels = p.userData.velocities;
                            p.userData.age += 0.1;

                            for (let j = 0; j < positions.length / 3; j++) {
                                positions[j * 3] += vels[j * 3];
                                positions[j * 3 + 1] += vels[j * 3 + 1];
                                positions[j * 3 + 2] += vels[j * 3 + 2];
                            }
                            p.geometry.attributes.position.needsUpdate = true;
                            (p.material as THREE.PointsMaterial).opacity = 1 - (p.userData.age / 5);

                            if (p.userData.age > 5) {
                                burstParticles.remove(p);
                                p.geometry.dispose();
                            }
                        }
                    });
                }
            }, 0);

        } catch (e) {
            console.error("Error in Sun Scene", e);
        }
    }

    setupRadiationScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x1a2980);
        camera.position.set(0, 5, 15);

        const earthGeometry = new THREE.SphereGeometry(3, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2196F3,
            shininess: 30,
            emissive: 0x0D47A1,
            emissiveIntensity: 0.1
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);

        const rays = new THREE.Group();
        const createRay = () => {
            const geometry = new THREE.ConeGeometry(0.05, 1.5, 4);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFEB3B,
                transparent: true,
                opacity: 0.8
            });
            return new THREE.Mesh(geometry, material);
        };

        const resetRay = (ray: THREE.Object3D) => {
            ray.position.set(
                (Math.random() - 0.5) * 15,
                Math.random() * 10 + 5,
                (Math.random() - 0.5) * 15
            );
            ((ray as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.8;
        };

        for (let i = 0; i < 30; i++) {
            const ray = createRay();
            ray.position.set(
                (Math.random() - 0.5) * 15,
                Math.random() * 10,
                (Math.random() - 0.5) * 15
            );
            rays.add(ray);
        }
        scene.add(rays);

        const sun = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.MeshPhongMaterial({
                color: 0xFF9800,
                emissive: 0xFF5722,
                emissiveIntensity: 0.5
            })
        );
        sun.position.set(-10, 5, 0);
        scene.add(sun);

        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-10, 10, 0);
        scene.add(directionalLight);

        setTimeout(() => {
            if (this.scenes.radiation) {
                this.scenes.radiation.isAnimating = true; // Custom property
                this.scenes.radiation.setUpdateFunction(() => {
                    if (!this.scenes.radiation.isAnimating) return;

                    earth.rotation.y += 0.002;
                    sun.rotation.y += 0.01;

                    rays.children.forEach((ray: any, i) => {
                        const direction = new THREE.Vector3();
                        direction.subVectors(earth.position, ray.position).normalize();
                        ray.position.add(direction.multiplyScalar(0.1));
                        ray.material.opacity -= 0.005;

                        if (ray.position.distanceTo(earth.position) < 3.5 || ray.material.opacity <= 0) {
                            resetRay(ray);
                        }
                    });
                });
            }
        }, 0);
    }

    setupProcessScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x101020);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        // Load Models
        const panelGroup = new THREE.Group();
        const batteryGroup = new THREE.Group();
        scene.add(panelGroup);
        scene.add(batteryGroup);

        // Solar Panel
        this.loader.load('/solar_panel.glb', (gltf) => {
            const panel = gltf.scene;
            panel.scale.set(2, 2, 2);
            panel.position.set(-3, 0, 0);
            panel.rotation.y = Math.PI / 4;
            panelGroup.add(panel);
        }, undefined, (err) => {
            // Fallback
            const geo = new THREE.BoxGeometry(3, 0.1, 2);
            const mat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(-3, 0, 0);
            panelGroup.add(mesh);
        });

        // Battery
        let batteryFill: THREE.Mesh;
        this.loader.load('/battery.glb', (gltf) => {
            const battery = gltf.scene;
            battery.scale.set(1, 1, 1);
            battery.position.set(3, 0, 0);
            batteryGroup.add(battery);

            // Add a fill indicator if not present in model
            // Assuming battery is roughly cylindrical or boxy
            const fillGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 32);
            const fillMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
            batteryFill = new THREE.Mesh(fillGeo, fillMat);
            batteryFill.position.set(3, 1, 0);
            batteryFill.scale.y = 0.1;
            scene.add(batteryFill);

        }, undefined, (err) => {
            // Fallback
            const geo = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
            const mat = new THREE.MeshPhongMaterial({ color: 0x888888 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(3, 1, 0);
            batteryGroup.add(mesh);

            const fillGeo = new THREE.CylinderGeometry(0.51, 0.51, 2, 32);
            const fillMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
            batteryFill = new THREE.Mesh(fillGeo, fillMat);
            batteryFill.position.set(3, 1, 0);
            batteryFill.scale.y = 0.1;
            scene.add(batteryFill);
        });

        // Wire Path
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-3, 0, 0),
            new THREE.Vector3(-1, 0.5, 0),
            new THREE.Vector3(1, 0.5, 0),
            new THREE.Vector3(3, 0, 0)
        ]);

        const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tube);

        // Electrons
        const electronCount = 20;
        const electrons = new THREE.Group();
        scene.add(electrons);

        const electronGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const electronMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        for (let i = 0; i < electronCount; i++) {
            const el = new THREE.Mesh(electronGeo, electronMat);
            electrons.add(el);
            el.userData = { progress: i / electronCount };
        }

        // Update Function
        setTimeout(() => {
            if (this.scenes.process) {
                this.scenes.process.setUpdateFunction(() => {
                    const time = Date.now() * 0.001;

                    // Animate Electrons
                    electrons.children.forEach((el) => {
                        el.userData.progress += 0.01;
                        if (el.userData.progress > 1) el.userData.progress = 0;

                        const point = curve.getPoint(el.userData.progress);
                        el.position.copy(point);
                    });

                    // Animate Battery Fill
                    if (batteryFill) {
                        batteryFill.scale.y = (Math.sin(time) + 1) / 2 * 0.9 + 0.1;
                        batteryFill.position.y = 0 + batteryFill.scale.y; // Adjust based on pivot
                    }
                });
            }
        }, 0);
    }

    setupBenefitsScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x87CEEB); // Sky blue
        camera.position.set(0, 10, 20);
        camera.lookAt(0, 0, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(50, 50);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        scene.add(ground);

        // Helper to create low poly tree
        const createTree = (x: number, z: number) => {
            const group = new THREE.Group();
            const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 6);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, flatShading: true });
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 0.75;

            const leavesGeo = new THREE.ConeGeometry(1.5, 3, 6);
            const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22, flatShading: true });
            const leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = 2.5;

            group.add(trunk, leaves);
            group.position.set(x, -1, z);
            return group;
        };

        // Helper to create low poly house
        const createHouse = (x: number, z: number) => {
            const group = new THREE.Group();
            const bodyGeo = new THREE.BoxGeometry(2, 2, 2);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, flatShading: true });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1;

            const roofGeo = new THREE.ConeGeometry(1.5, 1.5, 4);
            const roofMat = new THREE.MeshStandardMaterial({ color: 0xA52A2A, flatShading: true });
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.y = 2.75;
            roof.rotation.y = Math.PI / 4;

            group.add(body, roof);
            group.position.set(x, -1, z);
            return group;
        };

        // Helper to create low poly factory
        const createFactory = (x: number, z: number) => {
            const group = new THREE.Group();
            const bodyGeo = new THREE.BoxGeometry(3, 2, 2);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x708090, flatShading: true });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1;

            const chimneyGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
            const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x404040, flatShading: true });
            const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
            chimney.position.set(0.8, 2, 0);

            group.add(body, chimney);
            group.position.set(x, -1, z);
            return group;
        };

        const trees = new THREE.Group();
        for (let i = 0; i < 15; i++) {
            trees.add(createTree(Math.random() * 20 - 10, Math.random() * 20 - 10));
        }
        scene.add(trees);

        const houses = new THREE.Group();
        houses.add(createHouse(-5, 0));
        houses.add(createHouse(5, 5));
        scene.add(houses);

        const factory = createFactory(0, -5);
        scene.add(factory);

        // CO2 Particles
        const co2Particles = new THREE.Group();
        const co2Geo = new THREE.SphereGeometry(0.2, 4, 4);
        const co2Mat = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.6 });

        for (let i = 0; i < 30; i++) {
            const p = new THREE.Mesh(co2Geo, co2Mat);
            p.position.set(0, 2, -5); // Start at factory
            p.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.05 + Math.random() * 0.05, (Math.random() - 0.5) * 0.1),
                age: Math.random() * 100
            };
            co2Particles.add(p);
        }
        scene.add(co2Particles);

        setTimeout(() => {
            if (this.scenes.benefits) {
                this.scenes.benefits.setUpdateFunction(() => {
                    const time = Date.now() * 0.001;

                    // Bobbing animation
                    trees.children.forEach((tree, i) => {
                        tree.scale.y = 1 + 0.05 * Math.sin(time * 2 + i);
                    });

                    houses.children.forEach((house, i) => {
                        house.position.y = -1 + 0.1 * Math.sin(time + i);
                    });

                    // CO2 Animation
                    co2Particles.children.forEach((p) => {
                        p.position.add(p.userData.velocity);
                        p.userData.age++;

                        if (p.position.y > 8 || p.userData.age > 200) {
                            p.position.set(0, 2, -5);
                            p.userData.age = 0;
                            ((p as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.6;
                        } else {
                            ((p as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 - (p.position.y / 8));
                        }
                    });
                });
            }
        }, 0);
    }

    setupChallengesScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x222222);
        camera.position.set(0, 5, 15);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        const scenarioGroup = new THREE.Group();
        scene.add(scenarioGroup);

        // Sun (Background)
        let sunMesh: THREE.Object3D | null = null;
        this.loader.load('/sun.glb', (gltf) => {
            const sun = gltf.scene;
            sun.scale.set(2, 2, 2);
            sun.position.set(-5, 5, -5);
            scenarioGroup.add(sun);
            sunMesh = sun;
        }, undefined, () => {
            const geo = new THREE.SphereGeometry(2, 32, 32);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
            sunMesh = new THREE.Mesh(geo, mat);
            sunMesh.position.set(-5, 5, -5);
            scenarioGroup.add(sunMesh);
        });

        // Clouds
        const cloudsGroup = new THREE.Group();
        scenarioGroup.add(cloudsGroup);

        const loadCloud = (x: number, y: number, z: number) => {
            this.loader.load('/cloud.glb', (gltf) => {
                const cloud = gltf.scene;
                cloud.scale.set(1.5, 1.5, 1.5);
                cloud.position.set(x, y, z);
                // Make cloud transparent if possible
                cloud.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                        m.transparent = true;
                        m.opacity = 0.8;
                    }
                });
                cloudsGroup.add(cloud);
            }, undefined, () => {
                const geo = new THREE.SphereGeometry(1, 16, 16);
                const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
                const cloud = new THREE.Mesh(geo, mat);
                cloud.position.set(x, y, z);
                cloudsGroup.add(cloud);
            });
        };

        loadCloud(0, 5, 2);
        loadCloud(4, 4, 3);
        loadCloud(-3, 6, 2);

        // Battery
        let batteryMesh: THREE.Object3D | null = null;
        let batteryIndicator: THREE.Mesh | null = null;

        this.loader.load('/battery.glb', (gltf) => {
            const battery = gltf.scene;
            battery.scale.set(1.5, 1.5, 1.5);
            battery.position.set(5, 0, 0);
            scenarioGroup.add(battery);
            batteryMesh = battery;

            // Indicator
            const indGeo = new THREE.BoxGeometry(0.8, 2, 0.8);
            const indMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            batteryIndicator = new THREE.Mesh(indGeo, indMat);
            batteryIndicator.position.set(5, 1, 0);
            batteryIndicator.scale.y = 0.1;
            scene.add(batteryIndicator);

        }, undefined, () => {
            const geo = new THREE.BoxGeometry(2, 3, 1);
            const mat = new THREE.MeshPhongMaterial({ color: 0x333333 });
            batteryMesh = new THREE.Mesh(geo, mat);
            batteryMesh.position.set(5, 0, 0);
            scenarioGroup.add(batteryMesh);
        });

        setTimeout(() => {
            if (this.scenes.challenges) {
                this.scenes.challenges.scenario = 'intermittence';
                this.scenes.challenges.setUpdateFunction(() => {
                    const time = Date.now() * 0.001;

                    if (this.scenes.challenges.scenario === 'intermittence') {
                        // Move clouds
                        cloudsGroup.children.forEach((cloud, i) => {
                            cloud.position.x += 0.02;
                            if (cloud.position.x > 10) cloud.position.x = -10;
                        });

                        // Dim sun if clouds cover it (simulated by distance)
                        // Simple logic: if clouds are roughly in front of sun
                        let covered = false;
                        cloudsGroup.children.forEach(cloud => {
                            if (Math.abs(cloud.position.x - (-5)) < 3) covered = true;
                        });

                        if (sunMesh) {
                            sunMesh.traverse((child) => {
                                if ((child as THREE.Mesh).isMesh) {
                                    const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                                    if (m.emissive) m.emissiveIntensity = covered ? 0.1 : 1;
                                    if (m.color) m.color.setHex(covered ? 0x553300 : 0xffaa00);
                                }
                            });
                        }

                    } else if (this.scenes.challenges.scenario === 'storage') {
                        // Battery fill animation
                        if (batteryIndicator) {
                            const level = (Math.sin(time) + 1) / 2;
                            batteryIndicator.scale.y = level;
                            batteryIndicator.position.y = 0 + level; // Adjust

                            (batteryIndicator.material as THREE.MeshBasicMaterial).color.setHSL(level * 0.3, 1, 0.5); // Red to Green
                        }
                    }
                });
            }
        }, 0);
    }

    setupWorldMapScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x0f2027);
        camera.position.set(0, 0, 15);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 10, 10);
        scene.add(dirLight);

        const earthGroup = new THREE.Group();
        scene.add(earthGroup);

        // Load Earth
        this.loader.load('/planet_earth.glb', (gltf) => {
            const earth = gltf.scene;
            earth.scale.set(5, 5, 5); // Adjust scale to match previous radius roughly
            earthGroup.add(earth);
        }, undefined, () => {
            const geo = new THREE.SphereGeometry(5, 64, 64);
            const mat = new THREE.MeshPhongMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.8 });
            const earth = new THREE.Mesh(geo, mat);
            earthGroup.add(earth);
        });

        // Markers
        const markersGroup = new THREE.Group();
        earthGroup.add(markersGroup); // Attach to earth so they rotate with it

        const countries = [
            { name: 'Chine', lat: 35, lon: 105, intensity: 0.9 },
            { name: 'USA', lat: 39, lon: -95, intensity: 0.8 },
            { name: 'Allemagne', lat: 51, lon: 10, intensity: 0.7 },
            { name: 'Japon', lat: 36, lon: 138, intensity: 0.6 },
            { name: 'France', lat: 46, lon: 2, intensity: 0.5 },
            { name: 'Inde', lat: 20, lon: 77, intensity: 0.8 },
            { name: 'Espagne', lat: 40, lon: -4, intensity: 0.6 }
        ];

        // Helper to convert lat/lon to vector3
        // Assuming radius is ~5 (scale 5 of model, or 5 units if sphere)
        // Adjust radius based on model bounds if needed. Let's assume 5.
        const radius = 5;

        countries.forEach(country => {
            const phi = (90 - country.lat) * (Math.PI / 180);
            const theta = (country.lon + 180) * (Math.PI / 180);

            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = (radius * Math.sin(phi) * Math.sin(theta));
            const y = (radius * Math.cos(phi));

            const markerGeo = new THREE.CylinderGeometry(0.1, 0.1, 1 + country.intensity * 2, 8);
            markerGeo.translate(0, (1 + country.intensity * 2) / 2, 0); // Pivot at bottom
            const color = new THREE.Color().setHSL(0.3 - country.intensity * 0.3, 1, 0.5); // Green to Red/Orange
            const markerMat = new THREE.MeshBasicMaterial({ color: color });
            const marker = new THREE.Mesh(markerGeo, markerMat);

            marker.position.set(x, y, z);
            marker.lookAt(0, 0, 0); // Point outwards (actually inwards, so rotate)
            marker.rotateX(-Math.PI / 2); // Adjust orientation to point out

            // Add a glowing tip
            const tipGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const tipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const tip = new THREE.Mesh(tipGeo, tipMat);
            tip.position.y = 1 + country.intensity * 2;
            marker.add(tip);

            markersGroup.add(marker);
        });

        setTimeout(() => {
            if (this.scenes.worldMap) {
                this.scenes.worldMap.setUpdateFunction(() => {
                    const time = Date.now() * 0.001;
                    earthGroup.rotation.y += 0.002;

                    // Pulse markers
                    markersGroup.children.forEach((marker, i) => {
                        const scale = 1 + 0.2 * Math.sin(time * 3 + i);
                        marker.scale.set(scale, scale, scale);
                    });
                });
            }
        }, 0);
    }

    setupComparisonScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x1a2a6c);
        camera.position.set(0, 5, 15);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        // Solar Bar
        const solarGroup = new THREE.Group();
        solarGroup.position.set(-3, 0, 0);
        scene.add(solarGroup);

        const solarBarGeo = new THREE.BoxGeometry(2, 1, 2);
        solarBarGeo.translate(0, 0.5, 0); // Pivot bottom
        const solarBarMat = new THREE.MeshPhongMaterial({ color: 0x4CAF50, emissive: 0x2E7D32, emissiveIntensity: 0.2 });
        const solarBar = new THREE.Mesh(solarBarGeo, solarBarMat);
        solarGroup.add(solarBar);

        // Solar Icon (Sun)
        const sunIconGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const sunIconMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const sunIcon = new THREE.Mesh(sunIconGeo, sunIconMat);
        sunIcon.position.y = 8; // Target height
        solarGroup.add(sunIcon);

        // Fossil Bar
        const fossilGroup = new THREE.Group();
        fossilGroup.position.set(3, 0, 0);
        scene.add(fossilGroup);

        const fossilBarGeo = new THREE.BoxGeometry(2, 1, 2);
        fossilBarGeo.translate(0, 0.5, 0);
        const fossilBarMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
        const fossilBar = new THREE.Mesh(fossilBarGeo, fossilBarMat);
        fossilGroup.add(fossilBar);

        // Fossil Icon (Factory/Barrel)
        const barrelGeo = new THREE.CylinderGeometry(0.6, 0.6, 1, 16);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.y = 4; // Target height
        fossilGroup.add(barrel);

        // Smoke Particles
        const smokeParticles = new THREE.Group();
        fossilGroup.add(smokeParticles);

        const smokeGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const smokeMat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });

        for (let i = 0; i < 15; i++) {
            const s = new THREE.Mesh(smokeGeo, smokeMat);
            s.position.set(0, 4, 0);
            s.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.05 + Math.random() * 0.05, (Math.random() - 0.5) * 0.1),
                age: Math.random() * 100
            };
            smokeParticles.add(s);
        }

        setTimeout(() => {
            if (this.scenes.comparison) {
                this.scenes.comparison.setUpdateFunction(() => {
                    const time = Date.now() * 0.001;

                    // Grow Bars
                    solarBar.scale.y = THREE.MathUtils.lerp(solarBar.scale.y, 8, 0.02);
                    fossilBar.scale.y = THREE.MathUtils.lerp(fossilBar.scale.y, 4, 0.02);

                    // Move Icons
                    sunIcon.position.y = solarBar.scale.y + 1 + Math.sin(time) * 0.2;
                    barrel.position.y = fossilBar.scale.y + 0.8;

                    // Animate Smoke
                    smokeParticles.children.forEach((s) => {
                        s.position.add(s.userData.velocity);
                        s.userData.age++;
                        const scale = 1 + s.userData.age * 0.05;
                        s.scale.set(scale, scale, scale);

                        if (s.userData.age > 100) {
                            s.position.set(0, fossilBar.scale.y + 0.5, 0);
                            s.userData.age = 0;
                            s.scale.set(1, 1, 1);
                            ((s as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5;
                        } else {
                            ((s as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - (s.userData.age / 100));
                        }
                    });
                });
            }
        }, 0);
    }

    setupTechScene(scene: THREE.Scene, camera: THREE.Camera, techType?: string) {
        scene.background = new THREE.Color(0x2c3e50);
        camera.position.set(0, 3, 8);

        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        switch (techType) {
            case 'paint':
                this.setupPaintTechnology(scene);
                break;
            case 'road':
                this.setupRoadTechnology(scene);
                break;
            case 'satellite':
                this.setupSatelliteTechnology(scene);
                break;
        }
    }

    setupPaintTechnology(scene: THREE.Scene) {
        const wallGroup = new THREE.Group();

        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(4, 3, 0.2),
            new THREE.MeshStandardMaterial({
                color: 0xeeeeee,
                roughness: 0.2,
                metalness: 0.1
            })
        );
        wallGroup.add(wall);

        // Nano-particles (Dots on surface)
        const particleCount = 1000;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x00ffff); // Cyan
        const color2 = new THREE.Color(0x0000ff); // Blue

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 3.8;
            const y = (Math.random() - 0.5) * 2.8;
            const z = 0.11; // Slightly in front of wall

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Mix colors
            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        wallGroup.add(particles);

        // Energy Output (Plug/Connector)
        const connector = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        connector.position.set(1.5, -1.2, 0.1);
        wallGroup.add(connector);

        const lightIndicator = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        lightIndicator.position.set(0, 0, 0.2);
        connector.add(lightIndicator);

        scene.add(wallGroup);

        setTimeout(() => {
            if (this.scenes.tech1) {
                this.scenes.tech1.setUpdateFunction(() => {
                    const time = Date.now() * 0.001;

                    // Wave effect on particles
                    const positions = particles.geometry.attributes.position.array as Float32Array;
                    const colors = particles.geometry.attributes.color.array as Float32Array;

                    for (let i = 0; i < particleCount; i++) {
                        const x = positions[i * 3];
                        const y = positions[i * 3 + 1];

                        // Wave moving across
                        const wave = Math.sin(x * 2 + y * 2 + time * 5);

                        // Brighten color based on wave
                        if (wave > 0.8) {
                            colors[i * 3] = 1; // R
                            colors[i * 3 + 1] = 1; // G
                            colors[i * 3 + 2] = 1; // B
                        } else {
                            // Reset to base (simplified, just making them blueish)
                            colors[i * 3] = 0;
                            colors[i * 3 + 1] = 0.5 + 0.5 * Math.random();
                            colors[i * 3 + 2] = 1;
                        }
                    }
                    particles.geometry.attributes.color.needsUpdate = true;

                    // Pulse indicator
                    (lightIndicator.material as THREE.MeshBasicMaterial).color.setHSL(0.3, 1, 0.5 + 0.5 * Math.sin(time * 10));
                });
            }
        }, 0);
    }

    setupRoadTechnology(scene: THREE.Scene) {
        const roadGroup = new THREE.Group();

        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 3),
            new THREE.MeshPhongMaterial({
                color: 0x333333,
                shininess: 10
            })
        );
        road.rotation.x = -Math.PI / 2;
        roadGroup.add(road);

        const cells = new THREE.Group();
        for (let x = 0; x < 6; x++) {
            for (let z = 0; z < 3; z++) {
                const cell = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.1, 0.4),
                    new THREE.MeshPhongMaterial({
                        color: 0x1E90FF,
                        emissive: 0x1a237e,
                        emissiveIntensity: 0.1
                    })
                );
                cell.position.set(x - 2.5, 0.05, z - 1);
                cells.add(cell);
            }
        }
        roadGroup.add(cells);

        const car = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.3, 0.8),
            new THREE.MeshPhongMaterial({
                color: 0xFF0000,
                shininess: 100
            })
        );
        car.position.y = 0.25;
        roadGroup.add(car);

        scene.add(roadGroup);

        let carPosition = -3;
        setTimeout(() => {
            if (this.scenes.tech2) {
                this.scenes.tech2.setUpdateFunction(() => {
                    roadGroup.rotation.y += 0.002;

                    carPosition += 0.05;
                    if (carPosition > 3) carPosition = -3;
                    car.position.x = carPosition;

                    cells.children.forEach((cell: any, i) => {
                        const distance = Math.abs(cell.position.x - carPosition);
                        if (distance < 0.5) {
                            cell.material.emissiveIntensity = 0.5;
                            cell.material.color.setHex(0xFFD700);
                        } else {
                            cell.material.emissiveIntensity = 0.1;
                            cell.material.color.setHex(0x1E90FF);
                        }
                    });
                });
            }
        }, 0);
    }

    setupSatelliteTechnology(scene: THREE.Scene) {
        const satelliteGroup = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 1),
            new THREE.MeshPhongMaterial({
                color: 0x666666,
                emissive: 0x333333,
                emissiveIntensity: 0.2
            })
        );
        satelliteGroup.add(body);

        const panels = new THREE.Group();
        for (let i = 0; i < 2; i++) {
            const panel = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 1.5),
                new THREE.MeshPhongMaterial({
                    color: 0x1E90FF,
                    emissive: 0x1a237e,
                    emissiveIntensity: 0.3,
                    side: THREE.DoubleSide
                })
            );
            panel.position.x = i === 0 ? -2 : 2;
            panel.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;
            panels.add(panel);
        }
        satelliteGroup.add(panels);

        const energyBeam = new THREE.Group();
        for (let i = 0; i < 10; i++) {
            const beam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.1, 3, 8),
                new THREE.MeshBasicMaterial({
                    color: 0x00FF00,
                    transparent: true,
                    opacity: 0.6
                })
            );
            beam.position.y = -1.5 - i * 0.3;
            energyBeam.add(beam);
        }
        satelliteGroup.add(energyBeam);

        scene.add(satelliteGroup);

        setTimeout(() => {
            if (this.scenes.tech3) {
                this.scenes.tech3.setUpdateFunction(() => {
                    satelliteGroup.rotation.y += 0.01;

                    panels.children.forEach((panel: any, i) => {
                        panel.material.emissiveIntensity = 0.3 + 0.2 * Math.sin(Date.now() * 0.001 + i);
                    });

                    energyBeam.children.forEach((beam: any, i) => {
                        beam.scale.y = 1 + 0.2 * Math.sin(Date.now() * 0.002 + i);
                        beam.material.opacity = 0.4 + 0.2 * Math.sin(Date.now() * 0.001 + i);
                    });
                });
            }
        }, 0);
    }

    // Helper functions
    latLonToVector3(lat: number, lon: number, radius: number) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    }

    updateImpactStats() {
        this.stats.treesSaved += 1;
        this.stats.co2Saved += 100;
        this.stats.oilSaved += 5;

        if (this.onStatsUpdate) {
            this.onStatsUpdate({ ...this.stats });
        }
    }

    initStats() {
        this.stats = {
            treesSaved: 0,
            co2Saved: 0,
            oilSaved: 0,
            energyOutput: 250,
            efficiency: 22.5,
            temperature: 42
        };
        if (this.onStatsUpdate) {
            this.onStatsUpdate({ ...this.stats });
        }
    }

    // Interaction functions
    changeRadiationAngle() {
        if (this.scenes.radiation) {
            this.scenes.radiation.camera.position.y = 5 + Math.random() * 5;
            this.scenes.radiation.camera.position.z = 10 + Math.random() * 5;
            this.scenes.radiation.camera.lookAt(0, 0, 0);
        }
    }

    toggleRadiationFlow() {
        if (this.scenes.radiation) {
            this.scenes.radiation.isAnimating = !this.scenes.radiation.isAnimating;
            return this.scenes.radiation.isAnimating;
        }
        return false;
    }

    updateSimulation(intensity: number, angle: number) {
        if (this.scenes.process) {
            this.scenes.process.scene.children.forEach((child: any) => {
                if (child.type === 'DirectionalLight') {
                    child.intensity = intensity / 100;
                }
            });

            const panelGroup = this.scenes.process.scene.getObjectByName('panelGroup');
            if (panelGroup) {
                panelGroup.rotation.x = THREE.MathUtils.degToRad(angle);
            }
        }
    }

    setScenario(scenario: string) {
        if (this.scenes.challenges) {
            this.scenes.challenges.scenario = scenario;
        }
    }

    highlightCountry(country: string) {
        const countries: { [key: string]: { lat: number, lon: number, color: number } } = {
            france: { lat: 46, lon: 2, color: 0x0000FF },
            germany: { lat: 51, lon: 10, color: 0xFF0000 },
            china: { lat: 35, lon: 105, color: 0xFF0000 },
            usa: { lat: 39, lon: -95, color: 0x0000FF },
            spain: { lat: 40, lon: -4, color: 0xFFFF00 }
        };

        const countryData = countries[country];
        if (countryData && this.scenes.worldMap) {
            this.scenes.worldMap.scene.children.forEach((child: any) => {
                if (child.type === 'Group' && child.children.length > 0) {
                    child.children.forEach((point: any) => {
                        const distance = point.position.distanceTo(
                            this.latLonToVector3(countryData.lat, countryData.lon, 5.2)
                        );

                        if (distance < 0.5) {
                            point.material.color.setHex(countryData.color);
                            point.scale.setScalar(2);

                            setTimeout(() => {
                                point.scale.setScalar(1);
                                point.material.color.setHex(0xFF9800);
                            }, 2000);
                        }
                    });
                }
            });
        }
    }

    resizeAll() {
        Object.values(this.scenes).forEach((scene: any) => {
            if (scene.resize) {
                scene.resize();
            }
        });
    }

    dispose() {
        Object.values(this.scenes).forEach((scene: any) => {
            if (scene.stop) scene.stop();
            if (scene.renderer) scene.renderer.dispose();
            if (scene.controls) scene.controls.dispose();
        });
        this.scenes = {};
    }
}

export const solarApp = new SolarApp();
