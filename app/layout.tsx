import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Fitvora — Personalized Indian Home-Food Weight Management',
    template: '%s | Fitvora',
  },
  description:
    'Achieve sustainable weight loss or healthy weight gain with personalized Indian home-cooked meals. No crash diets, no synthetic supplements, and no shame. Individualized plans starting at ₹499/month.',
  keywords: [
    'Indian diet plan',
    'weight loss Indian home food',
    'weight gain Indian diet',
    'ghar ka khana diet plan',
    'healthy Indian meal plan',
    'Fitvora',
  ],
  authors: [{ name: 'Fitvora' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://fitvora.com'
  ),
  openGraph: {
    title: 'Fitvora — Personalized Indian Home-Food Weight Management',
    description:
      'Sustainable weight loss & gain with familiar Indian home cooking. No supplements, no crash diets.',
    url: 'https://fitvora.com',
    siteName: 'Fitvora',
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#075B2B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-warm-cream text-dark-text antialiased selection:bg-pale-green selection:text-forest-green font-sans">
        {children}
      </body>
    </html>
  );
}
