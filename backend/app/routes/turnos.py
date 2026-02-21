from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.turno import Turno
from app.schemas.turno import TurnoCreate, TurnoResponse

router = APIRouter(prefix="/turnos", tags=["Turnos"])

@router.post("/", response_model=TurnoResponse)
def crear_turno(
    data: TurnoCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin", "odontologo", "recepcion"))
):
    # Validar superposición básica (misma fecha, hora y odontólogo)
    existente = db.query(Turno).filter(
        Turno.fecha == data.fecha,
        Turno.hora == data.hora,
        Turno.odontologo_id == data.odontologo_id
    ).first()

    if existente:
        raise HTTPException(
            status_code=400,
            detail="El odontólogo ya tiene un turno en ese horario"
        )

    turno = Turno(**data.model_dump())
    db.add(turno)
    db.commit()
    db.refresh(turno)
    return turno


@router.get("/", response_model=list[TurnoResponse])
def listar_turnos(
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin", "odontologo", "recepcion"))
):
    return db.query(Turno).all()
