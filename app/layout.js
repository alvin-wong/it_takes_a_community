import localFont from "next/font/local";
import "./globals.css";
import { HeaderSimple } from './header'; // Import the HeaderSimple component

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Only light mode is applied */}
        <HeaderSimple />
        <main>{children}</main> {/* Main content will be passed as children */}
      </body>
    </html>
  );
}
