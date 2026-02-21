from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user
from app.models.usuario import Usuario

def require_role(*roles: str):
    def _require_role(user: Usuario = Depends(get_current_user)):
        if user.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para esta acción"
            )
        return user
    return _require_role
