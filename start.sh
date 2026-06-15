#!/bin/bash
# Script de démarrage complet du projet FinCoach
# Usage: bash start.sh

echo "🚀 Démarrage du projet FinCoach..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo "Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non trouvé. Veuillez installer Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Vérifier Python
echo "Vérification de Python..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 non trouvé. Veuillez installer Python 3.11+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# Frontend setup
echo ""
echo "📦 Configuration du Frontend..."
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances npm..."
    npm install
else
    echo -e "${GREEN}✓ node_modules existe déjà${NC}"
fi

if [ ! -f ".env" ]; then
    echo "Création du fichier .env"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Éditer .env avec vos paramètres Supabase${NC}"
fi

# Backend setup
echo ""
echo "🐍 Configuration du Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer venv
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "Installation des dépendances Python..."
pip install -r requirements.txt > /dev/null 2>&1

if [ ! -f ".env" ]; then
    echo "Création du fichier .env backend"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Éditer backend/.env avec vos paramètres${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✓ Configuration terminée!${NC}"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Éditer .env avec vos clés Supabase"
echo "2. Éditer backend/.env avec vos paramètres"
echo ""
echo "🚀 Pour démarrer:"
echo "   Frontend:  npm run dev"
echo "   Backend:   cd backend && python main.py"
echo ""
echo "📚 Documentation:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API Docs: http://localhost:8000/docs"
echo "   - Setup Supabase: voir SUPABASE_SETUP.md"
echo ""
