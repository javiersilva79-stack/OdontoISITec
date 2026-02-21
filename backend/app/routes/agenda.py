from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.turno import Turno

router = APIRouter(prefix="/agenda", tags=["Agenda"])


@router.get("/")
def agenda_por_fecha(
    fecha: str = Query(...),
    odontologo_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    query = db.query(Turno).filter(Turno.fecha == fecha)

    if odontologo_id:
        query = query.filter(Turno.odontologo_id == odontologo_id)

    return query.order_by(Turno.hora_inicio).all()