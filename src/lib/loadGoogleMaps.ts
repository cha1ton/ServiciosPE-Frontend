// frontend/src/lib/loadGoogleMaps.ts

let mapsPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<typeof google> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);

  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("gmaps-script") as HTMLScriptElement | null;
      if (existing) {
        existing.onload = () => resolve((window as any).google);
        existing.onerror = () => reject(new Error("Error cargando Google Maps"));
        return;
      }

      const script = document.createElement("script");
      script.id = "gmaps-script";
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
      script.onload = () => resolve((window as any).google);
      script.onerror = () => reject(new Error("Error cargando Google Maps"));
      document.head.appendChild(script);
    });
  }

  return mapsPromise;
}
