import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "../components/header";
import { ScrollToTopButton } from "../components/ui";
import { AppProviders } from "../context";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Starter",
    template: "%s",
  },
  description: "Component-first starter template for reusable website page assembly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=optional"
        />
      </head>
      <body>
        <AppProviders>
          <Header />
          {children}
          <ScrollToTopButton />
        </AppProviders>
      </body>
    </html>
  );
}
