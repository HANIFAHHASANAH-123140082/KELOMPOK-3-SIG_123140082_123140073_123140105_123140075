from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas

def get_all_parkir(db: Session):
    parkirs = db.query(models.Parkir).all()
    result = []
    for p in parkirs:
        result.append({
            "id": p.id,
            "nama": p.nama,
            "alamat": p.alamat,
            "jenis_lahan": p.jenis_lahan,
            "kapasitas_mobil": p.kapasitas_mobil,
            "kapasitas_motor": p.kapasitas_motor,
            "jam_buka": p.jam_buka,
            "jam_tutup": p.jam_tutup,
            "latitude": db.execute(
                func.ST_Y(p.koordinat)
            ).scalar() if p.koordinat else None,
            "longitude": db.execute(
                func.ST_X(p.koordinat)
            ).scalar() if p.koordinat else None,
            "tarifs": p.tarifs,
        })
    return result

def get_parkir_by_id(db: Session, parkir_id: int):
    p = db.query(models.Parkir).filter(models.Parkir.id == parkir_id).first()
    if not p:
        return None
    lat = db.scalar(func.ST_Y(p.koordinat)) if p.koordinat else None
    lng = db.scalar(func.ST_X(p.koordinat)) if p.koordinat else None
    return {
        "id": p.id,
        "nama": p.nama,
        "alamat": p.alamat,
        "jenis_lahan": p.jenis_lahan,
        "kapasitas_mobil": p.kapasitas_mobil,
        "kapasitas_motor": p.kapasitas_motor,
        "jam_buka": p.jam_buka,
        "jam_tutup": p.jam_tutup,
        "latitude": lat,
        "longitude": lng,
        "tarifs": p.tarifs,
    }

def create_parkir(db: Session, parkir: schemas.ParkirCreate):
    point_wkt = f"POINT({parkir.longitude} {parkir.latitude})"
    db_parkir = models.Parkir(
        nama=parkir.nama,
        alamat=parkir.alamat,
        jenis_lahan=parkir.jenis_lahan,
        kapasitas_mobil=parkir.kapasitas_mobil,
        kapasitas_motor=parkir.kapasitas_motor,
        jam_buka=parkir.jam_buka,
        jam_tutup=parkir.jam_tutup,
        koordinat=func.ST_SetSRID(func.ST_GeomFromText(point_wkt), 4326)
    )
    db.add(db_parkir)
    db.commit()
    db.refresh(db_parkir)
    return get_parkir_by_id(db, db_parkir.id)

def update_parkir(db: Session, parkir_id: int, parkir: schemas.ParkirUpdate):
    db_parkir = db.query(models.Parkir).filter(models.Parkir.id == parkir_id).first()
    if not db_parkir:
        return None
    db_parkir.nama = parkir.nama
    db_parkir.alamat = parkir.alamat
    db_parkir.jenis_lahan = parkir.jenis_lahan
    db_parkir.kapasitas_mobil = parkir.kapasitas_mobil
    db_parkir.kapasitas_motor = parkir.kapasitas_motor
    db_parkir.jam_buka = parkir.jam_buka
    db_parkir.jam_tutup = parkir.jam_tutup
    if parkir.latitude and parkir.longitude:
        point_wkt = f"POINT({parkir.longitude} {parkir.latitude})"
        db_parkir.koordinat = func.ST_SetSRID(func.ST_GeomFromText(point_wkt), 4326)
    db.commit()
    return get_parkir_by_id(db, parkir_id)

def delete_parkir(db: Session, parkir_id: int):
    db_parkir = db.query(models.Parkir).filter(models.Parkir.id == parkir_id).first()
    if db_parkir:
        db.delete(db_parkir)
        db.commit()
        return True
    return False

# ===== ENDPOINT SPASIAL =====
def get_parkir_terdekat(db: Session, lat: float, lng: float, limit: int = 5):
    user_point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
    return db.query(
        models.Parkir.id,
        models.Parkir.nama,
        models.Parkir.alamat,
        models.Parkir.jenis_lahan,
        models.Parkir.kapasitas_mobil,
        models.Parkir.kapasitas_motor,
        models.Parkir.jam_buka,
        models.Parkir.jam_tutup,
        func.ST_Y(models.Parkir.koordinat).label("latitude"),
        func.ST_X(models.Parkir.koordinat).label("longitude"),
        func.ST_Distance(
            func.ST_Transform(models.Parkir.koordinat, 32748),
            func.ST_Transform(user_point, 32748)
        ).label("jarak_meter")
    ).order_by("jarak_meter").limit(limit).all()

def get_parkir_dalam_radius(db: Session, lat: float, lng: float, radius_meter: float):
    user_point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
    return db.query(
        models.Parkir.id,
        models.Parkir.nama,
        models.Parkir.alamat,
        models.Parkir.jenis_lahan,
        models.Parkir.kapasitas_mobil,
        models.Parkir.kapasitas_motor,
        models.Parkir.jam_buka,
        models.Parkir.jam_tutup,
        func.ST_Y(models.Parkir.koordinat).label("latitude"),
        func.ST_X(models.Parkir.koordinat).label("longitude"),
        func.ST_Distance(
            func.ST_Transform(models.Parkir.koordinat, 32748),
            func.ST_Transform(user_point, 32748)
        ).label("jarak_meter")
    ).filter(
        func.ST_DWithin(
            func.ST_Transform(models.Parkir.koordinat, 32748),
            func.ST_Transform(user_point, 32748),
            radius_meter
        )
    ).order_by("jarak_meter").all()

# ===== TARIF =====
def get_tarif_by_parkir(db: Session, parkir_id: int):
    return db.query(models.Tarif).filter(models.Tarif.parkir_id == parkir_id).all()

def create_tarif(db: Session, tarif: schemas.TarifCreate, parkir_id: int):
    db_tarif = models.Tarif(**tarif.model_dump(), parkir_id=parkir_id)
    db.add(db_tarif)
    db.commit()
    db.refresh(db_tarif)
    return db_tarif

# ===== KECAMATAN =====
def get_all_kecamatan(db: Session):
    return db.query(models.Kecamatan.id, models.Kecamatan.nama_kecamatan).all()