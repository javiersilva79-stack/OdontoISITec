from datetime import date, datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


Sexo = Literal["M", "F", "X"]
GrupoSanguineo = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]


class PacienteBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    apellido: str = Field(min_length=1, max_length=120)

    dni: Optional[str] = Field(default=None, max_length=30)
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[Sexo] = None

    telefono: Optional[str] = Field(default=None, max_length=40)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = Field(default=None, max_length=255)
    ciudad: Optional[str] = Field(default=None, max_length=120)
    provincia: Optional[str] = Field(default=None, max_length=120)

    grupo_sanguineo: Optional[GrupoSanguineo] = None
    alergias: Optional[str] = None
    enfermedades_previas: Optional[str] = None
    medicacion_actual: Optional[str] = None
    observaciones: Optional[str] = None

    obra_social: Optional[str] = Field(default=None, max_length=120)
    numero_afiliado: Optional[str] = Field(default=None, max_length=60)
    responsable_legal: Optional[str] = Field(default=None, max_length=200)
    telefono_responsable: Optional[str] = Field(default=None, max_length=40)


class PacienteCreate(PacienteBase):
    consultorio_id: int


class PacienteUpdate(BaseModel):
    # Todo opcional para update (cuando lo implementemos)
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=120)
    apellido: Optional[str] = Field(default=None, min_length=1, max_length=120)

    dni: Optional[str] = Field(default=None, max_length=30)
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[Sexo] = None

    telefono: Optional[str] = Field(default=None, max_length=40)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = Field(default=None, max_length=255)
    ciudad: Optional[str] = Field(default=None, max_length=120)
    provincia: Optional[str] = Field(default=None, max_length=120)

    grupo_sanguineo: Optional[GrupoSanguineo] = None
    alergias: Optional[str] = None
    enfermedades_previas: Optional[str] = None
    medicacion_actual: Optional[str] = None
    observaciones: Optional[str] = None

    obra_social: Optional[str] = Field(default=None, max_length=120)
    numero_afiliado: Optional[str] = Field(default=None, max_length=60)
    responsable_legal: Optional[str] = Field(default=None, max_length=200)
    telefono_responsable: Optional[str] = Field(default=None, max_length=40)

    activo: Optional[bool] = None


class PacienteResponse(PacienteBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    consultorio_id: int
    activo: bool
    created_at: datetime
    updated_at: datetime