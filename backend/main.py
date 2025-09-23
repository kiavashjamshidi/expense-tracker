from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database
from routers import expenses, auth, users, salaries

models.Base.metadata.create_all(bind=database.engine)

def create_default_categories():
    db = database.SessionLocal()
    try:
        existing_categories = db.query(models.Category).count()
        if existing_categories == 0:
            default_categories = [
                {"name": "Food", "description": "Food and dining expenses"},
                {"name": "Transportation", "description": "Travel and commuting costs"},
                {"name": "Entertainment", "description": "Movies, games, and fun activities"},
                {"name": "Utilities", "description": "Electricity, water, gas bills"},
                {"name": "Healthcare", "description": "Medical and health expenses"},
                {"name": "Shopping", "description": "Clothing, electronics, and purchases"},
                {"name": "Rent", "description": "Housing and accommodation costs"},
                {"name": "Clubbing", "description": "Nightlife and club expenses"},
                {"name": "Groceries", "description": "Food shopping and household items"},
                {"name": "Travel", "description": "Vacation and travel expenses"},
                {"name": "Education", "description": "Learning and educational costs"},
                {"name": "Insurance", "description": "Insurance premiums and coverage"},
                {"name": "Phone", "description": "Mobile and phone bills"},
                {"name": "Internet", "description": "Internet and data services"},
                {"name": "Gym", "description": "Fitness and gym memberships"},
                {"name": "Other", "description": "Miscellaneous expenses"}
            ]
            
            for category_data in default_categories:
                category = models.Category(**category_data)
                db.add(category)
            
            db.commit()
    finally:
        db.close()

create_default_categories()

app = FastAPI(
    title="Expense Tracker API",
    description="A simple expense tracker API built with FastAPI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(salaries.router, prefix="/api/salaries", tags=["salaries"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Expense Tracker API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}