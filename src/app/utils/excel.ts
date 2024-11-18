/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from 'exceljs';

interface ProcessedInvoice {
  DocNumber: string;
  TxnDate: string;
  CustomerName: string;
  TotalAmt: number;
  Balance: number;
  [key: string]: any; // For dynamic item columns
}

export const processInvoicesForExcel = (invoices: Invoice[], items: Item[]) => {
  const itemMap = new Map(items.map(item => [item.Id, item]));
  const processedData: ProcessedInvoice[] = [];

  invoices.forEach(invoice => {
    const processedInvoice: ProcessedInvoice = {
      DocNumber: invoice.DocNumber,
      TxnDate: invoice.TxnDate,
      ShipDate: invoice.ShipDate,
      DueDate: invoice.DueDate,
      CustomerName: invoice.CustomerRef.name,
      Billing_Address: Object.values(invoice?.BillAddr ?? {}).slice(1).join(", \r\n"),
      Shipping_Address: Object.values(invoice?.ShipAddr ?? {}).slice(1).join(", \r\n"),
      Shipper: invoice.ShipMethodRef?.name,
      Customer_Number: invoice.CustomField?.filter((field) => field.Name === "Contact Number")[0]?.StringValue,
      Customer_PO_Number: invoice.CustomField?.filter((field) => field.Name === "Customer PO Number")[0]?.StringValue,
      Customer_Memo: invoice.CustomerMemo?.value,
      Private_Note: invoice.PrivateNote,
      Billing_Email: invoice.BillEmail?.Address,
      TotalAmt: invoice.TotalAmt,
      Balance: invoice.Balance,
      Others: Object.values(invoice?.Others ?? {}).slice(1).join(", \r\n"),
      Discount: '',
      Shipping_Fee: 0,
    };

    // Initialize quantities and prices for each item
    items.forEach(item => {
      processedInvoice[`${item.Name}_qty`] = 0;
      processedInvoice[`${item.Name}_price`] = 0;
    });

    // Process line items
    invoice.Line.forEach(lineItem => {
      if (lineItem.DetailType === 'SalesItemLineDetail' && lineItem.SalesItemLineDetail) {
        const itemId = lineItem.SalesItemLineDetail.ItemRef.value;
        const item = itemMap.get(itemId);
        if (item) {
          processedInvoice[`${item.Name}_qty`] = (processedInvoice[`${item.Name}_qty`] || 0) + lineItem.SalesItemLineDetail.Qty;
          processedInvoice[`${item.Name}_price`] = 
            lineItem.SalesItemLineDetail.UnitPrice || lineItem.Amount || 0;
        } else if (lineItem.SalesItemLineDetail.ItemRef.value === 'SHIPPING_ITEM_ID') {
          processedInvoice.Shipping_Fee += lineItem.Amount;
        }
      } else if (lineItem.DetailType === 'GroupLineDetail' && lineItem.GroupLineDetail) {
        const groupItemId = lineItem.GroupLineDetail.GroupItemRef.value;
        const groupItem = itemMap.get(groupItemId);
        if (groupItem) {
          processedInvoice[`${groupItem.Name}_qty`] = (processedInvoice[`${groupItem.Name}_qty`] || 0) + lineItem.GroupLineDetail.Quantity;
          if (lineItem.Amount) {
            processedInvoice[`${groupItem.Name}_price`] = 
              lineItem.Amount;
          }
        }

        // Process individual items within the group
        lineItem.GroupLineDetail.Line.forEach(groupLine => {
          if (groupLine.SalesItemLineDetail) {
            const subItemId = groupLine.SalesItemLineDetail.ItemRef.value;
            const subItem = itemMap.get(subItemId);
            if (subItem) {
              processedInvoice[`${subItem.Name}_qty`] = (processedInvoice[`${subItem.Name}_qty`] || 0) + groupLine.SalesItemLineDetail.Qty;
              processedInvoice[`${subItem.Name}_price`] = 
                groupLine.SalesItemLineDetail.UnitPrice || 0;
            }
          }
        });
      } else if (lineItem.DetailType === 'DiscountLineDetail' && lineItem.DiscountLineDetail) {
        processedInvoice.Discount = `${lineItem.DiscountLineDetail.DiscountPercent}%`;
      }
    });

    processedData.push(processedInvoice);
  });

  return processedData;
};

export const downloadExcel = async (data: ProcessedInvoice[], items: Item[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Invoices');

  // Create headers
  const baseColumns = ['DocNumber', 'TxnDate', 'ShipDate', 'DueDate', 'CustomerName', 'Billing_Address', 'Shipping_Address', 'Shipper', 'Customer_Number', 'Customer_PO_Number', 'Customer_Memo', 'Private_Note', 'Billing_Email', 'TotalAmt', 'Balance'];
  const itemColumns = items.flatMap(item => [
    { 
      header: `${item.Name} Qty`,
      key: `${item.Name}_qty`,
      width: 12,
      style: {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6FA' }  // Light purple for quantities
        }
      }
    },
    { 
      header: `${item.Name} Price`,
      key: `${item.Name}_price`,
      width: 15,
      style: {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6FFE6' }  // Light green for prices
        }
      }
    }
  ]);

  worksheet.columns = [
    ...baseColumns.map(header => ({ header, key: header, width: 15 })),
    ...itemColumns
  ];

  // Add data rows
  worksheet.addRows(data);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.height = 20;

  // Format numbers and apply conditional formatting
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    row.eachCell((cell, colNumber) => {
      const columnKey = worksheet.columns[colNumber - 1].key as string;
      
      if (columnKey?.includes('_price')) {
        // Price columns
        cell.numFmt = '"$"#,##0.00';
        if (cell.value && cell.value !== 0) {
          cell.font = { bold: true };
        } else {
          cell.font= { color: {argb: '888888'} };
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6FFE6' }  // Light green
        };
      } 
      else if (columnKey?.includes('_qty')) {
        // Quantity columns
        cell.numFmt = '#,##0';
        if (cell.value && cell.value !== 0) {
          cell.font = { bold: true };
        } else {
          cell.font= { color: {argb: '888888'} };
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6FA' }  // Light purple
        };
      }
      else if (columnKey === 'TotalAmt' || columnKey === 'Balance') {
        // Format monetary values
        cell.numFmt = '"$"#,##0.00';
        if (cell.value && cell.value !== 0) {
          cell.font = { bold: true };
        }
      }
    });
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Freeze the header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: worksheet.columns.length }
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// utils/excel.ts (add to existing file)
interface ProcessedExpense {
  Date: string;
  Account: string;
  Payee: string;
  PaymentMethod: string;
  Department: string;
  Currency: string;
  Amount: number;
  Description: string;
  Customer: string;
  LineAmount: number;
  LineAccount: string;
}

export const processExpensesForExcel = (expenses: Expense[]): ProcessedExpense[] => {
  const processedData: ProcessedExpense[] = [];

  expenses.forEach(expense => {
    // If expense has multiple lines, create a row for each line
    expense.Line.forEach(line => {
      processedData.push({
        Date: expense.TxnDate,
        Account: expense.AccountRef?.name || '',
        Payee: expense.EntityRef?.name || '',
        PaymentMethod: expense.PaymentMethodRef?.name || '',
        Department: expense.DepartmentRef?.name || '',
        Currency: expense.CurrencyRef?.name || '',
        Amount: expense.TotalAmt,
        Description: line.Description || '',
        Customer: line.AccountBasedExpenseLineDetail?.CustomerRef?.name || '',
        LineAmount: line.Amount,
        LineAccount: line.AccountBasedExpenseLineDetail?.AccountRef?.name || ''
      });
    });
  });

  return processedData;
};

export const downloadExpensesExcel = async (expenses: Expense[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses');

  // Define columns
  worksheet.columns = [
    { header: 'Date', key: 'Date', width: 12 },
    { header: 'Account', key: 'Account', width: 20 },
    { header: 'Payee', key: 'Payee', width: 20 },
    { header: 'Payment Method', key: 'PaymentMethod', width: 15 },
    { header: 'Department', key: 'Department', width: 15 },
    { header: 'Currency', key: 'Currency', width: 10 },
    { header: 'Total Amount', key: 'Amount', width: 12 },
    { header: 'Description', key: 'Description', width: 30 },
    { header: 'Customer', key: 'Customer', width: 20 },
    { header: 'Line Amount', key: 'LineAmount', width: 12 },
    { header: 'Line Account', key: 'LineAccount', width: 20 }
  ];

  // Process and add data
  const data = processExpensesForExcel(expenses);
  worksheet.addRows(data);

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Format date and number columns
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    // Format date
    const dateCell = row.getCell('Date');
    dateCell.numFmt = 'yyyy-mm-dd';

    // Format amounts
    const amountCell = row.getCell('Amount');
    const lineAmountCell = row.getCell('LineAmount');
    amountCell.numFmt = '"$"#,##0.00';
    lineAmountCell.numFmt = '"$"#,##0.00';

    // Bold non-zero amounts
    if (amountCell.value && amountCell.value !== 0) {
      amountCell.font = { bold: true };
    }
    if (lineAmountCell.value && lineAmountCell.value !== 0) {
      lineAmountCell.font = { bold: true };
    }
  });

  // Add borders
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Add autofilter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: worksheet.columns.length }
  };

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
