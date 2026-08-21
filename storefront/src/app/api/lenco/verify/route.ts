import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json({ error: "Missing reference parameter" }, { status: 400 })
  }

  const baseUrl = (process.env.LENCO_BASE_URL ?? "").replace(/\/+$/, "")

  try {
    console.log(`[Lenco] Verifying payment reference: ${reference}`)

    const response = await fetch(`${baseUrl}/collections/status/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.LENCO_SECRET_KEY}`,
        "User-Agent": "SYA-Storefront/2.0.0",
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[Lenco] Verification fetch failed:", error)
    return NextResponse.json({ error: "Verification failed", details: String(error) }, { status: 500 })
  }
}
