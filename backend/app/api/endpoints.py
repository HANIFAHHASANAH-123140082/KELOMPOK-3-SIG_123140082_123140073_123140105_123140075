from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter()

# Perbaikan 1: Ubah schemas.Parkir menjadi schemas.ParkirOut
@router.get("/parkir", response_model=List[schemas.ParkirOut])
def read_parkir(db: Session = Depends(get_db)):
    return crud.get_parkir(db)

# Perbaikan 2: Pastikan POST juga menggunakan schemas.ParkirOut untuk responnya
@router.post("/parkir", response_model=schemas.ParkirOut)
def create_parkir(parkir: schemas.ParkirCreate, db: Session = Depends(get_db)):
    return crud.create_parkir(db=db, parkir=parkir)

# Tambahkan endpoint baru ini di bawah router.post

@router.delete("/parkir/{parkir_id}")
def delete_parkir_by_id(parkir_id: int, db: Session = Depends(get_db)):
    success = crud.delete_parkir(db, parkir_id)
    if not success:
        raise HTTPException(status_code=404, detail="Data parkir tidak ditemukan")
    return {"message": f"Data parkir ID {parkir_id} berhasil dihapus"}

@router.delete("/parkir-reset-semua")
def reset_tabel_parkir(db: Session = Depends(get_db)):
    # Fungsi ini untuk membersihkan data coba-coba kemarin
    success = crud.clear_all_parkir(db)
    if success:
        return {"message": "Semua data parkir berhasil dibersihkan. Sekarang tabel kosong dan siap untuk data final!"}
    return {"message": "Gagal membersihkan data"}