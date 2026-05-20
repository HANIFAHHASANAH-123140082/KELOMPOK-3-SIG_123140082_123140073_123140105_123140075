from sqlalchemy import Column, Integer, String, Text, Time, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from .database import Base

class Kecamatan(Base):
    __tablename__ = "kecamatan"
    id = Column(Integer, primary_key=True, index=True)
    nama_kecamatan = Column(String(100), nullable=False)
    batas_wilayah = Column(Geometry(geometry_type='POLYGON', srid=4326))

class Parkir(Base):
    __tablename__ = "parkir"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    alamat = Column(Text)
    koordinat = Column(Geometry(geometry_type='POINT', srid=4326))
    jenis_lahan = Column(String(50))
    kapasitas_mobil = Column(Integer, default=0)
    kapasitas_motor = Column(Integer, default=0)
    jam_buka = Column(Time)
    jam_tutup = Column(Time)
    created_at = Column(TIMESTAMP, server_default=func.now())
    tarifs = relationship("Tarif", back_populates="parkir", cascade="all, delete")

class Tarif(Base):
    __tablename__ = "tarif"
    id = Column(Integer, primary_key=True, index=True)
    parkir_id = Column(Integer, ForeignKey("parkir.id"), nullable=False)
    jenis_kendaraan = Column(String(20), nullable=False)
    tarif_jam_pertama = Column(Integer, nullable=False)
    tarif_jam_berikutnya = Column(Integer, nullable=False)
    parkir = relationship("Parkir", back_populates="tarifs")