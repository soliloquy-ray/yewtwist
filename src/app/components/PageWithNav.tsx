
'use client';

import { Layout } from 'antd';
import Navigation from './Navigation';
import styled from 'styled-components';

const { Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const ContentWrapper = styled(Content)`
  margin: 24px;
  min-height: 280px;
`;

export default function PageWithNav({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <StyledLayout>
    <Navigation />
    <Layout>
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </Layout>
  </StyledLayout>
  )
}