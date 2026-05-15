import PasswordChangeForm from '@/app/change-password/PasswordChangeForm'

export default function SettingsAccountPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-t5 font-bold text-ink-700">계정 보안</h1>
        <p className="mt-1 text-p14 text-ink-400">비밀번호를 변경합니다.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-card-md p-6 max-w-md">
        <PasswordChangeForm />
      </div>
    </div>
  )
}
