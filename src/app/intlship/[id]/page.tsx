// pages/invoice-view/[id].tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';  // Note: using navigation instead of router
import styled from 'styled-components';
import { Button, Input, Row, Select, Image, Checkbox, Col } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { fetchInvoices } from '@/lib/quickbooks-api';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';

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

  .ant-row {
    font-size: 10px;
  }

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
    font-size: 10px;
  }
  
  th {
    background-color: #d9f2d0;
    font-weight: bold;
    
    @media print {
      background-color: #d9f2d0 !important;
      -webkit-print-color-adjust: exact;
    }
  }
    
    th.lighter{
      background-color: rgb(230, 247, 225);
      @media print {
        background-color:  rgb(230, 247, 225) !important;
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
&.centered {
  .ant-select-selector {
    text-align: center;    
  }
}
height: 12px;
.ant-select-selector {
padding: 0 !important;
font-weight: bolder;
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
  const [nineValue, setNineValue] = useState("");
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

  useEffect(() => {
    if (invoice) {
      setInvoiceLine(invoice.Line.map((lineItems) => ({...lineItems, hidden: false })));
    }
  }, [invoice])

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
      <Title style={{fontSize: 20, letterSpacing: 10}}>INTERNATIONAL SHIPMENT ORDER</Title>

      <InvoiceTable>
        <tbody>
          <tr>
            <th>1. Shipment Order Date:
            </th>
            <th>2. Yewtwist PO Number:
            </th>
            <th>3. Customer PO Number:
            </th>
          </tr>
          <tr>
            <td>{dayjs(invoice.ShipDate).format('MMDDYYYY')}</td>
            <td>YEW-{dayjs(invoice.TxnDate).format('MMDDYYYY')}-{invoice.DocNumber}</td>
            <td>{invoice.CustomField?.find(cf => cf.Name === "Customer PO Number")?.StringValue}</td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <tbody style={{display: "flex", flexDirection: "column"}}>
          <tr style={{display: "flex"}}>
            <th colSpan={2} style={{flex: 1}}>4. Customer Information: (Complete name, address, contact number):</th>
            <th colSpan={2} style={{flex: 1}}>5. Ship To: (Complete name & address, contact number)</th>
          </tr>
          <tr style={{display: "flex"}}>
            <td style={{flex: 1}} colSpan={2}>
              <ExtendedInput value={fourValue} onChange={(v) => setFourValue(v.target.value)} style={{fontSize: 10, padding: 0, border: fourValue === "" ? "1px solid red" : ""}} bordered={false} />
              {Object.values(invoice?.BillAddr ?? {}).filter((bData) => bData !== "").map((billData, index) => <p key={index}>{billData}</p>)}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue}
            </td>
            <td style={{flex: 1}} colSpan={2}>
              <ExtendedInput value={nineValue} onChange={(v: any) => setNineValue(v.target.value)} style={{fontSize: 10, padding: 0,border: nineValue === "" ? "1px solid red" : ""}} bordered={false} />
              {Object.values(invoice?.ShipAddr ?? {}).filter((sData) => sData !== "").map((shipData, index) => <p key={index}>{shipData}</p>)}
              {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue}
            </td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable style={{tableLayout: "fixed"}}>
        <tbody>
          <tr>
            <th colSpan={4}>6. Ordered by:</th>
          </tr>
          <tr>
            <td><b>Name: </b> {invoice.CustomerRef.name}</td>
            <td><b>Phone Number: </b> 
            {invoice?.CustomField?.find((cf) => cf.Name === "Contact Number")?.StringValue}</td>
            <td><b>Email: </b> {invoice.BillEmail.Address}</td>
            <td style={{ display: "flex", gap: 10, alignItems: "center"}}><b style={{flex: 0}}>Source: </b><ExtendedSelect bordered={false} style={{flex: 1}}>
              <Option value="Phone">Phone</Option>
              <Option value="Email">Email</Option>
              <Option value="Fax">Fax</Option>
              <Option value="Website">Website</Option>
              </ExtendedSelect></td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable style={{tableLayout: "fixed"}}>
        <tbody>
          <tr>
            <th>7. Shipment Needed By:</th>
            <th>8. Shipment Order Type:</th>
            <th colSpan={2}>10. Shipment Order Change Notice Sent:</th>
          </tr>
          <tr>
            <td><ExtendedInput bordered={false} /></td>
            <td><ExtendedSelect bordered={false} style={{width: "100%"}}>
              <Option value="New Order">New Order</Option>
              <Option value="Update existing order">Update existing order</Option>
              </ExtendedSelect>
            </td>
            <td colSpan={2}>
              <Row style={{width: "100%", display: "flex", alignItems: "center"}}>
                <Col style={{flex: 1, fontSize: 10}}>
                  <Checkbox style={{fontSize: 10}}>Not Applicable</Checkbox>
                  <Checkbox style={{fontSize: 10}}>Yes</Checkbox>
                </Col>
                <Col style={{flex: 1, fontSize: 10}}>
                To:
                </Col>
                <Col style={{flex: 1, fontSize: 10}}>
                Date: 
                </Col>

              </Row>
            </td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable style={{tableLayout: "fixed"}}>
        <tbody>
          <tr>
            <th colSpan={5}>11. Shipment Order Details:</th>
          </tr>
          <tr>
            <th className='lighter' style={{textAlign: "center"}}>Product Code</th>
            <th className='lighter' style={{textAlign: "center"}}>Goods Description</th>
            <th className='lighter' style={{textAlign: "center"}}>Lot Number</th>
            <th className='lighter' style={{textAlign: "center"}}>Unit of Measure</th>
            <th className='lighter' style={{textAlign: "center"}}>Qty</th>            
          </tr>
          {invoiceLine
            ?.filter(item => ['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType) /* && item?.SalesItemLineDetail?.ItemRef.value !== "SHIPPING_ITEM_ID" */ && !item.SalesItemLineDetail?.ItemRef?.name?.includes('Stripe') && !item.GroupLineDetail?.GroupItemRef?.name.includes('Stripe') && !item?.hidden)
            ?.map((item) => {
            const itemDescription = item.DetailType === 'GroupLineDetail' ? item.GroupLineDetail?.GroupItemRef?.name :
            item.DetailType === 'DiscountLineDetail' ? item?.DiscountLineDetail?.DiscountAccountRef?.name : 
          item.SalesItemLineDetail?.ItemRef.name;
            const productCode = getProductCodeFromDesc(itemDescription?.toLocaleLowerCase() ?? "");            
            const actualQty = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.Qty ?? item.SalesItemLineDetail?.Qty;
            return (
            <tr key={item.Id} onClick={() => setInvoiceLine((pv) => [...pv.filter((lineItem) => lineItem.Id !== item.Id)])}>
              <td style={{textAlign: "center"}}>{
                  productCode
              }</td>
              <td style={{textAlign: "center"}}>{itemDescription}<br/><br/>(Item is <b>NOT a medical device</b>. It is a gripping device used in medical sciences.)</td>
              <td style={{textAlign: "center"}}>{itemDescription?.toLocaleLowerCase().includes("orange") ? "240704" : "240203"}</td>              
              <td style={{textAlign: "center"}}>{ productCode.toLocaleLowerCase().includes("yt1") ? 'Bag' : 'Box' }</td>
              <td style={{textAlign: "center"}}>{actualQty}</td>
            </tr>
          )
          })}
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr><td style={{fontWeight: 800}} colSpan={5}>
            
          <ExtendedSelect className='centered' bordered={false} value={twelveValue} onChange={(v: any) => setTwelveValue(v)} style={{width: "100%", border: twelveValue === "" ? "1px solid red" : ""}} allowClear>
                <Option value={1}>Product Sample Not For Sale</Option>
                <Option value={2}>{" "}</Option>
              </ExtendedSelect>
            </td></tr>
          <tr>
            <td style={{textAlign: "center", fontWeight: 800}} colSpan={5} >Tariff Classification: 9018.9080</td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <tbody>
          <tr>
            <th colSpan={3}>12. Transportation Details:</th>
          </tr>
          <tr>
            <td><Row><b>Shipment to be sent by: (mmddyyy)</b></Row>
            <Row>{dayjs(invoice.ShipDate).format("MMDDYYYY")}</Row></td>
            <td>
              <Row><b>Carrier:&nbsp;</b> {invoice.ShipMethodRef?.value}</Row>
              <Row><b>Tracking Number:</b> {invoice?.Others?.TrackingNum}</Row>
            </td>
            <td>
              <Row><b>Carrier Account No: </b></Row>
              <Row><ExtendedInput bordered={false}/></Row>
            </td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable>
        <tbody>
          <tr>
            <th>13. Broker Name: (For Customs Clearance).</th>
          </tr>
          <tr>
            <td>
              <Row style={{fontWeight: 700, whiteSpace: 'nowrap', display: "flex", flexWrap: "nowrap", gap: 5}}>Custom Broker Distributor Using: <ExtendedInput bordered={false} /></Row>
              <Row style={{fontWeight: 700, whiteSpace: 'nowrap', display: "flex", flexWrap: "nowrap", gap: 5}}>Contact Name: <ExtendedInput bordered={false} /></Row>
              <Row style={{fontWeight: 700, whiteSpace: 'nowrap', display: "flex", flexWrap: "nowrap", gap: 5}}>Contact Number: <ExtendedInput bordered={false} /></Row>
              <Row style={{fontWeight: 700, whiteSpace: 'nowrap', display: "flex", flexWrap: "nowrap", gap: 5}}>Email: <ExtendedInput bordered={false} /></Row>
            </td>
          </tr>
        </tbody>
      </InvoiceTable>

      <InvoiceTable style={{tableLayout: "fixed"}}>
        <tbody>
          <tr>
            <th colSpan={3}>14. Documentation to be included with Shipment:</th>
          </tr>
          <tr>
            <td><Row><b>Document Name</b></Row>
            <Row>Commercial Invoice</Row></td>
            <td>
              <Row><b>Responsibility</b></Row>
              <Row>-</Row>
            </td>
            <td>
              <Row><b>Status:</b></Row>
              <Row>Attached</Row>
            </td>
          </tr>
        </tbody>
      </InvoiceTable>
      
      <InvoiceTable>
        <tbody>
          <tr>
            <th>15. Additional Instructions</th>
          </tr>
          <tr>
            <td>
              <TextArea rows={4} style={{width: "100%", height: "100%", fontSize: 10, padding: 0}} bordered={false} />
            </td>
          </tr>
        </tbody>
      </InvoiceTable>
      <br/>
    </PrintableContainer>
  );
}
