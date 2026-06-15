from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"

class TransactionCreate(BaseModel):
    amount: float
    description: str
    category: str
    transaction_type: TransactionType
    date: Optional[datetime] = None

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    transaction_type: Optional[TransactionType] = None
    date: Optional[datetime] = None

class TransactionResponse(TransactionCreate):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    category: str
    limit_amount: float
    month: str

class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    limit_amount: Optional[float] = None
    spent_amount: Optional[float] = None
    month: Optional[str] = None

class BudgetResponse(BudgetCreate):
    id: str
    user_id: str
    spent_amount: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str

class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    budget_status: dict
    recent_transactions: list
