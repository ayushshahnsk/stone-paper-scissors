import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayush's Stone Paper Scissors",
  description:
    "Play Stone Paper Scissors using hand gestures with MediaPipe and Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}