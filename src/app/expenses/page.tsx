'use client';

import { useState } from 'react';
import { Table, Space, Button, DatePicker, Input, Card, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import PageWithNav from '@/app/components/PageWithNav';
import { downloadExpensesExcel } from '@/app/utils/excel';

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

  const columns: ColumnsType<Expense> = [
    {
      title: 'Date',
      dataIndex: 'TxnDate',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Account',
      dataIndex: ['AccountRef', 'name'],
      key: 'account',
    },
    {
      title: 'Payee',
      dataIndex: ['EntityRef', 'name'],
      key: 'payee',
    },
    {
      title: 'Payment Method',
      dataIndex: ['PaymentMethodRef', 'name'],
      key: 'paymentMethod',
    },
    {
      title: 'Department',
      dataIndex: ['DepartmentRef', 'name'],
      key: 'department',
    },
    {
      title: 'Currency',
      dataIndex: ['CurrencyRef', 'name'],
      key: 'currency',
    },
    {
      title: 'Amount',
      dataIndex: 'TotalAmt',
      key: 'amount',
      align: 'right',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, expense) => (
        <ul>
          {expense.Line.map((line, index) => (
            <li key={index}>
              {line.Description}: ${line.Amount.toFixed(2)}
              {line.AccountBasedExpenseLineDetail?.CustomerRef && 
                ` (${line.AccountBasedExpenseLineDetail.CustomerRef.name})`}
            </li>
          ))}
        </ul>
      ),
    }
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quickbooks/expenses?' + new URLSearchParams(filters));
      const data = await response.json();
      setExpenses(data.expenses);
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
                onClick={handleSearch}
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
          columns={columns}
          dataSource={expenses}
          rowKey="Id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </PageContainer>
    </PageWithNav>
  );
}