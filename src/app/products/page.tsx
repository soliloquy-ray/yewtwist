'use client';

import { useState } from 'react';
import { Table, Space, Button, Input, Card, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import PageWithNav from '../components/PageWithNav';

const PageContainer = styled.div`
  padding: 24px;
`;

const SearchCard = styled(Card)`
  margin-bottom: 24px;
`;

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searchText, setSearchText] = useState('');

  const columns: ColumnsType<Item> = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (name: string, item) => (
        <Space>
          {name}
          {!item.Active && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'Type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={
          type === 'Inventory' ? 'blue' :
          type === 'Service' ? 'green' :
          type === 'Bundle' ? 'purple' : 'default'
        }>
          {type}
        </Tag>
      ),
    },
    {
      title: 'SKU/ID',
      dataIndex: 'Id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'description',
      width: 200,
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Sales Price',
      dataIndex: 'UnitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (price?: number) => price ? `$${price.toFixed(2)}` : '-',
    },
    {
      title: 'Purchase Cost',
      dataIndex: 'PurchaseCost',
      key: 'purchaseCost',
      width: 100,
      align: 'right',
      render: (cost?: number) => cost ? `$${cost.toFixed(2)}` : '-',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 150,
      render: (_, item) => (
        item.TrackQtyOnHand ? (
          <Tooltip title="Tracked Inventory">
            <Tag color={item.QtyOnHand! > 0 ? 'green' : 'red'}>
              {item.QtyOnHand} in stock
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Quantity not tracked">
            <Tag>Not tracked</Tag>
          </Tooltip>
        )
      ),
    },
    {
      title: 'Income Account',
      dataIndex: ['IncomeAccountRef', 'name'],
      key: 'incomeAccount',
      width: 150,
    },
    {
      title: 'Expense Account',
      dataIndex: ['ExpenseAccountRef', 'name'],
      key: 'expenseAccount',
      width: 150,
    },
    {
      title: 'Asset Account',
      dataIndex: ['AssetAccountRef', 'name'],
      key: 'assetAccount',
      width: 150,
    },
    {
      title: 'Taxable',
      dataIndex: 'Taxable',
      key: 'taxable',
      width: 100,
      render: (taxable?: boolean) => (
        <Tag color={taxable ? 'blue' : 'default'}>
          {taxable ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: ['MetaData', 'CreateTime'],
      key: 'createTime',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Last Modified',
      dataIndex: ['MetaData', 'LastUpdatedTime'],
      key: 'lastUpdated',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quickbooks/items?search=${searchText}`);
      const data = await response.json();
      setItems(data.QueryResponse.Item || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWithNav>
    <PageContainer>
      <SearchCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            placeholder="Search by name or description..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            Search
          </Button>
        </Space>
      </SearchCard>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="Id"
        loading={loading}
        scroll={{ x: 'max-content', y: 600 }}
        pagination={{
          total: items.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </PageContainer>
    </PageWithNav>
  );
}