import { type CellProps, Grid } from "./Grid"

const colorFromRainbow =
  (
    frequency1: number,
    frequency2: number,
    frequency3: number,
    phase1: number,
    phase2: number,
    phase3: number,
    colorCenter = 128,
    colorWidth = 127,
  ) =>
  (i: number) => {
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

function renderCell({ x, y }: CellProps) {
  return <div style={{ background: rainbow(y + x) }} />
}

function App() {
  return (
    <>
      <div className="fixed top-0 left-0 z-10 bg-white shadow p-2">
        <a
          target="_blank"
          href={"https://github.com/kaoDev/react-virtual-grid"}
          rel="noreferrer"
        >
          See code on github
        </a>
      </div>
      <Grid
        rowCount={10000}
        columnCount={10000}
        renderCell={renderCell}
        overScan={16}
      />
    </>
  )
}

export default App
