import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['100', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Star Wars",
  description: "Busque no universo Star Wars",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}