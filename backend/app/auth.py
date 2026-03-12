from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
import secrets

load_dotenv()

security = HTTPBasic()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS = {
    "admin": os.getenv("ADMIN_PASSWORD", "1234567tyL"),
    "operator": os.getenv("OPERATOR_PASSWORD", "98765432mjK"),
}


def get_current_user(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    password = USERS.get(credentials.username)

    if not password or not secrets.compare_digest(
        credentials.password.encode("utf-8"),
        password.encode("utf-8"),
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username
