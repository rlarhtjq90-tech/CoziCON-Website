import type { Metadata } from 'next'
import './globals.css'
import Providers from './Providers'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.CastBid.co.kr'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CastBid | 건설 입찰 플랫폼',
    template: '%s | CastBid',
  },
  description:
    '종합건설사와 전문건설사를 연결하는 스마트 입찰 플랫폼. 공사 발주부터 낙찰까지 디지털로 처리하세요.',
  keywords: ['건설 입찰', '전문건설사', '종합건설사', '하도급', '공사 발주', '건설 플랫폼', '건설 디지털화', '입찰 시스템'],
  authors: [{ name: 'CastBid' }],
  openGraph: {
    title: 'CastBid | 건설 입찰 플랫폼',
    description: '종합건설사와 전문건설사를 연결하는 스마트 입찰 플랫폼. 공사 발주부터 낙찰까지 디지털로.',
    url: BASE_URL,
    siteName: 'CastBid',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CastBid 건설 입찰 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CastBid | 건설 입찰 플랫폼',
    description: '종합건설사와 전문건설사를 연결하는 스마트 입찰 플랫폼',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-pretendard antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
