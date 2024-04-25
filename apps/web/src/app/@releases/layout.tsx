export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold text-2xl">Tracking</h2>

      {children}
    </section>
  );
}
