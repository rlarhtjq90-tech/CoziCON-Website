'use client'

import React, { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

interface AccordionItemData {
  id: number
  title: string
  subtitle: string
  imageUrl: string
  href: string
}

interface AccordionItemProps {
  item: AccordionItemData
  isActive: boolean
  onMouseEnter: () => void
}

// ── Data ───────────────────────────────────────────────────────────────────

export const accordionItems: AccordionItemData[] = [
  {
    id: 1,
    title: '서비스소개',
    subtitle: 'CoziCON이 하는 일',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1974&auto=format&fit=crop',
    href: '#features',
  },
  {
    id: 2,
    title: '입찰프로세스',
    subtitle: '발주부터 낙찰까지',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1974&auto=format&fit=crop',
    href: '#process',
  },
  {
    id: 3,
    title: '이용대상',
    subtitle: '종합건설사 · 전문건설사',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop',
    href: '#audience',
  },
  {
    id: 4,
    title: '문의하기',
    subtitle: '도입 상담 · 파트너 등록',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop',
    href: '#contact',
  },
]

// ── Accordion Item ─────────────────────────────────────────────────────────

function AccordionItem({ item, isActive, onMouseEnter }: AccordionItemProps) {
  const handleClick = () => {
    const target = document.querySelector(item.href)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={`
        relative h-[420px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out flex-shrink-0
        ${isActive ? 'w-[340px]' : 'w-[60px]'}
      `}
      onMouseEnter={onMouseEnter}
      onClick={handleClick}
    >
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Active: 하단 텍스트 + 클릭 유도 */}
      {isActive && (
        <div className="absolute bottom-6 left-6 right-6 transition-all duration-300">
          <p className="text-white/70 text-sm font-medium mb-1">{item.subtitle}</p>
          <div className="flex items-center justify-between">
            <p className="text-white text-xl font-bold">{item.title}</p>
            <span className="text-white/80 text-sm font-medium bg-white/20 rounded-full px-3 py-1 hover:bg-white/30 transition-colors">
              바로가기 →
            </span>
          </div>
        </div>
      )}

      {/* Inactive: 세로 텍스트 */}
      {!isActive && (
        <span className="absolute bottom-20 left-1/2 -translate-x-1/2 rotate-90 text-white text-sm font-semibold whitespace-nowrap transition-all duration-300">
          {item.title}
        </span>
      )}
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────────────────

export function InteractiveImageAccordion() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-row items-center justify-center gap-3 overflow-x-auto pb-2">
      {accordionItems.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  )
}
