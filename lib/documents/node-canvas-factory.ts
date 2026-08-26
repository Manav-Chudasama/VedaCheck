import { createCanvas, type Canvas, type SKRSContext2D } from "@napi-rs/canvas"

type CanvasAndContext = {
  canvas: Canvas
  context: SKRSContext2D
}

type NodeCanvasFactoryOptions = {
  ownerDocument?: unknown
  enableHWA?: boolean
}

/**
 * pdf.js CanvasFactory class backed by `@napi-rs/canvas`.
 * Pass the class (not an instance) to `getDocument({ CanvasFactory })`.
 */
export class NodeCanvasFactory {
  // pdf.js constructs factories with `{ ownerDocument, enableHWA }`.
  constructor(_options: NodeCanvasFactoryOptions = {}) {}

  create(width: number, height: number): CanvasAndContext {
    const canvas = createCanvas(Math.ceil(width), Math.ceil(height))
    const context = canvas.getContext("2d")
    return { canvas, context }
  }

  reset(
    canvasAndContext: CanvasAndContext,
    width: number,
    height: number
  ): void {
    canvasAndContext.canvas.width = Math.ceil(width)
    canvasAndContext.canvas.height = Math.ceil(height)
  }

  destroy(canvasAndContext: CanvasAndContext): void {
    canvasAndContext.canvas.width = 0
    canvasAndContext.canvas.height = 0
  }
}
