from fastapi import FastAPI
from app.database import engine, Base
from app import models
from app.api import endpoints # Pastikan ini ada

# Sinkronisasi Database
print("Sedang menyinkronkan database...")
models.Base.metadata.create_all(bind=engine)
print("Database berhasil disinkronkan!")

app = FastAPI(title="WebGIS Parkir Ratu Agung")

# Mendaftarkan Router
app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Koneksi Berhasil!"}