from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.roles import require_role
from app.models.tratamiento_realizado import TratamientoRealizado, TratamientoEstado
from app.schemas.tratamiento_realizado import TratamientoRealizadoLoteCreate

router = APIRouter(prefix="/tratamientos_realizados", tags=["Tratamientos Realizados"])


@router.post("/lote")
def crear_tratamientos_lote(
    data: TratamientoRealizadoLoteCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "odontologo"))
):
    if not data.tratamientos:
        raise HTTPException(status_code=400, detail="Debe enviar al menos un tratamiento")

    nuevos = []

    for item in data.tratamientos:
        tr = TratamientoRealizado(
            turno_id=data.turno_id,
            paciente_id=data.paciente_id,
            odontologo_id=data.odontologo_id,
            consultorio_id=data.consultorio_id,
            tratamiento_id=item.tratamiento_id,
            pieza_dental=item.pieza_dental,
            precio=item.precio,
            descuento=item.descuento,
            observaciones=item.observaciones,
            estado=TratamientoEstado.realizado
        )
        db.add(tr)
        nuevos.append(tr)

    db.commit()

    return {"ok": True, "cantidad": len(nuevos)}