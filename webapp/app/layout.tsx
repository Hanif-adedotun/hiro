import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hiro - AI-Powered Test Generation",
  description: "Let Hiro handle your testing and documentation, so you can focus on building.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var k = 'hiro-theme';
  var s = typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;
  var d = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = (s === 'dark' || s === 'light') ? s : (d ? 'dark' : 'light');
  document.documentElement.classList.add(theme);
})();
            `.trim(),
          }}
        />
      </head>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

