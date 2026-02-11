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
