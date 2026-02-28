from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.deps import get_db
from app.core.roles import require_role
from app.models.paciente import Paciente
from app.schemas.paciente import PacienteCreate, PacienteUpdate, PacienteResponse

from sqlalchemy import func
from app.models.tratamiento_realizado import TratamientoRealizado
from app.models.tratamiento_catalogo import TratamientoCatalogo
from app.models.pago import Pago
from app.schemas.paciente import PacienteResumenResponse

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

@router.get("/{paciente_id}/resumen", response_model=PacienteResumenResponse)
def resumen_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo", "recepcion"))
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    # Subquery pagos por prestación
    pagos_subq = (
        db.query(
            Pago.tratamiento_realizado_id,
            func.coalesce(func.sum(Pago.monto), 0).label("total_pagado")
        )
        .group_by(Pago.tratamiento_realizado_id)
        .subquery()
    )

    # Prestaciones con cálculo de deuda
    prestaciones = (
        db.query(
            TratamientoRealizado.id,
            TratamientoCatalogo.nombre.label("tratamiento"),
            TratamientoRealizado.pieza_dental.label("pieza"),
            TratamientoRealizado.estado,
            TratamientoRealizado.precio,
            TratamientoRealizado.descuento,
            func.coalesce(pagos_subq.c.total_pagado, 0).label("total_pagado"),
            (
                func.coalesce(TratamientoRealizado.precio, 0)
                - func.coalesce(TratamientoRealizado.descuento, 0)
                - func.coalesce(pagos_subq.c.total_pagado, 0)
            ).label("deuda")
        )
        .join(TratamientoCatalogo, TratamientoCatalogo.id == TratamientoRealizado.tratamiento_id)
        .outerjoin(pagos_subq, pagos_subq.c.tratamiento_realizado_id == TratamientoRealizado.id)
        .filter(TratamientoRealizado.paciente_id == paciente_id)
        .all()
    )

    deuda_total = sum(p.deuda for p in prestaciones if p.deuda)

    tiene_deuda = deuda_total > 0

    pagos_recientes = (
        db.query(Pago)
        .join(TratamientoRealizado, TratamientoRealizado.id == Pago.tratamiento_realizado_id)
        .filter(TratamientoRealizado.paciente_id == paciente_id)
        .order_by(Pago.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "paciente": paciente,
        "deuda_total": deuda_total,
        "tiene_deuda": tiene_deuda,
        "prestaciones_activas": prestaciones,
        "pagos_recientes": pagos_recientes
    }

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