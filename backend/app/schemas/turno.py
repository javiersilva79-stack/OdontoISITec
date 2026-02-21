from pydantic import BaseModel
from datetime import date, time
from app.schemas.paciente import PacienteResponse

# =========================
# Schemas para CREAR turno
# =========================

class TurnoBase(BaseModel):
    fecha: date
    hora: time
    duracion_minutos: int = 30
    paciente_id: int
    odontologo_id: int

class TurnoCreate(TurnoBase):
    consultorio_id: int


# =========================
# Schema para RESPUESTA
# =========================

class TurnoResponse(BaseModel):
    id: int
    fecha: date
    hora: time
    duracion_minutos: int

    paciente: PacienteResponse
    odontologo_id: int
    consultorio_id: int

    class Config:
        from_attributes = True

