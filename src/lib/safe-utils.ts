/**
 * Runtime safety utilities for array operations and API responses.
 * Guards against null/undefined to prevent runtime crashes.
 */

export function safeMap<T, U>(
  items: T[] | null | undefined,
  fn: (item: T, index: number) => U
): U[] {
  return Array.isArray(items) ? items.map(fn) : []
}

export function safeFilter<T>(
  items: T[] | null | undefined,
  predicate: (item: T, index: number) => boolean
): T[] {
  return Array.isArray(items) ? items.filter(predicate) : []
}

export function safeAccess<T>(
  obj: Record<string, unknown> | null | undefined,
  key: string | number
): T | undefined {
  if (obj == null) return undefined
  return obj[key as keyof typeof obj] as T | undefined
}

export function ensureArray<T>(value: T[] | null | undefined): T[] {
  return value ?? []
}

export function safeFirst<T>(items: T[] | null | undefined): T | undefined {
  const arr = Array.isArray(items) ? items : []
  return arr[0]
}

export function safeLast<T>(items: T[] | null | undefined): T | undefined {
  const arr = Array.isArray(items) ? items : []
  return arr[arr.length - 1]
}
