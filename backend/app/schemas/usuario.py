from pydantic import BaseModel, EmailStr
from typing import Optional


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    rol: str
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True