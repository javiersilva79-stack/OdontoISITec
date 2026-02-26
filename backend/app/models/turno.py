from sqlalchemy import Column, Integer, Date, Time, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Turno(Base):
    __tablename__ = "turnos"

    id = Column(Integer, primary_key=True, index=True)

    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    odontologo_id = Column(Integer, ForeignKey("odontologos.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    duracion_min = Column(Integer, nullable=False)

    estado = Column(String(20), nullable=False, default="reservado")

    paciente = relationship("Paciente")
    odontologo = relationship("Odontologo")
    consultorio = relationship("Consultorio")