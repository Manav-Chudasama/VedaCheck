import {
  DEFAULT_MAX_LONG_EDGE,
  DEFAULT_MAX_PAGES,
  DEFAULT_PDF_SCALE,
  DEFAULT_WEBP_QUALITY,
  DocumentRasterizeError,
  type PageRaster,
  type RasterizeOptions,
} from "@/lib/documents/types"
import { encodePageRaster } from "@/lib/documents/encode-page"
import { NodeCanvasFactory } from "@/lib/documents/node-canvas-factory"

async function loadPdfjs() {
  // Legacy build avoids DOMMatrix / browser-only APIs in Node.
  // Do not use import.meta.resolve here — Turbopack/Next replace it with a
  // stub that is not a function. Workers are disabled in getDocument below.
  return import("pdfjs-dist/legacy/build/pdf.mjs")
}

/**
 * Rasterize each PDF page to a WebP PageRaster with preserved pixel size.
 */
export async function rasterizePdf(
  data: Buffer | Uint8Array,
  options: RasterizeOptions = {}
): Promise<PageRaster[]> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES
  const pdfScale = options.pdfScale ?? DEFAULT_PDF_SCALE
  const maxLongEdge = options.maxLongEdge ?? DEFAULT_MAX_LONG_EDGE
  const webpQuality = options.webpQuality ?? DEFAULT_WEBP_QUALITY

  const pdfjs = await loadPdfjs()

  let document
  try {
    document = await pdfjs.getDocument({
      data: data instanceof Buffer ? new Uint8Array(data) : data,
      // Class, not instance — pdf.js does `new CanvasFactory(...)`.
      CanvasFactory: NodeCanvasFactory,
      // Node/serverless: avoid worker threads (not in public TS types).
      disableWorker: true,
      isEvalSupported: false,
      useSystemFonts: true,
    } as Parameters<typeof pdfjs.getDocument>[0]).promise
  } catch (error) {
    throw new DocumentRasterizeError("Failed to open PDF", { cause: error })
  }

  const canvasFactory = new NodeCanvasFactory()

  try {
    const pageCount = Math.min(document.numPages, maxPages)
    if (document.numPages > maxPages) {
      // Soft cap — keep processing first N pages rather than failing the upload.
      console.warn(
        `[rasterizePdf] PDF has ${document.numPages} pages; truncating to ${maxPages}`
      )
    }

    const pages: PageRaster[] = []

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await document.getPage(pageNum)
      const viewport = page.getViewport({ scale: pdfScale })
      const canvasAndContext = canvasFactory.create(
        viewport.width,
        viewport.height
      )

      try {
        // @napi-rs/canvas types do not match DOM Canvas*; pdfjs accepts them at runtime.
        await page.render({
          canvasContext:
            canvasAndContext.context as unknown as CanvasRenderingContext2D,
          canvas: canvasAndContext.canvas as unknown as HTMLCanvasElement,
          viewport,
        }).promise

        const png = Buffer.from(canvasAndContext.canvas.toBuffer("image/png"))
        const raster = await encodePageRaster(png, pageNum, {
          maxLongEdge,
          webpQuality,
        })
        pages.push(raster)
      } finally {
        canvasFactory.destroy(canvasAndContext)
        page.cleanup()
      }
    }

    return pages
  } catch (error) {
    if (error instanceof DocumentRasterizeError) throw error
    throw new DocumentRasterizeError("Failed to rasterize PDF pages", {
      cause: error,
    })
  } finally {
    await document.cleanup()
  }
}
