import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../services/AuthContext'
import SidebarNavigation from '../components/SidebarNavigation'

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
        <body className={`${inter.className} lg:bg-gray-50`} suppressHydrationWarning={true}>
          <div className="lg:flex lg:min-h-screen">
            <SidebarNavigation />
            <main className="flex-1 lg:ml-64">
              <div className="max-w-xl mx-auto lg:max-w-none lg:mx-0 border-x-1 lg:border-x-0 shadow-2xl lg:shadow-none border-gray-300 lg:border-0 min-h-screen lg:min-h-0">
                {children}
              </div>
            </main>
          </div>
        </body>
      </AuthProvider>
    </html>
  )
}
