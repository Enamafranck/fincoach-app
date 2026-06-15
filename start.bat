@echo off
REM Script de démarrage complet du projet FinCoach pour Windows
REM Usage: start.bat

echo.
echo ========================================
echo   FinCoach - Setup & Start Script
echo ========================================
echo.

REM Vérifier Node.js
echo [*] Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js non trouve! Veuillez installer Node.js 18+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Vérifier Python
echo [*] Verification de Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python non trouve! Veuillez installer Python 3.11+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] %PYTHON_VERSION%

REM Frontend setup
echo.
echo [*] Configuration du Frontend...
if not exist "node_modules" (
    echo Telechargement et installation des dependances npm...
    call npm install
    if errorlevel 1 (
        echo [X] Erreur lors de l'installation npm
        pause
        exit /b 1
    )
) else (
    echo [OK] node_modules existe deja
)

if not exist ".env" (
    echo Creation du fichier .env
    copy .env.example .env >nul
    echo [!] ATTENTION: Editer .env avec vos parametres Supabase
)

REM Backend setup
echo.
echo [*] Configuration du Backend...
cd backend

if not exist "venv" (
    echo Creation de l'environnement virtuel...
    python -m venv venv
    if errorlevel 1 (
        echo [X] Erreur lors de la creation de venv
        cd ..
        pause
        exit /b 1
    )
)

echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo Installation des dependances Python...
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo [X] Erreur lors de l'installation Python
    cd ..
    pause
    exit /b 1
)

if not exist ".env" (
    echo Creation du fichier .env backend
    copy .env.example .env >nul
    echo [!] ATTENTION: Editer backend\.env avec vos parametres
)

cd ..

echo.
echo ========================================
echo   [OK] Configuration terminee!
echo ========================================
echo.
echo [*] Prochaines etapes:
echo    1. Editer .env avec vos cles Supabase
echo    2. Editer backend\.env avec vos parametres
echo.
echo [*] Pour demarrer:
echo    Frontend:  npm run dev
echo    Backend:   cd backend ^&^& python main.py
echo.
echo [*] Documentation:
echo    - Frontend: http://localhost:5173
echo    - Backend API Docs: http://localhost:8000/docs
echo    - Setup Supabase: voir SUPABASE_SETUP.md
echo.
pause
