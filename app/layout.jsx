import './globals.css'

export const metadata = {
  title: 'X·Host — AI Interface',
  description: 'A high-performance streaming AI interface powered by X·Host',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060810',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
