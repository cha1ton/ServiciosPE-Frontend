// frontend/src/app/info/layout.tsx
import Navbar from "@/components/Layout/Navbar";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 12 }}>{children}</div>
    </>
  );
}
