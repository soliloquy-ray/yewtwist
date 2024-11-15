// app/registry.tsx
'use client'
 
import React, { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'
import { Layout } from 'antd';
import Navigation from '@/app/components/Navigation';
import styled from 'styled-components';

const { Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const ContentWrapper = styled(Content)`
  margin: 24px;
  min-height: 280px;
`;

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
 
  if (typeof window !== 'undefined') return <>{children}</>
 
  return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
          {children}
        </StyleSheetManager>
  )
}
