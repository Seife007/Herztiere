import type { ReactNode } from 'react'

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-800">{title}</h1>
      <div className="mt-6 flex flex-col gap-5 rounded-3xl bg-white p-6 text-sm leading-relaxed text-stone-600 shadow-md sm:p-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-stone-800 [&_strong]:text-stone-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
        {children}
      </div>
    </div>
  )
}
