from pydantic import BaseModel
from typing import List, Optional
from datetime import time

class TarifBase(BaseModel):
    jenis_kendaraan: str
    tarif_jam_pertama: int
    tarif_jam_berikutnya: int

class TarifCreate(TarifBase):
    pass

class TarifOut(TarifBase):
    id: int
    parkir_id: int
    class Config:
        from_attributes = True

class ParkirBase(BaseModel):
    nama: str
    alamat: Optional[str] = None
    jenis_lahan: Optional[str] = None
    kapasitas_mobil: int = 0
    kapasitas_motor: int = 0
    jam_buka: Optional[time] = None
    jam_tutup: Optional[time] = None

class ParkirCreate(ParkirBase):
    latitude: float
    longitude: float

class ParkirUpdate(ParkirBase):
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ParkirOut(ParkirBase):
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    tarifs: List[TarifOut] = []
    class Config:
        from_attributes = True

class ParkirTerdekat(ParkirOut):
    jarak_meter: Optional[float] = None