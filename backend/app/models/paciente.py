from sqlalchemy import Column, Integer, String, Boolean, Date, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)

    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)

    nombre = Column(String(120), nullable=False)
    apellido = Column(String(120), nullable=False)

    telefono = Column(String(40), nullable=True)
    dni = Column(String(20), nullable=True, index=True)
    fecha_nacimiento = Column(Date, nullable=True)

    observaciones = Column(Text, nullable=True)

    activo = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    consultorio = relationship("Consultorio", back_populates="pacientes")