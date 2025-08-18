import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Love Must Be Free',
  description: 'Secure area',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="lmf-bg">{children}</body>
    </html>
  )
}
