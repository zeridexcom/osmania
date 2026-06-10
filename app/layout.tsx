import type { Metadata } from "next";
import { Inter, Noto_Serif, Public_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body-css",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-headline-css",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-label-css",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Osmania University — Examination Results Portal",
    template: "%s | Osmania University",
  },
  description:
    "Look up examination results, view marks statements, and access official notices for Osmania University.",
  applicationName: "OU Examination Portal",
  authors: [{ name: "Osmania University" }],
  keywords: [
    "Osmania University",
    "OU results",
    "examination results",
    "OU exam",
    "statement of marks",
  ],
  icons: {
    icon: "https://www.osmania.ac.in/wp-content/uploads/2024/06/OU-logo.png",
    shortcut: "https://www.osmania.ac.in/wp-content/uploads/2024/06/OU-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} ${publicSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-surface text-on-surface relative">
        {children}
      </body>
    </html>
  );
}
