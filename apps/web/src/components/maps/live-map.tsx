'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/lib/auth-context';

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LiveMapProps {
  initialLat: number;
  initialLng: number;
  caregiverId: string;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export const LiveMap: React.FC<LiveMapProps> = ({ initialLat, initialLng, caregiverId }) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const { token } = useAuth();
  const socket = useSocket('location', token);

  useEffect(() => {
    if (!socket) return;

    socket.emit('subscribe-location', { caregiverId });

    socket.on('location-update', (data: { caregiverId: string; lat: number; lng: number }) => {
      if (data.caregiverId === caregiverId) {
        setPosition([data.lat, data.lng]);
      }
    });

    return () => {
      socket.off('location-update');
    };
  }, [socket, caregiverId]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border-2 border-teal-700 shadow-md">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Caregiver is here.
          </Popup>
        </Marker>
        <RecenterMap lat={position[0]} lng={position[1]} />
      </MapContainer>
    </div>
  );
};
