from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .database import Base

class Kecamatan(Base):
    __tablename__ = "kecamatan"

    id = Column(Integer, primary_key=True, index=True)
    nama_kecamatan = Column(String, nullable=False)
    # Geometri Polygon untuk batas wilayah
    geom = Column(Geometry(geometry_type='POLYGON', srid=4326))

class Parkir(Base):
    __tablename__ = "parkir"

    id = Column(Integer, primary_key=True, index=True)
    nama_lokasi = Column(String, nullable=False)
    alamat = Column(String)
    kapasitas_mobil = Column(Integer, default=0)
    kapasitas_motor = Column(Integer, default=0)
    # Geometri Point untuk lokasi (Longitude, Latitude)
    geom = Column(Geometry(geometry_type='POINT', srid=4326))

    # Relasi ke Tabel Tarif
    tarifs = relationship("Tarif", back_populates="parkir")

class Tarif(Base):
    __tablename__ = "tarif"

    id = Column(Integer, primary_key=True, index=True)
    jenis_kendaraan = Column(String) # Mobil atau Motor
    biaya = Column(Float)
    parkir_id = Column(Integer, ForeignKey("parkir.id"))

    parkir = relationship("Parkir", back_populates="tarifs")