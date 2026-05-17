from pydantic import BaseModel
from typing import List, Optional

# --- SCHEMA TARIF ---
class TarifBase(BaseModel):
    jenis_kendaraan: str
    biaya: float

class TarifCreate(TarifBase): # Ini yang tadi hilang
    pass

class TarifOut(TarifBase):
    id: int
    parkir_id: int
    class Config:
        from_attributes = True

# --- SCHEMA PARKIR ---
class ParkirBase(BaseModel):
    nama_lokasi: str
    alamat: Optional[str] = None
    kapasitas_mobil: int = 0
    kapasitas_motor: int = 0

class ParkirCreate(ParkirBase):
    latitude: float
    longitude: float

class ParkirOut(ParkirBase):
    id: int
    latitude: float
    longitude: float
    tarifs: List[TarifOut] = [] # Menampilkan daftar tarif jika ada

    class Config:
        from_attributes = True