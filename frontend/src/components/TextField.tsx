import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={fieldId} className="text-sm font-semibold text-stone-700">
        {label}
      </label>
      <input
        id={fieldId}
        className={`rounded-2xl border px-4 py-2.5 text-stone-800 outline-none transition-colors focus:border-coral-400 focus:ring-2 focus:ring-coral-100 ${
          error ? 'border-red-300' : 'border-stone-200'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
