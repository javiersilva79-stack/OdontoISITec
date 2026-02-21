from sqlalchemy import Column, Integer, String, Boolean, Text, Numeric, ForeignKey
from app.core.database import Base

class TratamientoCatalogo(Base):
    __tablename__ = "tratamientos_catalogo"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)

    nombre = Column(String(160), nullable=False)
    descripcion = Column(Text, nullable=True)

    precio_base = Column(Numeric(12, 2), nullable=True)
    duracion_estimada = Column(Integer, nullable=True)  # minutos

    activo = Column(Boolean, nullable=False, server_default="true")