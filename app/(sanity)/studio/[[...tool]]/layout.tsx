import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "George AI Portfolio Studio",
  description: "George AI Portfolio Studio",
};

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export default Layout;
