# Backend FinCoach API

API FastAPI pour la gestion financière FinCoach.

## Installation

### Prérequis
- Python 3.11+
- pip ou poetry

### Étapes

1. **Créer un environnement virtuel**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configurer les variables d'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos paramètres
# Notamment : JWT_SECRET_KEY, DATABASE_URL, SUPABASE_URL, etc.
```

## Démarrage

```bash
# Mode développement (avec rechargement automatique)
python main.py

# Ou avec uvicorn directement
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

L'API sera disponible sur `http://localhost:8000`

### Documentation Interactive
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Structure du Projet

```
backend/
├── app/
│   ├── models/          # Modèles SQLAlchemy
│   ├── schemas/         # Schémas Pydantic
│   ├── routes/          # Endpoints API
│   ├── auth.py          # Authentification JWT
│   └── config.py        # Configuration
├── main.py              # Point d'entrée
├── requirements.txt     # Dépendances
└── .env.example        # Variables d'exemple
```

## Endpoints Principaux

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/refresh-token` - Rafraîchir le token

### Transactions
- `GET /api/transactions` - Lister les transactions
- `POST /api/transactions` - Créer une transaction
- `PUT /api/transactions/{id}` - Mettre à jour
- `DELETE /api/transactions/{id}` - Supprimer

### Budgets
- `GET /api/budgets` - Lister les budgets
- `POST /api/budgets` - Créer un budget
- `PUT /api/budgets/{id}` - Mettre à jour
- `DELETE /api/budgets/{id}` - Supprimer

### Dashboard
- `GET /api/dashboard/summary` - Résumé financier
- `GET /api/dashboard/analytics` - Analyses
- `GET /api/dashboard/trends` - Tendances

## Configuration pour Production

1. **Changer JWT_SECRET_KEY** dans .env
2. **Configurer DATABASE_URL** avec une vraie base de données
3. **Configurer SUPABASE_URL** et clés
4. **Définir DEBUG=False** dans .env
5. **Utiliser un serveur ASGI** comme Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Technologies

- **FastAPI** - Framework API moderne
- **Uvicorn** - Serveur ASGI
- **SQLAlchemy** - ORM
- **python-jose** - Authentification JWT
- **Pydantic** - Validation de données
- **Supabase** - Backend as a Service

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

Inclure le token dans les requêtes:
```
Authorization: Bearer <token>
```

## Support

Pour les questions ou problèmes, consultez la documentation FastAPI:
- https://fastapi.tiangolo.com/
