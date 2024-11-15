'use client';

import { useState } from 'react';
import { searchCustomers, fetchInvoices } from '@/lib/quickbooks-api';
import { 
  Table, 
  Input, 
  DatePicker, 
  Button, 
  Card, 
  Space, 
  Collapse, 
  Tag, 
  Spin,
  message 
} from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { ColumnsType } from 'antd/es/table';
import {useRouter} from 'next/navigation';
import PageWithNav from '../components/PageWithNav';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchCard = styled(Card)`
  margin-bottom: 24px;
`;

const LineItem = styled.div`
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
`;

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerSearch: ''
  });
  const router = useRouter();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const handleCustomerSearch = async (): Promise<string|null> => {
    if (filters.customerSearch === '')  {
      return null
    }
    try {
      const results = await searchCustomers(filters.customerSearch);
      console.log({results});
      return results?.[0]?.Id;
    } catch (error) {
      message.error('Customer search failed');
      return null;
    }
  };

  const handleSearch = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    const cId = await handleCustomerSearch();
    try {
      let baseFilters: any = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        limit: pageSize
      };
      if (cId !== null) {
        baseFilters.customerId = cId;
      }
      const results = await fetchInvoices(baseFilters);
      setInvoices(results.invoices);
      setPagination(prev => ({
        ...prev,
        total: results.pagination.total
      }));
      message.success(`Found ${results.pagination.total} invoices`);
    } catch (error) {
      message.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };
  

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice #',
      dataIndex: 'DocNumber',
      key: 'docNumber',
    },
    {
      title: 'Date',
      dataIndex: 'TxnDate',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Customer',
      dataIndex: ['CustomerRef', 'name'],
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'TotalAmt',
      key: 'amount',
      align: 'right',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Balance',
      dataIndex: 'Balance',
      key: 'balance',
      align: 'right',
      render: (balance: number) => (
        <Tag color={balance > 0 ? 'orange' : 'green'}>
          ${balance.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, invoice) => (
        <Collapse ghost>
          <Panel header="View Items" key="1">
            {invoice.Line
              .filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType))
              .map((item, index) => (
                <LineItem key={index}>
                  {item.DetailType === 'GroupLineDetail' ? <div>{item.GroupLineDetail?.GroupItemRef?.name}</div> :
                   item.DetailType === 'DiscountLineDetail' ? <div>{item?.DiscountLineDetail?.DiscountAccountRef?.name}</div> : 
                  <div>{item.SalesItemLineDetail?.ItemRef.name}</div>}
                  {item.DetailType === 'DiscountLineDetail' ? 
                  <div>Discount: {item?.Amount} at {item.DiscountLineDetail?.DiscountPercent}%</div>
                  :
                  <div style={{ color: '#666' }}>
                    Qty: {item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.Qty ?? item.SalesItemLineDetail?.Qty} × ${item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.UnitPrice ?? item.SalesItemLineDetail?.UnitPrice}
                    = ${item.Amount}
                  </div>
                  }
                </LineItem>
              ))}
          </Panel>
        </Collapse>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, invoice) => (
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => router.push(`/invoices/${invoice.DocNumber}`)}
        >
          PDF
        </Button>
      ),
    },
  ];

  return (
    <PageWithNav>
    <PageContainer>
      <SearchCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  ...filters,
                  startDate: dates[0]?.toISOString().split('T')[0] || '',
                  endDate: dates[1]?.toISOString().split('T')[0] || ''
                });
              }
            }}
          />
          <Input
            placeholder="Search customer..."
            onChange={(e) => {
              setFilters({ ...filters, customerSearch: e.target.value });
            }}
            value={filters.customerSearch}
          />
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={() => handleSearch(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            Search
          </Button>
        </Space>
      </SearchCard>

      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="Id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({
              ...prev,
              current: page,
              pageSize: pageSize
            }));
            handleSearch(page, pageSize);
          }
        }}
        scroll={{ x: true }}
      />
    </PageContainer>
    </PageWithNav>
  );
}

export default InvoicesPage;