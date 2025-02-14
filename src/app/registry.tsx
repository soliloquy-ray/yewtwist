// app/registry.tsx
'use client'
 
import React, { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'
import { message } from 'antd'

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())
 
  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return <>{styles}</>
  })
 
message.config({
  maxCount: 3,
  top: 72,  // distance from top of viewport
  duration: 3 // default duration in seconds
});
  if (typeof window !== 'undefined') return <>{children}</>
 
  return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
          {children}
        </StyleSheetManager>
  )
}
