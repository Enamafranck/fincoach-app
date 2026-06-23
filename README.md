# FinCoach

**FinCoach** est une application de gestion financière intelligente, développée avec une architecture full-stack moderne.

## 🚀 À propos

- Frontend: **Vite + React 19 + Tailwind CSS**
- PWA: **vite-plugin-pwa** pour installation mobile et service worker
- Graphiques: **Recharts** pour dashboard financier
- Backend: **FastAPI + Uvicorn**
- Authentification: **JWT** et intégration **Supabase**
- Base de données: **PostgreSQL / Supabase**

## 🧩 Fonctionnalités

- Tableau de bord financier réactif
- Visualisation des revenus et dépenses
- Gestion des transactions
- Suivi des budgets par catégorie
- Authentification sécurisée
- Application installable en tant que PWA

## 📁 Structure du projet

```
fincoach-app/
├── public/                 # Assets, manifest, icônes PWA
├── src/                    # Frontend React
│   ├── components/         # Composants UI
│   ├── services/           # Services API et Supabase
│   ├── App.jsx
│   └── main.jsx
├── backend/                # Backend FastAPI
│   ├── app/
│   ├── main.py
│   └── requirements.txt
├── .env.example            # Variables frontend
├── docker-compose.yml      # Services PostgreSQL / Redis
├── package.json            # Dépendances frontend
├── vite.config.js          # Config Vite + PWA
└── tailwind.config.js      # Config Tailwind
```

## ⚡ Installation rapide

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🌐 Utilisation

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000/docs`

## 📚 Documentation utile

- [QUICKSTART.md](./QUICKSTART.md)
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- [PUSH_TO_GITHUB.md](./PUSH_TO_GITHUB.md)
- [ROADMAP.md](./ROADMAP.md)

## ✍️ Auteur

**Enamafranck**

## 📝 Licence

MIT
