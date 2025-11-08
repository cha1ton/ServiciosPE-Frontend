import Navbar from '@/components/Layout/Navbar';

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 12 }}>{children}</div>
    </>
  );
}
