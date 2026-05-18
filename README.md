# JDR Reunion - Site Web Statique

Site web statique pour l'association JDR Reunion, dédié à la promotion des jeux de rôle sur table à La Réunion.

## 🚀 Fonctionnalités

- **Page unique avec défilement** : Trois écrans avec effets de parallax
- **Design responsive** : Optimisé pour mobile et desktop
- **SEO optimisé** : Métadonnées complètes pour les moteurs de recherche
- **Déploiement GitLab Pages** : CI/CD automatisé
- **Thème RPG** : Couleurs et design inspirés des jeux de rôle

## 🛠️ Technologies

- **Next.js 16** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **Static Export** : Génération de site statique pour GitLab Pages

## 📦 Installation

1. Clonez le repository :
```bash
git clone https://gitlab.com/your-username/jdr-reunion.git
cd jdr-reunion
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🚀 Déploiement

### Développement

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run start` : Lance le serveur de production (après build)
- `npm run lint` : Vérifie le code avec ESLint
- `npm run format` : Formate le code avec Prettier

### Production

Le projet est configuré pour un déploiement statique sur GitLab Pages :

1. Poussez vos changements sur la branche `main` ou `master`
2. GitLab CI/CD construira automatiquement le site
3. Le site sera déployé sur `https://your-username.gitlab.io/jdr-reunion/`

## 📁 Structure du Projet

```
jdr-reunion/
├── src/
│   └── app/
│       ├── globals.css          # Styles globaux et Tailwind
│       ├── layout.tsx           # Layout racine avec métadonnées
│       └── page.tsx             # Page principale avec 3 sections
├── public/                      # Assets statiques
├── .gitlab-ci.yml              # Configuration CI/CD
├── next.config.js              # Configuration Next.js
├── package.json                # Dépendances et scripts
├── tailwind.config.ts          # Configuration Tailwind
└── tsconfig.json               # Configuration TypeScript
```

## 🎨 Personnalisation

### Couleurs du thème

Les couleurs principales sont définies dans `tailwind.config.ts` :
- **Primaire** : Violet (#8B5CF6) - pour les éléments principaux
- **Secondaire** : Ambre (#F59E0B) - pour les accents
- **Accent** : Émeraude (#10B981) - pour les succès/confirmations

### Contenu

Modifiez le contenu dans `src/app/page.tsx` :
- **Section 1** : Message d'accueil et call-to-action
- **Section 2** : Mission de l'association et communauté
- **Section 3** : Événements et informations de contact

### Métadonnées SEO

Mettez à jour les métadonnées dans `src/app/layout.tsx` pour optimiser le référencement.

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Contact

JDR Reunion - contact@jdr-reunion.re

Lien du projet : [https://gitlab.com/your-username/jdr-reunion](https://gitlab.com/your-username/jdr-reunion)
