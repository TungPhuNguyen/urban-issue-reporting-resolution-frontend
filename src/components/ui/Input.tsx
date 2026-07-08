import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={clsx(
          'h-10 rounded-lg border px-3 text-sm transition-colors outline-none',
          'focus:border-brand-500 focus:ring-brand-500/30 border-gray-300 bg-white text-gray-900 focus:ring-2',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
