from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteResponse

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


@router.post("/", response_model=PacienteResponse)
def crear_paciente(
    data: PacienteCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin", "odontologo", "recepcion"))
):
    paciente = Paciente(**data.model_dump())
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente


@router.get("/", response_model=list[PacienteResponse])
def listar_pacientes(
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin", "odontologo", "recepcion"))
):
    return db.query(Paciente).all()


@router.get("/{paciente_id}", response_model=PacienteResponse)
def obtener_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_role("admin", "odontologo", "recepcion"))
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()

    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    return paciente
