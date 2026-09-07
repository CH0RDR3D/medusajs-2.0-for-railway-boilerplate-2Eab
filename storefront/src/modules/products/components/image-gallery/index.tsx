"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useCallback, useMemo, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

// Minimum horizontal drag distance (px) to register as a swipe
const SWIPE_THRESHOLD = 40

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const validImages = useMemo(
    () => images.filter((image) => Boolean(image?.url)),
    [images]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const selectedImage = validImages[selectedIndex]

  // Safe manual navigation without triggering window-level scroll resets
  const goTo = useCallback(
    (index: number) => {
      if (!validImages.length) return
      const newIndex = ((index % validImages.length) + validImages.length) % validImages.length
      setSelectedIndex(newIndex)

      // Center the active thumbnail within the thumbnail strip only
      if (thumbnailsRef.current) {
        const container = thumbnailsRef.current
        const activeThumbnail = container.querySelector(
          `[data-thumbnail-index="${newIndex}"]`
        ) as HTMLElement | null

        if (activeThumbnail) {
          const containerLeft = container.getBoundingClientRect().left
          const thumbLeft = activeThumbnail.getBoundingClientRect().left
          const offset =
            thumbLeft - containerLeft - container.clientWidth / 2 + activeThumbnail.clientWidth / 2
          container.scrollBy({ left: offset, behavior: "smooth" })
        }
      }
    },
    [validImages.length]
  )

  const goPrev = useCallback(() => goTo(selectedIndex - 1), [goTo, selectedIndex])
  const goNext = useCallback(() => goTo(selectedIndex + 1), [goTo, selectedIndex])

  // Touch swipe support for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goNext()
      } else {
        goPrev()
      }
    }
  }

  if (!selectedImage?.url) {
    return null
  }

  return (
    <div className="flex flex-col items-start relative w-full">
      <div className="flex flex-col flex-1 gap-y-4 w-full">
        {/* Main Product Image Container */}
        <Container
          className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle rounded-rounded shadow-sm border border-[var(--surface-border)]"
          id={selectedImage.id}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={selectedImage.url}
            priority
            className="absolute inset-0 rounded-rounded object-cover"
            alt={`Product image ${selectedIndex + 1}`}
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
          />

          {validImages.length > 1 && (
            <>
              {/* Prev / Next Arrows */}
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-ui-bg-base/85 text-ui-fg-base shadow-md hover:bg-ui-bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-transform active:scale-95"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-ui-bg-base/85 text-ui-fg-base shadow-md hover:bg-ui-bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-transform active:scale-95"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </Container>

        {/* Thumbnails Strip */}
        {validImages.length > 1 && (
          <div
            ref={thumbnailsRef}
            className="flex w-full gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none"
          >
            {validImages.map((image, index) => {
              const isCurrent = index === selectedIndex
              return (
                <button
                  key={image.id || index}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`shrink-0 w-20 small:w-24 min-h-11 rounded-lg overflow-hidden snap-center border-2 transition-all duration-150 ${
                    isCurrent
                      ? "border-amber-500 opacity-100 ring-2 ring-amber-500/20"
                      : "border-transparent opacity-65 hover:opacity-90"
                  }`}
                  data-thumbnail-index={index}
                  aria-label={`Select product image ${index + 1}`}
                  aria-current={isCurrent}
                >
                  <Container className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle">
                    <Image
                      src={image.url!}
                      alt={`Product thumbnail ${index + 1}`}
                      fill
                      sizes="120px"
                      className="absolute inset-0 object-cover"
                    />
                  </Container>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
