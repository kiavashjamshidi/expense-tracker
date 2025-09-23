from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# Expense schemas
class ExpenseBase(BaseModel):
    description: Optional[str] = None
    amount: float
    category_id: int

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    date: datetime
    user_id: int
    category: Optional[Category] = None
    
    class Config:
        from_attributes = True

# Salary schemas
class SalaryBase(BaseModel):
    description: Optional[str] = None
    amount: float

class SalaryCreate(SalaryBase):
    pass

class Salary(SalaryBase):
    id: int
    date: datetime
    user_id: int
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None