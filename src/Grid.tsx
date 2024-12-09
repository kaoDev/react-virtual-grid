import moize from "moize"
import React, { useRef } from "react"
import { useElementSize } from "./elementSize"
import { useComponentScrollPosition } from "./scrollHook"

const calcVerticalOffsets = moize(
  (top: number, maxPadding: number, cellHeight: number, overScan: number) => {
    const scrolledCellFraction = top % cellHeight

    const paddingTop = Math.min(
      Math.max(
        0,
        top - Math.floor(overScan / 2) * cellHeight - scrolledCellFraction,
      ),
      maxPadding,
    )
    const offsetTop = Math.round(paddingTop / cellHeight)

    return {
      paddingTop,
      offsetTop,
    }
  },
)
const calcHorizontalOffsets = moize(
  (left: number, maxPadding: number, cellWidth: number, overScan: number) => {
    const scrolledCellFraction = left % cellWidth

    const paddingLeft = Math.min(
      Math.max(
        0,
        left - Math.ceil(overScan / 2) * cellWidth - scrolledCellFraction,
      ),
      maxPadding,
    )
    const offsetLeft = Math.round(paddingLeft / cellWidth)

    return {
      paddingLeft,
      offsetLeft,
    }
  },
)

const generateRow = moize((offsetLeft: number, renderedColumnCount: number) =>
  Array.from({ length: renderedColumnCount }).map((_, x) => x + offsetLeft),
)

const generateGridArray = moize(
  (
    offsetTop: number,
    offsetLeft: number,
    renderedColumnCount: number,
    renderedRowCount: number,
  ) =>
    Array.from({ length: renderedRowCount }).map((_, row) => {
      const y = row + offsetTop
      return { y, row: generateRow(offsetLeft, renderedColumnCount) }
    }),
)

const calcRenderedRowCount = moize(
  (renderedHeight: number, cellHeight: number, overScan: number) =>
    Math.floor(renderedHeight / cellHeight) + overScan,
)
const calcRenderedColumnCount = moize(
  (renderedWidth: number, cellWidth: number, overScan: number) =>
    Math.floor(renderedWidth / cellWidth) + overScan,
)

export interface CellProps {
  x: number
  y: number
}

export interface GridProps {
  renderCell: (props: CellProps) => React.ReactNode
  rowCount: number
  columnCount: number
  cellHeight: number
  cellWidth: number
  overScan: number
}

export function Grid({
  renderCell,
  rowCount,
  columnCount,
  cellHeight,
  cellWidth,
  overScan,
}: GridProps) {
  const gridHeight = rowCount * cellHeight
  const gridWidth = columnCount * cellWidth

  const scrollRef = useRef<HTMLDivElement>(null)
  const { left, top } = useComponentScrollPosition(scrollRef)

  const { height, width } = useElementSize(scrollRef)

  const renderedRowCount = calcRenderedRowCount(height, cellHeight, overScan)
  const renderedColumnCount = calcRenderedColumnCount(
    width,
    cellWidth,
    overScan,
  )

  const maxVerticalPadding = gridHeight - renderedRowCount * cellHeight
  const maxHorizontalPadding = gridWidth - renderedColumnCount * cellWidth

  const { paddingTop, offsetTop } = calcVerticalOffsets(
    top,
    maxVerticalPadding,
    cellHeight,
    overScan,
  )

  const { paddingLeft, offsetLeft } = calcHorizontalOffsets(
    left,
    maxHorizontalPadding,
    cellWidth,
    overScan,
  )

  const indices = generateGridArray(
    offsetTop,
    offsetLeft,
    renderedColumnCount,
    renderedRowCount,
  )

  return (
    <div className="w-full h-full overflow-auto" ref={scrollRef}>
      <div
        className="relative"
        style={{ width: gridWidth, height: gridHeight }}
      >
        <div
          className="grid absolute"
          style={{
            top: `${paddingTop}px`,
            left: `${paddingLeft}px`,
            gridTemplateColumns: `repeat(${renderedColumnCount},${cellWidth}px)`,
            gridTemplateRows: `repeat(${renderedRowCount},${cellHeight}px)`,
          }}
        >
          {indices.map(({ y, row }) => (
            <React.Fragment key={y}>
              {row.map((x) => (
                <React.Fragment key={x}>{renderCell({ x, y })}</React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

Grid.defaultProps = {
  cellHeight: 64,
  cellWidth: 128,
  overScan: 4,
}
