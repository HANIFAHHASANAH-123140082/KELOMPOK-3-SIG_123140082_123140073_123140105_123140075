from fastapi import APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter()

# ===== PARKIR =====
@router.get("/parkir", response_model=List[schemas.ParkirOut])
def read_all_parkir(db: Session = Depends(get_db)):
    return crud.get_all_parkir(db)

@router.get("/parkir/terdekat")
def get_parkir_terdekat(lat: float, lng: float, limit: int = 5, db: Session = Depends(get_db)):
    results = crud.get_parkir_terdekat(db, lat, lng, limit)
    return [dict(r._mapping) for r in results]

@router.get("/parkir/dalam-radius")
def get_parkir_dalam_radius(lat: float, lng: float, radius: float = 1000, db: Session = Depends(get_db)):
    results = crud.get_parkir_dalam_radius(db, lat, lng, radius)
    return [dict(r._mapping) for r in results]

@router.get("/parkir/{parkir_id}", response_model=schemas.ParkirOut)
def read_parkir_by_id(parkir_id: int, db: Session = Depends(get_db)):
    result = crud.get_parkir_by_id(db, parkir_id)
    if not result:
        raise HTTPException(status_code=404, detail="Parkir tidak ditemukan")
    return result

@router.post("/parkir", response_model=schemas.ParkirOut)
def create_parkir(parkir: schemas.ParkirCreate, db: Session = Depends(get_db)):
    return crud.create_parkir(db, parkir)

@router.put("/parkir/{parkir_id}", response_model=schemas.ParkirOut)
def update_parkir(parkir_id: int, parkir: schemas.ParkirUpdate, db: Session = Depends(get_db)):
    result = crud.update_parkir(db, parkir_id, parkir)
    if not result:
        raise HTTPException(status_code=404, detail="Parkir tidak ditemukan")
    return result

@router.delete("/parkir/{parkir_id}")
def delete_parkir(parkir_id: int, db: Session = Depends(get_db)):
    if not crud.delete_parkir(db, parkir_id):
        raise HTTPException(status_code=404, detail="Parkir tidak ditemukan")
    return {"message": f"Parkir ID {parkir_id} berhasil dihapus"}

# ===== TARIF =====
@router.get("/tarif/{parkir_id}", response_model=List[schemas.TarifOut])
def get_tarif(parkir_id: int, db: Session = Depends(get_db)):
    return crud.get_tarif_by_parkir(db, parkir_id)

@router.post("/tarif/{parkir_id}", response_model=schemas.TarifOut)
def create_tarif(parkir_id: int, tarif: schemas.TarifCreate, db: Session = Depends(get_db)):
    return crud.create_tarif(db, tarif, parkir_id)

# ===== KECAMATAN =====
@router.get("/kecamatan")
def get_kecamatan(db: Session = Depends(get_db)):
    return crud.get_all_kecamatan(db)