import { useRef } from 'react'
import { Input } from '#/components/ui/input'

export default function ColorTextField({
  defaultValue,
  onChange,
  onBlur,
  ariaLabel,
  placeholder,
}: {
  defaultValue: string
  onChange: (value: string) => void
  onBlur: (value: string) => void
  ariaLabel: string
  placeholder: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleBlur = () => {
    const value = inputRef.current?.value ?? ''
    onChange(value)
    onBlur(value)
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      defaultValue={defaultValue}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className="w-20 border-0 bg-transparent px-1 py-0.5 text-xs focus:ring-1"
    />
  )
}
