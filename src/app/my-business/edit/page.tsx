// frontend/src/app/my-business/edit/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import MapPicker from '@/components/Map/MapPicker';
import { BusinessService, BusinessFormData } from '@/lib/services';

export default function EditMyBusinessPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [coords, setCoords] = useState<{lat:number; lng:number} | null>(null);
  const [form, setForm] = useState<BusinessFormData>({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    address: {},      // opcional
    schedule: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '14:00' },
      sunday: { open: '', close: '' },
    }
  });

  // imágenes nuevas (para reemplazar)
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const { success, service } = await BusinessService.getMyBusiness();
        if (!success) throw new Error('No se pudo cargar tu negocio');
        // rellenar form con datos existentes
        setForm({
          name: service.name || '',
          description: service.description || '',
          category: service.category || '',
          phone: service.contact?.phone || '',
          email: service.contact?.email || '',
          address: {
            street: service.address?.street,
            district: service.address?.district,
            city: service.address?.city,
            reference: service.address?.reference,
            formatted: service.address?.formatted
          },
          coordinates: service.address?.coordinates || undefined,
          schedule: service.schedule || form.schedule
        });
        setCoords(service.address?.coordinates || null);
      } catch (e:any) {
        setError(e?.message || 'Error cargando negocio');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: value }
      }) as any);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const onSchedule = (day:string, field:'open'|'close', value:string) => {
    setForm(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [day]: { ...prev.schedule[day], [field]: value } }
    }));
  };

  const onImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length !== 3) {
      setError('Para reemplazar imágenes debes seleccionar exactamente 3 archivos (2MB c/u).');
      return;
    }
    const big = files.find(f => f.size > 2*1024*1024);
    if (big) {
      setError('Cada imagen debe ser menor a 2MB.');
      return;
    }
    setError('');
    setNewImages(files);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    try {
      if (!coords) throw new Error('Selecciona la ubicación en el mapa');

      const payload: BusinessFormData = {
        ...form,
        coordinates: coords
      };

      const result = await BusinessService.updateMyBusiness(payload, newImages.length ? newImages : undefined);
      if (!result.success) throw new Error(result.message);
      setMsg('Negocio actualizado correctamente');
    } catch (err:any) {
      setError(err?.response?.data?.message || err?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) return <div><Navbar /><main><p>Cargando…</p></main></div>;

  return (
    <div>
      <Navbar />
      <main>
        <h1>Editar mi Negocio</h1>
        {msg && <div style={{color:'green'}}>{msg}</div>}
        {error && <div style={{color:'crimson'}}>{error}</div>}

        <form onSubmit={onSubmit}>
          {/* Básicos */}
          <div>
            <label>Nombre *</label>
            <input name="name" value={form.name} onChange={onChange} required />
          </div>
          <div>
            <label>Categoría *</label>
            <select name="category" value={form.category} onChange={onChange} required>
              <option value="">Selecciona</option>
              <option value="restaurante">Restaurante</option>
              <option value="centro_salud">Centro de Salud</option>
              <option value="lavanderia">Lavandería</option>
              <option value="farmacia">Farmacia</option>
              <option value="supermercado">Supermercado</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div>
            <label>Descripción *</label>
            <textarea name="description" rows={3} value={form.description} onChange={onChange} required />
          </div>

          {/* Contacto */}
          <div>
            <label>Teléfono *</label>
            <input name="phone" value={form.phone} onChange={onChange} required />
          </div>
          <div>
            <label>Email (no editable)</label>
            <input name="email" value={form.email} onChange={onChange} disabled />
          </div>

          {/* Mapa */}
          <div style={{ marginTop: 16 }}>
            <label>Ubicación *</label>
            <MapPicker
              initialCenter={coords || { lat: -12.0464, lng: -77.0428 }}
              value={coords}
              onChange={setCoords}
              height="320px"
            />
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {coords ? <>Coords: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</> : <span style={{color:'#d00'}}>Selecciona la ubicación</span>}
            </div>
          </div>

          {/* Dirección opcional */}
          <div style={{ marginTop: 16 }}>
            <label>Dirección (opcional)</label>
            <input name="address.street" placeholder="Calle y número" value={form.address?.street || ''} onChange={onChange} />
            <input name="address.district" placeholder="Distrito" value={form.address?.district || ''} onChange={onChange} />
            <input name="address.city" placeholder="Ciudad" value={form.address?.city || ''} onChange={onChange} />
            <input name="address.reference" placeholder="Referencia" value={form.address?.reference || ''} onChange={onChange} />
          </div>

          {/* Reemplazo de imágenes */}
          <div style={{ marginTop: 16 }}>
            <label>Reemplazar imágenes (exactamente 3, 2MB c/u) — si no seleccionas, se conservan</label>
            <input type="file" multiple accept="image/*" onChange={onImages} />
          </div>

          {/* Horarios */}
          <div style={{ marginTop: 16 }}>
            <label>Horario</label>
            {Object.entries(form.schedule).map(([day, sch]: any) => (
              <div key={day}>
                <span style={{ display:'inline-block', width:110 }}>{day}:</span>
                <input type="time" value={sch.open} onChange={(e)=>onSchedule(day,'open',e.target.value)} />
                <span> a </span>
                <input type="time" value={sch.close} onChange={(e)=>onSchedule(day,'close',e.target.value)} />
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </main>
    </div>
  );
}
