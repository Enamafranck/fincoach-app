from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
import uuid
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse
from app.auth import hash_password, create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory user storage (à remplacer par une base de données)
users_db = {}

@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    """Créer un nouveau compte utilisateur"""
    # Vérifier si l'utilisateur existe déjà
    if any(u.get("email") == user.email for u in users_db.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà utilisé"
        )
    
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user.password)
    
    users_db[user_id] = {
        "id": user_id,
        "email": user.email,
        "password": hashed_password
    }
    
    # Créer le token JWT
    access_token = create_access_token(
        data={"sub": user_id, "email": user.email}
    )
    
    return {
        "access_token": access_token,
        "user_id": user_id
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Se connecter avec email et mot de passe"""
    # Trouver l'utilisateur par email
    user = None
    for u in users_db.values():
        if u.get("email") == credentials.email:
            user = u
            break
    
    if not user or not verify_password(credentials.password, user.get("password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects"
        )
    
    # Créer le token JWT
    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"]}
    )
    
    return {
        "access_token": access_token,
        "user_id": user["id"]
    }

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(current_user_id: str):
    """Rafraîchir le token d'accès"""
    user = users_db.get(current_user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Créer un nouveau token
    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"]}
    )
    
    return {
        "access_token": access_token,
        "user_id": user["id"]
    }
