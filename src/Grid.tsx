import React, { useRef } from "react"
import { useComponentScrollPosition } from "./scrollHook"
import moize from "moize"
import styled from "@emotion/styled"
import { useElementSize } from "./elementSize"

const calcVerticalOffsets = moize(function(
  top: number,
  maxPadding: number,
  cellHeight: number,
  overScan: number,
) {
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
})
const calcHorizontalOffsets = moize(function(
  left: number,
  maxPadding: number,
  cellWidth: number,
  overScan: number,
) {
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
})

const generateRow = moize(function(
  offsetLeft: number,
  renderedColumnCount: number,
) {
  return Array.from({ length: renderedColumnCount }).map(
    (_, x) => x + offsetLeft,
  )
})

const generateGridArray = moize(function(
  offsetTop: number,
  offsetLeft: number,
  renderedColumnCount: number,
  renderedRowCount: number,
) {
  return Array.from({ length: renderedRowCount }).map((_, row) => {
    const y = row + offsetTop
    return { y, row: generateRow(offsetLeft, renderedColumnCount) }
  })
})

const calcRenderedRowCount = moize(function(
  renderedHeight: number,
  cellHeight: number,
  overScan: number,
) {
  return Math.floor(renderedHeight / cellHeight) + overScan
})
const calcRenderedColumnCount = moize(function(
  renderedWidth: number,
  cellWidth: number,
  overScan: number,
) {
  return Math.floor(renderedWidth / cellWidth) + overScan
})

const ScrollContainer = styled.div({
  overflow: "auto",
  height: "100%",
  width: "100%",
})
const GridSpace = styled.div({
  position: "relative",
})
const GridWindow = styled.div(
  {
    position: "absolute",
    display: "grid",
  },
  (props: {
    cellHeight: number
    cellWidth: number
    columns: number
    rows: number
  }) => ({
    gridTemplateColumns: `repeat(${props.columns},${props.cellWidth}px)`,
    gridTemplateRows: `repeat(${props.rows},${props.cellHeight}px)`,
  }),
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
    <ScrollContainer ref={scrollRef}>
      <GridSpace style={{ width: gridWidth, height: gridHeight }}>
        <GridWindow
          rows={renderedRowCount}
          columns={renderedColumnCount}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          style={{
            top: `${paddingTop}px`,
            left: `${paddingLeft}px`,
          }}
        >
          {indices.map(({ y, row }) => (
            <React.Fragment key={y}>
              {row.map(x => (
                <React.Fragment key={x}>{renderCell({ x, y })}</React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </GridWindow>
      </GridSpace>
    </ScrollContainer>
  )
}

Grid.defaultProps = {
  cellHeight: 64,
  cellWidth: 128,
  overScan: 4,
}
