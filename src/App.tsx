import React, { useRef } from 'react'
import { useComponentScrollPosition } from './scrollHook'
/** @jsx jsx */
import { jsx, css, Global } from '@emotion/core'
import moize from 'moize'
import { useElementSize } from './elementSize'

jsx('a') // use jsx to protect it from code elimination

const rows = 10000
const columns = 10000

const cellHeight = 50
const cellWidth = 100

const overscan = 4

const allHeight = rows * cellHeight
const allWidth = columns * cellWidth

const calcVerticalOffsets = moize(function(
  top: number,
  renderedRowCount: number
) {
  const maxPadding = allHeight - renderedRowCount * cellHeight

  const scrolledCellFraction = top % cellHeight

  const paddingTop =
    Math.min(
      Math.max(0, top - Math.floor(overscan / 2) * cellHeight),
      maxPadding
    ) - scrolledCellFraction
  const offsetTop = Math.ceil(top / cellHeight)

  return {
    paddingTop,
    offsetTop
  }
})
const calcHorizontalOffsets = moize(function(
  left: number,
  renderedColumnCount: number
) {
  const maxPadding = allWidth - renderedColumnCount * cellWidth

  const scrolledCellFraction = left % cellWidth

  const paddingLeft =
    Math.min(
      Math.max(0, left - Math.ceil(overscan / 2) * cellWidth),
      maxPadding
    ) - scrolledCellFraction
  const offsetLeft = Math.round(paddingLeft / cellWidth)

  return {
    paddingLeft,
    offsetLeft
  }
})

const generateRow = moize(function(
  y: number,
  offsetLeft: number,
  renderedColumnCount: number
) {
  return Array.from({ length: renderedColumnCount }).map((_, x) => ({
    x: x + offsetLeft,
    y
  }))
})

const generateGridArray = moize(function(
  offsetTop: number,
  offsetLeft: number,
  renderedColumnCount: number,
  renderedRowCount: number
) {
  return Array.from({ length: renderedRowCount }).map((_, row) => {
    const y = row + offsetTop
    return generateRow(y, offsetLeft, renderedColumnCount)
  })
})

const calcRenderedRowCount = moize(function(height: number) {
  return Math.floor(height / cellHeight) + overscan
})
const calcRenderedColumnCount = moize(function(width: number) {
  return Math.floor(width / cellWidth) + overscan
})

const globalStyle = (
  <Global
    styles={{
      'body, #root': {
        fontFamily: 'sans-serif',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        margin: 0
      }
    }}
  />
)

const githubLinkWrapperStyle = css({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1,
  background: 'white',
  boxShadow: '1px 1px 10px rgba(0,0,0,0.4)',
  padding: 8
})
const scrollContainerStyle = css({
  overflow: 'scroll',
  height: '100%',
  width: '100%'
})
const cellStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  border: '1px solid rgba(30, 30, 30, 0.5)'
})

function App() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { left, top } = useComponentScrollPosition(scrollRef)

  const { height, width } = useElementSize(scrollRef)

  const renderedRowCount = calcRenderedRowCount(height)
  const renderedColumnCount = calcRenderedColumnCount(width)

  const { paddingTop, offsetTop } = calcVerticalOffsets(top, renderedRowCount)

  const { paddingLeft, offsetLeft } = calcHorizontalOffsets(
    left,
    renderedColumnCount
  )

  const indices = generateGridArray(
    offsetTop,
    offsetLeft,
    renderedColumnCount,
    renderedRowCount
  )

  return (
    <>
      {globalStyle}
      <div css={githubLinkWrapperStyle}>
        <a
          target="_blank"
          href={'https://github.com/kaoDev/react-virtual-grid'}
        >
          See code on github
        </a>
      </div>
      <div css={scrollContainerStyle} ref={scrollRef}>
        <div
          style={{ width: allWidth, height: allHeight, position: 'relative' }}
        >
          <div
            css={css({
              position: 'absolute',
              display: 'grid',
              gridTemplateColumns: `repeat(${renderedColumnCount},${cellWidth}px)`,
              gridTemplateRows: `repeat(${renderedRowCount},${cellHeight}px)`
            })}
            style={{
              top: `${paddingTop}px`,
              left: `${paddingLeft}px`
            }}
          >
            {indices.map(row =>
              row.map(({ x, y }) => (
                <div css={cellStyle} key={`y${y}-x${x}`}>
                  {JSON.stringify({ x, y })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
