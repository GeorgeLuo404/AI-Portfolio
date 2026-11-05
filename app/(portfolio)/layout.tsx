import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "George Luo, AI and web engineer",
  description: "George Luo's portfolio, being rebuilt.",
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
