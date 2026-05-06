import imageCompression from 'browser-image-compression'
import heic2any from 'heic2any'
import { supabase } from '@/lib/supabase'

// Convert HEIC/HEIF (iPhone format) to JPEG first, then compress
export async function compressImage(file: File): Promise<File> {
  let workingFile = file

  const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
    || file.name.toLowerCase().endsWith('.heic')
    || file.name.toLowerCase().endsWith('.heif')

  if (isHeic) {
    try {
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
      const blob = Array.isArray(converted) ? converted[0] : converted
      workingFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' })
    } catch (err) {
      console.error('HEIC conversion failed, using original:', err)
    }
  }

  try {
    return await imageCompression(workingFile, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
      preserveExif: true,
    })
  } catch (error) {
    console.error('Compression failed, using original:', error)
    return workingFile
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getPublicImageUrl(path: string) {
  const { data } = supabase.storage.from('gallery').getPublicUrl(path)
  return data.publicUrl
}
