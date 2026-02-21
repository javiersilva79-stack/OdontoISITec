from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional


class ConsultorioBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    direccion: Optional[str] = Field(default=None, max_length=255)
    telefono: Optional[str] = Field(default=None, max_length=40)
    email: Optional[EmailStr] = None


class ConsultorioCreate(ConsultorioBase):
    pass


class ConsultorioResponse(ConsultorioBase):
    id: int
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True