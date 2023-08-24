import './globals.css';
import ThemeRegistry from '../components/theme-registry/theme-registry';
import { Navbar } from '../components/navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>
        <ThemeRegistry>
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
