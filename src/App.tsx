import React, { useRef } from 'react'
import { useComponentScrollPosition } from './scrollHook'
/** @jsx jsx */
import { jsx, css, Global } from '@emotion/core'
import moize from 'moize'
import { useElementSize } from './elementSize'

jsx('a') // use jsx to protect it from code elimination

const rows = 10000
const columns = 10000

const cellHeight = 64
const cellWidth = 128

const overflow = 2

const allHeight = rows * cellHeight
const allWidth = columns * cellWidth

const calcVerticalOffsets = moize(function(
  top: number,
  renderedRowCount: number
) {
  const maxPadding = allHeight - renderedRowCount * cellHeight
  const paddingTop = Math.min(
    Math.max(0, top - Math.floor(overflow / 2) * cellHeight),
    maxPadding
  )
  const paddingBottom = Math.min(
    Math.max(0, allHeight - paddingTop - renderedRowCount * cellHeight),
    maxPadding
  )
  const offsetTop = Math.floor(paddingTop / cellHeight)

  return {
    paddingTop,
    paddingBottom,
    offsetTop
  }
})
const calcHorizontalOffsets = moize(function(
  left: number,
  renderedColumnCount: number
) {
  const maxPadding = allWidth - renderedColumnCount * cellWidth
  const paddingLeft = Math.min(
    Math.max(0, left - Math.floor(overflow / 2) * cellWidth),
    maxPadding
  )
  const paddingRight = Math.min(
    Math.max(0, allWidth - paddingLeft - renderedColumnCount * cellWidth),
    maxPadding
  )
  const offsetLeft = Math.floor(paddingLeft / cellWidth)

  return {
    paddingLeft,
    paddingRight,
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
  return Math.floor(height / cellHeight) + overflow
})
const calcRenderedColumnCount = moize(function(width: number) {
  return Math.floor(width / cellWidth) + overflow
})

function App() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { left, top } = useComponentScrollPosition(scrollRef)

  const { height, width } = useElementSize(scrollRef)

  const renderedRowCount = calcRenderedRowCount(height)
  const renderedColumnCount = calcRenderedColumnCount(width)

  const { paddingTop, paddingBottom, offsetTop } = calcVerticalOffsets(
    top,
    renderedRowCount
  )

  const { paddingLeft, paddingRight, offsetLeft } = calcHorizontalOffsets(
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
      <div
        css={css({
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'white',
          boxShadow: '1px 1px 10px rgba(0,0,0,0.4)',
          padding: 8
        })}
      >
        <a
          target="_blank"
          href={'https://github.com/kaoDev/react-virtual-grid'}
        >
          See code on github
        </a>
      </div>
      <div
        css={css({
          overflow: 'scroll',
          height: '100%',
          width: '100%'
        })}
        ref={scrollRef}
      >
        <div
          css={css({
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
            paddingLeft: `${paddingLeft}px`,
            paddingRight: `${paddingRight}px`,
            display: 'grid',
            gridTemplateColumns: `repeat(${renderedColumnCount},${cellWidth}px)`,
            gridTemplateRows: `repeat(${renderedRowCount},${cellHeight}px)`
          })}
        >
          {indices
            .map(row =>
              row.map(({ x, y }) => (
                <div
                  css={css(
                    {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      border: '1px solid rgba(30, 30, 30, 0.5)'
                    },
                    {
                      gridRow: ((y - offsetTop) % renderedRowCount) + 1,
                      gridColumn: ((x - offsetLeft) % renderedColumnCount) + 1
                    }
                  )}
                  key={`y${y}-x${x}`}
                >
                  {JSON.stringify({ x, y })}
                </div>
              ))
            )
            .flat()}
        </div>
      </div>
    </>
  )
}

export default App
