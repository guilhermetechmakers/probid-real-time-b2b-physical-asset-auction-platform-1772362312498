/**
 * SearchBar - Debounced search with autosuggest dropdown and keyboard navigation.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { fetchSuggestions } from '@/api/marketplace'
import type { SuggestResult } from '@/types/marketplace'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (result: SuggestResult) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onSelect,
  placeholder = 'Search by keyword, identifier, location...',
  className,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestResult[]>([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedValue = useDebounce(value, 300)

  const loadSuggestions = useCallback(async (q: string) => {
    if (!q?.trim() || q.trim().length < 2) {
      setSuggestions([])
      return
    }
    try {
      const results = await fetchSuggestions(q)
      setSuggestions(Array.isArray(results) ? results : [])
      setHighlightIndex(-1)
    } catch {
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    loadSuggestions(debouncedValue)
  }, [debouncedValue, loadSuggestions])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current != null && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = suggestions ?? []
    if (list.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => (i < list.length - 1 ? i + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => (i > 0 ? i - 1 : list.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && highlightIndex < list.length) {
          const item = list[highlightIndex]
          if (item?.listingId) {
            onSelect?.(item)
          }
          onChange(item?.text ?? '')
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightIndex(-1)
        break
      default:
        break
    }
  }

  const handleSelect = (item: SuggestResult) => {
    onChange(item.text)
    onSelect?.(item)
    setIsOpen(false)
  }

  const showDropdown = isOpen && (suggestions ?? []).length > 0

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            highlightIndex >= 0 && highlightIndex < (suggestions ?? []).length
              ? `suggestion-${highlightIndex}`
              : undefined
          }
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
      </div>
      {showDropdown && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-[rgb(var(--border))] bg-card py-2 shadow-card"
        >
          {(suggestions ?? []).map((item, i) => (
            <li
              key={item.id}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === highlightIndex}
              className={cn(
                'cursor-pointer px-4 py-2 text-sm transition-colors',
                i === highlightIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              )}
              onMouseEnter={() => setHighlightIndex(i)}
              onClick={() => handleSelect(item)}
            >
              <span className="font-medium">{item.text}</span>
              {item.type !== 'keyword' && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {item.type}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
