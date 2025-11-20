// frontend/src/app/my-business/edit/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import MapPicker from '@/components/Map/MapPicker';
import { BusinessService, BusinessFormData } from '@/lib/services';
import { Building2, Info, MapPin, Phone, Clock, Image } from 'lucide-react';
import styles from './edit.module.css';

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
    offerings: '',
    phone: '',
    email: '',
    address: {},
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

  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const { success, service } = await BusinessService.getMyBusiness();
        if (!success) throw new Error('No se pudo cargar tu negocio');
        setForm({
          name: service.name || '',
          description: service.description || '',
          category: service.category || '',
          offerings: service.offerings || '',
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

  if (loading || authLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando información...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Editar mi Negocio</h1>
          <p className={styles.subtitle}>Actualiza la información de tu negocio</p>
        </div>

        {msg && <div className={styles.successMessage}>{msg}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          {/* Información Básica */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Building2 size={20} /></span>
              Información Básica
            </h2>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Nombre del Negocio</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className={styles.input}
                placeholder="Ej: Restaurante El Buen Sabor"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Categoría</label>
              <select name="category" value={form.category} onChange={onChange} className={styles.select} required>
                <option value="">Selecciona una categoría</option>
                <option value="restaurante">Restaurante</option>
                <option value="comida_bebidas">Cafetería / Panadería / Pastelería</option>
                <option value="centro_salud">Centro de Salud</option>
                <option value="farmacia">Farmacia</option>
                <option value="veterinaria">Veterinaria / Pet Shop</option>
                <option value="supermercado">Supermercado</option>
                <option value="hotel">Hotel / Hospedaje</option>
                <option value="gimnasio">Gimnasio</option>
                <option value="escuela_baile">Escuela de Baile</option>
                <option value="taller_mecanico">Taller Mecánico</option>
                <option value="lavanderia">Lavandería</option>
                <option value="barberia">Barbería</option>
                <option value="salon_belleza">Salón de Belleza</option>
                <option value="discoteca">Discoteca / Night Club</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                className={styles.textarea}
                placeholder="Describe tu negocio..."
                required
              />
              <span className={styles.hint}>Cuéntale a tus clientes qué hace especial a tu negocio</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>¿Qué ofreces?</label>
              <textarea
                name="offerings"
                value={form.offerings || ''}
                onChange={onChange}
                className={styles.textarea}
                placeholder="Ej: pizza, pasta, comida italiana, delivery"
              />
              <span className={styles.hint}>Palabras clave que ayuden a los clientes a encontrarte</span>
            </div>
          </section>

          {/* Contacto */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Phone size={20} /></span>
              Información de Contacto
            </h2>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Teléfono</label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className={styles.input}
                placeholder="+51 999 999 999"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                className={styles.input}
                disabled
              />
              <span className={styles.hint}>El email no puede ser modificado</span>
            </div>
          </section>

          {/* Ubicación */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><MapPin size={20} /></span>
              Ubicación
            </h2>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>Selecciona tu ubicación en el mapa</label>
              <div className={styles.mapContainer}>
                <MapPicker
                  initialCenter={coords || { lat: -12.0464, lng: -77.0428 }}
                  value={coords}
                  onChange={setCoords}
                  height="320px"
                />
              </div>
              <div className={`${styles.coordsInfo} ${!coords ? styles.warning : ''}`}>
                <MapPin size={16} />
                {coords
                  ? `Coordenadas: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                  : 'Haz clic en el mapa para seleccionar tu ubicación'}
              </div>
            </div>

            <div className={styles.addressGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Calle y número</label>
                <input
                  name="address.street"
                  placeholder="Av. Principal 123"
                  value={form.address?.street || ''}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Distrito</label>
                <input
                  name="address.district"
                  placeholder="Miraflores"
                  value={form.address?.district || ''}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ciudad</label>
                <input
                  name="address.city"
                  placeholder="Lima"
                  value={form.address?.city || ''}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Referencia</label>
                <input
                  name="address.reference"
                  placeholder="Cerca al parque central"
                  value={form.address?.reference || ''}
                  onChange={onChange}
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Imágenes */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Image size={20} /></span>
              Imágenes
            </h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Reemplazar imágenes</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onImages}
                className={styles.fileInput}
              />
              <span className={styles.hint}>
                Selecciona exactamente 3 imágenes (máximo 2MB cada una). Si no seleccionas ninguna, se conservarán las actuales.
              </span>
            </div>
          </section>

          {/* Horarios */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Clock size={20} /></span>
              Horario de Atención
            </h2>

            <div className={styles.scheduleGrid}>
              {Object.entries(form.schedule).map(([day, sch]: any) => (
                <div key={day} className={styles.scheduleRow}>
                  <span className={styles.dayLabel}>{day}</span>
                  <input
                    type="time"
                    value={sch.open}
                    onChange={(e) => onSchedule(day, 'open', e.target.value)}
                    className={styles.timeInput}
                  />
                  <span className={styles.timeSeparator}>a</span>
                  <input
                    type="time"
                    value={sch.close}
                    onChange={(e) => onSchedule(day, 'close', e.target.value)}
                    className={styles.timeInput}
                  />
                </div>
              ))}
            </div>
            <span className={styles.hint}>Deja los campos vacíos para días cerrados</span>
          </section>

          <button type="submit" disabled={saving} className={styles.submitButton}>
            {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
          </button>
        </form>
      </main>
    </div>
  );
}