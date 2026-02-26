from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.deps import get_db
from app.models.odontologo import Odontologo
from pydantic import BaseModel

router = APIRouter(prefix="/odontologos", tags=["Odontologos"])


# ===== SCHEMAS =====

class OdontologoBase(BaseModel):
    nombre: str
    apellido: str
    matricula: Optional[str] = None
    especialidad: Optional[str] = None
    activo: Optional[bool] = True


class OdontologoCreate(OdontologoBase):
    consultorio_id: int


class OdontologoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    matricula: Optional[str] = None
    especialidad: Optional[str] = None
    activo: Optional[bool] = None


class OdontologoResponse(OdontologoBase):
    id: int
    consultorio_id: int

    class Config:
        from_attributes = True


# ===== LISTAR =====

@router.get("/", response_model=List[OdontologoResponse])
def listar_odontologos(
    solo_activos: bool = True,
    db: Session = Depends(get_db),
):
    query = db.query(Odontologo)

    if solo_activos:
        query = query.filter(Odontologo.activo == True)

    return query.order_by(Odontologo.apellido).all()


# ===== OBTENER UNO =====

@router.get("/{id}", response_model=OdontologoResponse)
def obtener_odontologo(id: int, db: Session = Depends(get_db)):
    odontologo = db.query(Odontologo).filter(Odontologo.id == id).first()

    if not odontologo:
        raise HTTPException(status_code=404, detail="Odontólogo no encontrado")

    return odontologo


# ===== CREAR =====

@router.post("/", response_model=OdontologoResponse)
def crear_odontologo(datos: OdontologoCreate, db: Session = Depends(get_db)):
    nuevo = Odontologo(**datos.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


# ===== ACTUALIZAR =====

@router.put("/{id}", response_model=OdontologoResponse)
def actualizar_odontologo(id: int, datos: OdontologoUpdate, db: Session = Depends(get_db)):
    odontologo = db.query(Odontologo).filter(Odontologo.id == id).first()

    if not odontologo:
        raise HTTPException(status_code=404, detail="Odontólogo no encontrado")

    for key, value in datos.dict(exclude_unset=True).items():
        setattr(odontologo, key, value)

    db.commit()
    db.refresh(odontologo)
    return odontologo