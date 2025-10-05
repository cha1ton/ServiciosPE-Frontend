//src/app/register-business/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import { BusinessService, BusinessFormData } from '@/lib/services';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect } from 'react';

const CATEGORIES = [
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'centro_salud', label: 'Centro de Salud' },
  { value: 'lavanderia', label: 'Lavandería' },
  { value: 'farmacia', label: 'Farmacia' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'otros', label: 'Otros' }
];

const DEFAULT_SCHEDULE = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '09:00', close: '14:00' },
  sunday: { open: '', close: '' }
};

export default function RegisterBusinessPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { coordinates, getCurrentLocation, loading: geoLoading } = useGeolocation();
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: user?.email || '',
    address: {
      street: '',
      city: '',
      district: '',
      reference: ''
    },
    schedule: DEFAULT_SCHEDULE
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');


  // PROBANDO - INICIO 

  useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  }
}, [loading, user, router]);

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Cargando...</p>
    </div>
  );
}

if (!user) {
  return null; 
}

// FIN

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 3) {
      setError('Máximo 3 imágenes permitidas');
      return;
    }

    const oversized = files.find(file => file.size > 2 * 1024 * 1024);
    if (oversized) {
      setError('Cada imagen debe ser menor a 2MB');
      return;
    }

    setImages(prev => [...prev, ...files]);
    setError('');
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
  const parentKey = parent as keyof BusinessFormData;
  const childKey = child;

  const parentValue = prev[parentKey];

  return {
    ...prev,
    [parentKey]: {
      ...(parentValue as Record<string, any>),
      [childKey]: value
    }
  };
});;
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleScheduleChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleGetLocation = () => {
    getCurrentLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      if (images.length === 0) {
        throw new Error('Debes subir al menos una imagen del negocio');
      }

      // Agregar coordenadas si están disponibles
      const submissionData = {
        ...formData,
        coordinates: coordinates || undefined
      };

      const result = await BusinessService.registerBusiness(submissionData, images);
      
      if (result.success) {
        router.push('/?message=business_registered');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrar el negocio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Registra tu Negocio</h1>
          <p className="text-gray-600 mb-6">Completa la información de tu establecimiento</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  name="address.street"
                  placeholder="Calle y número"
                  required
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="address.district"
                    placeholder="Distrito"
                    required
                    value={formData.address.district}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="address.city"
                    placeholder="Ciudad"
                    required
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  name="address.reference"
                  placeholder="Referencia (opcional)"
                  value={formData.address.reference}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {geoLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                </button>
                {coordinates && (
                  <span className="ml-3 text-sm text-green-600">
                    ✓ Ubicación obtenida: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del Negocio (Máximo 3, 2MB cada una) *
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={URL.createObjectURL(img)} 
                        alt={`Preview ${index}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Horarios (simplificado) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario de Atención
              </label>
              <div className="space-y-2">
                {Object.entries(DEFAULT_SCHEDULE).map(([day, schedule]) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-20 capitalize">{day}:</span>
                    <input
                      type="time"
                      value={schedule.open}
                      onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                    <span>a</span>
                    <input
                      type="time"
                      value={schedule.close}
                      onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Registrando Negocio...' : 'Registrar Negocio'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}