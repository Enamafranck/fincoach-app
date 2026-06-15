from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
from datetime import datetime
from app.schemas.schemas import BudgetCreate, BudgetResponse, BudgetUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])

# In-memory storage
budgets_db = {}

@router.get("", response_model=List[BudgetResponse])
async def get_budgets(user_id: str = Depends(get_current_user), month: str = None):
    """Récupérer les budgets de l'utilisateur"""
    user_budgets = [
        b for b in budgets_db.values()
        if b.get("user_id") == user_id
    ]
    
    if month:
        user_budgets = [b for b in user_budgets if b.get("month") == month]
    
    return user_budgets

@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(budget_id: str, user_id: str = Depends(get_current_user)):
    """Récupérer un budget spécifique"""
    budget = budgets_db.get(budget_id)
    
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget non trouvé")
    
    if budget.get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé")
    
    return budget

@router.post("", response_model=BudgetResponse)
async def create_budget(
    budget: BudgetCreate,
    user_id: str = Depends(get_current_user)
):
    """Créer un nouveau budget"""
    new_budget = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "category": budget.category,
        "limit_amount": budget.limit_amount,
        "spent_amount": 0.0,
        "month": budget.month,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    budgets_db[new_budget["id"]] = new_budget
    return new_budget

@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    budget: BudgetUpdate,
    user_id: str = Depends(get_current_user)
):
    """Mettre à jour un budget"""
    if budget_id not in budgets_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget non trouvé")
    
    existing = budgets_db[budget_id]
    if existing.get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé")
    
    update_data = budget.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    existing.update(update_data)
    return existing

@router.delete("/{budget_id}")
async def delete_budget(budget_id: str, user_id: str = Depends(get_current_user)):
    """Supprimer un budget"""
    if budget_id not in budgets_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget non trouvé")
    
    if budgets_db[budget_id].get("user_id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Non autorisé")
    
    del budgets_db[budget_id]
    return {"message": "Budget supprimé"}
