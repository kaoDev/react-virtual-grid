import { useState, useLayoutEffect, useRef } from "react"

function getScrollPosition(el: HTMLElement | null) {
  if (!el) {
    return { top: 0, left: 0 }
  }

  return {
    top: el.scrollTop,
    left: el.scrollLeft,
  }
}

export function useComponentScrollPosition(
  ref: React.RefObject<HTMLElement>,
  throttle = 16,
) {
  const [scrollPosition, setScrollPosition] = useState(
    getScrollPosition(ref.current),
  )

  const lastUpdate = useRef(0)

  function handleScroll() {
    if (Date.now() - lastUpdate.current > throttle) {
      lastUpdate.current = Date.now()
      const nextPosition = getScrollPosition(ref.current)
      if (
        nextPosition.left !== scrollPosition.left ||
        nextPosition.top !== scrollPosition.top
      ) {
        setScrollPosition(nextPosition)
      }
    }
  }

  useLayoutEffect(() => {
    if (ref.current) {
      const element = ref.current

      element.addEventListener("scroll", handleScroll)

      return () => element.removeEventListener("scroll", handleScroll)
    }
  })

  return scrollPosition
}
