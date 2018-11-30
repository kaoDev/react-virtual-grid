import { useState, useLayoutEffect } from 'react'

function getScrollPosition(el: HTMLElement | null) {
  if (!el) {
    return { top: 0, left: 0 }
  }

  return {
    top: el.scrollTop,
    left: el.scrollLeft
  }
}

export function useComponentScrollPosition(ref: React.RefObject<HTMLElement>) {
  let [scrollPosition, setScrollPosition] = useState(
    getScrollPosition(ref.current)
  )

  function handleScroll() {
    setScrollPosition(getScrollPosition(ref.current))
  }

  useLayoutEffect(() => {
    if (ref.current) {
      const element = ref.current

      element.addEventListener('scroll', handleScroll)

      return () => element.removeEventListener('scroll', handleScroll)
    }
  })

  return scrollPosition
}
