import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VIRALSTORY AI",
    template: "%s | VIRALSTORY AI",
  },
  description: "Short stories in English and Kiswahili, made for the moment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
