Titer de projet : trois-dimensions


## 1.Description du Defit :

SolarEdu3D est un site web éducatiants et aux utilisateurs de comprendre le fonctionnement de l'énergie solaire, ses avantages et ses défis, à travers des scènes 3D réalistes et des explications structurées qui ff et innovant qui s'appuie sur la technologie 3D pour expliquer les concepts de l'énergie solaire de manière interactive et visuellement attrayante.
Le projet combine des graphismes en trois dimensions, réalisés avec la bibliothèque Three.js, et un contenu scientifique simplifié pour offrir une expérience d'apprentissage moderne et ludique.
L'objectif de SolarEdu3D est de permettre aux étudiacilitent l'assimilation de concepts complexes de façon simple et claire.


 ## 2.les technologies 3D a été utilisée dans le projet pour :

 Le projet utilise Three.js comme moteur principal pour créer et manipuler des scènes 3D avec WebGL, incluant caméras interactives, matériaux avancés et effets d’éclairage réalistes.
Des modèles 3D au format GLB/GLTF (batterie, nuage, Terre, soleil…) sont intégrés afin de représenter des objets complexes avec précision.

Le système repose sur différentes géométries 3D (sphères, cônes, boîtes, cylindres, plans) ainsi que sur un éclairage dynamique combinant lumière directionnelle, ambiante et effets émissifs.
Des particules 3D animées permettent d’ajouter des effets visuels fluides et immersifs.

L’interactivité est assurée via OrbitControls, des sliders et des boutons permettant de manipuler les éléments en temps réel.
Les animations incluent rotations, variations d’échelle et mouvements dynamiques.

Les matériaux et shaders sont gérés pour offrir transparence, reflets et couleurs dynamiques.
Une structure hiérarchique (Groupes) optimise les performances et organise les objets.

Enfin, un système de géolocalisation 3D permet de convertir des coordonnées latitude/longitude en positions 3D pour afficher une carte mondiale interactive.


## 3. Structure du projet "trois-dimensions" 


trois-dimensions/
├── assets/
├── index.html
├── README.md
├── script.js
└── style.css


## 04 : Méthode pour exécuter le projet : 


Étape 1 : Assurez-vous d'avoir Node.js installé sur votre ordinateur (version 18 ou supérieure recommandée).

Étape 2 : Ouvrez un terminal ou une invite de commandes sur votre ordinateur.

Étape 3 : Naviguez vers le dossier du projet en tapant la commande "cd trois-dimensions" puis appuyez sur Entrée.

Étape 4 : Installez toutes les dépendances nécessaires en tapant la commande "npm install" puis appuyez sur Entrée. Attendez que l'installation soit terminée.

Étape 5 : Lancez le serveur de développement en tapant la commande "npm run dev" puis appuyez sur Entrée.

Étape 6 : Une fois le serveur démarré, ouvrez votre navigateur web et accédez à l'adresse "http://localhost:3000" pour voir l'application en fonctionnement.



## 05 : Fonctionnalités Éducatives Principales


1. Système de Navigation Interactive

Menu de navigation responsive avec menu hamburger pour mobile

8 sections principales : Accueil, Définition, Fonctionnement, Avantages, Inconvénients, Données, Comparaison, Technologies

Défilement fluide avec surbrillance automatique des sections actives

2. Sept (7) Scènes 3D Interactives
A. Scène du Soleil (Hero Section)

Soleil 3D animé avec rayons rotatifs et particules

Effets lumineux dynamiques avec pulsation

Particules flottantes pour l’ambiance

B. Scène du Rayonnement Solaire

Modèle interactif de la Terre avec simulation des rayons

Activation/désactivation du flux de rayonnement

Contrôle de l’angle de caméra

Particules simulant la transmission de l’énergie solaire

C. Scène du Processus Photovoltaïque

Panneau solaire interactif avec cellules animées

Animation des électrons illustrant la production d’électricité

Contrôles en temps réel :

Intensité solaire (0–100 %)

Angle du panneau (0–90°)

Bouton de simulation complète

D. Scène des Bénéfices Environnementaux

Visualisation d’une forêt en 3D

Animation de particules représentant le CO₂

Statistiques environnementales en temps réel :

Compteur d’arbres sauvés

CO₂ évitée (kg)

Pétrole économisé (L)

E. Scène des Défis & Limites

Changement de scénarios :

Intermittence : nuages affectant la production

Stockage : systèmes de batteries animés

Recyclage : visualisation du recyclage des panneaux

F. Carte Mondiale 3D

Globe terrestre interactif

Visualisation des données de production solaire par pays

Marqueurs colorés selon l’intensité de production

Sélection et mise en surbrillance de pays

Pays pris en charge : France, Allemagne, Chine, USA, Espagne, Inde

G. Scène des Technologies Futures

Slider présentant 3 innovations :

Peinture Solaire (2026–2028) – Génération via nanoparticules

Routes Solaires – Surfaces routières photovoltaïques

Satellites Solaires (2035–2040) – Stations d’énergie orbites

3. Visualisation des Données
Tableau de Bord en Temps Réel :

1300 GW installés dans le monde

173 TWh produits en 2023

4,3 millions d’emplois

22 % de croissance annuelle

Visualisation 3D Comparée :

Comparaison solaire vs énergies fossiles

Représentation animée des flux d’énergie

Contrôles interactifs pour changer de perspective

4. Contenu Éducatif Structuré
Section Définition

Explication scientifique

Photovoltaïque vs Thermique

Importance mondiale et impact climatique

Section Fonctionnement

Processus en 4 étapes :

Rayonnement solaire

Absorption photovoltaïque

Création du courant

Conversion AC/DC

Section Avantages

Avantages environnementaux

Gains économiques

Innovations technologiques

Section Inconvénients

Problèmes d’intermittence et solutions

Coûts initiaux et financements

Impacts de fabrication

5. Contrôles & Interactions

Curseur intensité du soleil

Contrôle d’angle des panneaux

Mise à jour en temps réel des scènes

Activation/désactivation des animations

Sélecteur de pays + géolocalisation 3D

Slider des technologies futures

6. Caractéristiques Techniques
Moteur 3D (Three.js)

Rendu WebGL

OrbitControls pour la caméra

Systèmes de particules

Éclairage dynamique et matériaux avancés

Design Responsive

Menu mobile

Scènes 3D adaptatives

Contrôles tactiles

Optimisation des Performances

Rendu WebGL haute performance

Optimisation du pixel ratio

Nettoyage et gestion mémoire proactive

Animations

Animations AOS lors du scroll

Rendu 3D fluide à 60 fps

Effets interactifs (couleurs, opacité, survols)

7. Expérience Utilisateur

Effet parallaxe avec soleil 3D

Animations de chargement

Boutons interactifs avec feedback visuel

Fonctionnement basique même sans JavaScript

Structure HTML sémantique pour accessibilité

8. Gestion du Contenu

Architecture modulaire

Mise à jour dynamique des scénarios

Gestion des statistiques en temps réel

Cohérence graphique (thème unifié)

9. Intégration d’Assets Externes

Modèles 3D GLB (batterie, nuage, Terre, soleil)

Icônes SVG

Icônes Font Awesome

10. Développement & Déploiement

Framework Next.js (architecture moderne React)

TypeScript pour un code sécurisé

CSS Modules pour un stylage isolé

Serveur de développement (npm run dev)

Build optimisé pour la production


## 06 :hébergement
La plateforme est entièrement statique et peut être déployée facilement sur n’importe quel service d’hébergement web.
Pour ce projet, le déploiement a été réalisé via Vercel, permettant d’accéder à la plateforme en ligne de manière fiable, rapide et optimisée.

https://trois-dimensions-gt8u.vercel.app/
