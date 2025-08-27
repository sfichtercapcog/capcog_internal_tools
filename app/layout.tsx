import "./globals.css";

export const metadata = {
  title: "CAPCOG Internal Tools",
  description: "Automated workflows for CAPCOG staff to improve accuracy and save time."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100">
        <div className="min-h-screen flex flex-col">
          <header className="w-full bg-slate-800 shadow-lg">
            <div className="container mx-auto px-6 py-8">
              <h1 className="text-white text-3xl font-bold text-center tracking-tight">
                CAPCOG Internal Tools
              </h1>
              <p className="text-slate-300 text-center mt-2 text-sm font-medium">
                File Renamer
              </p>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-6 py-8 max-w-4xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
