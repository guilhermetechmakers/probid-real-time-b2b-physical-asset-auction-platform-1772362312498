/**
 * SearchBar - Client-side search to filter docs and FAQs.
 */
import { useState, useCallback, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 200

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search docs and FAQs...',
  className,
  id = 'help-search',
}: SearchBarProps) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    const t = setTimeout(() => {
      onChange(local)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [local, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocal(e.target.value)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        id={id}
        type="search"
        role="searchbox"
        aria-label="Search help content"
        placeholder={placeholder}
        value={local}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  )
}
