import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { manrope, hankenGrotesk } from './fonts';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { SessionTimeoutProvider } from '@/providers/SessionTimeoutProvider';
import { TenantProvider } from '@/providers/TenantProvider';
import { ToastProvider } from '@/components/ui/Toast';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'EMTech House | Distributor Financing',
  description: 'Enterprise value chain financing platform by EMTech House',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${hankenGrotesk.variable} ${poppins.variable}`}>
      <body className="antialiased min-h-screen bg-surface text-on-surface font-body-md">
        <AuthProvider>
          <TenantProvider>
            <ToastProvider>
              <SessionTimeoutProvider>{children}</SessionTimeoutProvider>
            </ToastProvider>
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}