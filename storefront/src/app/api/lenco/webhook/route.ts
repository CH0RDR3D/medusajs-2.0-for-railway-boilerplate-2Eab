import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const event = await request.json()

    if (event?.type === "collection.successful") {
      console.log("Payment successful:", event.data?.reference)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Webhook processing failed", details: String(error) }, { status: 500 })
  }
}
