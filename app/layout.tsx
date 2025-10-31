import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Klaviyo Email Sequence Creator',
  description: 'Create email sequences in Klaviyo via API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
