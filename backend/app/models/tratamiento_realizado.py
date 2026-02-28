import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.sql import func
from app.core.database import Base

class TratamientoEstado(str, enum.Enum):
    pendiente = "pendiente"
    realizado = "realizado"
    cancelado = "cancelado"

from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date, Text, DateTime, Enum
from sqlalchemy.sql import func

class TratamientoRealizado(Base):
    __tablename__ = "tratamientos_realizados"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    odontologo_id = Column(Integer, ForeignKey("odontologos.id"), nullable=False)
    turno_id = Column(Integer, ForeignKey("turnos.id"))
    tratamiento_id = Column(Integer, ForeignKey("tratamientos_catalogo.id"), nullable=False)

    pieza_dental = Column(String(10))
    precio = Column(Numeric(12,2))
    estado = Column(Enum(TratamientoEstado), default=TratamientoEstado.pendiente)

    fecha_inicio = Column(Date, default=date.today)
    fecha_finalizacion = Column(Date)
    observaciones = Column(Text)
    descuento = Column(Numeric(12,2), default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())