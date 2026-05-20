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

# ===== GEOJSON ENDPOINTS =====
@router.get("/parkir/geojson")
def get_parkir_geojson(db: Session = Depends(get_db)):
    parkirs = crud.get_all_parkir(db)
    features = []
    for p in parkirs:
        if p["latitude"] and p["longitude"]:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [p["longitude"], p["latitude"]]
                },
                "properties": {
                    "id": p["id"],
                    "nama": p["nama"],
                    "alamat": p["alamat"],
                    "jenis_lahan": p["jenis_lahan"],
                    "kapasitas_mobil": p["kapasitas_mobil"],
                    "kapasitas_motor": p["kapasitas_motor"],
                    "jam_buka": str(p["jam_buka"]) if p["jam_buka"] else None,
                    "jam_tutup": str(p["jam_tutup"]) if p["jam_tutup"] else None,
                }
            })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/kecamatan/geojson")
def get_kecamatan_geojson(db: Session = Depends(get_db)):
    return {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [102.255, -3.780],
                    [102.285, -3.780],
                    [102.285, -3.810],
                    [102.255, -3.810],
                    [102.255, -3.780]
                ]]
            },
            "properties": {
                "nama": "Kecamatan Ratu Agung",
                "kota": "Kota Bengkulu"
            }
        }]
    }

# ===== KECAMATAN =====
@router.get("/kecamatan")
def get_kecamatan(db: Session = Depends(get_db)):
    return crud.get_all_kecamatan(db)