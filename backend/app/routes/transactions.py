from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
from datetime import datetime
from app.schemas.schemas import TransactionCreate, TransactionResponse, TransactionUpdate
from app.models.models import Transaction, TransactionType
from app.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])

# In-memory storage (à remplacer par une base de données)
transactions_db = {}

@router.get("", response_model=List[TransactionResponse])
async def get_transactions(
    user_id: str = Depends(get_current_user),
    category: str = None,
    transaction_type: TransactionType = None
):
    """Récupérer les transactions de l'utilisateur"""
    user_transactions = [
        t for t in transactions_db.values()
        if t.get("user_id") == user_id
    ]
    
    if category:
        user_transactions = [t for t in user_transactions if t.get("category") == category]
    
    if transaction_type:
        user_transactions = [t for t in user_transactions if t.get("transaction_type") == transaction_type]
    
    return user_transactions

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str, user_id: str = Depends(get_current_user)):
    """Récupérer une transaction spécifique"""
    transaction = transactions_db.get(transaction_id)
    
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction non trouvée")
    
    if transaction.get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé")
    
    return transaction

@router.post("", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    user_id: str = Depends(get_current_user)
):
    """Créer une nouvelle transaction"""
    new_transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": transaction.amount,
        "description": transaction.description,
        "category": transaction.category,
        "transaction_type": transaction.transaction_type,
        "date": transaction.date or datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    transactions_db[new_transaction["id"]] = new_transaction
    return new_transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: str,
    transaction: TransactionUpdate,
    user_id: str = Depends(get_current_user)
):
    """Mettre à jour une transaction"""
    if transaction_id not in transactions_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction non trouvée")
    
    existing = transactions_db[transaction_id]
    if existing.get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé")
    
    update_data = transaction.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    existing.update(update_data)
    return existing

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str, user_id: str = Depends(get_current_user)):
    """Supprimer une transaction"""
    if transaction_id not in transactions_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction non trouvée")
    
    if transactions_db[transaction_id].get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé")
    
    del transactions_db[transaction_id]
    return {"message": "Transaction supprimée"}
