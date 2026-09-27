from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db.session import get_db
from app.db.models import User

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)


@router.post("/api/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    print("PASSWORD:", req.password)
    print("PASSWORD LENGTH:", len(req.password))
    print("PASSWORD BYTES:", len(req.password.encode("utf-8")))
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    

    user = User(
        email=req.email,
        name=req.name,
        password_hash=pwd_context.hash(req.password),
        google_id=None,
    )
   
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "name": user.name}

    


@router.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.password_hash or not pwd_context.verify(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"id": user.id, "email": user.email, "name": user.name}