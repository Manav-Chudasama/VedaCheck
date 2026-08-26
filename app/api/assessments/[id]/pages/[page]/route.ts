import { NextResponse } from "next/server"

import { getAnswerSheetPageRaster } from "@/lib/assessment/store"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{
    id: string
    page: string
  }>
}

/**
 * Serve a single answer-sheet page raster from the in-memory assessment store.
 * GET /api/assessments/[id]/pages/[page]
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id, page: pageParam } = await context.params
  const page = Number.parseInt(pageParam, 10)

  if (!id?.trim() || !Number.isInteger(page) || page < 1) {
    return NextResponse.json(
      { error: "Invalid assessment id or page number" },
      { status: 400 }
    )
  }

  const raster = getAnswerSheetPageRaster(id, page)
  if (!raster) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(raster.buffer), {
    status: 200,
    headers: {
      "Content-Type": raster.mimeType,
      "Content-Length": String(raster.buffer.byteLength),
      "Cache-Control": "private, max-age=300",
      "X-Page-Width": String(raster.width),
      "X-Page-Height": String(raster.height),
    },
  })
}
