from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import hash_password
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.core.roles import require_role
from app.core.auth import get_current_user

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("admin"))
):


    existente = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    usuario = Usuario(
        email=data.email,
        password_hash=hash_password(data.password),
        rol=data.rol,
        consultorio_id=data.consultorio_id
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario

@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_role("admin"))
):
    return db.query(Usuario).all()


