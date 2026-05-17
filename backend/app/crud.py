from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas

# --- FUNGSI UNTUK PARKIR ---

def get_parkir(db: Session):
    # Perbaikan Utama: Mengambil koordinat dari geom menggunakan ST_X dan ST_Y
    results = db.query(
        models.Parkir.id,
        models.Parkir.nama_lokasi,
        models.Parkir.alamat,
        models.Parkir.kapasitas_mobil,
        models.Parkir.kapasitas_motor,
        func.ST_Y(models.Parkir.geom).label("latitude"),  # Y adalah Latitude
        func.ST_X(models.Parkir.geom).label("longitude")  # X adalah Longitude
    ).all()
    return results

def create_parkir(db: Session, parkir: schemas.ParkirCreate):
    point = f"POINT({parkir.longitude} {parkir.latitude})"
    
    db_parkir = models.Parkir(
        nama_lokasi=parkir.nama_lokasi,
        alamat=parkir.alamat,
        kapasitas_mobil=parkir.kapasitas_mobil,
        kapasitas_motor=parkir.kapasitas_motor,
        geom=func.ST_GeomFromText(point, 4326)
    )
    
    db.add(db_parkir)
    db.commit()
    db.refresh(db_parkir)
    
    # Tambahkan baris ini agar responnya tidak error:
    db_parkir.latitude = parkir.latitude
    db_parkir.longitude = parkir.longitude
    
    return db_parkir

# --- FUNGSI UNTUK TARIF ---

def create_parkir_tarif(db: Session, tarif: schemas.TarifCreate, parkir_id: int):
    # Menggunakan model_dump() adalah cara terbaru, jika error gunakan .dict()
    db_tarif = models.Tarif(**tarif.model_dump(), parkir_id=parkir_id)
    db.add(db_tarif)
    db.commit()
    db.refresh(db_tarif)
    return db_tarif

# --- FUNGSI PENGHAPUSAN ---

def delete_parkir(db: Session, parkir_id: int):
    db_parkir = db.query(models.Parkir).filter(models.Parkir.id == parkir_id).first()
    if db_parkir:
        db.delete(db_parkir)
        db.commit()
        return True
    return False

def clear_all_parkir(db: Session):
    # Hati-hati! Ini akan menghapus SEMUA isi tabel parkir
    try:
        db.query(models.Parkir).delete()
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False