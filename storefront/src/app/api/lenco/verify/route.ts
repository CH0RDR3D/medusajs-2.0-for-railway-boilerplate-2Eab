import { NextResponse } from "next/server"

function getLencoBaseUrl(secretKey?: string): string {
  if (process.env.LENCO_BASE_URL) {
    let url = process.env.LENCO_BASE_URL.replace(/\/+$/, "")
    if (!url.includes("/access/v2")) {
      url = `${url}/access/v2`
    }
    return url
  }
  const key =
    secretKey ||
    process.env.LENCO_SECRET_KEY ||
    process.env.NEXT_PUBLIC_LENCO_KEY ||
    process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY ||
    ""
  const isSandbox =
    !key ||
    key.startsWith("sec-test-") ||
    key.startsWith("pub-test-") ||
    key.includes("test") ||
    key.includes("sandbox")
  return isSandbox
    ? "https://sandbox.lenco.co/access/v2"
    : "https://api.lenco.co/access/v2"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference =
    searchParams.get("reference") ||
    searchParams.get("transaction_id") ||
    searchParams.get("id")

  if (!reference || reference === "undefined" || reference === "null") {
    return NextResponse.json(
      { success: false, error: "Missing or invalid reference parameter" },
      { status: 400 }
    )
  }

  const secretKey =
    process.env.LENCO_SECRET_KEY ||
    process.env.LENCO_API_KEY ||
    process.env.LENCO_KEY

  if (!secretKey) {
    console.error("[Lenco Verify] LENCO_SECRET_KEY is not configured in environment variables.")
    return NextResponse.json(
      {
        success: false,
        error: "LENCO_SECRET_KEY is missing on server",
      },
      { status: 500 }
    )
  }

  const baseUrl = getLencoBaseUrl(secretKey)

  try {
    console.log(`[Lenco Verify] Verifying payment reference: ${reference} against ${baseUrl}`)

    const response = await fetch(
      `${baseUrl}/collections/status/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          "User-Agent": "SYA-Storefront/2.0.0",
        },
        cache: "no-store",
      }
    )

    const data = await response.json()
    console.log("[Lenco Verify] Response status:", response.status, "data:", data)

    // Lenco API v2.0 response schema:
    // { status: true, message: "...", data: { status: "successful" | "settled" | "completed", reference, amount, currency } }
    const txData = data?.data || data
    const txStatus = (txData?.status || data?.status || "").toString().toLowerCase()

    const isSuccessful =
      response.ok &&
      (data.status === true || data.status === "successful") &&
      (txStatus === "successful" ||
        txStatus === "settled" ||
        txStatus === "completed" ||
        txStatus === "true")

    if (isSuccessful) {
      return NextResponse.json({
        success: true,
        status: "successful",
        reference,
        transactionId: txData?.id,
        amount: txData?.amount,
        currency: txData?.currency,
        data: txData,
      })
    }

    const message = (data?.message || "").toString()
    const isIpWhitelistError = message.toLowerCase().includes("ip address is not whitelisted") || message.toLowerCase().includes("whitelist")

    if (isIpWhitelistError) {
      console.warn(
        `[Lenco Verify] Lenco rejected API call because the server IP is not whitelisted. Please disable IP whitelisting or add your server IP in Lenco Dashboard -> Settings -> API & Webhooks.`
      )
    }

    return NextResponse.json(
      {
        success: false,
        isIpWhitelistError,
        status: txStatus || "unverified",
        message: message || "Transaction status is not successful",
        data: txData,
      },
      { status: response.status >= 400 ? response.status : 400 }
    )
  } catch (error) {
    console.error("[Lenco Verify] Fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Verification failed", details: String(error) },
      { status: 500 }
    )
  }
}
