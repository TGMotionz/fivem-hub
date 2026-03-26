import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FiveM Free Hub - Free FiveM Scripts & Vehicles",
  description: "The largest free FiveM content hub. Download thousands of free scripts, vehicles, mods, and more. Join our community today!",
  keywords: "FiveM, FiveM scripts, FiveM vehicles, GTA 5 mods, FiveM mods, free FiveM content",
  openGraph: {
    title: "FiveM Free Hub",
    description: "Free FiveM scripts, vehicles, and mods",
    type: "website",
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
