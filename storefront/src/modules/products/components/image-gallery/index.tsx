"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const validImages = useMemo(
    () => images.filter((image) => Boolean(image?.url)),
    [images]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const selectedImage = validImages[selectedIndex]

  useEffect(() => {
    if (validImages.length < 2) {
      return
    }

    const interval = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % validImages.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [validImages.length])

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
    <div className="flex flex-col items-start relative w-full">
      <div className="flex flex-col flex-1 gap-y-4 w-full">
        <Container
          className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle rounded-rounded"
          id={selectedImage.id}
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
                onClick={() => setSelectedIndex(index)}
                className="shrink-0 w-20 small:w-24 rounded-rounded overflow-hidden snap-center"
                data-thumbnail-index={index}
                aria-label={`Select product image ${index + 1}`}
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
