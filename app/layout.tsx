import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../services/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Avanti Gurukul',
  description: 'A product of Avanti',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={`${inter.className} max-w-xl mx-auto border-x-1 shadow-2xl border-gray-300`} suppressHydrationWarning={true}>{children}</body>
      </AuthProvider>
    </html>
  )
}
