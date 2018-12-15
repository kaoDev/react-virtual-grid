import React from "react"
import { css, Global } from "@emotion/core"
import styled from "@emotion/styled"
import { Grid } from "./Grid"

const globalStyle = (
  <Global
    styles={{
      "body, #root": {
        fontFamily: "sans-serif",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        margin: 0,
      },
    }}
  />
)

const GithubLinkWrapper = styled.div({
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1,
  background: "white",
  boxShadow: "1px 1px 10px rgba(0,0,0,0.4)",
  padding: 8,
})

const colorFromRainbow = (
  frequency1: number,
  frequency2: number,
  frequency3: number,
  phase1: number,
  phase2: number,
  phase3: number,
  colorCenter = 128,
  colorWidth = 127,
) => (i: number) => {
  const red = Math.round(
    Math.sin(frequency1 * i + phase1) * colorWidth + colorCenter,
  )
  const grn = Math.round(
    Math.sin(frequency2 * i + phase2) * colorWidth + colorCenter,
  )
  const blu = Math.round(
    Math.sin(frequency3 * i + phase3) * colorWidth + colorCenter,
  )

  return `rgb(${red},${grn},${blu})`
}

const rainbow = colorFromRainbow(0.05, 0.05, 0.05, 0, 2, 4)

function App() {
  return (
    <>
      {globalStyle}
      <GithubLinkWrapper>
        <a
          target="_blank"
          href={"https://github.com/kaoDev/react-virtual-grid"}
        >
          See code on github
        </a>
      </GithubLinkWrapper>
      <Grid
        rowCount={10000}
        columnCount={10000}
        renderCell={({ x, y }) => (
          <div style={{ background: rainbow(y + x) }} />
        )}
      />
    </>
  )
}

export default App
