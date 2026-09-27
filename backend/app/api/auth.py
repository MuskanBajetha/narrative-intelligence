from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import bcrypt

from app.db.session import get_db
from app.db.models import User

router = APIRouter()


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)


@router.post("/api/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = bcrypt.hashpw(
        req.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user = User(
        email=req.email,
        name=req.name,
        password_hash=password_hash,
        google_id=None,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }


@router.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_valid = bcrypt.checkpw(
        req.password.encode("utf-8"),
        user.password_hash.encode("utf-8"),
    )

    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }
