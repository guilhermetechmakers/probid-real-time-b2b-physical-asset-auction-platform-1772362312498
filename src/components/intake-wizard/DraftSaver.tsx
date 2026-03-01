/**
 * DraftSaver - Auto-save mechanism with debounce
 */

import { useEffect, useRef, useCallback } from 'react'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import type { DraftData } from '@/types'

export function useDraftSaver(
  draftId: string | null,
  data: DraftData,
  step: number,
  onSave: (draftId: string, payload: { data: DraftData; step?: number }) => Promise<void>,
  debounceMs = 45000
) {
  const prevDataRef = useRef<string>('')
  const save = useDebouncedCallback(
    useCallback(async () => {
      if (!draftId) return
      try {
        await onSave(draftId, { data, step })
        toast.success('Draft saved')
      } catch {
        toast.error('Failed to save draft')
      }
    }, [draftId, data, step, onSave]),
    debounceMs
  )

  useEffect(() => {
    const serialized = JSON.stringify({ data, step })
    if (prevDataRef.current && prevDataRef.current !== serialized) {
      save()
    }
    prevDataRef.current = serialized
  }, [data, step, save])
}
