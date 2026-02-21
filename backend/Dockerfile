# Imagen base con Python
FROM python:3.11-slim

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos dependencias
COPY requirements.txt .

# Instalamos dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código
COPY app app

# Comando para iniciar el backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
