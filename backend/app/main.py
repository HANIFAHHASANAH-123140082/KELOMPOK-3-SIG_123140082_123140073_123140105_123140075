from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.api import endpoints

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WebGIS Parkir Publik - Kecamatan Ratu Agung",
    description="REST API untuk sistem informasi parkir berbasis spasial",
    version="1.0.0"
)

# CORS agar frontend bisa akses backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "WebGIS Parkir API berjalan!", "docs": "/docs"}