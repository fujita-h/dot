export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="print:bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="p-2 md:p-4">{children}</div>
      </div>
    </div>
  );
}
