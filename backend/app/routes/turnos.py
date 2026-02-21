from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.turno import Turno
from app.schemas.turno import TurnoCreate, TurnoResponse

router = APIRouter(prefix="/turnos", tags=["Turnos"])


def _to_dt(fecha, hora):
    # fecha: date, hora: time
    return datetime.combine(fecha, hora)


@router.post("/", response_model=TurnoResponse)
def crear_turno(
    data: TurnoCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion")),
):
    # Validaciones básicas
    if data.duracion_min <= 0 or data.duracion_min > 480:
        raise HTTPException(status_code=400, detail="Duración inválida")

    # Si está cancelado/ausente no tiene sentido crear así, pero lo permitimos igual.
    estado = (data.estado or "reservado").strip().lower()

    # Chequear solapamiento SOLO si el turno bloquea horario
    bloquea = estado not in ("cancelado", "ausente")

    if bloquea:
        nuevo_ini = _to_dt(data.fecha, data.hora_inicio)
        nuevo_fin = nuevo_ini + timedelta(minutes=data.duracion_min)

        turnos_existentes = (
            db.query(Turno)
            .filter(Turno.consultorio_id == data.consultorio_id)
            .filter(Turno.odontologo_id == data.odontologo_id)
            .filter(Turno.fecha == data.fecha)
            .filter(Turno.estado.notin_(["cancelado", "ausente"]))
            .all()
        )

        for t in turnos_existentes:
            t_ini = _to_dt(t.fecha, t.hora_inicio)
            t_fin = t_ini + timedelta(minutes=t.duracion_min)

            # Solapamiento: (ini < otro_fin) y (fin > otro_ini)
            if nuevo_ini < t_fin and nuevo_fin > t_ini:
                raise HTTPException(
                    status_code=409,
                    detail=f"Horario ocupado: se superpone con turno ID {t.id} ({t.hora_inicio} + {t.duracion_min}min)",
                )

    turno = Turno(**data.model_dump())
    db.add(turno)
    db.commit()
    db.refresh(turno)
    return turno


@router.get("/", response_model=list[TurnoResponse])
def listar_turnos(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion")),
):
    return db.query(Turno).order_by(Turno.fecha.desc(), Turno.hora_inicio.asc()).all()


@router.get("/{turno_id}", response_model=TurnoResponse)
def obtener_turno(
    turno_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion")),
):
    turno = db.query(Turno).filter(Turno.id == turno_id).first()
    if not turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return turno

@router.put("/{turno_id}/estado", response_model=TurnoResponse)
def cambiar_estado(
    turno_id: int,
    nuevo_estado: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion")),
):
    turno = db.query(Turno).filter(Turno.id == turno_id).first()

    if not turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")

    nuevo_estado = nuevo_estado.strip().lower()

    if nuevo_estado not in ["reservado", "atendido", "cancelado", "ausente"]:
        raise HTTPException(status_code=400, detail="Estado inválido")

    turno.estado = nuevo_estado
    db.commit()
    db.refresh(turno)

    return turno