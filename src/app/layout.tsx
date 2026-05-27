import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstRound | Tailored CV Generator",
  description: "Get past the screening with perfectly tailored CVs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
