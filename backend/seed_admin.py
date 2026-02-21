from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.consultorio import Consultorio
from app.models.usuario import Usuario

EMAIL = "admin@odonto.local"
PASS = "admin123"
ROL = "admin"

db: Session = SessionLocal()

consultorio = db.query(Consultorio).first()
if not consultorio:
    consultorio = Consultorio(nombre="Consultorio Central", activo=True)
    db.add(consultorio)
    db.commit()
    db.refresh(consultorio)

u = db.query(Usuario).filter(Usuario.email == EMAIL).first()
if not u:
    u = Usuario(
        email=EMAIL,
        nombre="Administrador",
        rol=ROL,
        activo=True,
        consultorio_id=consultorio.id,
        password_hash=hash_password(PASS),
    )
    db.add(u)
    db.commit()

print("OK ✅")
print("consultorio_id:", consultorio.id)
print("login email:", EMAIL)
print("login pass :", PASS)

db.close()
