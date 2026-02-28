from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.core.deps import get_db

import app.models  # 🔴 REGISTRA TODOS LOS MODELOS

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OdontoISITec",
    description="Sistema odontológico web multi-consultorio",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "sistema": "OdontoISITec",
        "estado": "Backend funcionando"
    }

@app.get("/db-test")
def test_db(db: Session = Depends(get_db)):
    return {"db": "conectada correctamente"}

from app.routes.consultorios import router as consultorios_router
from app.routes.usuarios import router as usuarios_router
from app.routes.auth import router as auth_router
from app.routes.pacientes import router as pacientes_router
from app.routes.turnos import router as turnos_router
from app.routes.agenda import router as agenda_router
from app.routes.dashboard import router as dashboard_router
from app.routes.odontologos import router as odontologos_router
from app.routes.tratamientos_realizados import router as tratamientos_realizados_router
from app.routes.tratamiento_catalogo import router as tratamiento_catalogo_router

app.include_router(dashboard_router)
app.include_router(consultorios_router)
app.include_router(usuarios_router)
app.include_router(auth_router)
app.include_router(pacientes_router)
app.include_router(turnos_router)
app.include_router(agenda_router)
app.include_router(odontologos_router)
app.include_router(tratamientos_realizados_router)
app.include_router(tratamiento_catalogo_router)