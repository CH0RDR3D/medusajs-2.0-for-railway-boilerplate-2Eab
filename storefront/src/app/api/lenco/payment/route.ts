import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const baseUrl = (process.env.LENCO_BASE_URL ?? "").replace(/\/+$/, "")

    const response = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LENCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: "ZMW",
        recipient_account: body.recipient,
        narration: body.narration,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: "Payment failed", details: String(error) }, { status: 500 })
  }
}
