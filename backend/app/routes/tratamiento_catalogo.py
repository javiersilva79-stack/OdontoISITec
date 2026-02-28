from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.roles import require_role
from app.models.tratamiento_catalogo import TratamientoCatalogo
from app.schemas.tratamiento_catalogo import TratamientoCatalogoCreate, TratamientoCatalogoResponse

router = APIRouter(prefix="/tratamientos_catalogo", tags=["Tratamientos Catalogo"])


@router.post("/", response_model=TratamientoCatalogoResponse)
def crear_tratamiento_catalogo(
    data: TratamientoCatalogoCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo"))
):
    tratamiento = TratamientoCatalogo(**data.model_dump())
    db.add(tratamiento)
    db.commit()
    db.refresh(tratamiento)
    return tratamiento


@router.get("/", response_model=list[TratamientoCatalogoResponse])
def listar_tratamientos_catalogo(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    return db.query(TratamientoCatalogo).filter(TratamientoCatalogo.activo == True).all()