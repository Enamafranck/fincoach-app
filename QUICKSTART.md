# 🚀 FinCoach - Guide de Démarrage Complet

Bienvenue sur le projet FinCoach! Application de gestion financière PWA.

## 📋 Prérequis

### Frontend
- Node.js 18+ et npm
- Navigateur moderne (PWA support)

### Backend
- Python 3.11+
- PostgreSQL 12+ (ou utiliser Docker)
- Redis (optionnel, pour cache)

## 🛠️ Installation Rapide

### 1. Frontend (Vite + React)

```bash
cd c:\Users\HP\Desktop\fincoach-app

# Installer les dépendances
npm install

# Créer le fichier .env
copy .env.example .env

# Éditer .env avec vos paramètres Supabase
# Voir SUPABASE_SETUP.md pour la configuration

# Démarrer le serveur de développement
npm run dev
```

Frontend sera disponible sur: **http://localhost:5173**

### 2. Backend (FastAPI)

```bash
# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
copy .env.example .env

# Éditer .env avec vos paramètres (JWT_SECRET_KEY, DATABASE_URL, etc.)

# Démarrer le serveur FastAPI
python main.py
```

Backend sera disponible sur: **http://localhost:8000**
Documentation API: **http://localhost:8000/docs**

### 3. Base de Données (Optionnel - avec Docker)

```bash
# Depuis la racine du projet
docker-compose up -d

# Vérifier que les services sont lancés
docker-compose ps
```

Cela démarre PostgreSQL et Redis.

## 📁 Structure du Projet

```
fincoach-app/
├── Frontend (Vite + React)
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── services/         # Services API et Supabase
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/               # Assets et manifest
│   ├── index.html
│   ├── vite.config.js        # Config Vite + PWA
│   └── tailwind.config.js
│
├── Backend (FastAPI)
│   ├── app/
│   │   ├── models/           # Modèles de données
│   │   ├── schemas/          # Schémas de validation
│   │   ├── routes/           # Endpoints API
│   │   │   ├── auth.py
│   │   │   ├── transactions.py
│   │   │   ├── budgets.py
│   │   │   └── dashboard.py
│   │   ├── auth.py           # Authentification JWT
│   │   └── config.py         # Configuration
│   ├── main.py               # Point d'entrée
│   └── requirements.txt
│
├── .env.example              # Variables frontend
├── backend/.env.example      # Variables backend
├── docker-compose.yml        # Services (DB, Redis)
├── SUPABASE_SETUP.md         # Guide Supabase
└── QUICKSTART.md            # Ce fichier
```

## 🔐 Configuration Supabase

Pour utiliser l'authentification et la base de données:

1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Suivre les étapes dans [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
4. Remplir vos `.env` avec les clés reçues

## 🎯 Fonctionnalités Implémentées

### Frontend ✅
- [x] PWA avec vite-plugin-pwa
- [x] Interface Tailwind CSS
- [x] Dashboard avec Recharts
- [x] Authentification UI
- [x] Service Worker
- [x] Manifest.json

### Backend ✅
- [x] FastAPI avec Uvicorn
- [x] Authentification JWT
- [x] Endpoints transactions
- [x] Endpoints budgets
- [x] Endpoints dashboard
- [x] Validation Pydantic
- [x] CORS configuré

### Base de Données
- [ ] PostgreSQL (à configurer)
- [ ] Tables (transactions, budgets) - SQL fourni
- [ ] Row Level Security - SQL fourni

## 📝 Commandes Utiles

### Frontend
```bash
npm run dev        # Démarrage développement
npm run build      # Build production
npm run preview    # Prévisualisation build
npm run lint       # Vérifier le code
```

### Backend
```bash
# Depuis le dossier backend
python main.py                    # Démarrage
uvicorn main:app --reload        # Avec rechargement
uvicorn main:app --host 0.0.0.0  # Accessible en réseau
```

### Docker
```bash
docker-compose up      # Démarrer les services
docker-compose down    # Arrêter les services
docker-compose logs -f # Voir les logs
```

## 🧪 Test de l'Application

### 1. Test Authentification
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 2. Test Transactions
```bash
curl -X GET http://localhost:8000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Accéder au Frontend
Ouvrir http://localhost:5173

## 📱 PWA Features

- ✅ Installable sur mobile
- ✅ Works offline (avec service worker)
- ✅ Responsive design
- ✅ Manifest configuré
- ✅ Icons configurées

Pour installer l'app PWA:
1. Ouvrir l'app dans un navigateur mobile
2. Menu > "Ajouter à l'écran d'accueil"

## 🚀 Déploiement

### Frontend
- Netlify/Vercel: Connexion simple avec GitHub
- Build: `npm run build`
- Dossier: `dist/`

### Backend
- Railway/Render: Support FastAPI natif
- Heroku: Utiliser Procfile avec Gunicorn
- VPS: Déployer avec Docker

Voir les dossiers respectifs pour plus de détails.

## 🛠️ Troubleshooting

### Port déjà utilisé
```bash
# Frontend (changer le port)
npm run dev -- --port 3000

# Backend (changer le port)
uvicorn main:app --port 8001
```

### CORS errors
Vérifier que CORS_ORIGINS dans backend/.env inclut votre URL frontend

### Base de données non trouvée
```bash
# Vérifier la connexion
docker-compose ps

# Redémarrer
docker-compose restart postgres
```

## 📚 Ressources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Support

Pour les questions:
1. Vérifier la documentation respective
2. Consulter les issues GitHub
3. Contacter le support

## 📄 Licence

À définir

---

**FinCoach - Gestion Financière Intelligente**

Prêt à démarrer? Suivez les étapes d'installation ci-dessus! 🚀
