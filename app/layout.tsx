import './globals.css';
import type { Metadata } from 'next';
import { Nunito_Sans, Quicksand } from 'next/font/google';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-nunito-sans',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
});

export const metadata: Metadata = {
  title: 'Meu Amigo Fraudes — Amigo secreto sem complicação',
  description:
    'Crie um grupo, convidle as pessoas e faça o sorteio do amigo secreto em minutos. Cada pessoa recebe seu resultado em um link privado.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${nunitoSans.variable} ${quicksand.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
