from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas
from .auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Salary)
def create_salary(
    salary: schemas.SalaryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_salary = models.Salary(**salary.dict(), user_id=current_user.id)
    db.add(db_salary)
    db.commit()
    db.refresh(db_salary)
    return db_salary

@router.get("/", response_model=List[schemas.Salary])
def read_salaries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    salaries = db.query(models.Salary).filter(
        models.Salary.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return salaries

@router.get("/{salary_id}", response_model=schemas.Salary)
def read_salary(
    salary_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    salary = db.query(models.Salary).filter(
        models.Salary.id == salary_id,
        models.Salary.user_id == current_user.id
    ).first()
    if salary is None:
        raise HTTPException(status_code=404, detail="Salary not found")
    return salary

@router.put("/{salary_id}", response_model=schemas.Salary)
def update_salary(
    salary_id: int,
    salary: schemas.SalaryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_salary = db.query(models.Salary).filter(
        models.Salary.id == salary_id,
        models.Salary.user_id == current_user.id
    ).first()
    if db_salary is None:
        raise HTTPException(status_code=404, detail="Salary not found")
    
    for key, value in salary.dict().items():
        setattr(db_salary, key, value)
    
    db.commit()
    db.refresh(db_salary)
    return db_salary

@router.delete("/{salary_id}")
def delete_salary(
    salary_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_salary = db.query(models.Salary).filter(
        models.Salary.id == salary_id,
        models.Salary.user_id == current_user.id
    ).first()
    if db_salary is None:
        raise HTTPException(status_code=404, detail="Salary not found")
    
    db.delete(db_salary)
    db.commit()
    return {"message": "Salary deleted successfully"}