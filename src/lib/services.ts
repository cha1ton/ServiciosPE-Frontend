// frontend/src/lib/services.ts
import { api } from "./api";

export interface BusinessFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  address: {
    street?: string;
    city?: string;
    district?: string;
    reference?: string;
    formatted?: string;
  };
  coordinates?: { lat: number; lng: number };
  schedule: { [key: string]: { open: string; close: string } };
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  service?: {
    id: string;
    name: string;
    category: string;
    images: Array<{ id: string; format: string; size: number }>;
  };
}

export class BusinessService {
  static async registerBusiness(
    formData: BusinessFormData,
    images: File[]
  ): Promise<ServiceResponse> {
    const fd = new FormData();

    // Campos planos
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);

    // Contacto
    fd.append(
      "contact",
      JSON.stringify({
        phone: formData.phone,
        email: formData.email,
        website: "",
      })
    );

    // Address solo con claves presentes
    const addressPayload: any = {};
    if (formData.address?.street)    addressPayload.street = formData.address.street;
    if (formData.address?.district)  addressPayload.district = formData.address.district;
    if (formData.address?.city)      addressPayload.city = formData.address.city;
    if (formData.address?.reference) addressPayload.reference = formData.address.reference;
    if (formData.address?.formatted) addressPayload.formatted = formData.address.formatted;
    fd.append("address", JSON.stringify(addressPayload));

    // Coordenadas (obligatorio en tu flujo)
    if (formData.coordinates) {
      fd.append("coordinates", JSON.stringify(formData.coordinates));
    }

    // Horario
    fd.append("schedule", JSON.stringify(formData.schedule));

    // Imágenes
    images.forEach((image) => fd.append("images", image));

    const response = await api.post("/services", fd);
    return response.data;
  }

  static async getMyBusiness() {
    const response = await api.get("/services/my-service");
    return response.data; // { success, service }
  }

  static async updateMyBusiness(
    formData: BusinessFormData,
    images?: File[]
  ): Promise<ServiceResponse> {
    const fd = new FormData();

    if (formData.name)        fd.append("name", formData.name);
    if (formData.description) fd.append("description", formData.description);
    if (formData.category)    fd.append("category", formData.category);

    // Contacto
    fd.append(
      "contact",
      JSON.stringify({
        phone: formData.phone,
        email: formData.email,
        website: "",
      })
    );

    // Address: solo si hay claves (evita enviar objeto vacío)
    const addressPayload: any = {};
    if (formData.address?.street)    addressPayload.street = formData.address.street;
    if (formData.address?.district)  addressPayload.district = formData.address.district;
    if (formData.address?.city)      addressPayload.city = formData.address.city;
    if (formData.address?.reference) addressPayload.reference = formData.address.reference;
    if (formData.address?.formatted) addressPayload.formatted = formData.address.formatted;
    if (Object.keys(addressPayload).length > 0) {
      fd.append("address", JSON.stringify(addressPayload));
    }

    // Coordenadas: si cambió el pin
    if (formData.coordinates) {
      fd.append("coordinates", JSON.stringify(formData.coordinates));
    }

    // Horario
    if (formData.schedule) {
      fd.append("schedule", JSON.stringify(formData.schedule));
    }

    // Imágenes: si llegan 3, backend reemplaza todas
    if (images && images.length > 0) {
      images.forEach((img) => fd.append("images", img));
    }

    const response = await api.put("/services/my-service", fd);
    return response.data;
  }
}
