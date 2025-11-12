// frontend/src/hooks/useGeolocation.ts

'use client';

import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationInfo {
  district: string | null;
  city: string | null;
  country: string | null;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  locationInfo: LocationInfo | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    locationInfo: null,
    error: null,
    loading: false
  });

  // Función para obtener información de ubicación mediante reverse geocoding
  // Usando Nominatim (OpenStreetMap) - GRATIS, sin API key
  const getLocationInfo = async (lat: number, lng: number): Promise<LocationInfo> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`;
      console.log('🌍 Obteniendo información de ubicación...');
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ServiciosPE App' // Requerido por Nominatim
        }
      });
      
      if (!response.ok) {
        console.error('❌ Error en geocoding API:', response.status);
        return { district: null, city: 'Lima', country: null };
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Extraer información de ubicación
        const locationInfo = {
          district: address.suburb || address.neighbourhood || address.city_district || null,
          city: address.city || address.town || address.village || 'Lima',
          country: address.country || null
        };
        
        console.log('✅ Ubicación detectada:', locationInfo);
        return locationInfo;
      }
      
      console.warn('⚠️ No se encontraron resultados de geocoding');
      return { district: null, city: 'Lima', country: null };
    } catch (error) {
      console.error('❌ Error obteniendo información de ubicación:', error);
      return { district: null, city: 'Lima', country: null };
    }
  };

  const getCurrentLocation = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Geolocalización no soportada por el navegador' 
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('📍 Coordenadas obtenidas:', coords);
        
        // Primero establecer las coordenadas
        setState(prev => ({
          ...prev,
          coordinates: coords,
          loading: false,
          error: null
        }));
        
        // Luego obtener la información de ubicación
        const locationInfo = await getLocationInfo(coords.lat, coords.lng);
        console.log('📍 LocationInfo final:', locationInfo);
        
        setState(prev => ({
          ...prev,
          locationInfo
        }));
      },
      (error) => {
        let errorMessage = 'Error obteniendo la ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }

        setState({
          coordinates: null,
          locationInfo: null,
          error: errorMessage,
          loading: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return {
    coordinates: state.coordinates,
    locationInfo: state.locationInfo,
    error: state.error,
    loading: state.loading,
    getCurrentLocation
  };
};