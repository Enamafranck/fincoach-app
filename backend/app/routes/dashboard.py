from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from app.schemas.schemas import DashboardSummary
from app.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Import des données (simulées pour l'instant)
from app.routes.transactions import transactions_db
from app.routes.budgets import budgets_db

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(user_id: str = Depends(get_current_user)):
    """Récupérer le résumé du tableau de bord"""
    
    # Filtrer les transactions de l'utilisateur
    user_transactions = [
        t for t in transactions_db.values()
        if t.get("user_id") == user_id
    ]
    
    # Calculer les totaux
    total_income = sum(
        t["amount"] for t in user_transactions
        if t.get("transaction_type") == "income"
    )
    total_expenses = sum(
        t["amount"] for t in user_transactions
        if t.get("transaction_type") == "expense"
    )
    
    net_balance = total_income - total_expenses
    
    # Obtenir les budgets
    user_budgets = [
        b for b in budgets_db.values()
        if b.get("user_id") == user_id
    ]
    
    # Statut des budgets
    budget_status = {}
    for budget in user_budgets:
        percentage = (budget["spent_amount"] / budget["limit_amount"] * 100) if budget["limit_amount"] > 0 else 0
        budget_status[budget["category"]] = {
            "spent": budget["spent_amount"],
            "limit": budget["limit_amount"],
            "percentage": percentage
        }
    
    # Transactions récentes (dernières 10)
    recent_transactions = sorted(
        user_transactions,
        key=lambda x: x.get("date", x.get("created_at")),
        reverse=True
    )[:10]
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": net_balance,
        "budget_status": budget_status,
        "recent_transactions": recent_transactions
    }

@router.get("/analytics")
async def get_analytics(
    user_id: str = Depends(get_current_user),
    period: str = Query("month", description="period: day, week, month, year")
):
    """Récupérer les analyses détaillées"""
    
    user_transactions = [
        t for t in transactions_db.values()
        if t.get("user_id") == user_id
    ]
    
    # Analyser par catégorie
    categories = {}
    for transaction in user_transactions:
        category = transaction.get("category", "Autres")
        if category not in categories:
            categories[category] = {"income": 0, "expense": 0}
        
        if transaction.get("transaction_type") == "income":
            categories[category]["income"] += transaction["amount"]
        else:
            categories[category]["expense"] += transaction["amount"]
    
    return {
        "period": period,
        "categories": categories,
        "total_transactions": len(user_transactions)
    }

@router.get("/trends")
async def get_trends(user_id: str = Depends(get_current_user)):
    """Récupérer les tendances"""
    
    user_transactions = [
        t for t in transactions_db.values()
        if t.get("user_id") == user_id
    ]
    
    # Grouper par mois
    trends = {}
    for transaction in user_transactions:
        date = transaction.get("date", transaction.get("created_at"))
        month = date.strftime("%Y-%m") if isinstance(date, datetime) else str(date)[:7]
        
        if month not in trends:
            trends[month] = {"income": 0, "expense": 0}
        
        if transaction.get("transaction_type") == "income":
            trends[month]["income"] += transaction["amount"]
        else:
            trends[month]["expense"] += transaction["amount"]
    
    return trends
