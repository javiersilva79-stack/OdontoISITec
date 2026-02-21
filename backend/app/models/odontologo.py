from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Odontologo(Base):
    __tablename__ = "odontologos"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)

    nombre = Column(String(120), nullable=False)
    apellido = Column(String(120), nullable=False)
    matricula = Column(String(60), nullable=True)
    especialidad = Column(String(120), nullable=True)

    activo = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)