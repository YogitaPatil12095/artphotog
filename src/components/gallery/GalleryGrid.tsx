import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Masonry from 'react-masonry-css'
import type { Image as GalleryImage } from '@/types/database'
import { getFilterStyle } from '@/lib/filters'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryGridProps {
  images: GalleryImage[]
}

const breakpointCols = {
  default: 5,
  1280: 5,
  1024: 4,
  768: 3,
  480: 2,
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)), [images.length])
  const next = useCallback(() => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null)), [images.length])

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null

  return (
    <>
      <Masonry breakpointCols={breakpointCols} className="masonry-grid" columnClassName="masonry-grid-column">
        {images.map((image, index) => {
          const filterStyle = getFilterStyle(image.filter_name)
          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="relative group cursor-pointer overflow-hidden rounded-xl"
              onClick={() => openLightbox(index)}
            >
              <div className="relative w-full overflow-hidden rounded-xl">
                <img
                  src={image.image_url}
                  alt={image.caption || `Image ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  style={filterStyle}
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300 rounded-xl" />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-charcoal/80 text-cream/90 text-xs font-sans translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-b-xl">
                    {image.caption}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </Masonry>

      <AnimatePresence>
        {currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lightbox-overlay"
            onClick={closeLightbox}
          >
            <button className="absolute top-5 right-5 z-20 p-2 text-cream/60 hover:text-cream transition-colors" onClick={closeLightbox}>
              <X size={24} />
            </button>
            {images.length > 1 && (
              <button className="absolute left-4 z-20 p-3 text-cream/60 hover:text-cream transition-colors" onClick={(e) => { e.stopPropagation(); prev() }}>
                <ChevronLeft size={28} />
              </button>
            )}
            <motion.div
              key={currentImage.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-5xl max-h-[85vh] mx-12"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage.image_url}
                alt={currentImage.caption || 'Gallery image'}
                loading="eager"
                decoding="async"
                className="max-h-[80vh] w-auto h-auto object-contain rounded-sm shadow-2xl"
                style={getFilterStyle(currentImage.filter_name)}
              />
              {currentImage.caption && (
                <p className="mt-4 text-center text-cream/50 text-sm font-sans">{currentImage.caption}</p>
              )}
              <p className="mt-2 text-center font-mono text-xs text-cream/25 tracking-widest">
                {(lightboxIndex || 0) + 1} / {images.length}
              </p>
            </motion.div>
            {images.length > 1 && (
              <button className="absolute right-4 z-20 p-3 text-cream/60 hover:text-cream transition-colors" onClick={(e) => { e.stopPropagation(); next() }}>
                <ChevronRight size={28} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
