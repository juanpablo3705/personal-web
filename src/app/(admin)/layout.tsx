import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="public-scope theme-normal relative flex min-h-dvh flex-col">
      <Navbar />
      <main className="w-full flex-1 px-5 pb-20 sm:px-8 md:px-12 lg:px-16">
        {children}
      </main>
    </div>
  );
}
