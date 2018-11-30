import { useState, useCallback, useLayoutEffect } from 'react'

const getElementSize = function(ref: HTMLElement | null) {
  if (ref) {
    return {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    }
  }
  return {
    width: 0,
    height: 0
  }
}

export function useElementSize(ref: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState(getElementSize(ref.current))

  const handleResize = useCallback(
    function handleResize() {
      if (ref.current) {
        setDimensions(getElementSize(ref.current))
      }
    },
    [ref]
  )

  useLayoutEffect(
    () => {
      if (!ref.current) {
        return
      }

      handleResize()

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    },
    [ref.current]
  )

  return dimensions
}
