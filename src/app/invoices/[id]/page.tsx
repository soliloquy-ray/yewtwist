// pages/invoice-view/[id].tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';  // Note: using navigation instead of router
import styled from 'styled-components';
import { Button, Input, Row, Select, Image } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { fetchInvoices } from '@/lib/quickbooks-api';
import dayjs from 'dayjs';

const PrintableContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  color: #333;
  
  .ant-image {
    display: block;
    margin: 25px auto;
    object-fit: contain;
  }

  @media print {
    padding: 0;
    .no-print {
      display: none;
    }
  }
`;

const ExtendedRow = styled(Row)`
  font-size: 10px;
`

const InvoiceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th, td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
    font-size: 10px;
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
const {Option} = Select;

const ExtendedSelect = styled(Select)`
height: 12px;
.ant-select-selector {
padding: 0 !important;
}
.ant-select-selection-item{
  font-size: 10px;
padding: 0;
}
`;

const ExtendedInput = styled(Input)`
font-size: 10px;
padding: 0;
height: 12px;
`

interface ExtendedLineItem extends LineItem {
  hidden: boolean;
}

export default function InvoiceView() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceLine, setInvoiceLine] = useState<ExtendedLineItem[]>([]);
  const [fourValue, setFourValue] = useState("");
  const [fiveValue, setFiveValue] = useState("");
  const [sixValue, setSixValue] = useState("");
  const [nineValue, setNineValue] = useState("");
  const [tenValue, setTenValue] = useState("");
  const [elevenValue, setElevenValue] = useState("");
  const [twelveValue, setTwelveValue] = useState("");

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

  const getProductCodeFromDesc = (desc: string): string => {
    let type = "";
    const color = desc.includes("green") ? "Green" : "Orange";
    if (desc.includes("master box")) {
      type = "YT300";
    } else if (desc.includes("box")) {
      type = "YT30";
    } else {
      type = "YT1"
    }
    return `${type} - ${color}`;
  }

  const getPackagingFromDesc = (desc: string): JSX.Element => {
    if (desc.includes("master box")) {
      if (desc.includes("orange")) return <p>Approx. Dimensions of package L x W x H<br/>
Inches: 13-5/8 x  9-1/8 x 20-1/2 <br/>
Centimeters: 34 x 23.5 x 52</p>;
      else return <p>Approx. Dimensions of package L x W x H<br/>
Inches: 13-5/8 x  9-1/8 x 20-1/2 <br/>
Centimeters: 34 x 23.5 x 52</p>;
    }else if (desc.includes("box")) {
      if (desc.includes("orange")) return <p>Approx. Dimensions of package L x W x H<br/>
Inches: 8.86 x 6.69 x 3.94<br/>
Centimeters: 22.5 x 17 x 10</p>;
      else return <p>Approx. Dimensions of package L x W x H<br/>
Inches: 8.86 x 6.69 x 3.94<br/>
Centimeters: 22.5 x 17 x 10</p>;
    } else {
      if (desc.includes("orange")) return <p>Approx. Dimensions of package L x W x H<br/>
Inches: 5.2 x 0.5 x 7.5 <br/>
Centimeters: 11.5 x 1.5 x 17</p>;
      else return <p>Approx. Dimensions of package L x W x H<br/>
Inches: 5.2 x 0.5 x 7.5 <br/>
Centimeters: 11.5 x 1.5 x 17</p>;
    } 
  }

  const getWeightFromLine = (item: string, actualPkg: number, actualQty: number ): number => {
    if (item.includes("master box")) {
      return 5.50 * Number(actualPkg);
    } else if (item.includes("box")) {
      return 0.50 * Number(actualPkg);
    } else return 0.01 * Number(actualQty);
  }

  const getTotalWeight = (lineItems: ExtendedLineItem[]): number => {
    let gs = 0;
    lineItems
            ?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType) && item?.SalesItemLineDetail?.ItemRef.value !== "SHIPPING_ITEM_ID" && !item.SalesItemLineDetail?.ItemRef?.name?.includes('Stripe') && !item.GroupLineDetail?.GroupItemRef?.name.includes('Stripe') && !item?.hidden)
            ?.map((item) => {
              console.log({ item });
              const actualPkg = item.GroupLineDetail?.Quantity ?? item.SalesItemLineDetail?.Qty;
              
            const actualQty = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.Qty ?? item.SalesItemLineDetail?.Qty;
              
              const itemDescription = item.DetailType === 'GroupLineDetail' ? item.GroupLineDetail?.GroupItemRef?.name :
              item.DetailType === 'DiscountLineDetail' ? item?.DiscountLineDetail?.DiscountAccountRef?.name : 
            item.SalesItemLineDetail?.ItemRef.name;
              const actualWeight = getWeightFromLine(itemDescription?.toLocaleLowerCase() ?? "", actualPkg ?? 0, actualQty ?? 0);
              console.log({ actualPkg, actualQty, actualWeight });
              gs += actualWeight;
            })
    return gs;
  }

  useEffect(() => {
    if (invoice) {
      setInvoiceLine(invoice.Line.map((lineItems) => ({...lineItems, hidden: false })));
      setTenValue(`${invoice?.ShipMethodRef?.name ?? ""} ${invoice?.Others?.TrackingNum ?? ""}`);
    }
    console.log({ twelveValue });
  }, [invoice, twelveValue]);

  const getFilteredLineItems = (line: ExtendedLineItem[]): ExtendedLineItem[] => {
    return line?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType) && /* item?.SalesItemLineDetail?.ItemRef.value !== "SHIPPING_ITEM_ID" && */ !item.SalesItemLineDetail?.ItemRef?.name?.includes('Stripe') && !item.GroupLineDetail?.GroupItemRef?.name.includes('Stripe') && !item?.hidden)
    
    //?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType))
  }

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
      <Image alt="yewtwist logo" height={50} style={{objectFit: "contain"}} src={"/Yewtwist-logo.png"}/>
      <Title style={{fontSize: 20, letterSpacing: 10}}>COMMERCIAL INVOICE</Title>

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
        <tbody style={{display: "flex", flexDirection: "column"}}>
          <tr style={{display: "flex"}}>
            <th colSpan={2} style={{flex: 1}}>3. Shipper / Exporter Information:</th>
            <th colSpan={2} style={{flex: 1}}>4. Consignee / Importer Information:</th>
          </tr>
          <tr style={{display: "flex"}}>
            <td style={{flex: 1}} colSpan={2}>
              Ingenyewity Inc<br />
              15 Allstate Parkway, Suite 600<br />
              L3R 5B4 Markham, Ontario<br />
              Canada
            </td>
            <td style={{flex: 1}} colSpan={2}>
              <ExtendedInput value={fourValue} onChange={(v) => setFourValue(v.target.value)} style={{fontSize: 10, padding: 0, border: fourValue === "" ? "1px solid red" : ""}} bordered={false} />
              {Object.values(invoice?.BillAddr ?? {}).filter((bData) => bData !== "").map((billData, index) => <p key={index}>{billData}</p>)}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue} 
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
            <td><ExtendedSelect bordered={false} style={{width: "100%", border: fiveValue === "" ? "1px solid red" : ""}} value={fiveValue} onChange={(v: any)=>setFiveValue(v)}>
              <Option value={1}>Canada</Option><Option value={2}>Switzerland</Option></ExtendedSelect>
            </td>
            <td>Canada</td>
            <td colSpan={2} rowSpan={3}>
              <ExtendedInput value={nineValue} onChange={(v: any) => setNineValue(v.target.value)} style={{fontSize: 10, padding: 0,border: nineValue === "" ? "1px solid red" : ""}} bordered={false} />
              {Object.values(invoice?.ShipAddr ?? {}).filter((sData) => sData !== "").map((shipData, index) => <p key={index}>{shipData}</p>)}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue}     
             </td>
          </tr>
          <tr>
            <th>6. Country of Ultimate Destination:</th>
            <th>8. Tariff Classification:</th>
          </tr>
          <tr>
            <td>
              <ExtendedSelect value={sixValue} onChange={(v: any) => setSixValue(v)} bordered={false} style={{width: "100%",border: sixValue === "" ? "1px solid red" : ""}}>
                {Object.entries(invoice?.BillAddr ?? {}).map(([a, b], index) => (<Option key={`${a}${index}`}>{b}</Option>))}                
              </ExtendedSelect>
              </td>
            <td>9018.9080</td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <tbody style={{display: "flex", flexDirection: "column"}}>
          <tr style={{display: "flex", width: "100%"}}>
            <th colSpan={2} style={{flex: 2}}>10. International Air Waybill Number / Tracking Number:</th>
            <th style={{flex: 1}}>11. Incoterms:</th>
            <th style={{flex: 1}}>12. Others</th>
          </tr>
          <tr style={{display: "flex"}}>
            <td colSpan={2} style={{flex: 2}}><ExtendedInput value={tenValue} onChange={(v: any) => setTenValue(v.target.value)} bordered={false} style={{width: "100%", border: tenValue === "" ? "1px solid red" : ""}}/></td>
            <td style={{flex: 1}}><ExtendedSelect value={elevenValue} onChange={(v: any) => setElevenValue(v)} bordered={false} style={{width: "100%", border: elevenValue === "" ? "1px solid red" : ""}}>
              <Option value="F.O.B">F.O.B.</Option>
              <Option value="E.X.W.">E.X.W.</Option>
              </ExtendedSelect>
            </td>
            <td style={{flex: 1}}>
              <ExtendedSelect bordered={false} value={twelveValue} onChange={(v: any) => setTwelveValue(v)} style={{width: "100%", border: twelveValue === "" ? "1px solid red" : ""}} allowClear>
                <Option value={1}>Product Sample Not For Sale</Option>
                <Option value={2}>{" "}</Option>
              </ExtendedSelect>
            </td>
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
          {getFilteredLineItems(invoiceLine)?.map((item, index) => {
              const itemDescription = item.DetailType === 'GroupLineDetail' ? item.GroupLineDetail?.GroupItemRef?.name :
              item.DetailType === 'DiscountLineDetail' ? item?.DiscountLineDetail?.DiscountAccountRef?.name : 
            item.SalesItemLineDetail?.ItemRef.name;
            const actualQty = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.Qty ?? item.SalesItemLineDetail?.Qty;
            const actualPkg = item.GroupLineDetail?.Quantity ?? item.SalesItemLineDetail?.Qty;
            const actualPrice = Number(twelveValue) === 1 ? 3.5 : item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.UnitPrice ?? item.SalesItemLineDetail?.UnitPrice;
            const actualAmount = Number(twelveValue) === 1 ? Number(actualPrice) * Number(actualQty) : item.Amount;
              return <tr key={index} style={{cursor: 'pointer'}} onClick={() => setInvoiceLine((pv) => [...pv.filter((lineItem) => lineItem.Id !== item.Id)])}>
                <td>{
                  getProductCodeFromDesc(itemDescription?.toLocaleLowerCase() ?? "")
              }</td>
                <td style={{textAlign: "center"}}>{actualPkg}</td>
                <td>{getPackagingFromDesc(itemDescription?.toLocaleLowerCase() ?? "")}</td>
                <td>{itemDescription === 'Discounts given' ? 'Discount' : itemDescription}</td>
                <td style={{textAlign: "center"}}>{itemDescription?.toLocaleLowerCase().includes("orange") ? "240704" : "240203"}</td>
                <td style={{textAlign: "center"}}>{actualQty}</td>
                <td style={{textAlign: "center"}}>{ item.DetailType === 'DiscountLineDetail' ? 'Percent' : 'Unit' }</td>
                <td style={{textAlign: "center"}}>{getWeightFromLine(itemDescription?.toLocaleLowerCase() ?? "", actualPkg!, actualQty!)}</td>
                <td style={{textAlign: "right"}}>${Number(actualPrice?.toFixed(2)).toLocaleString()}</td>
                <td style={{textAlign: "right"}}>${Number(actualAmount.toFixed(2)).toLocaleString()}</td>
              </tr>
          })}
          <tr>
            <th>Total Packages</th>
            <th style={{textAlign: "center"}}>{getFilteredLineItems(invoiceLine).reduce((acc, item) => {
              const actualQty = item.GroupLineDetail?.Quantity ?? item.SalesItemLineDetail?.Qty;
              return acc + Number(actualQty ?? 0);
              }, 0)}</th>
            <th colSpan={3}></th>
            <th colSpan={2}>Total Weight in KGS: </th>
            <th style={{textAlign: "center"}}>{getTotalWeight(invoiceLine)}</th>
            <th style={{textAlign: "center"}}>Total Invoice</th>
            <th style={{textAlign: "right"}}>${Number(twelveValue) === 1 ? 3.5 * invoiceLine
            ?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType)).reduce((acc, item) => {
              const actualQty = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.Qty ?? item.SalesItemLineDetail?.Qty;
              return acc + Number(actualQty ?? 0);
              }, 0) : Number(invoiceLine
            ?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType) /* && item?.SalesItemLineDetail?.ItemRef.value !== "SHIPPING_ITEM_ID" */ && !item.SalesItemLineDetail?.ItemRef?.name?.includes('Stripe') && !item.GroupLineDetail?.GroupItemRef?.name.includes('Stripe')).reduce((acc, sum) => acc + sum.Amount, 0).toFixed(2)).toLocaleString()}</th>
          </tr>
          <tr>
            <th colSpan={10} style={{textAlign: "center"}}>Gripping Device- non medical device</th>
          </tr>
        </tbody>
      </InvoiceTable>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        RETURN TO: ________________________________________________
      </ExtendedRow>
      <br/>
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        DOES NOT CONTAIN ANY ANIMAL PRODUCT
      </ExtendedRow>
      <br/>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        VALUE FOR CUSTOMS PURPOSES ONLY
      </ExtendedRow>
      <br/>
      <br/>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        I DECLARE ALL THE INFORMATION CONTAINED IN THIS INVOICE TO BE TRUE AND CORRECT
      </ExtendedRow>
      <br/>
      <br/>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        SIGNATURE OF SHIPPER/EXPORTER (Type name and title and sign)
      </ExtendedRow>
      <br/>
      
      <ExtendedRow style={{alignItems: "center", gap: 70, justifyContent: "flex-start"}}>
        <b>________________________________________________________________________________________________</b><b style={{textDecoration: "underline"}}>{invoice?.ShipDate}</b>
      </ExtendedRow>
      <br/>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        SIGNATURE OF SHIPPER/EXPORTER (Type name and title and sign)
      </ExtendedRow>
      <br/>
      <ExtendedRow style={{alignItems: "center", gap: 70, justifyContent: "flex-start"}}>
        <b>________________________________________________________________________________________________</b><b style={{textDecoration: "underline"}}>{invoice?.ShipDate}</b>
      </ExtendedRow>
      <br/>
      <br/>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        <b>Transport information</b>
      </ExtendedRow>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        1. Customs
      </ExtendedRow>
      
      <ExtendedRow style={{alignItems: "center", gap: 4}}>
        2. Shipping
      </ExtendedRow>
      <br/>
    </PrintableContainer>
  );
}
