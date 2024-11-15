'use client';
// components/Navigation.tsx
import { Layout, Menu, message } from 'antd';
import { 
  FileTextOutlined, 
  ShoppingOutlined,
  SyncOutlined, 
  FileTextTwoTone
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import styled from 'styled-components';

const { Sider } = Layout;

const Logo = styled.div`
  height: 32px;
  margin: 16px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
`;

const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    // {
    //   key: '/',
    //   icon: <HomeOutlined />,
    //   label: 'Dashboard'
    // },
    {
      key: '/invoices',
      icon: <FileTextOutlined />,
      label: 'Invoices'
    },
    {
      key: '/invoices/raw-data',
      icon: <FileTextTwoTone />,
      label: 'Raw Data'
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products and Services'
    },
    {
      key: '/sync',
      icon: <SyncOutlined />,
      label: 'Sync Data',
    }
  ];

  return (
    <Sider
      theme="dark"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <Logo>Yewtwist Admin</Logo>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={async ({ key }) => {
          if (key !== "/sync") router.push(key);
          else {            
            await fetch('/api/sync/items');
            await fetch('/api/sync/invoices');
            message.info('Data synced!');
          }
        }}
      />
    </Sider>
  );
};

export default Navigation;
