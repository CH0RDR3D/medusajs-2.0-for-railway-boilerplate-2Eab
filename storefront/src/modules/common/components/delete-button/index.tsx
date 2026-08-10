import { removeFromCart } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useState } from "react"

const DeleteButton = ({
  id,
  variantId,
  productId,
  children,
  className,
  ...rest
}: {
  id: string
  variantId?: string
  productId?: string
  children?: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    setError(null)
    setIsDeleting(true)

    await removeFromCart({
      lineId: id,
      variantId,
      productId,
    })
      .then(() => {
        router.refresh()
      })
      .catch((err) => {
        setError(err?.message || "Failed to remove item from cart")
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        type="button"
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={() => handleDelete(id)}
        disabled={isDeleting}
        {...rest}
      >
        {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
        <span>{children}</span>
      </button>
      {error && <span className="ml-2 text-ui-fg-error">{error}</span>}
    </div>
  )
}

export default DeleteButton
