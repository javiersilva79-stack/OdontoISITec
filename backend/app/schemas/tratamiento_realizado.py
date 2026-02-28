from pydantic import BaseModel
from typing import List, Optional


class TratamientoRealizadoCreateItem(BaseModel):
    tratamiento_id: int
    pieza_dental: Optional[str] = None
    precio: float
    descuento: float = 0
    observaciones: Optional[str] = None


class TratamientoRealizadoLoteCreate(BaseModel):
    turno_id: int
    paciente_id: int
    odontologo_id: int
    consultorio_id: int
    tratamientos: List[TratamientoRealizadoCreateItem]