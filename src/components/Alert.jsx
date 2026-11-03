import { CircleAlert, CircleCheck, Info } from 'lucide-react'

const styles = {
  error: { box: 'border-rose-200 bg-rose-50 text-rose-800', Icon: CircleAlert },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CircleCheck },
  info: { box: 'border-indigo-200 bg-indigo-50 text-indigo-800', Icon: Info },
}

// Kotak pesan. Contoh: <Alert type="error">Email salah</Alert>
export default function Alert({ type = 'info', children }) {
  if (!children) return null
  const { box, Icon } = styles[type] || styles.info

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${box}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
