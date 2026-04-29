import type { Metadata } from 'next'
import './globals.css'
import Providers from './Providers'

export const metadata: Metadata = {
  title: 'CoziCON | 건설 입찰 플랫폼',
  description:
    '종합건설사와 전문건설사를 연결하는 스마트 입찰 플랫폼. 공사 발주부터 낙찰까지 디지털로 처리하세요.',
  keywords: ['건설 입찰', '전문건설사', '종합건설사', '하도급', '공사 발주', '건설 플랫폼'],
  openGraph: {
    title: 'CoziCON | 건설 입찰 플랫폼',
    description: '종합건설사와 전문건설사를 연결하는 스마트 입찰 플랫폼',
    locale: 'ko_KR',
    type: 'website',
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
