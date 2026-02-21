import enum
from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.sql import func
from app.core.database import Base

class MedioPago(str, enum.Enum):
    efectivo = "efectivo"
    tarjeta = "tarjeta"
    transferencia = "transferencia"
    obra_social = "obra_social"

class PagoEstado(str, enum.Enum):
    pagado = "pagado"
    pendiente = "pendiente"

class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    turno_id = Column(Integer, ForeignKey("turnos.id"), nullable=True, index=True)

    monto = Column(Numeric(12, 2), nullable=False)
    medio_pago = Column(Enum(MedioPago, name="medio_pago"), nullable=False)
    estado = Column(Enum(PagoEstado, name="pago_estado"), nullable=False, server_default="pagado")

    fecha_pago = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)