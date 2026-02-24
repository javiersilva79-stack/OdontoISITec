from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate, PacienteResponse

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


@router.post("/", response_model=PacienteResponse)
def crear_paciente(
    data: PacienteCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    paciente = Paciente(**data.model_dump())
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente


@router.get("/", response_model=list[PacienteResponse])
def listar_pacientes(
    q: str | None = Query(default=None, description="Buscar por nombre/apellido/dni/teléfono"),
    solo_activos: bool = Query(default=True),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    query = db.query(Paciente)

    if solo_activos:
        query = query.filter(Paciente.activo == True)  # noqa: E712

    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Paciente.nombre.ilike(like),
                Paciente.apellido.ilike(like),
                Paciente.dni.ilike(like),
                Paciente.telefono.ilike(like),
            )
        )

    return query.order_by(Paciente.apellido.asc(), Paciente.nombre.asc()).offset(offset).limit(limit).all()


@router.get("/{paciente_id}", response_model=PacienteResponse)
def obtener_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return paciente


@router.put("/{paciente_id}", response_model=PacienteResponse)
def actualizar_paciente(
    paciente_id: int,
    data: PacienteUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    payload = data.model_dump(exclude_unset=True)
    if not payload:
        return paciente
    
    for k, v in payload.items():
        setattr(paciente, k, v)

    db.commit()
    db.refresh(paciente)
    return paciente


@router.delete("/{paciente_id}")
def desactivar_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente.activo:
        return {"ok": True, "paciente_id": paciente_id, "activo": False}

    paciente.activo = False
    db.commit()
    return {"ok": True, "paciente_id": paciente_id, "activo": False}