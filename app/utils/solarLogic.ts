import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

    constructor() { }

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

    setupSunScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x0c2461);
        camera.position.set(0, 0, 15);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));

        const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF9800,
            emissive: 0xFF5722,
            emissiveIntensity: 0.5
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        const rays = new THREE.Group();
        for (let i = 0; i < 12; i++) {
            const rayGeometry = new THREE.ConeGeometry(0.2, 5, 4);
            const rayMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFEB3B,
                transparent: true,
                opacity: 0.7
            });
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            ray.position.y = 3;
            ray.rotation.x = Math.PI / 2;
            ray.rotation.z = (i / 12) * Math.PI * 2;
            rays.add(ray);
        }
        scene.add(rays);

        const particles = new THREE.Group();
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xFF9800,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);

        // Return update function
        setTimeout(() => {
            if (this.scenes.sun) {
                this.scenes.sun.setUpdateFunction(() => {
                    sun.rotation.y += 0.005;
                    rays.rotation.y += 0.01;
                    particleSystem.rotation.y += 0.001;

                    const time = Date.now() * 0.001;
                    sun.material.emissiveIntensity = 0.5 + 0.3 * Math.sin(time);

                    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i + 1] += Math.sin(time + i) * 0.01;
                    }
                    particleSystem.geometry.attributes.position.needsUpdate = true;
                });
            }
        }, 0);
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
        scene.background = new THREE.Color(0x0f0c29);
        camera.position.set(0, 8, 15);

        const panelGroup = new THREE.Group();
        panelGroup.name = 'panelGroup';

        const frameGeometry = new THREE.BoxGeometry(6, 0.2, 3);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x555555,
            shininess: 100
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.1;
        panelGroup.add(frame);

        const cellsGroup = new THREE.Group();
        for (let x = 0; x < 4; x++) {
            for (let z = 0; z < 2; z++) {
                const cellGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
                const cellMaterial = new THREE.MeshPhongMaterial({
                    color: this.panelColor,
                    emissive: 0x1a237e,
                    emissiveIntensity: 0.2
                });
                const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                cell.position.set(
                    (x - 1.5) * 1.5,
                    0.15,
                    (z - 0.5) * 1.5
                );
                cellsGroup.add(cell);
            }
        }
        panelGroup.add(cellsGroup);
        scene.add(panelGroup);

        const createElectron = () => {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00FF00,
                transparent: true,
                opacity: 0.8
            });
            const electron = new THREE.Mesh(geometry, material);
            electron.position.set(
                (Math.random() - 0.5) * 3,
                Math.random() * 2 - 1,
                (Math.random() - 0.5) * 2
            );
            return electron;
        };

        const electrons = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const electron = createElectron();
            electrons.add(electron);
        }
        scene.add(electrons);

        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        setTimeout(() => {
            if (this.scenes.process) {
                this.scenes.process.setUpdateFunction(() => {
                    panelGroup.rotation.y += 0.001;

                    electrons.children.forEach((electron: any, i) => {
                        electron.position.y += 0.05;
                        electron.rotation.x += 0.1;
                        electron.rotation.y += 0.1;

                        if (electron.position.y > 5) {
                            electron.position.y = -2;
                            electron.position.x = (Math.random() - 0.5) * 3;
                            electron.position.z = (Math.random() - 0.5) * 2;
                        }

                        const cellIndex = i % 8;
                        if (cellsGroup.children[cellIndex]) {
                            const intensity = 0.2 + 0.1 * Math.sin(Date.now() * 0.001 + i);
                            ((cellsGroup.children[cellIndex] as THREE.Mesh).material as THREE.MeshPhongMaterial).emissiveIntensity = intensity;
                        }
                    });
                });
            }
        }, 0);
    }

    setupBenefitsScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x1a2a6c);
        camera.position.set(0, 10, 20);

        const createTree = () => {
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3);
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

            const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
            const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 3;

            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            return tree;
        };

        const createCO2Particle = () => {
            const geometry = new THREE.SphereGeometry(0.3, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x808080,
                transparent: true,
                opacity: 0.7
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(
                (Math.random() - 0.5) * 15,
                Math.random() * 5 - 5,
                (Math.random() - 0.5) * 15
            );
            return particle;
        };

        const trees = new THREE.Group();
        for (let i = 0; i < 10; i++) {
            const tree = createTree();
            tree.position.set(
                (Math.random() - 0.5) * 20,
                0,
                (Math.random() - 0.5) * 20
            );
            trees.add(tree);
        }
        scene.add(trees);

        const co2Particles = new THREE.Group();
        for (let i = 0; i < 30; i++) {
            const particle = createCO2Particle();
            co2Particles.add(particle);
        }
        scene.add(co2Particles);

        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        setTimeout(() => {
            if (this.scenes.benefits) {
                this.scenes.benefits.setUpdateFunction(() => {
                    trees.rotation.y += 0.001;

                    co2Particles.children.forEach((particle: any, i) => {
                        particle.position.y += 0.02;
                        particle.rotation.x += 0.01;

                        if (particle.position.y > 10) {
                            particle.position.y = -5;
                            particle.position.x = (Math.random() - 0.5) * 15;
                            particle.position.z = (Math.random() - 0.5) * 15;

                            this.updateImpactStats();
                        }
                    });
                });
            }
        }, 0);
    }

    setupChallengesScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x000000);
        camera.position.set(0, 5, 10);

        const scenarioGroup = new THREE.Group();

        const sun = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0xFF9800,
                emissive: 0xFF5722,
                emissiveIntensity: 0.5
            })
        );
        sun.position.set(-5, 5, 0);
        scenarioGroup.add(sun);

        const createClouds = () => {
            const group = new THREE.Group();
            for (let i = 0; i < 3; i++) {
                const cloud = createCloud();
                cloud.position.set(i * 3, Math.random() * 2, 0);
                group.add(cloud);
            }
            return group;
        };

        const createCloud = () => {
            const group = new THREE.Group();
            for (let j = 0; j < 4; j++) {
                const sphere = new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.8
                });
                const mesh = new THREE.Mesh(sphere, material);
                mesh.position.set(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 1,
                    (Math.random() - 0.5) * 1
                );
                group.add(mesh);
            }
            return group;
        };

        const createBattery = () => {
            const group = new THREE.Group();

            const bodyGeometry = new THREE.BoxGeometry(2, 3, 1);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0x333333,
                emissive: 0x1a237e,
                emissiveIntensity: 0.1
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            group.add(body);

            const terminalGeometry = new THREE.BoxGeometry(0.5, 0.2, 1.2);
            const terminalMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFD700,
                emissive: 0xFFD700,
                emissiveIntensity: 0.3
            });
            const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
            terminal.position.y = 1.6;
            group.add(terminal);

            return group;
        };

        const clouds = createClouds();
        scenarioGroup.add(clouds);

        const battery = createBattery();
        battery.position.set(5, 0, 0);
        scenarioGroup.add(battery);

        scene.add(scenarioGroup);

        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        setTimeout(() => {
            if (this.scenes.challenges) {
                this.scenes.challenges.scenario = 'intermittence';
                this.scenes.challenges.setUpdateFunction(() => {
                    sun.rotation.y += 0.005;

                    if (this.scenes.challenges.scenario === 'intermittence') {
                        clouds.position.x += 0.01;
                        if (clouds.position.x > 10) clouds.position.x = -10;

                        const distance = Math.abs(clouds.position.x - sun.position.x);
                        sun.material.emissiveIntensity = distance > 3 ? 0.5 : 0.1;
                    } else if (this.scenes.challenges.scenario === 'storage') {
                        battery.rotation.y += 0.01;
                        ((battery.children[1] as THREE.Mesh).material as THREE.MeshPhongMaterial).emissiveIntensity = 0.3 + 0.2 * Math.sin(Date.now() * 0.001);
                    }
                });
            }
        }, 0);
    }

    setupWorldMapScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x0f2027);
        camera.position.set(0, 10, 20);

        const earthRadius = 5;
        const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x1E90FF,
            transparent: true,
            opacity: 0.8,
            wireframe: false
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);

        const productionPoints = new THREE.Group();
        const countries = [
            { name: 'Chine', lat: 35, lon: 105, intensity: 0.9 },
            { name: 'USA', lat: 39, lon: -95, intensity: 0.8 },
            { name: 'Allemagne', lat: 51, lon: 10, intensity: 0.7 },
            { name: 'Japon', lat: 36, lon: 138, intensity: 0.6 },
            { name: 'France', lat: 46, lon: 2, intensity: 0.5 },
            { name: 'Inde', lat: 20, lon: 77, intensity: 0.8 },
            { name: 'Espagne', lat: 40, lon: -4, intensity: 0.6 }
        ];

        const createProductionPoint = (intensity: number) => {
            const color = intensity > 0.8 ? 0x00FF00 :
                intensity > 0.6 ? 0xFFFF00 : 0xFF0000;

            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });

            const point = new THREE.Mesh(geometry, material);

            const haloGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.3
            });
            const halo = new THREE.Mesh(haloGeometry, haloMaterial);
            point.add(halo);

            return point;
        };

        countries.forEach(country => {
            const point = createProductionPoint(country.intensity);
            const position = this.latLonToVector3(country.lat, country.lon, earthRadius + 0.2);
            point.position.copy(position);
            productionPoints.add(point);
        });

        scene.add(productionPoints);

        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        setTimeout(() => {
            if (this.scenes.worldMap) {
                this.scenes.worldMap.setUpdateFunction(() => {
                    earth.rotation.y += 0.001;
                    productionPoints.rotation.y += 0.001;

                    productionPoints.children.forEach((point, i) => {
                        const scale = 1 + 0.2 * Math.sin(Date.now() * 0.001 + i);
                        point.scale.setScalar(scale);
                    });
                });
            }
        }, 0);
    }

    setupComparisonScene(scene: THREE.Scene, camera: THREE.Camera) {
        scene.background = new THREE.Color(0x1a2a6c);
        camera.position.set(0, 5, 15);

        const solarGroup = new THREE.Group();
        solarGroup.position.set(-3, 0, 0);

        const solarPanel = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.1, 1),
            new THREE.MeshPhongMaterial({
                color: 0x1E90FF,
                emissive: 0x1a237e,
                emissiveIntensity: 0.2
            })
        );
        solarGroup.add(solarPanel);

        for (let i = 0; i < 5; i++) {
            const ray = new THREE.Mesh(
                new THREE.ConeGeometry(0.05, 1, 4),
                new THREE.MeshBasicMaterial({
                    color: 0x00FF00,
                    transparent: true,
                    opacity: 0.7
                })
            );
            ray.position.set(0, 0.6 + i * 0.3, 0);
            ray.rotation.x = Math.PI;
            solarGroup.add(ray);
        }

        const fossilGroup = new THREE.Group();
        fossilGroup.position.set(3, 0, 0);

        const factory = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            new THREE.MeshPhongMaterial({
                color: 0x666666,
                emissive: 0x333333,
                emissiveIntensity: 0.1
            })
        );
        fossilGroup.add(factory);

        for (let i = 0; i < 5; i++) {
            const smoke = new THREE.Mesh(
                new THREE.SphereGeometry(0.1 + i * 0.05, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0x888888,
                    transparent: true,
                    opacity: 0.5
                })
            );
            smoke.position.set(0, 1 + i * 0.3, 0);
            fossilGroup.add(smoke);
        }

        scene.add(solarGroup);
        scene.add(fossilGroup);

        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        setTimeout(() => {
            if (this.scenes.comparison) {
                this.scenes.comparison.setUpdateFunction(() => {
                    solarGroup.rotation.y += 0.01;
                    fossilGroup.rotation.y += 0.01;

                    solarGroup.children.slice(1).forEach((ray, i) => {
                        ray.scale.y = 1 + 0.3 * Math.sin(Date.now() * 0.001 + i);
                    });

                    fossilGroup.children.slice(1).forEach((smoke, i) => {
                        smoke.position.y += 0.01;
                        smoke.scale.x += 0.002;
                        smoke.scale.y += 0.002;
                        smoke.scale.z += 0.002;

                        if (smoke.position.y > 3) {
                            smoke.position.y = 1;
                            smoke.scale.set(1, 1, 1);
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
            new THREE.MeshPhongMaterial({
                color: 0xF5F5DC,
                shininess: 30
            })
        );
        wallGroup.add(wall);

        const particles = new THREE.Group();
        for (let i = 0; i < 30; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 4, 4),
                new THREE.MeshBasicMaterial({
                    color: 0x1E90FF,
                    transparent: true,
                    opacity: 0.8
                })
            );
            particle.position.set(
                (Math.random() - 0.5) * 3.8,
                (Math.random() - 0.5) * 2.8,
                0.1
            );
            particles.add(particle);
        }
        wallGroup.add(particles);

        scene.add(wallGroup);

        setTimeout(() => {
            if (this.scenes.tech1) {
                this.scenes.tech1.setUpdateFunction(() => {
                    wallGroup.rotation.y += 0.005;

                    particles.children.forEach((particle: any, i) => {
                        particle.material.opacity = 0.5 + 0.3 * Math.sin(Date.now() * 0.001 + i);
                        particle.rotation.x += 0.01;
                        particle.rotation.y += 0.01;
                    });
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
