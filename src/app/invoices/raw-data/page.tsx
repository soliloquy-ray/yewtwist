// app/invoice-details/page.tsx
'use client';

import { useState } from 'react';
import { Table, Space, Button, DatePicker, Input, Card, message, Collapse, Row } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { fetchInvoices, searchCustomers } from '@/lib/quickbooks-api';
import PageWithNav from '@/app/components/PageWithNav';
import { downloadExcel, processInvoicesForExcel } from '@/app/utils/excel';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const PageContainer = styled.div`
  padding: 24px;
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

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerSearch: ''
  });
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
    // const cId = await handleCustomerSearch();
    try {
      let baseFilters: any = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        limit: pageSize
      };
      if (filters.customerSearch) {
        baseFilters.customerRef = filters.customerSearch;
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
  

  // Define all columns based on your Invoice interface
  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice #',
      dataIndex: 'DocNumber',
      key: 'docNumber',
      fixed: 'left',  // This column will be fixed on the left
      width: 100,
    },
    {
      title: 'Date',
      dataIndex: 'TxnDate',
      key: 'date',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Ship Date',
      dataIndex: 'ShipDate',
      key: 'shipDate',
      width: 100,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Due Date',
      dataIndex: 'DueDate',
      key: 'dueDate',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Customer',
      dataIndex: ['CustomerRef', 'name'],
      key: 'customer',
      width: 200,
    },
    {
      title: 'Customer ID',
      dataIndex: ['CustomerRef', 'value'],
      key: 'customerId',
      width: 100,
    },
    {
      title: 'Currency',
      dataIndex: ['CurrencyRef', 'name'],
      key: 'currency',
      width: 200,
    },
    {
      title: 'Currency Symbol',
      dataIndex: ['CurrencyRef', 'value'],
      key: 'currencyId',
      width: 100,
    },
    {
      title: 'Amount',
      dataIndex: 'TotalAmt',
      key: 'amount',
      width: 100,
      align: 'right',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Balance',
      dataIndex: 'Balance',
      key: 'balance',
      width: 100,
      align: 'right',
      render: (balance: number) => `$${balance.toFixed(2)}`,
    },
    {
      title: 'Billing Address',
      dataIndex: 'BillAddr',
      key: 'billAddr',
      width: 300,
      render: (addr: {[key:string]: string}) => addr ? (
        <>
          {Object.values(addr).map((addrData) => <p>{addrData}</p>)}
        </>
      ) : '-',
    },
    {
      title: 'Shipping Address',
      dataIndex: 'ShipAddr',
      key: 'shipAddr',
      width: 300,
      render: (addr: {[key: string]: string}) => addr ? (
        <>
          {Object.values(addr).map((addrData) => <p>{addrData}</p>)}
        </>
      ) : '-',
    },
    {
      title: 'Shipping Method',
      dataIndex: ['ShipMethodRef', 'name'],
      key: 'shipMethod',
      width: 150,
    },
    {
      title: 'Custom Fields',
      dataIndex: 'CustomField',
      key: 'customFields',
      width: 200,
      render: (fields) => fields?.map((field: any) => (
        <div key={field.Name}>
          {field.Name}: {field.StringValue}
        </div>
      )),
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      width: 100,
    },
    {
      title: 'Customer Memo',
      dataIndex: ['CustomerMemo', 'value'],
      key: 'shipMethod',
      width: 300,
    },
    {
      title: 'Private Note',
      dataIndex: 'PrivateNote',
      key: 'privateNote',
      width: 300,
    },
    {
      title: 'Billing Email',
      dataIndex: ['BillEmail', 'Address'],
      key: 'billEmail',
      width: 150,
    },
    {
      title: 'Line Items',
      key: 'lineItems',
      width: 400,
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
      fixed: 'right',
      width: 100,
      render: (_, invoice) => (
        <Button 
          onClick={() => handleDownload([invoice], invoice.DocNumber)}
          icon={<DownloadOutlined />}
          size="small"
        >
          Export
        </Button>
      ),
    }
  ];

  const handleDownload = async (invoiceList: Invoice[], filename: string) => {
    try {
      setLoading(true);
      // Fetch all items
      const itemsResponse = await fetch('/api/quickbooks/items');
      const itemsData = await itemsResponse.json();
      const items = itemsData.QueryResponse.Item || [];
  
      // Process the currently displayed invoices with items
      const processedData = processInvoicesForExcel(invoiceList, items);
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const fn = `invoices_${filename}`;
      
      // Download the excel file
      await downloadExcel(processedData, fn);
      message.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      message.error('Failed to download Excel file');
    } finally {
      setLoading(false);
    }
  };  

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
        scroll={{ x: 'max-content', y: 600 }}
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
        footer={() => 
          <Row>
            <Button type='primary' onClick={() => handleDownload(invoices, dayjs().format('MM/DD/YYYY'))}>Download Page</Button>
          </Row>}
      />
    </PageContainer>
    </PageWithNav>
  );
}
