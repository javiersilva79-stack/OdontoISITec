from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.turno import Turno
from app.models.paciente import Paciente

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/resumen")
def resumen(db: Session = Depends(get_db), _=Depends(require_role("admin","odontologo","recepcion"))):
    hoy = date.today()
    citas_hoy = db.query(Turno).filter(Turno.fecha == hoy).count()
    pacientes_total = db.query(Paciente).count()
    pendientes_pago = 0  # lo dejaremos para cuando hagamos pagos
    tratamientos = 0     # lo dejaremos para cuando hagamos tratamientos

    return {
        "citas_hoy": citas_hoy,
        "pacientes_total": pacientes_total,
        "pendientes_pago": pendientes_pago,
        "tratamientos": tratamientos,
    }