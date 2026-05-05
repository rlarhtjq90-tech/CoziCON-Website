'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Building2, Camera, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'

const REGION_OPTIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

interface License {
  id: string
  licenseType: string
  grade: string | null
  licenseNo: string | null
  issuedAt: string | null
}

interface ConstructionRecord {
  year: string
  name: string
  client: string
  amount: string
}

interface Company {
  id: string
  name: string
  ceoName: string | null
  bizNo: string
  address: string | null
  phone: string | null
  fax: string | null
  website: string | null
  logoUrl: string | null
  constructionCapacity: string | null
  mainRegions: string[]
  constructionRecords: ConstructionRecord[] | null
  equipmentAndStaff: { equipment: string[]; staff: string[] } | null
  licenses: License[]
}

export default function ProfileClient({ company: initial }: { company: Company }) {
  const [company, setCompany] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [openSection, setOpenSection] = useState<string | null>('basic')

  const [form, setForm] = useState({
    address: company.address ?? '',
    phone: company.phone ?? '',
    fax: company.fax ?? '',
    website: company.website ?? '',
    constructionCapacity: company.constructionCapacity ?? '',
    mainRegions: company.mainRegions ?? [],
    constructionRecords: (company.constructionRecords as ConstructionRecord[] | null) ?? [],
    equipmentAndStaff: company.equipmentAndStaff ?? { equipment: [], staff: [] },
  })

  const logoRef = useRef<HTMLInputElement>(null)

  function toggleRegion(region: string) {
    setForm(f => ({
      ...f,
      mainRegions: f.mainRegions.includes(region)
        ? f.mainRegions.filter(r => r !== region)
        : [...f.mainRegions, region],
    }))
  }

  function addRecord() {
    setForm(f => ({
      ...f,
      constructionRecords: [...f.constructionRecords, { year: '', name: '', client: '', amount: '' }],
    }))
  }

  function updateRecord(idx: number, field: keyof ConstructionRecord, value: string) {
    setForm(f => {
      const records = [...f.constructionRecords]
      records[idx] = { ...records[idx], [field]: value }
      return { ...f, constructionRecords: records }
    })
  }

  function removeRecord(idx: number) {
    setForm(f => ({
      ...f,
      constructionRecords: f.constructionRecords.filter((_, i) => i !== idx),
    }))
  }

  function addEquipment() {
    setForm(f => ({
      ...f,
      equipmentAndStaff: { ...f.equipmentAndStaff, equipment: [...f.equipmentAndStaff.equipment, ''] },
    }))
  }

  function updateEquipment(idx: number, val: string) {
    setForm(f => {
      const arr = [...f.equipmentAndStaff.equipment]
      arr[idx] = val
      return { ...f, equipmentAndStaff: { ...f.equipmentAndStaff, equipment: arr } }
    })
  }

  function removeEquipment(idx: number) {
    setForm(f => ({
      ...f,
      equipmentAndStaff: {
        ...f.equipmentAndStaff,
        equipment: f.equipmentAndStaff.equipment.filter((_, i) => i !== idx),
      },
    }))
  }

  function addStaff() {
    setForm(f => ({
      ...f,
      equipmentAndStaff: { ...f.equipmentAndStaff, staff: [...f.equipmentAndStaff.staff, ''] },
    }))
  }

  function updateStaff(idx: number, val: string) {
    setForm(f => {
      const arr = [...f.equipmentAndStaff.staff]
      arr[idx] = val
      return { ...f, equipmentAndStaff: { ...f.equipmentAndStaff, staff: arr } }
    })
  }

  function removeStaff(idx: number) {
    setForm(f => ({
      ...f,
      equipmentAndStaff: {
        ...f.equipmentAndStaff,
        staff: f.equipmentAndStaff.staff.filter((_, i) => i !== idx),
      },
    }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/company/logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? '업로드 실패'); return }
      if (json.url) setCompany(c => ({ ...c, logoUrl: json.url }))
    } catch {
      setError('업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingLogo(false)
      if (logoRef.current) logoRef.current.value = ''
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/company/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? '저장 실패'); return }
      setCompany(c => ({ ...c, ...json.company }))
      setEditing(false)
      setSuccess('저장되었습니다.')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm({
      address: company.address ?? '',
      phone: company.phone ?? '',
      fax: company.fax ?? '',
      website: company.website ?? '',
      constructionCapacity: company.constructionCapacity ?? '',
      mainRegions: company.mainRegions ?? [],
      constructionRecords: (company.constructionRecords as ConstructionRecord[] | null) ?? [],
      equipmentAndStaff: company.equipmentAndStaff ?? { equipment: [], staff: [] },
    })
    setEditing(false)
    setError('')
  }

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl shadow-card-md overflow-hidden">
      <button
        type="button"
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-brand-slate-50 transition-colors"
      >
        <span className="text-p16 font-semibold text-ink-700">{title}</span>
        {openSection === id ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
      </button>
      {openSection === id && <div className="px-6 pb-6 border-t border-ink-100">{children}</div>}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* 헤더 카드 */}
      <div className="bg-white rounded-2xl shadow-card-md p-6">
        <div className="flex items-start gap-5">
          {/* 로고 */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-brand-slate-100 border-2 border-ink-200 overflow-hidden flex items-center justify-center">
              {company.logoUrl ? (
                <Image src={company.logoUrl} alt="회사 로고" width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <Building2 className="w-8 h-8 text-ink-300" />
              )}
            </div>
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
          </div>

          {/* 회사 기본 정보 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-t5 font-bold text-ink-700 truncate">{company.name}</h1>
            <p className="text-p14 text-ink-400 mt-0.5">대표: {company.ceoName ?? '—'}</p>
            <p className="text-p13 text-ink-300 mt-1">사업자번호: {company.bizNo.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {company.licenses.map(l => (
                <span key={l.id} className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-700 text-p12 font-medium rounded-full border border-blue-200">
                  {l.licenseType}{l.grade ? ` (${l.grade})` : ''}
                </span>
              ))}
            </div>
          </div>

          {/* 수정/저장 버튼 */}
          <div className="shrink-0">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                정보 수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-brand-slate-100 text-ink-600 text-p14 font-semibold rounded-xl hover:bg-brand-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '저장 중…' : '저장'}
                </button>
              </div>
            )}
          </div>
        </div>

        {uploadingLogo && <p className="mt-3 text-p13 text-blue-600">로고 업로드 중…</p>}
        {error && <p className="mt-3 text-p13 text-red-600">{error}</p>}
        {success && <p className="mt-3 text-p13 text-emerald-600">{success}</p>}
      </div>

      {/* 기본 연락처 */}
      <Section id="basic" title="기본 정보">
        <div className="mt-4 grid gap-4 tablet:grid-cols-2">
          <Field label="주소" editing={editing}>
            {editing
              ? <input className={inputCls} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="서울시 강남구 테헤란로 000" />
              : <span className={valueCls}>{company.address || '—'}</span>}
          </Field>
          <Field label="대표 전화" editing={editing}>
            {editing
              ? <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="02-0000-0000" />
              : <span className={valueCls}>{company.phone || '—'}</span>}
          </Field>
          <Field label="팩스" editing={editing}>
            {editing
              ? <input className={inputCls} value={form.fax} onChange={e => setForm(f => ({ ...f, fax: e.target.value }))} placeholder="02-0000-0000" />
              : <span className={valueCls}>{company.fax || '—'}</span>}
          </Field>
          <Field label="홈페이지" editing={editing}>
            {editing
              ? <input className={inputCls} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
              : company.website
                ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-p14 text-primary underline">{company.website}</a>
                : <span className={valueCls}>—</span>}
          </Field>
          <Field label="시공능력평가액" editing={editing}>
            {editing
              ? <input className={inputCls} value={form.constructionCapacity} onChange={e => setForm(f => ({ ...f, constructionCapacity: e.target.value }))} placeholder="예: 50억원" />
              : <span className={valueCls}>{company.constructionCapacity || '—'}</span>}
          </Field>
        </div>
      </Section>

      {/* 주력 지역 */}
      <Section id="regions" title="주력 지역">
        <div className="mt-4">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {REGION_OPTIONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegion(r)}
                  className={`px-3 py-1.5 rounded-lg text-p13 font-medium border transition-colors ${
                    form.mainRegions.includes(r)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {(company.mainRegions ?? []).length > 0
                ? company.mainRegions.map(r => (
                    <span key={r} className="px-3 py-1 bg-primary/10 text-primary text-p13 font-medium rounded-lg">{r}</span>
                  ))
                : <span className="text-p14 text-ink-400">등록된 주력 지역이 없습니다.</span>}
            </div>
          )}
        </div>
      </Section>

      {/* 시공실적 */}
      <Section id="records" title="시공실적">
        <div className="mt-4 space-y-3">
          {(editing ? form.constructionRecords : (company.constructionRecords as ConstructionRecord[] | null) ?? []).map((rec, idx) => (
            <div key={idx} className="p-4 bg-brand-slate-50 rounded-xl border border-ink-100">
              {editing ? (
                <div className="grid gap-3 tablet:grid-cols-4">
                  <input className={inputCls} placeholder="연도 (예: 2023)" value={rec.year} onChange={e => updateRecord(idx, 'year', e.target.value)} />
                  <input className={`${inputCls} tablet:col-span-2`} placeholder="공사명" value={rec.name} onChange={e => updateRecord(idx, 'name', e.target.value)} />
                  <div className="flex gap-2">
                    <input className={inputCls} placeholder="발주처" value={rec.client} onChange={e => updateRecord(idx, 'client', e.target.value)} />
                    <button type="button" onClick={() => removeRecord(idx)} className="shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input className={`${inputCls} tablet:col-span-2`} placeholder="계약금액 (예: 3억 5천만원)" value={rec.amount} onChange={e => updateRecord(idx, 'amount', e.target.value)} />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-p15 font-semibold text-ink-700">{rec.name}</p>
                    <p className="text-p13 text-ink-400 mt-0.5">{rec.year} · {rec.client}</p>
                  </div>
                  <span className="shrink-0 text-p14 font-medium text-primary">{rec.amount}</span>
                </div>
              )}
            </div>
          ))}
          {editing && (
            <button type="button" onClick={addRecord} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-ink-200 rounded-xl text-p14 text-ink-400 hover:border-primary hover:text-primary transition-colors w-full justify-center">
              <Plus className="w-4 h-4" /> 실적 추가
            </button>
          )}
          {!editing && ((company.constructionRecords as ConstructionRecord[] | null) ?? []).length === 0 && (
            <p className="text-p14 text-ink-400">등록된 시공실적이 없습니다.</p>
          )}
        </div>
      </Section>

      {/* 보유장비/인력 */}
      <Section id="assets" title="보유장비 / 인력">
        <div className="mt-4 grid gap-6 tablet:grid-cols-2">
          <div>
            <p className="text-p14 font-semibold text-ink-600 mb-2">보유장비</p>
            <div className="space-y-2">
              {(editing ? form.equipmentAndStaff.equipment : (company.equipmentAndStaff?.equipment ?? [])).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  {editing ? (
                    <>
                      <input className={`${inputCls} flex-1`} value={item} onChange={e => updateEquipment(idx, e.target.value)} placeholder="예: 굴삭기 5톤" />
                      <button type="button" onClick={() => removeEquipment(idx)} className="shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-p14 text-ink-600">• {item}</span>
                  )}
                </div>
              ))}
              {editing && (
                <button type="button" onClick={addEquipment} className="flex items-center gap-1.5 text-p13 text-primary hover:underline">
                  <Plus className="w-3.5 h-3.5" /> 장비 추가
                </button>
              )}
              {!editing && (company.equipmentAndStaff?.equipment ?? []).length === 0 && (
                <p className="text-p14 text-ink-400">—</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-p14 font-semibold text-ink-600 mb-2">보유인력</p>
            <div className="space-y-2">
              {(editing ? form.equipmentAndStaff.staff : (company.equipmentAndStaff?.staff ?? [])).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  {editing ? (
                    <>
                      <input className={`${inputCls} flex-1`} value={item} onChange={e => updateStaff(idx, e.target.value)} placeholder="예: 현장소장 10년 경력" />
                      <button type="button" onClick={() => removeStaff(idx)} className="shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-p14 text-ink-600">• {item}</span>
                  )}
                </div>
              ))}
              {editing && (
                <button type="button" onClick={addStaff} className="flex items-center gap-1.5 text-p13 text-primary hover:underline">
                  <Plus className="w-3.5 h-3.5" /> 인력 추가
                </button>
              )}
              {!editing && (company.equipmentAndStaff?.staff ?? []).length === 0 && (
                <p className="text-p14 text-ink-400">—</p>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

function Field({ label, editing, children }: { label: string; editing: boolean; children: React.ReactNode }) {
  return (
    <div className={editing ? '' : ''}>
      <p className="text-p12 font-medium text-ink-400 mb-1">{label}</p>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 border border-ink-200 rounded-lg text-p14 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white'
const valueCls = 'text-p14 text-ink-700'
