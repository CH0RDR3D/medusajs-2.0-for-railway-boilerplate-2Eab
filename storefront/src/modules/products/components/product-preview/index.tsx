import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { convertToLocale } from "@lib/util/money"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  const price = cheapestPrice?.calculated_price_number ?? 0
  const originalPrice = cheapestPrice?.original_price_number ?? 0
  const discountPct =
    cheapestPrice?.price_type === "sale" && cheapestPrice.percentage_diff
      ? parseInt(cheapestPrice.percentage_diff)
      : null

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-black/5 dark:border-white/5 bg-transparent transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-amber-400/40 hover:border-transparent hover:bg-black/5 dark:hover:bg-white/5 h-full"
    >
      {/* Image zone */}
      <div className="relative w-full aspect-square overflow-hidden" style={{ background: "var(--bg-surface)" }}>
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title ?? "Product Image"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 250px"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110 scale-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {discountPct && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-full z-10">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Info zone */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-xs md:text-sm text-[var(--text-secondary)] font-medium line-clamp-2 group-hover:text-[var(--text-primary)] transition leading-snug">
          {product.title}
        </h3>

        <div className="mt-auto pt-3 flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--text-primary)]" data-testid="price">
              {cheapestPrice?.calculated_price}
            </span>
            {discountPct && (
              <span className="text-xs text-[var(--text-muted)] line-through" data-testid="original-price">
                {cheapestPrice?.original_price}
              </span>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
