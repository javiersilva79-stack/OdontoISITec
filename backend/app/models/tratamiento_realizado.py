import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.sql import func
from app.core.database import Base

class TratamientoEstado(str, enum.Enum):
    pendiente = "pendiente"
    realizado = "realizado"
    cancelado = "cancelado"

class TratamientoRealizado(Base):
    __tablename__ = "tratamientos_realizados"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    odontologo_id = Column(Integer, ForeignKey("odontologos.id"), nullable=False, index=True)
    turno_id = Column(Integer, ForeignKey("turnos.id"), nullable=True, index=True)

    tratamiento_id = Column(Integer, ForeignKey("tratamientos_catalogo.id"), nullable=False, index=True)
    pieza_dental = Column(String(10), nullable=True)

    precio = Column(Numeric(12, 2), nullable=True)
    estado = Column(Enum(TratamientoEstado, name="tratamiento_estado"), nullable=False, server_default="pendiente")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)