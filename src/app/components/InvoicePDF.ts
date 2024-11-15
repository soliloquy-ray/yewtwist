// components/InvoicePDF.tsx

import { jsPDF } from 'jspdf';

export const generateInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set font
  doc.setFont('helvetica', 'normal');
  
  // Header
  doc.setFontSize(16);
  doc.text('COMMERCIAL INVOICE', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Add table-like structure
  doc.setFontSize(10);
  doc.setLineWidth(0.5);
  
  // First row
  doc.rect(10, 30, 60, 15); // Date box
  doc.rect(70, 30, 80, 15); // PO Number box
  doc.rect(150, 30, 50, 15); // Export References box
  
  // Headers for first row
  doc.setFontSize(8);
  doc.text('1. Date of Exportation:', 12, 35);
  doc.text('2. Yewtwist PO Number:', 72, 35);
  doc.text('3. Export References:', 152, 35);
  
  // Data for first row
  doc.setFontSize(10);
  doc.text(invoice.TxnDate, 12, 40);
  doc.text(invoice.DocNumber, 72, 40);
  
  // Shipper/Exporter and Consignee Information
  doc.rect(10, 45, 100, 40); // Shipper box
  doc.rect(110, 45, 90, 40); // Consignee box
  
  doc.setFontSize(8);
  doc.text('3. Shipper / Exporter Information:', 12, 50);
  doc.text('4. Consignee / Importer Information:', 112, 50);
  
  // Company information
  doc.setFontSize(10);
  doc.text('Ingenyewity Inc', 12, 57);
  doc.text('15 Allstate Parkway, Suite 600', 12, 62);
  doc.text('L3R 5B4 Markham, Ontario', 12, 67);
  doc.text('Canada', 12, 72);
  
  // Consignee information
  doc.text(invoice.CustomerRef.name, 112, 57);
  // Add address if available in your invoice object
  
  // Country information
  doc.rect(10, 85, 60, 15);
  doc.rect(70, 85, 40, 15);
  doc.rect(110, 85, 90, 40);
  
  doc.setFontSize(8);
  doc.text('5. Country of Export:', 12, 90);
  doc.text('7. Country of Origin of Goods:', 72, 90);
  
  doc.setFontSize(10);
  doc.text('Canada', 12, 95);
  doc.text('Canada', 72, 95);
  
  // Add items table
  const startY = 130;
  doc.rect(10, startY, 190, 10); // Header row
  
  // Table headers
  doc.setFontSize(8);
  const columns = [
    'Product Code',
    'No. of Packages',
    'Type of Packaging',
    'Goods Description',
    'Lot Number',
    'Qty',
    'Unit of Measure',
    'Weight',
    'Unit Value (CDN)',
    'Total Value (CDN)'
  ];
  
  let xPos = 12;
  columns.forEach(col => {
    doc.text(col, xPos, startY + 5);
    xPos += 19;
  });
  
  // Add line items
  let yPos = startY + 15;
  invoice.Line.forEach((item, index) => {
    console.log({index});
    const itemDescription = item.DetailType === 'GroupLineDetail' ? item.GroupLineDetail?.GroupItemRef?.name :
    item.DetailType === 'DiscountLineDetail' ? item?.DiscountLineDetail?.DiscountAccountRef?.name : 
   item.SalesItemLineDetail?.ItemRef.name;
   const actualQty = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.Qty ?? item.SalesItemLineDetail?.Qty;
   const actualPrice = item.GroupLineDetail?.Line[0]?.SalesItemLineDetail?.UnitPrice ?? item.SalesItemLineDetail?.UnitPrice;
    if (['SalesItemLineDetail','GroupLineDetail','DiscountLineDetail'].includes(item.DetailType)) {
      doc.setFontSize(8);
      xPos = 12;
      doc.text(itemDescription || '', xPos, yPos);
      doc.text(actualQty?.toString() || '', xPos + 95, yPos);
      doc.text(`$${actualPrice?.toFixed(2)}`, xPos + 152, yPos);
      doc.text(`$${item.Amount.toFixed(2)}`, xPos + 171, yPos);
      yPos += 10;
    }
  });

  // Save the PDF
  doc.save(`invoice-${invoice.DocNumber}.pdf`);
};
