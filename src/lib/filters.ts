import type React from 'react'

export type FilterName =
  | 'none'
  | 'soft-warm'
  | 'dusty-vintage'
  | 'muted-pastel'
  | 'film-grain'
  | 'cool-blue'
  | 'black-white'
  | 'low-contrast'

export interface Filter {
  name: FilterName
  label: string
  cssFilter: string
  overlayColor?: string
  overlayOpacity?: number
}

export const FILTERS: Filter[] = [
  { name: 'none', label: 'None / Original', cssFilter: 'none' },
  { name: 'soft-warm', label: 'Soft Warm', cssFilter: 'sepia(0.2) saturate(1.1) brightness(1.05) contrast(0.95)', overlayColor: '#F4D09B', overlayOpacity: 0.08 },
  { name: 'dusty-vintage', label: 'Dusty Vintage', cssFilter: 'sepia(0.35) saturate(0.8) brightness(0.95) contrast(0.9)', overlayColor: '#C4A882', overlayOpacity: 0.12 },
  { name: 'muted-pastel', label: 'Muted Pastel', cssFilter: 'saturate(0.7) brightness(1.05) contrast(0.88)', overlayColor: '#F4F0E8', overlayOpacity: 0.1 },
  { name: 'film-grain', label: 'Film Grain', cssFilter: 'sepia(0.15) contrast(1.05) brightness(0.98) saturate(0.9)', overlayColor: '#2F2F2F', overlayOpacity: 0.04 },
  { name: 'cool-blue', label: 'Cool Blue', cssFilter: 'saturate(0.8) hue-rotate(10deg) brightness(1.02) contrast(0.95)', overlayColor: '#B7C8CF', overlayOpacity: 0.1 },
  { name: 'black-white', label: 'Black & White', cssFilter: 'grayscale(1) contrast(1.05) brightness(1.02)' },
  { name: 'low-contrast', label: 'Low Contrast', cssFilter: 'contrast(0.8) brightness(1.05) saturate(0.85)', overlayColor: '#F4F0E8', overlayOpacity: 0.15 },
]

export function getFilter(name: string | null): Filter {
  return FILTERS.find((f) => f.name === name) ?? FILTERS[0]
}

export function getFilterStyle(filterName: string | null): React.CSSProperties {
  const filter = getFilter(filterName)
  return { filter: filter.cssFilter }
}
