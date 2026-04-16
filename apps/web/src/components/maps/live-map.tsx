'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '@/hooks/use-socket';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface LiveMapProps {
  bookingId: string;
  token: string;
  initialCenter: [number, number];
  customerLocation: [number, number];
}

export const LiveMap: React.FC<LiveMapProps> = ({ bookingId, token, initialCenter, customerLocation }) => {
  const [caregiverLocation, setCaregiverLocation] = useState<[number, number] | null>(null);
  const [L, setL] = useState<any>(null);
  const socket = useSocket('location', token);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('subscribe-to-booking', { bookingId });

    socket.on('location-updated', (data: { lat: number; lng: number }) => {
      setCaregiverLocation([data.lat, data.lng]);
    });

    return () => {
      socket.off('location-updated');
    };
  }, [socket, bookingId]);

  if (!L || typeof window === 'undefined') return <div>Loading Map...</div>;

  // Fix for default marker icons in Leaflet + Next.js
  const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const CaregiverIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-inner">
      <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Customer Location */}
        <Marker position={customerLocation} icon={DefaultIcon}>
          <Popup>Customer Home</Popup>
        </Marker>

        {/* Caregiver Live Location */}
        {caregiverLocation && (
          <Marker position={caregiverLocation} icon={CaregiverIcon}>
            <Popup>Caregiver is here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
