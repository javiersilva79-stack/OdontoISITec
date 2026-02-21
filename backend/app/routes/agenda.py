from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy.orm import joinedload

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.turno import Turno
from app.schemas.turno import TurnoResponse

router = APIRouter(prefix="/agenda", tags=["Agenda"])

@router.get("/diaria", response_model=list[TurnoResponse])
def agenda_diaria(
    fecha: date,
    odontologo_id: int,
    consultorio_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin", "odontologo", "recepcion"))
):
    turnos = (
        db.query(Turno)
        .options(joinedload(Turno.paciente))   # 👈 ESTA LÍNEA ES CLAVE
        .filter(
            Turno.fecha == fecha,
            Turno.odontologo_id == odontologo_id,
            Turno.consultorio_id == consultorio_id
        )
        .order_by(Turno.hora)
        .all()
    )

    return turnos
