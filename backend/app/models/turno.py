import enum
from sqlalchemy import Column, Integer, Date, Time, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.core.database import Base

class TurnoEstado(str, enum.Enum):
    reservado = "reservado"
    confirmado = "confirmado"
    atendido = "atendido"
    cancelado = "cancelado"

class Turno(Base):
    __tablename__ = "turnos"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    odontologo_id = Column(Integer, ForeignKey("odontologos.id"), nullable=False, index=True)

    fecha = Column(Date, nullable=False, index=True)
    hora = Column(Time, nullable=False)
    duracion_minutos = Column(Integer, nullable=False, server_default="30")

    estado = Column(Enum(TurnoEstado, name="turno_estado"), nullable=False, server_default="reservado")
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)