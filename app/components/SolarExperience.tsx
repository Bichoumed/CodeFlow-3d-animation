'use client';

import React, { useEffect, useState, useRef } from 'react';
import { solarApp, Stats } from '../utils/solarLogic';

export default function SolarExperience() {
    const [stats, setStats] = useState<Stats>({
        treesSaved: 0,
        co2Saved: 0,
        oilSaved: 0,
        energyOutput: 250,
        efficiency: 22.5,
        temperature: 42
    });

    const [activeTech, setActiveTech] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [radiationFlow, setRadiationFlow] = useState(true);

    useEffect(() => {
        // Initialize the solar app logic
        solarApp.init((newStats) => {
            setStats(newStats);
        });

        // Cleanup on unmount
        return () => {
            solarApp.dispose();
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleRadiationAngle = () => {
        solarApp.changeRadiationAngle();
    };

    const handleRadiationFlow = () => {
        const isAnimating = solarApp.toggleRadiationFlow();
        setRadiationFlow(isAnimating);
    };

    const handleSimulationChange = (type: 'intensity' | 'angle', value: number) => {
        const intensityInput = document.getElementById('sunIntensity') as HTMLInputElement;
        const angleInput = document.getElementById('panelAngle') as HTMLInputElement;

        if (intensityInput && angleInput) {
            solarApp.updateSimulation(parseInt(intensityInput.value), parseInt(angleInput.value));

            // Update display values
            const intensityVal = document.getElementById('intensityValue');
            const angleVal = document.getElementById('angleValue');
            if (intensityVal) intensityVal.innerText = intensityInput.value + '%';
            if (angleVal) angleVal.innerText = angleInput.value + '°';
        }
    };

    const handleScenarioChange = (scenario: string) => {
        solarApp.setScenario(scenario);
    };

    const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Store selected country if needed
    };

    const highlightCountry = () => {
        const select = document.getElementById('countrySelect') as HTMLSelectElement;
        if (select) {
            solarApp.highlightCountry(select.value);
        }
    };

    const handleTechSlide = (slideIndex: number) => {
        setActiveTech(slideIndex);
        // Trigger resize for the newly visible scene
        setTimeout(() => {
            solarApp.resizeAll();
        }, 100);
    };

    return (
        <>
            {/* Navigation */}
            <nav className="navbar">
                <div className="nav-container">
                    <a href="#" className="logo">
                        <i className="fas fa-sun"></i>
                        <span>Solar<span className="highlight">Edu</span>3D</span>
                    </a>
                    <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                        <li><a href="#accueil" onClick={() => setIsMenuOpen(false)}><i className="fas fa-home"></i> Accueil</a></li>
                        <li><a href="#definition" onClick={() => setIsMenuOpen(false)}><i className="fas fa-info-circle"></i> Définition</a></li>
                        <li><a href="#fonctionnement" onClick={() => setIsMenuOpen(false)}><i className="fas fa-cogs"></i> Fonctionnement</a></li>
                        <li><a href="#avantages" onClick={() => setIsMenuOpen(false)}><i className="fas fa-thumbs-up"></i> Avantages</a></li>
                        <li><a href="#inconvenients" onClick={() => setIsMenuOpen(false)}><i className="fas fa-exclamation-triangle"></i> Inconvénients</a></li>
                        <li><a href="#donnees" onClick={() => setIsMenuOpen(false)}><i className="fas fa-chart-bar"></i> Données</a></li>
                        <li><a href="#comparaison" onClick={() => setIsMenuOpen(false)}><i className="fas fa-balance-scale"></i> Comparaison</a></li>
                        <li><a href="#technologies" onClick={() => setIsMenuOpen(false)}><i className="fas fa-rocket"></i> Technologies</a></li>
                    </ul>
                    <div className="hamburger" onClick={toggleMenu}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </div>
                </div>
            </nav>

            {/* En-tête avec effet parallaxe */}
            <header id="accueil" className="hero">
                <div className="hero-content" data-aos="fade-up">
                    <h1 className="hero-title">L'Énergie <span className="highlight">Solaire</span> en 3D</h1>
                    <p className="hero-subtitle">Explorez, apprenez et découvrez l'énergie du futur grâce à des visualisations interactives 3D</p>
                    <a href="#definition" className="cta-button">
                        <i className="fas fa-graduation-cap"></i> Commencer l'Apprentissage
                    </a>
                </div>

                {/* Animation Soleil 3D */}
                <div className="sun-3d-container" id="sun-3d"></div>

                {/* Effets visuels */}
                <div className="hero-effects">
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                </div>
            </header>

            {/* Section 1: Définition */}
            <section id="definition" className="section">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Qu'est-ce que l'<span className="highlight">Énergie Solaire</span> ?</h2>
                        <p className="section-subtitle">Comprendre la source d'énergie la plus abondante de notre planète</p>
                    </div>

                    <div className="definition-content">
                        <div className="definition-text" data-aos="fade-right">
                            <div className="info-card">
                                <div className="info-icon">
                                    <i className="fas fa-sun"></i>
                                </div>
                                <h3>Définition Scientifique</h3>
                                <p>L'énergie solaire est l'énergie provenant du rayonnement solaire, captée et transformée en électricité ou en chaleur. C'est une source d'énergie renouvelable, propre et inépuisable à l'échelle humaine.</p>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">
                                    <i className="fas fa-bolt"></i>
                                </div>
                                <h3>Deux Technologies Principales</h3>
                                <div className="tech-list">
                                    <div className="tech-item">
                                        <i className="fas fa-solar-panel"></i>
                                        <div>
                                            <h4>Photovoltaïque</h4>
                                            <p>Conversion directe de la lumière en électricité</p>
                                        </div>
                                    </div>
                                    <div className="tech-item">
                                        <i className="fas fa-temperature-high"></i>
                                        <div>
                                            <h4>Thermique</h4>
                                            <p>Utilisation de la chaleur pour produire de l'électricité</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">
                                    <i className="fas fa-globe-europe"></i>
                                </div>
                                <h3>Importance Globale</h3>
                                <p>L'énergie solaire représente une solution clé pour réduire les émissions de CO₂ et lutter contre le changement climatique. C'est un pilier de la transition énergétique mondiale.</p>
                            </div>
                        </div>

                        <div className="definition-3d" data-aos="fade-left">
                            <div className="card-3d">
                                <div className="card-header">
                                    <i className="fas fa-eye"></i>
                                    <h4>Vue 3D : Rayonnement Solaire</h4>
                                </div>
                                <div className="scene-container" id="radiation-scene"></div>
                                <div className="scene-controls">
                                    <button className="scene-btn" onClick={handleRadiationAngle}>
                                        <i className="fas fa-sync-alt"></i> Changer Angle
                                    </button>
                                    <button className="scene-btn" onClick={handleRadiationFlow}>
                                        <i className="fas fa-play"></i> Animation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Fonctionnement */}
            <section id="fonctionnement" className="section bg-light">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Comment <span className="highlight">Fonctionne</span> l'Énergie Solaire ?</h2>
                        <p className="section-subtitle">Un processus technologique fascinant expliqué en 3D</p>
                    </div>

                    <div className="process-steps">
                        <div className="step" data-aos="fade-up">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <div className="step-icon">
                                    <i className="fas fa-sun"></i>
                                </div>
                                <h3>Rayonnement Solaire</h3>
                                <p>Les photons émis par le soleil atteignent la Terre à la vitesse de la lumière (300,000 km/s).</p>
                            </div>
                        </div>

                        <div className="step" data-aos="fade-up" data-aos-delay="100">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <div className="step-icon">
                                    <i className="fas fa-solar-panel"></i>
                                </div>
                                <h3>Absorption Photovoltaïque</h3>
                                <p>Les cellules photovoltaïques en silicium absorbent les photons et libèrent des électrons.</p>
                            </div>
                        </div>

                        <div className="step" data-aos="fade-up" data-aos-delay="200">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <div className="step-icon">
                                    <i className="fas fa-bolt"></i>
                                </div>
                                <h3>Création de Courant</h3>
                                <p>Le mouvement des électrons crée un courant électrique continu (DC).</p>
                            </div>
                        </div>

                        <div className="step" data-aos="fade-up" data-aos-delay="300">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <div className="step-icon">
                                    <i className="fas fa-exchange-alt"></i>
                                </div>
                                <h3>Conversion</h3>
                                <p>L'onduleur convertit le courant continu (DC) en courant alternatif (AC) utilisable.</p>
                            </div>
                        </div>
                    </div>

                    {/* Scène 3D Interactive du Processus */}
                    <div className="process-3d" data-aos="zoom-in">
                        <div className="process-3d-container">
                            <div className="process-header">
                                <i className="fas fa-gamepad"></i>
                                <h3>Simulation Interactive 3D du Processus</h3>
                            </div>
                            <div className="scene-wrapper">
                                <div className="scene-main" id="process-scene"></div>
                                <div className="scene-panel">
                                    <h4>Contrôles de Simulation</h4>
                                    <div className="control-group">
                                        <label><i className="fas fa-sun"></i> Intensité Solaire:</label>
                                        <input
                                            type="range"
                                            id="sunIntensity"
                                            min="0"
                                            max="100"
                                            defaultValue="70"
                                            onChange={(e) => handleSimulationChange('intensity', parseInt(e.target.value))}
                                        />
                                        <span id="intensityValue">70%</span>
                                    </div>
                                    <div className="control-group">
                                        <label><i className="fas fa-angle-right"></i> Angle Panneaux:</label>
                                        <input
                                            type="range"
                                            id="panelAngle"
                                            min="0"
                                            max="90"
                                            defaultValue="30"
                                            onChange={(e) => handleSimulationChange('angle', parseInt(e.target.value))}
                                        />
                                        <span id="angleValue">30°</span>
                                    </div>
                                    <button className="btn-simulate" onClick={() => solarApp.updateSimulation(100, 30)}>
                                        <i className="fas fa-play-circle"></i> Lancer Simulation Complète
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Avantages */}
            <section id="avantages" className="section">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Avantages de l'Énergie <span className="highlight">Solaire</span></h2>
                        <p className="section-subtitle">Pourquoi choisir l'énergie solaire ? Découvrez les bénéfices</p>
                    </div>

                    <div className="advantages-grid">
                        <div className="advantage-card" data-aos="flip-left">
                            <div className="advantage-icon">
                                <i className="fas fa-leaf"></i>
                            </div>
                            <div className="advantage-number">01</div>
                            <h3>Écologique</h3>
                            <p>L'énergie solaire est 100% renouvelable et ne produit pas de gaz à effet de serre lors de son utilisation.</p>
                            <ul className="advantage-list">
                                <li><i className="fas fa-check-circle"></i> Réduction de l'empreinte carbone</li>
                                <li><i className="fas fa-check-circle"></i> Pas de pollution de l'air</li>
                                <li><i className="fas fa-check-circle"></i> Ressource inépuisable</li>
                            </ul>
                        </div>

                        <div className="advantage-card" data-aos="flip-left" data-aos-delay="100">
                            <div className="advantage-icon">
                                <i className="fas fa-euro-sign"></i>
                            </div>
                            <div className="advantage-number">02</div>
                            <h3>Économique</h3>
                            <p>Après l'investissement initial, l'énergie solaire réduit considérablement vos factures d'électricité.</p>
                            <ul className="advantage-list">
                                <li><i className="fas fa-check-circle"></i> Économies à long terme</li>
                                <li><i className="fas fa-check-circle"></i> Indépendance énergétique</li>
                                <li><i className="fas fa-check-circle"></i> Valorisation immobilière</li>
                            </ul>
                        </div>

                        <div className="advantage-card" data-aos="flip-left" data-aos-delay="200">
                            <div className="advantage-icon">
                                <i className="fas fa-cogs"></i>
                            </div>
                            <div className="advantage-number">03</div>
                            <h3>Technologique</h3>
                            <p>Les technologies solaires évoluent rapidement avec des rendements toujours plus élevés.</p>
                            <ul className="advantage-list">
                                <li><i className="fas fa-check-circle"></i> Efficacité en amélioration</li>
                                <li><i className="fas fa-check-circle"></i> Intégration architecturale</li>
                                <li><i className="fas fa-check-circle"></i> Stockage intelligent</li>
                            </ul>
                        </div>
                    </div>

                    {/* Visualisation 3D des Avantages */}
                    <div className="advantages-3d" data-aos="fade-up">
                        <div className="advantages-3d-container">
                            <div className="viz-header">
                                <i className="fas fa-chart-line"></i>
                                <h3>Visualisation 3D des Bénéfices Environnementaux</h3>
                            </div>
                            <div className="viz-wrapper">
                                <div className="viz-scene" id="benefits-scene"></div>
                                <div className="viz-info">
                                    <h4><i className="fas fa-chart-pie"></i> Impact en Temps Réel</h4>
                                    <div className="impact-item">
                                        <div className="impact-icon"><i className="fas fa-tree"></i></div>
                                        <div className="impact-details">
                                            <div className="impact-title">Arbres Sauvés</div>
                                            <div className="impact-value" id="trees-saved">{stats.treesSaved}</div>
                                        </div>
                                    </div>
                                    <div className="impact-item">
                                        <div className="impact-icon"><i className="fas fa-smog"></i></div>
                                        <div className="impact-details">
                                            <div className="impact-title">CO₂ Évitée (kg)</div>
                                            <div className="impact-value" id="co2-saved">{stats.co2Saved}</div>
                                        </div>
                                    </div>
                                    <div className="impact-item">
                                        <div className="impact-icon"><i className="fas fa-gas-pump"></i></div>
                                        <div className="impact-details">
                                            <div className="impact-title">Pétrole Économisé (L)</div>
                                            <div className="impact-value" id="oil-saved">{stats.oilSaved}</div>
                                        </div>
                                    </div>
                                    <button className="btn-reset" onClick={() => solarApp.initStats()}>
                                        <i className="fas fa-redo"></i> Réinitialiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Inconvénients */}
            <section id="inconvenients" className="section bg-dark">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Inconvénients & <span className="highlight">Défis</span></h2>
                        <p className="section-subtitle">Comprendre les limites et solutions de l'énergie solaire</p>
                    </div>

                    <div className="challenges-content">
                        <div className="challenges-list" data-aos="fade-right">
                            <div className="challenge-card">
                                <div className="challenge-header">
                                    <div className="challenge-icon">
                                        <i className="fas fa-cloud-sun"></i>
                                    </div>
                                    <h3>Intermittence</h3>
                                </div>
                                <p>Production uniquement diurne et dépendante des conditions météorologiques.</p>
                                <div className="challenge-solution">
                                    <i className="fas fa-lightbulb"></i>
                                    <div>
                                        <strong>Solution :</strong> Systèmes de stockage (batteries) et mix énergétique.
                                    </div>
                                </div>
                            </div>

                            <div className="challenge-card">
                                <div className="challenge-header">
                                    <div className="challenge-icon">
                                        <i className="fas fa-money-bill-wave"></i>
                                    </div>
                                    <h3>Coût Initial</h3>
                                </div>
                                <p>Investissement initial élevé malgré la baisse continue des prix.</p>
                                <div className="challenge-solution">
                                    <i className="fas fa-lightbulb"></i>
                                    <div>
                                        <strong>Solution :</strong> Aides gouvernementales et financements innovants.
                                    </div>
                                </div>
                            </div>

                            <div className="challenge-card">
                                <div className="challenge-header">
                                    <div className="challenge-icon">
                                        <i className="fas fa-industry"></i>
                                    </div>
                                    <h3>Fabrication</h3>
                                </div>
                                <p>Processus de fabrication énergivore et utilisation de produits chimiques.</p>
                                <div className="challenge-solution">
                                    <i className="fas fa-lightbulb"></i>
                                    <div>
                                        <strong>Solution :</strong> Recyclage amélioré et technologies plus propres.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scène 3D des Défis */}
                        <div className="challenges-3d" data-aos="fade-left">
                            <div className="challenge-3d-container">
                                <div className="challenge-header">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <h4>Simulation 3D des Défis</h4>
                                </div>
                                <div className="challenge-scene" id="challenges-scene"></div>
                                <div className="challenge-controls">
                                    <h5><i className="fas fa-sliders-h"></i> Scénarios :</h5>
                                    <div className="scenario-selector">
                                        <button className="scenario-btn active" onClick={() => handleScenarioChange('intermittence')}>
                                            <i className="fas fa-cloud"></i> Intermittence
                                        </button>
                                        <button className="scenario-btn" onClick={() => handleScenarioChange('storage')}>
                                            <i className="fas fa-battery-full"></i> Stockage
                                        </button>
                                        <button className="scenario-btn" onClick={() => handleScenarioChange('recycling')}>
                                            <i className="fas fa-recycle"></i> Recyclage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Données Réelles */}
            <section id="donnees" className="section">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Données <span className="highlight">Réelles</span> & Statistiques</h2>
                        <p className="section-subtitle">Les chiffres mondiaux de l'énergie solaire en 2024</p>
                    </div>

                    {/* Statistiques en Temps Réel */}
                    <div className="stats-realtime" data-aos="fade-up">
                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-icon">
                                    <i className="fas fa-globe"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value" data-count="1300">1300</div>
                                    <div className="stat-label">GW Installés Mondialement</div>
                                </div>
                            </div>

                            <div className="stat-box">
                                <div className="stat-icon">
                                    <i className="fas fa-sun"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value" data-count="173">173</div>
                                    <div className="stat-label">TWh Produits en 2023</div>
                                </div>
                            </div>

                            <div className="stat-box">
                                <div className="stat-icon">
                                    <i className="fas fa-user-friends"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value" data-count="4.3">4.3</div>
                                    <div className="stat-label">Millions d'Emplois</div>
                                </div>
                            </div>

                            <div className="stat-box">
                                <div className="stat-icon">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-value" data-count="22">22</div>
                                    <div className="stat-label">% Croissance Annuelle</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Carte 3D Mondiale */}
                    <div className="world-map-3d" data-aos="zoom-in">
                        <div className="map-container">
                            <div className="map-header">
                                <i className="fas fa-map-marked-alt"></i>
                                <h3>Carte 3D de la Production Solaire Mondiale</h3>
                            </div>
                            <div className="map-wrapper">
                                <div className="map-scene" id="world-map-scene"></div>
                                <div className="map-legend">
                                    <h4><i className="fas fa-legend"></i> Légende (MW/km²)</h4>
                                    <div className="legend-item high">&gt; 150 (Élevé)</div>
                                    <div className="legend-item medium">50-150 (Moyen)</div>
                                    <div className="legend-item low">&lt; 50 (Faible)</div>
                                    <div className="country-selector">
                                        <select id="countrySelect" onChange={handleCountrySelect}>
                                            <option value="france">🇫🇷 France</option>
                                            <option value="germany">🇩🇪 Allemagne</option>
                                            <option value="china">🇨🇳 Chine</option>
                                            <option value="usa">🇺🇸 États-Unis</option>
                                            <option value="spain">🇪🇸 Espagne</option>
                                        </select>
                                        <button onClick={highlightCountry}>
                                            <i className="fas fa-plane"></i> Explorer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6: Comparaison */}
            <section id="comparaison" className="section bg-comparison">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Comparaison <span className="highlight">Objective</span></h2>
                        <p className="section-subtitle">Analyse comparative entre énergies renouvelables et fossiles</p>
                    </div>

                    <div className="comparison-content">
                        <div className="comparison-grid" data-aos="fade-up">
                            <div className="comparison-item solar">
                                <div className="comparison-header">
                                    <i className="fas fa-sun"></i>
                                    <h3>Énergie Solaire</h3>
                                </div>
                                <div className="comparison-features">
                                    <div className="feature positive">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Renouvelable et propre</span>
                                    </div>
                                    <div className="feature positive">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Faible maintenance</span>
                                    </div>
                                    <div className="feature positive">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Longue durée de vie</span>
                                    </div>
                                    <div className="feature neutral">
                                        <i className="fas fa-minus-circle"></i>
                                        <span>Intermittent</span>
                                    </div>
                                </div>
                                <div className="comparison-stats">
                                    <div className="stat">
                                        <div className="stat-label">Rendement</div>
                                        <div className="stat-value">15-22%</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-label">Coût sur 20 ans</div>
                                        <div className="stat-value">0.05€/kWh</div>
                                    </div>
                                </div>
                            </div>

                            <div className="comparison-item vs">
                                <div className="vs-circle">
                                    <span>VS</span>
                                </div>
                            </div>

                            <div className="comparison-item fossil">
                                <div className="comparison-header">
                                    <i className="fas fa-industry"></i>
                                    <h3>Énergies Fossiles</h3>
                                </div>
                                <div className="comparison-features">
                                    <div className="feature negative">
                                        <i className="fas fa-times-circle"></i>
                                        <span>Émissions CO₂ élevées</span>
                                    </div>
                                    <div className="feature negative">
                                        <i className="fas fa-times-circle"></i>
                                        <span>Ressource limitée</span>
                                    </div>
                                    <div className="feature positive">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Production continue</span>
                                    </div>
                                    <div className="feature negative">
                                        <i className="fas fa-times-circle"></i>
                                        <span>Coûts variables</span>
                                    </div>
                                </div>
                                <div className="comparison-stats">
                                    <div className="stat">
                                        <div className="stat-label">Rendement</div>
                                        <div className="stat-value">30-40%</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-label">Coût sur 20 ans</div>
                                        <div className="stat-value">0.10€/kWh</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Graphique 3D de Comparaison */}
                        <div className="comparison-3d" data-aos="fade-up">
                            <div className="comparison-viz" id="comparison-3d-scene"></div>
                            <div className="comparison-controls">
                                <button className="viz-control">
                                    <i className="fas fa-sun"></i> Avantages Solaire
                                </button>
                                <button className="viz-control">
                                    <i className="fas fa-smog"></i> Problèmes Fossiles
                                </button>
                                <button className="viz-control">
                                    <i className="fas fa-balance-scale"></i> Comparaison
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 7: Technologies Futures */}
            <section id="technologies" className="section">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Technologies <span className="highlight">d'Avenir</span></h2>
                        <p className="section-subtitle">Les innovations qui révolutionneront l'énergie solaire</p>
                    </div>

                    <div className="tech-slider">
                        <div className={`tech-slide ${activeTech === 1 ? 'active' : ''}`}>
                            <div className="tech-content">
                                <div className="tech-info" data-aos="fade-right">
                                    <div className="tech-badge">Nouveau</div>
                                    <h3><i className="fas fa-paint-roller"></i> Peinture Solaire</h3>
                                    <p>Des nanoparticules capables de générer de l'électricité sur n'importe quelle surface. Transformez vos murs, fenêtres et toits en générateurs d'énergie.</p>
                                    <div className="tech-specs">
                                        <div className="spec">
                                            <i className="fas fa-tachometer-alt"></i>
                                            <div>
                                                <strong>Rendement</strong>
                                                <span>20% en laboratoire</span>
                                            </div>
                                        </div>
                                        <div className="spec">
                                            <i className="fas fa-calendar-alt"></i>
                                            <div>
                                                <strong>Disponibilité</strong>
                                                <span>2026-2028</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tech-visual" data-aos="fade-left">
                                    <div className="tech-scene" id="tech1-scene"></div>
                                </div>
                            </div>
                        </div>

                        <div className={`tech-slide ${activeTech === 2 ? 'active' : ''}`}>
                            <div className="tech-content">
                                <div className="tech-info" data-aos="fade-right">
                                    <div className="tech-badge">En Test</div>
                                    <h3><i className="fas fa-road"></i> Routes Solaires</h3>
                                    <p>Revêtements routiers intégrant des cellules photovoltaïques résistantes aux charges lourdes. Transformez les autoroutes en centrales électriques.</p>
                                    <div className="tech-specs">
                                        <div className="spec">
                                            <i className="fas fa-tachometer-alt"></i>
                                            <div>
                                                <strong>Rendement</strong>
                                                <span>15% en conditions réelles</span>
                                            </div>
                                        </div>
                                        <div className="spec">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <div>
                                                <strong>Tests en cours</strong>
                                                <span>France, Chine, Pays-Bas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tech-visual" data-aos="fade-left">
                                    <div className="tech-scene" id="tech2-scene"></div>
                                </div>
                            </div>
                        </div>

                        <div className={`tech-slide ${activeTech === 3 ? 'active' : ''}`}>
                            <div className="tech-content">
                                <div className="tech-info" data-aos="fade-right">
                                    <div className="tech-badge">R&D</div>
                                    <h3><i className="fas fa-satellite"></i> Satellites Solaires</h3>
                                    <p>Centrales solaires spatiales transmettant l'énergie vers la Terre par micro-ondes. Production 24h/24 sans interruption météorologique.</p>
                                    <div className="tech-specs">
                                        <div className="spec">
                                            <i className="fas fa-tachometer-alt"></i>
                                            <div>
                                                <strong>Rendement</strong>
                                                <span>Projet théorique</span>
                                            </div>
                                        </div>
                                        <div className="spec">
                                            <i className="fas fa-hourglass-half"></i>
                                            <div>
                                                <strong>Horizon</strong>
                                                <span>2035-2040</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tech-visual" data-aos="fade-left">
                                    <div className="tech-scene" id="tech3-scene"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tech-navigation">
                        <button className="tech-nav prev" onClick={() => handleTechSlide(activeTech > 1 ? activeTech - 1 : 3)}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <div className="tech-dots">
                            <span className={`dot ${activeTech === 1 ? 'active' : ''}`} onClick={() => handleTechSlide(1)}></span>
                            <span className={`dot ${activeTech === 2 ? 'active' : ''}`} onClick={() => handleTechSlide(2)}></span>
                            <span className={`dot ${activeTech === 3 ? 'active' : ''}`} onClick={() => handleTechSlide(3)}></span>
                        </div>
                        <button className="tech-nav next" onClick={() => handleTechSlide(activeTech < 3 ? activeTech + 1 : 1)}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* Section 8: Défi & Contact */}
            <section id="defi" className="section bg-defi">
                <div className="container">
                    <div className="section-header" data-aos="fade-up">
                        <h2 className="section-title">Défi "<span className="highlight">En trois dimensions</span>"</h2>
                        <p className="section-subtitle">Projet réalisé pour la Nuit de l'Info 2025 - IUT de Marne-la-Vallée</p>
                    </div>

                    <div className="defi-content">
                        <div className="defi-info" data-aos="fade-right">
                            <div className="defi-card">
                                <div className="defi-header">
                                    <i className="fas fa-trophy"></i>
                                    <h3>Défi Relevé</h3>
                                </div>
                                <p>Ce site éducatif intègre <strong>7 scènes 3D interactives</strong> créées avec Three.js, répondant parfaitement au défi "En trois dimensions".</p>
                                <div className="features">
                                    <div className="feature">
                                        <i className="fas fa-cube"></i>
                                        <span>7 Modèles 3D Interactifs</span>
                                    </div>
                                    <div className="feature">
                                        <i className="fas fa-graduation-cap"></i>
                                        <span>Contenu Éducatif Complet</span>
                                    </div>
                                    <div className="feature">
                                        <i className="fas fa-mobile-alt"></i>
                                        <span>Design Responsive</span>
                                    </div>
                                </div>
                            </div>

                            <div className="defi-card">
                                <div className="defi-header">
                                    <i className="fas fa-university"></i>
                                    <h3>IUT de Marne-la-Vallée</h3>
                                </div>
                                <p>Composante de l'Université Gustave Eiffel avec plus de 2 200 étudiantes et étudiants.</p>
                                <ul className="iut-list">
                                    <li><i className="fas fa-graduation-cap"></i> 6 BUT (Bachelor Universitaire de Technologie)</li>
                                    <li><i className="fas fa-chalkboard-teacher"></i> 75% d'enseignants-chercheurs</li>
                                    <li><i className="fas fa-laptop-code"></i> Départements : GCCD, GEA, INFO, MMI, MT2E, TC</li>
                                </ul>
                            </div>
                        </div>

                        <div className="defi-prizes" data-aos="fade-left">
                            <h3><i className="fas fa-award"></i> Récompenses du Défi</h3>
                            <div className="prizes-grid">
                                <div className="prize-item gold">
                                    <div className="prize-medal">
                                        <i className="fas fa-trophy"></i>
                                    </div>
                                    <div className="prize-content">
                                        <h4>1er Prix</h4>
                                        <p className="prize-value">Bon d'achat FNAC 150€</p>
                                        <p className="prize-desc">Projet le plus innovant et complet</p>
                                    </div>
                                </div>

                                <div className="prize-item silver">
                                    <div className="prize-medal">
                                        <i className="fas fa-medal"></i>
                                    </div>
                                    <div className="prize-content">
                                        <h4>2ème Prix</h4>
                                        <p className="prize-value">Bon d'achat FNAC 100€</p>
                                        <p className="prize-desc">Excellente réalisation technique</p>
                                    </div>
                                </div>

                                <div className="prize-item bronze">
                                    <div className="prize-medal">
                                        <i className="fas fa-award"></i>
                                    </div>
                                    <div className="prize-content">
                                        <h4>3ème Prix</h4>
                                        <p className="prize-value">Bon d'achat FNAC 50€</p>
                                        <p className="prize-desc">Projet créatif et bien réalisé</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pied de page */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <a href="#" className="footer-logo">
                                <i className="fas fa-sun"></i>
                                <span>SolarEdu3D</span>
                            </a>
                            <p className="footer-desc">
                                Une plateforme éducative immersive pour comprendre les enjeux de l'énergie solaire et son rôle dans la transition énergétique.
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                                <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                                <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                                <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>

                        <div className="footer-links">
                            <h4>Navigation</h4>
                            <ul>
                                <li><a href="#accueil">Accueil</a></li>
                                <li><a href="#definition">Définition</a></li>
                                <li><a href="#fonctionnement">Fonctionnement</a></li>
                                <li><a href="#avantages">Avantages</a></li>
                                <li><a href="#technologies">Technologies</a></li>
                            </ul>
                        </div>

                        <div className="footer-links">
                            <h4>Ressources</h4>
                            <ul>
                                <li><a href="#">Documentation</a></li>
                                <li><a href="#">Sources de données</a></li>
                                <li><a href="#">Mentions légales</a></li>
                                <li><a href="#">Politique de confidentialité</a></li>
                            </ul>
                        </div>

                        <div className="footer-contact">
                            <h4>Contact</h4>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <span>contact@solaredu3d.fr</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 SolarEdu3D - Projet Nuit de l'Info. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
