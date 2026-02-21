from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)

    nombre = Column(String(120), nullable=False)
    apellido = Column(String(120), nullable=False)
    dni = Column(String(30), nullable=True, index=True)
    fecha_nacimiento = Column(Date, nullable=True)
    sexo = Column(String(1), nullable=True)  # M/F/X

    telefono = Column(String(40), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    direccion = Column(String(255), nullable=True)
    ciudad = Column(String(120), nullable=True)
    provincia = Column(String(120), nullable=True)

    grupo_sanguineo = Column(String(3), nullable=True)  # A+, O-, etc
    alergias = Column(Text, nullable=True)
    enfermedades_previas = Column(Text, nullable=True)
    medicacion_actual = Column(Text, nullable=True)
    observaciones = Column(Text, nullable=True)

    obra_social = Column(String(120), nullable=True)
    numero_afiliado = Column(String(60), nullable=True)
    responsable_legal = Column(String(200), nullable=True)
    telefono_responsable = Column(String(40), nullable=True)

    activo = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)