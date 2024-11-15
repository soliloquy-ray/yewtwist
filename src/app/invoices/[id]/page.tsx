// pages/invoice-view/[id].tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';  // Note: using navigation instead of router
import styled from 'styled-components';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { fetchInvoices } from '@/lib/quickbooks-api';
import dayjs from 'dayjs';

const PrintableContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media print {
    padding: 0;
    .no-print {
      display: none;
    }
  }
`;

const InvoiceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th, td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f0f0f0;
    font-weight: bold;
    
    @media print {
      background-color: #f0f0f0 !important;
      -webkit-print-color-adjust: exact;
    }
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
`;

const PrintButton = styled(Button)`
  margin-bottom: 20px;
  
  @media print {
    display: none;
  }
`;

export default function InvoiceView() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvoiceData(id as string);
      // Fetch invoice data using id
      // This would be your API call to get invoice details
    }
  }, [id]);

  const fetchInvoiceData = async (id: string) => {
    const results = await fetchInvoices({id});
    console.log({results, id});
    setInvoice(results.invoices[0] || []);
  }

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  return (
    <PrintableContainer>
      <PrintButton 
        type="primary" 
        icon={<PrinterOutlined />}
        onClick={handlePrint}
        className="no-print"
      >
        Print Invoice
      </PrintButton>

      <Title>COMMERCIAL INVOICE</Title>

      <InvoiceTable>
        <tbody>
          <tr>
            <th>1. Date of Exportation:</th>
            <th>2. Yewtwist PO Number:</th>
            <th>3. Export References:</th>
          </tr>
          <tr>
            <td>{dayjs(invoice.ShipDate).format('MMDDYYYY')}</td>
            <td>YEW-{dayjs(invoice.TxnDate).format('MMDDYYYY')}-{invoice.DocNumber}</td>
            <td></td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <tbody>
          <tr>
            <th colSpan={2}>3. Shipper / Exporter Information:</th>
            <th colSpan={2}>4. Consignee / Importer Information:</th>
          </tr>
          <tr>
            <td colSpan={2}>
              Ingenyewity Inc<br />
              15 Allstate Parkway, Suite 600<br />
              L3R 5B4 Markham, Ontario<br />
              Canada
            </td>
            <td colSpan={2}>
              {Object.values(invoice?.BillAddr ?? {}).filter((bData) => bData !== "").map((billData, index) => <p key={index}>{billData}</p>)}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue} 
             {/*  {invoice?.CustomerRef?.name}<br />
              {invoice?.BillAddr?.Line1 !== invoice.CustomerRef.name && invoice.BillAddr?.Line1 && <span>{invoice?.BillAddr?.Line1}<br/></span>}
              {invoice?.BillAddr?.City && <span>{invoice?.BillAddr?.City}<br/></span>}
              {invoice?.BillAddr?.Country && <span>{invoice?.BillAddr?.Country}<br/></span>}
              {invoice?.BillAddr?.Line2 !== invoice.BillAddr?.City && invoice?.BillAddr?.Line2 !== invoice.CustomerRef.name && invoice.BillAddr?.Line2 && <span>{invoice?.BillAddr?.Line2}<br/></span>}
              {invoice?.BillAddr?.Line3 !== invoice.BillAddr?.Country && invoice?.BillAddr?.Line3 !== invoice.CustomerRef.name && invoice.BillAddr?.Line3 && <span>{invoice?.BillAddr?.Line3}<br/></span>}
              {invoice?.BillAddr?.Line4 && <span>{invoice?.BillAddr?.Line4}<br/></span>}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue} */}
            </td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <tbody>
          <tr>
            <th>5. Country of Export:</th>
            <th>7. Country of Origin of Goods:</th>
            <th colSpan={2}>9. Importer - If different from Consignee: (Complete name & address)</th>
          </tr>
          <tr>
            <td>Canada</td>
            <td>Canada</td>
            <td colSpan={2} rowSpan={3}>
              {Object.values(invoice?.ShipAddr ?? {}).filter((sData) => sData !== "").map((shipData, index) => <p key={index}>{shipData}</p>)}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue}
            {/* {invoice?.CustomerRef?.name}<br />
              {invoice?.ShipAddr?.Line1 !== invoice.CustomerRef.name && invoice.ShipAddr?.Line1 && <span>{invoice?.ShipAddr?.Line1}<br/></span>}
              {invoice?.ShipAddr?.City && <span>{invoice?.ShipAddr?.City}<br/></span>}
              {invoice?.ShipAddr?.Country && <span>{invoice?.ShipAddr?.Country}<br/></span>}
              {invoice?.ShipAddr?.Line2 !== invoice.ShipAddr?.City && invoice?.ShipAddr?.Line2 !== invoice.CustomerRef.name && invoice.ShipAddr?.Line2 && <span>{invoice?.ShipAddr?.Line2}<br/></span>}
              {invoice?.ShipAddr?.Line3 !== invoice.ShipAddr?.Country && invoice?.ShipAddr?.Line3 !== invoice.CustomerRef.name && invoice.ShipAddr?.Line3 && <span>{invoice?.ShipAddr?.Line3}<br/></span>}
              {invoice?.ShipAddr?.Line4 && <span>{invoice?.ShipAddr?.Line4}<br/></span>}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue}    */}           
             </td>
          </tr>
          <tr>
            <th>6. Country of Ultimate Destination:</th>
            <th>8. Tariff Classification:</th>
          </tr>
          <tr>
            <td>{invoice?.ShipAddr?.Line4}</td>
            <td>9018.9080</td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <tbody>
          <tr >
            <th style={{width: "50%"}}>10. International Air Waybill Number / Tracking Number:</th>
            <th style={{width: "50%"}}>11. Incoterms:</th>
          </tr>
          <tr>
            <td>{invoice.ShipMethodRef?.value}</td>
            <td>F.O.B</td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <thead>
          <tr>
            <th>Product Code</th>
            <th>No. of Packages</th>
            <th>Type of Packaging</th>
            <th>Goods Description</th>
            <th>Lot Number</th>
            <th>Qty</th>
            <th>Unit of Measure</th>
            <th>Weight</th>
            <th>Unit Value (CDN)</th>
            <th>Total Value (CDN)</th>
          </tr>
        </thead>
        <tbody>
          {invoice?.Line
            ?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType) && item?.SalesItemLineDetail?.ItemRef.value !== "SHIPPING_ITEM_ID" && !item.SalesItemLineDetail?.ItemRef?.name?.includes('Stripe') && !item.GroupLineDetail?.GroupItemRef?.name.includes('Stripe'))
            ?.map((item, index) => {
              const itemDescription = item.DetailType === 'GroupLineDetail' ? item.GroupLineDetail?.GroupItemRef?.name :
              item.DetailType === 'DiscountLineDetail' ? item?.DiscountLineDetail?.DiscountAccountRef?.name : 
            item.SalesItemLineDetail?.ItemRef.name;
            const actualQty = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.Qty ?? item.SalesItemLineDetail?.Qty;
            const actualPkg = item.GroupLineDetail?.Quantity ?? item.SalesItemLineDetail?.Qty;
            const actualPrice = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.UnitPrice ?? item.SalesItemLineDetail?.UnitPrice;
              return <tr key={index}>
                <td>{/* Product code */}</td>
                <td>{actualPkg}</td>
                <td>{/* Packaging */}</td>
                <td>{itemDescription === 'Discounts given' ? 'Discount' : itemDescription}</td>
                <td>{/* Lot number */}</td>
                <td>{actualQty}</td>
                <td>{ item.DetailType === 'DiscountLineDetail' ? 'Percent' : 'Unit' }</td>
                <td>{/* Weight */}</td>
                <td>${actualPrice?.toFixed(2)}</td>
                <td>${item.Amount.toFixed(2)}</td>
              </tr>
          })}
          <tr>
            <th>Total Packages</th>
            <th>{invoice?.Line
            ?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType)).reduce((acc, item) => {
              const actualQty = item.GroupLineDetail?.Quantity ?? item.SalesItemLineDetail?.Qty;
              return acc + Number(actualQty ?? 0);
              }, 0)}</th>
            <th colSpan={3}></th>
            <th colSpan={2}>Total Weight in KGS: </th>
            <th></th>
            <th>Total Invoice</th>
            <th>${invoice?.Line
            ?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType) && item?.SalesItemLineDetail?.ItemRef.value !== "SHIPPING_ITEM_ID" && !item.SalesItemLineDetail?.ItemRef?.name?.includes('Stripe') && !item.GroupLineDetail?.GroupItemRef?.name.includes('Stripe')).reduce((acc, sum) => acc + sum.Amount, 0)}</th>
          </tr>
          <tr>
            <th colSpan={10} style={{textAlign: "center"}}>Gripping Device- non medical device</th>
          </tr>
        </tbody>
      </InvoiceTable>
    </PrintableContainer>
  );
}
