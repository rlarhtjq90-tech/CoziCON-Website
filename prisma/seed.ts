import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  {
    name: '토목',
    code: 'CIVIL',
    order: 1,
    children: [
      { name: '도로공사',       code: 'CIVIL_ROAD',     order: 1 },
      { name: '교량공사',       code: 'CIVIL_BRIDGE',   order: 2 },
      { name: '상하수도공사',   code: 'CIVIL_WATER',    order: 3 },
      { name: '항만·항공공사', code: 'CIVIL_PORT',     order: 4 },
      { name: '터널공사',       code: 'CIVIL_TUNNEL',   order: 5 },
      { name: '댐·제방공사',   code: 'CIVIL_DAM',      order: 6 },
    ],
  },
  {
    name: '건축',
    code: 'ARCH',
    order: 2,
    children: [
      { name: '골조공사',   code: 'ARCH_FRAME',    order: 1 },
      { name: '마감공사',   code: 'ARCH_FINISH',   order: 2 },
      { name: '리모델링',   code: 'ARCH_REMODEL',  order: 3 },
      { name: '철거·해체', code: 'ARCH_DEMO',     order: 4 },
    ],
  },
  {
    name: '전기·통신',
    code: 'ELEC',
    order: 3,
    children: [
      { name: '전기공사',     code: 'ELEC_POWER',   order: 1 },
      { name: '통신공사',     code: 'ELEC_COMM',    order: 2 },
      { name: '소방전기공사', code: 'ELEC_FIRE',    order: 3 },
    ],
  },
  {
    name: '기계설비',
    code: 'MECH',
    order: 4,
    children: [
      { name: '냉난방·공조공사', code: 'MECH_HVAC', order: 1 },
      { name: '배관공사',         code: 'MECH_PIPE', order: 2 },
      { name: '소방시설공사',     code: 'MECH_FIRE', order: 3 },
    ],
  },
  {
    name: '조경',
    code: 'LAND',
    order: 5,
    children: [
      { name: '조경공사', code: 'LAND_LANDSCAPE', order: 1 },
      { name: '식재공사', code: 'LAND_PLANT',     order: 2 },
    ],
  },
  {
    name: '전문공사',
    code: 'SPEC',
    order: 6,
    children: [
      { name: '철근콘크리트공사', code: 'SPEC_RC',      order: 1 },
      { name: '도장공사',         code: 'SPEC_PAINT',   order: 2 },
      { name: '방수공사',         code: 'SPEC_WATER',   order: 3 },
      { name: '내장공사',         code: 'SPEC_INTERIOR',order: 4 },
      { name: '창호공사',         code: 'SPEC_WINDOW',  order: 5 },
      { name: '지붕공사',         code: 'SPEC_ROOF',    order: 6 },
      { name: '석공사',           code: 'SPEC_STONE',   order: 7 },
    ],
  },
]

async function main() {
  console.log('🌱 공종 마스터 데이터 시드 시작...')

  for (const parent of CATEGORIES) {
    const parentRecord = await prisma.workCategory.upsert({
      where: { code: parent.code },
      update: { name: parent.name, order: parent.order },
      create: { name: parent.name, code: parent.code, order: parent.order },
    })
    console.log(`  ✅ 대분류: ${parent.name}`)

    for (const child of parent.children) {
      await prisma.workCategory.upsert({
        where: { code: child.code },
        update: { name: child.name, order: child.order, parentId: parentRecord.id },
        create: { name: child.name, code: child.code, order: child.order, parentId: parentRecord.id },
      })
      console.log(`     └ ${child.name}`)
    }
  }

  const total = await prisma.workCategory.count()
  console.log(`\n✅ 완료 — 총 ${total}개 카테고리 등록됨`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
