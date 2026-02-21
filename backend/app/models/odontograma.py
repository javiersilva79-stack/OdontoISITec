import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.core.database import Base

class OdontogramaEstado(str, enum.Enum):
    sano = "sano"
    caries = "caries"
    ausente = "ausente"
    tratado = "tratado"
    otro = "otro"

class Odontograma(Base):
    __tablename__ = "odontogramas"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)

    pieza = Column(String(10), nullable=False)
    estado = Column(Enum(OdontogramaEstado, name="odontograma_estado"), nullable=False, server_default="otro")
    observaciones = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)