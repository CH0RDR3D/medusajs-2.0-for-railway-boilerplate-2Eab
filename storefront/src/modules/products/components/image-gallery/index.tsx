"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

// Minimum horizontal drag distance (px) to register as a swipe.
const SWIPE_THRESHOLD = 40

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const validImages = useMemo(
    () => images.filter((image) => Boolean(image?.url)),
    [images]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const selectedImage = validImages[selectedIndex]

  // Auto-scroll through thumbnails when idle (not hovered or touched)
  useEffect(() => {
    if (validImages.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % validImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [validImages.length, isHovered])

  const goTo = useCallback(
    (index: number) => {
      if (!validImages.length) return
      setSelectedIndex(((index % validImages.length) + validImages.length) % validImages.length)
    },
    [validImages.length]
  )

  const goPrev = useCallback(() => goTo(selectedIndex - 1), [goTo, selectedIndex])
  const goNext = useCallback(() => goTo(selectedIndex + 1), [goTo, selectedIndex])

  // Manual swipe navigation only — no auto-advance.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? goNext() : goPrev()
    }
  }

  useEffect(() => {
    const activeThumbnail = thumbnailsRef.current?.querySelector(
      `[data-thumbnail-index="${selectedIndex}"]`
    ) as HTMLButtonElement | null

    activeThumbnail?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [selectedIndex])

  if (!selectedImage?.url) {
    return null
  }

  return (
    <div
      className="flex flex-col items-start relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <div className="flex flex-col flex-1 gap-y-4 w-full">
        <Container
          className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle rounded-rounded"
          id={selectedImage.id}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={selectedImage.url}
            priority
            className="absolute inset-0 rounded-rounded"
            alt={`Product image ${selectedIndex + 1}`}
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{
              objectFit: "cover",
            }}
          />

          {validImages.length > 1 && (
            <>
              {/* Manual-only prev/next controls — min 44px tap target for touch */}
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-ui-bg-base/80 text-ui-fg-base shadow-md hover:bg-ui-bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-ui-bg-base/80 text-ui-fg-base shadow-md hover:bg-ui-bg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </Container>

        {validImages.length > 1 && (
          <div
            ref={thumbnailsRef}
            className="flex w-full gap-2 overflow-x-auto pb-1 snap-x snap-mandatory"
          >
            {validImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                // Keep thumbnail selection local to avoid route-level re-renders.
                onClick={() => goTo(index)}
                className="shrink-0 w-20 small:w-24 min-h-11 rounded-rounded overflow-hidden snap-center"
                data-thumbnail-index={index}
                aria-label={`Select product image ${index + 1}`}
                aria-current={index === selectedIndex}
              >
                <Container
                  className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle"
                >
                  <Image
                    src={image.url!}
                    alt={`Product thumbnail ${index + 1}`}
                    fill
                    sizes="120px"
                    className={`absolute inset-0 transition-opacity ${
                      index === selectedIndex ? "opacity-100" : "opacity-70"
                    }`}
                    style={{ objectFit: "cover" }}
                  />
                </Container>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
