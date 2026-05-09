import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BackgroundShapes from "@/components/BackgroundShapes";

export const metadata: Metadata = {
  title: "Benang Merah | Ruang Sastra Terkurasi",
  description: "Platform tulisan sastra dan esai berkualitas tinggi dengan kurasi manusia. Membawa nuansa kertas ke layar digital.",
  keywords: ["sastra", "literasi", "esai", "kurasi", "benang merah", "tulisan"],
  openGraph: {
    title: "Benang Merah",
    description: "Ruang tenang untuk tulisan yang terpilih.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <BackgroundShapes />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
