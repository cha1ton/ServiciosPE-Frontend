// frontend/src/components/BackButton.tsx
"use client";
import { useRouter } from "next/navigation";

export default function BackButton({ label = "Volver" }: { label?: string }) {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} aria-label={label}>
      {label}
    </button>
  );
}
