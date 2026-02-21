from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.consultorio import Consultorio
from app.schemas.consultorio import ConsultorioCreate, ConsultorioResponse
from app.core.roles import require_role
from app.models.usuario import Usuario

router = APIRouter(prefix="/consultorios", tags=["Consultorios"])

@router.post("/", response_model=ConsultorioResponse)
def crear_consultorio(
    data: ConsultorioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("admin"))
):


    consultorio = Consultorio(**data.model_dump())
    db.add(consultorio)
    db.commit()
    db.refresh(consultorio)
    return consultorio

@router.get("/", response_model=list[ConsultorioResponse])
def listar_consultorios(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("admin"))
):
    return db.query(Consultorio).all()
