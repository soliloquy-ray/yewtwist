'use client';

import { useState } from 'react';
import { Table, Space, Button, DatePicker, Input, Card, message, Tag, Row } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import PageWithNav from '@/app/components/PageWithNav';
import { downloadExpensesExcel } from '@/app/utils/excel';
import dayjs from 'dayjs';
/* eslint-disable @typescript-eslint/no-explicit-any */
const { RangePicker } = DatePicker;

const PageContainer = styled.div`
  padding: 24px;
`;

const SearchCard = styled(Card)`
  margin-bottom: 24px;
`;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  

  const columns: ColumnsType<Expense> = [
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MM/DD/YYYY'),
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'TXN ID',
      dataIndex: 'Id',
      key: 'no',
    },
    {
      title: 'PAYEE',
      dataIndex: 'payee',
      key: 'payee',
    },
    // {
    //   title: 'CLASS',
    //   dataIndex: 'class',
    //   key: 'class',
    // },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'TOTAL BEFORE SALES TAX',
      dataIndex: 'totalBeforeSalesTax',
      key: 'totalBeforeSalesTax',
      align: 'right',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'SALES TAX',
      dataIndex: 'salesTax',
      key: 'salesTax',
      align: 'right',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'TOTAL',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'MEMO',
      dataIndex: 'memo',
      key: 'memo',
    },
    {
      title: 'CATEGORY DETAILS',
      key: 'categoryDetails',
      render: (_, record: any) => {
        return record.categoryDetails.map((categoryDetail: any, index: number) => (<Row key={index}>
          <Tag color='blue'>{categoryDetail.description}</Tag> - <Tag color='green'>${categoryDetail.amount}</Tag>
        </Row>))
      }/* (
        <Table
          size="small"
          showHeader={false}
          pagination={false}
          dataSource={record.categoryDetails}
          columns={[
            {
              title: 'Description',
              dataIndex: 'description',
              render: (text) => <Tag>{text}</Tag>
            },
            {
              title: 'Amount',
              dataIndex: 'amount',
              render: (text) => `$${text}`
            },
          ]}
        />
      ), */
    }
  ];
  

  const handleSearch = async (page = pagination.current, pageSize = pagination.pageSize) => {
    console.log({ pagination });
    setLoading(true);
    try {
      const response = await fetch(`/api/quickbooks/expenses?page=${page}&pageSize=${pageSize ?? 10}&` + new URLSearchParams(filters));
      const data = await response.json();
      setExpenses(data.expenses);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }));
      message.success(`Found ${data.pagination.total} expenses`);
    } catch (error) {
      message.error(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadExpensesExcel(expenses, `expenses_${new Date().toISOString().split('T')[0]}`);
      message.success('Excel file downloaded successfully');
    } catch (error) {
      message.error(JSON.stringify(error));
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
              allowClear
              allowEmpty
            />
            <Input
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Space>
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={() => handleSearch()}
                loading={loading}
              >
                Search
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={!expenses.length}
              >
                Export to Excel
              </Button>
            </Space>
          </Space>
        </SearchCard>

        <Table
          showSorterTooltip
          columns={columns}
          dataSource={expenses}
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
          scroll={{ x: 'max-content' }}
        />
      </PageContainer>
    </PageWithNav>
  );
}