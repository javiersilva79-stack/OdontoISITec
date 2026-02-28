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
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False)

    tratamiento_realizado_id = Column(
        Integer,
        ForeignKey("tratamientos_realizados.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    monto = Column(Numeric(12,2), nullable=False)
    medio_pago = Column(Enum(MedioPago), nullable=False)
    estado = Column(Enum(PagoEstado), default=PagoEstado.pagado, nullable=False)
    fecha_pago = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())