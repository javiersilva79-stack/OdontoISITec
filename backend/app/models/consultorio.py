from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Consultorio(Base):
    __tablename__ = "consultorios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(120), nullable=False)

    direccion = Column(String(255), nullable=True)
    telefono = Column(String(40), nullable=True)
    email = Column(String(255), nullable=True)

    activo = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 🔑 RELACIÓN
    pacientes = relationship("Paciente", back_populates="consultorio")