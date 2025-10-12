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

  coordinates?: {
    lat: number;
    lng: number;
  };
  schedule: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  service?: {
    id: string;
    name: string;
    category: string;
    images: Array<{
      id: string;
      format: string;
      size: number;
    }>;
  };
}

export interface MyService {
  _id: string;
  name: string;
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

    // ✅ Contacto como objeto (el schema lo espera dentro de 'contact')
    fd.append(
      "contact",
      JSON.stringify({
        phone: formData.phone,
        email: formData.email,
        website: "",
      })
    );

    // ✅ Dirección como JSON solo con claves presentes
    const addressPayload: any = {};
    if (formData.address?.street)
      addressPayload.street = formData.address.street;
    if (formData.address?.district)
      addressPayload.district = formData.address.district;
    if (formData.address?.city) addressPayload.city = formData.address.city;
    if (formData.address?.reference)
      addressPayload.reference = formData.address.reference;
    if (formData.address?.formatted)
      addressPayload.formatted = formData.address.formatted;

    fd.append("address", JSON.stringify(addressPayload));

    // ✅ Coordenadas como JSON (el controller las parsea)
    if (formData.coordinates) {
      fd.append("coordinates", JSON.stringify(formData.coordinates));
    }

    // ✅ Horario como JSON (evitas caer en DEFAULT_SCHEDULE)
    fd.append("schedule", JSON.stringify(formData.schedule));

    // Imágenes
    images.forEach((image) => {
      fd.append("images", image);
    });

    const response = await api.post("/services", fd);
    return response.data;
  }
}