'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPinIcon, CrosshairIcon } from 'lucide-react';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

if (typeof window !== 'undefined') {
  // Fix for default Leaflet icon
  const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = DefaultIcon;
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: {lat: number, lng: number} | null, 
  setPosition: (pos: {lat: number, lng: number}) => void 
}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function ChangeView({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(
    initialLat != null && initialLng != null
      ? { lat: Number(initialLat), lng: Number(initialLng) }
      : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [address, setAddress] = useState('');

  const defaultCenter: L.LatLngExpression = [6.5244, 3.3792]; // Lagos, Nigeria default

  useEffect(() => {
    if (position) {
      onLocationSelect(position.lat, position.lng, address);
    }
  }, [position, address, onLocationSelect]);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        setIsLocating(false);
        // Optional: Reverse geocode here if you want an address
      },
      (err) => {
        console.error(err);
        alert('Could not get your location. Please select it on the map.');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-emerald-500" />
          Select Delivery Location
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
          disabled={isLocating}
        >
          <CrosshairIcon className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Locating...' : 'Use My Current Location'}
        </button>
      </div>

      <div className="relative h-64 w-full overflow-hidden rounded-2xl border-2 border-slate-100 shadow-inner group">
        <MapContainer
          center={position || defaultCenter}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          {position && <ChangeView center={position} />}
        </MapContainer>
        
        {!position && (
          <div className="absolute inset-0 z-[10] flex items-center justify-center bg-slate-900/5 backdrop-blur-[2px] pointer-events-none">
            <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-xs font-bold text-slate-600 flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-emerald-500" />
              Tap the map to set your location
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="address_details" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Delivery Instructions (e.g. House Number, Landmark)
        </label>
        <textarea
          id="address_details"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Apt 4, Green Gate, near the pharmacy..."
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300"
        />
      </div>
      
      {position && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
            Location Set: {Number(position.lat).toFixed(6)}, {Number(position.lng).toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
