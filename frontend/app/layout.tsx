import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Text Extractor",
  description: "Extract text from PDF files using S3 and Lambda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
