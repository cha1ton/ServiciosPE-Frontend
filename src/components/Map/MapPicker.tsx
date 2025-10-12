// frontend/src/components/Map/MapPicker.tsx

'use client';
import { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';

type MapPickerProps = {
  initialCenter?: { lat: number; lng: number };
  value?: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  height?: string;
};

export default function MapPicker({
  initialCenter = { lat: -12.0464, lng: -77.0428 },
  value = null,
  onChange,
  height = '320px',
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: google.maps.Map | null = null;
    let marker: google.maps.Marker | null = null;
    let listener1: google.maps.MapsEventListener | null = null;
    let listener2: google.maps.MapsEventListener | null = null;
    let isMounted = true;

    (async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
      await loadGoogleMaps(apiKey);

      // Carga librerías con la nueva API del Maps JS
      const { Map } = (await (google.maps as any).importLibrary('maps')) as google.maps.MapsLibrary;
      const { Marker } = (await (google.maps as any).importLibrary('marker')) as google.maps.MarkerLibrary;

      if (!isMounted || !mapRef.current) return;

      map = new Map(mapRef.current, {
        center: value || initialCenter,
        zoom: 16,
        disableDefaultUI: false,
      });

      marker = new Marker({
        position: value || initialCenter,
        map,
        draggable: true,
      });

      // Click en el mapa → mover pin
      listener1 = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        marker!.setPosition(pos);
        onChange(pos);
      });

      // Drag del pin → actualizar coords
      listener2 = marker.addListener('dragend', () => {
        const p = marker!.getPosition();
        if (!p) return;
        const pos = { lat: p.lat(), lng: p.lng() };
        onChange(pos);
      });
    })();

    return () => {
      isMounted = false;
      listener1?.remove();
      listener2?.remove();
    };
  }, [initialCenter?.lat, initialCenter?.lng]);

  return <div ref={mapRef} style={{ width: '100%', height, borderRadius: 12 }} />;
}

