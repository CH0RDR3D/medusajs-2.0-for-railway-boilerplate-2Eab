import { NextResponse } from "next/server"

export async function GET() {
  const publicKey =
    process.env.NEXT_PUBLIC_LENCO_KEY ||
    process.env.NEXT_PUBLIC_LENCO_PUBLIC_KEY ||
    process.env.LENCO_PUBLIC_KEY ||
    ""

  const isSandbox =
    process.env.NEXT_PUBLIC_LENCO_ENV === "sandbox" ||
    process.env.LENCO_ENV === "sandbox" ||
    (process.env.LENCO_BASE_URL || "").includes("sandbox") ||
    publicKey.includes("test") ||
    publicKey.includes("sandbox")

  return NextResponse.json({
    publicKey,
    isSandbox,
  })
}
