"use client"

import React from "react"

const MOTION_PROP_KEYS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileInView",
  "viewport",
  "drag",
  "dragConstraints",
  "dragElastic",
  "layout",
  "layoutId",
  "custom",
  "onAnimationStart",
  "onAnimationComplete",
  "transformTemplate",
])

function stripMotionProps<T extends Record<string, unknown>>(props: T): T {
  const next: Record<string, unknown> = {}
  for (const key in props) {
    if (!MOTION_PROP_KEYS.has(key)) {
      next[key] = props[key]
    }
  }
  return next as T
}

const cache = new Map<string, React.ComponentType<any>>()

const motion: any = new Proxy(
  {},
  {
    get: (_target, tag: string) => {
      if (!cache.has(tag)) {
        const Comp = React.forwardRef<any, any>((props, ref) => {
          const cleaned = stripMotionProps(props || {})
          return React.createElement(tag, { ...cleaned, ref }, props?.children)
        })
        Comp.displayName = `motion.${String(tag)}`
        cache.set(tag, Comp)
      }
      return cache.get(tag)
    },
  },
)

const AnimatePresence = ({ children }: { children?: React.ReactNode; [key: string]: unknown }) => <>{children}</>

export { motion, AnimatePresence }
