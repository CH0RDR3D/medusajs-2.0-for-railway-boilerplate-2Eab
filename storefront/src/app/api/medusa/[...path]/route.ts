import { NextRequest } from "next/server"

const getBackendUrl = () =>
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const getPublishableApiKey = () =>
  process.env.MEDUSA_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  ""

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const backendUrl = new URL(path.join("/"), `${getBackendUrl()}/`)
  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value)
  })

  const response = await fetch(backendUrl.toString(), {
    headers: {
      ...(getPublishableApiKey()
        ? { "x-publishable-api-key": getPublishableApiKey() }
        : {}),
    },
    cache: "no-store",
  })

  const body = await response.text()

  return new Response(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  })
}