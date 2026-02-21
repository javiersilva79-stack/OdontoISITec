from pydantic import BaseModel
from datetime import date, time
from typing import Optional


class TurnoBase(BaseModel):
    consultorio_id: int
    paciente_id: int
    odontologo_id: int
    fecha: date
    hora_inicio: time
    duracion_min: int
    estado: Optional[str] = "reservado"


class TurnoCreate(TurnoBase):
    pass


class TurnoResponse(TurnoBase):
    id: int

    class Config:
        from_attributes = True