import { NextResponse } from "next/server"

export async function GET() {
  const publicKey =
    process.env.NEXT_PUBLIC_LENCO_KEY ||
    process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY ||
    process.env.LENCO_PUBLIC_KEY ||
    ""

  return NextResponse.json({ publicKey })
}
