from pydantic import BaseModel


class TratamientoCatalogoBase(BaseModel):
    consultorio_id: int
    nombre: str
    descripcion: str | None = None
    precio_base: float | None = None
    duracion_estimada: int | None = None
    activo: bool = True


class TratamientoCatalogoCreate(TratamientoCatalogoBase):
    pass


class TratamientoCatalogoResponse(TratamientoCatalogoBase):
    id: int

    class Config:
        from_attributes = True