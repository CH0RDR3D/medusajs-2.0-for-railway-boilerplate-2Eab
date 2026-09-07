import { NextResponse } from "next/server"
import crypto from "crypto"
import { sdk } from "@lib/config"

/**
 * Lenco Webhook Handler (Lenco API v2.0)
 *
 * Verifies HMAC SHA-256 signature from `x-lenco-signature` header,
 * maps transaction reference to Medusa cart, authorizes/captures
 * payment session, and completes cart into a confirmed order.
 */

function verifyLencoSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string
): boolean {
  if (!signatureHeader || !secretKey) {
    return false
  }

  try {
    const computedHmac = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("hex")

    const signatureBuffer = Buffer.from(signatureHeader.trim(), "hex")
    const computedBuffer = Buffer.from(computedHmac, "hex")

    if (signatureBuffer.length !== computedBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(
      Uint8Array.from(signatureBuffer),
      Uint8Array.from(computedBuffer)
    )
  } catch (err) {
    console.error("[Lenco Webhook] Signature verification error:", err)
    return false
  }
}

export async function POST(request: Request) {
  const secretKey =
    process.env.LENCO_WEBHOOK_SECRET ||
    process.env.LENCO_SECRET_KEY ||
    process.env.LENCO_API_KEY ||
    ""

  let rawBody = ""
  try {
    rawBody = await request.text()
  } catch (readErr) {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 })
  }

  const signatureHeader =
    request.headers.get("x-lenco-signature") ||
    request.headers.get("x-lenco-signature-sha256") ||
    request.headers.get("x-signature")

  // Verify signature if secret is configured
  if (secretKey && signatureHeader) {
    const isValid = verifyLencoSignature(rawBody, signatureHeader, secretKey)
    if (!isValid) {
      console.warn("[Lenco Webhook] Invalid HMAC signature received.")
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }
  } else if (!secretKey) {
    console.warn(
      "[Lenco Webhook] LENCO_WEBHOOK_SECRET or LENCO_SECRET_KEY is not set. Webhook received without signature validation."
    )
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch (parseErr) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  console.log("[Lenco Webhook] Event received:", {
    event: event?.event || event?.type,
    reference: event?.data?.reference || event?.reference,
    status: event?.data?.status || event?.status,
  })

  const eventType = (event?.event || event?.type || "").toLowerCase()
  const txData = event?.data || event
  const txStatus = (txData?.status || "").toLowerCase()
  const reference = txData?.reference || ""
  const transactionId = txData?.id || txData?.transaction_id || ""

  // Check for successful payment event
  const isSuccessful =
    eventType === "charge.completed" ||
    eventType === "collection.successful" ||
    eventType === "collection.completed" ||
    txStatus === "successful" ||
    txStatus === "settled" ||
    txStatus === "completed"

  if (!isSuccessful) {
    console.log(`[Lenco Webhook] Non-completion event ignored (${eventType}, status: ${txStatus})`)
    return NextResponse.json({ received: true, ignored: true }, { status: 200 })
  }

  // Extract cartId from reference (e.g., ref-cart_01JXYZ... or cart_01JXYZ...)
  const cartIdMatch = reference.match(/(cart_[a-zA-Z0-9]+)/)
  const cartId = cartIdMatch ? cartIdMatch[1] : null

  if (!cartId) {
    console.log(`[Lenco Webhook] No cart ID found in reference: ${reference}`)
    return NextResponse.json({ received: true, reference, cartId: null }, { status: 200 })
  }

  try {
    console.log(`[Lenco Webhook] Processing Medusa order completion for cart: ${cartId}`)

    // 1. Retrieve cart to inspect current status
    const cartRes = await sdk.store.cart
      .retrieve(cartId, { fields: "+metadata,+payment_collection" })
      .catch((err) => {
        console.warn(`[Lenco Webhook] Could not retrieve cart ${cartId}:`, err?.message)
        return null
      })

    if (!cartRes?.cart) {
      console.log(`[Lenco Webhook] Cart ${cartId} not found or already completed.`)
      return NextResponse.json({ received: true, cartId, status: "cart_not_found_or_completed" }, { status: 200 })
    }

    // 2. Initialize payment session if not already done
    try {
      await sdk.store.payment.initiatePaymentSession(
        cartRes.cart,
        {
          provider_id: "pp_system_default",
          data: {
            lenco_reference: reference,
            lenco_transaction_id: transactionId,
            amount: txData?.amount,
          },
        },
        {},
        {}
      )
    } catch (paymentErr: any) {
      console.log("[Lenco Webhook] Payment session init note:", paymentErr?.message)
    }

    // 3. Complete cart workflow (rail guard: idempotent)
    const completeRes = await sdk.store.cart.complete(cartId)
    console.log(`[Lenco Webhook] Cart completion result for ${cartId}:`, completeRes?.type)

    return NextResponse.json(
      {
        received: true,
        success: true,
        cartId,
        orderId: completeRes?.type === "order" ? completeRes.order.id : null,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error(`[Lenco Webhook] Error completing order for cart ${cartId}:`, error)
    // Return 200 to prevent Lenco from retrying if order is already fulfilled or non-retryable
    return NextResponse.json(
      {
        received: true,
        error: error?.message || "Internal processing error",
      },
      { status: 200 }
    )
  }
}
