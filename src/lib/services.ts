// frontend/src/lib/services.ts
import { api } from "./api";

export interface BusinessFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    district: string;
    reference?: string;
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

export class BusinessService {
  static async registerBusiness(
    formData: BusinessFormData,
    images: File[]
  ): Promise<ServiceResponse> {
    const formDataToSend = new FormData();

    // Campos planos
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("email", formData.email);

    // Dirección
    formDataToSend.append("address[street]", formData.address.street);
    formDataToSend.append("address[city]", formData.address.city);
    formDataToSend.append("address[district]", formData.address.district);
    formDataToSend.append(
      "address[reference]",
      formData.address.reference || ""
    );

    // Coordenadas (si existen)
    if (formData.coordinates) {
      formDataToSend.append(
        "coordinates[lat]",
        String(formData.coordinates.lat)
      );
      formDataToSend.append(
        "coordinates[lng]",
        String(formData.coordinates.lng)
      );
    }

    // Horario
    Object.entries(formData.schedule).forEach(([day, schedule]) => {
      formDataToSend.append(`schedule[${day}][open]`, schedule.open);
      formDataToSend.append(`schedule[${day}][close]`, schedule.close);
    });

    // Imágenes
    images.forEach((image) => {
      formDataToSend.append("images", image);
    });

    const response = await api.post("/services", formDataToSend); // no es necesario Content-Type

    return response.data;
  }

  static async getMyBusinesses() {
    const response = await api.get("/services/my-services");
    return response.data;
  }
}
