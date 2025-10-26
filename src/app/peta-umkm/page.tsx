// src/app/peta-umkm/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  PopupProps,
} from "react-leaflet";
import type { LatLngExpression, Icon as LeafletIcon } from "leaflet";

const MapContainer = dynamic<MapContainerProps>(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic<TileLayerProps>(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic<MarkerProps>(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic<PopupProps>(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function PetaUMKMPage() {
  const [isClient, setIsClient] = useState(false);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const iconRef = useRef<LeafletIcon | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const setupLeaflet = async () => {
      const L = (await import("leaflet")).default;

      const markerIcon = (await import("leaflet/dist/images/marker-icon.png"))
        .default;
      const markerIcon2x = (
        await import("leaflet/dist/images/marker-icon-2x.png")
      ).default;
      const markerShadow = (
        await import("leaflet/dist/images/marker-shadow.png")
      ).default;

      LRef.current = L;


      iconRef.current = L.icon({
        iconUrl: markerIcon as string,
        iconRetinaUrl: markerIcon2x as string,
        shadowUrl: markerShadow as string,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setMapReady(true);
    };

    if (typeof window !== "undefined") {
      setupLeaflet();
    }
  }, []);

  const position: LatLngExpression = [-6.2088, 106.8456];

  if (!isClient || !mapReady || !iconRef.current) {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-20">
        Memuat peta...
      </div>
    );
  }

  return (
    <div className="h-screen w-full p-4 pt-20">
      <h1 className="mb-4 text-center text-3xl font-bold">Peta Lokasi UMKM</h1>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "calc(100vh - 120px)", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={iconRef.current}>
          <Popup>
            Lokasi UMKM Contoh. <br /> Bisa diisi detail UMKM.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
