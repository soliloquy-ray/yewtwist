"use client"

import { Button, Checkbox, Input, Select, Image } from "antd"
import { useEffect, useState } from "react"
import styled from "styled-components";

interface ProducerDetails {
  companyName: string;
  importerName: string;
  address: string;
  contactNumber: string;
  email: string;
  taxIdNumber: string;
}

const ProducerDetails: ProducerDetails[] = [{
  companyName: "Alamo Scientific, Inc",
  importerName: "FedEx  Ground # 627462008",
  address: "7431 Reindeer Trail #2, San Antonio, TX 78238",
  contactNumber: "210-543-1300",
  email: "sales@alamoscientific.com",
  taxIdNumber: "20-1408943"
},
{
  companyName:  "Clinical Technology, Inc.",
  importerName: "Clinical Technology, Inc.",
  address: "7005 S. Edgerton Rd.  Brecksville, OH 44141",
  contactNumber: "440/526-0160",
  email:  "info@clinical-tech.com",
  taxIdNumber:  "34-1293451",
},{
  companyName: "New England Medical Specialties, Inc",
  importerName: "New England Medical Specialties, Inc",
  address: "21B Commerce Drive North Branford Ct 06471",
  contactNumber: "860-877-2226",
  email: "Kath@nemsct.com",
  taxIdNumber: "86-1093521"
}
]

const AdjustedInput = styled(Input)`
  border: 0;
  width: fit-content;
  background: transparent;
  z-index: 0;
`;
const Ndiv = styled.div`
  display: flex;
  padding: 0px 8px;
  justify-content: flex-start;
  align-items: center;
  label {
    display: inline;
    flex: 0 0 auto;
    line-height: 12px;
  font-size: 12px;
  }
  .ant-select{
    flex: 1;
  }
  .ant-input {
  font-size: 12px;
    display: inline;
    padding: 0 8px;
    line-height: 12px;
    flex: 1;
    // width: fit-content;
  }
`;

const Container = styled.div`
display: block;

    @media print {
      -webkit-print-color-adjust: exact;
      .no-print {
        display: none;
      }
    }
`

interface ExtendedLineItem extends LineItem {
  hidden: boolean;
}

export default function CertificateForm(invoice: Invoice) {
  const [invoiceLine, setInvoiceLine] = useState<ExtendedLineItem[]>([]);
  // Section 1 - Certifier
  const [certifierType, setCertifierType] = useState<string>("")

  // Section 2 - Certifier Details
  const [certifierCompanyName, setCertifierCompanyName] = useState("Ingenyewity Inc.")
  const [certifierNameJobTitle, setCertifierNameJobTitle] = useState("Maria Plummer Founder & CEO")
  const [certifierAddress, setCertifierAddress] = useState("15 Allstate Parkway, Suite 600 Markham ON L3R 5B4 Canada")
  const [certifierTelephone, setCertifierTelephone] = useState("289-469-0725")
  const [certifierEmail, setCertifierEmail] = useState("mplummer@yewtwist.com")
  const [certifierTaxId, setCertifierTaxId] = useState("814203998RM0001")

  // Section 3 - Exporter Details
  const [exporterCompanyName, setExporterCompanyName] = useState("Ingenyewity Inc.")
  const [exporterNameJobTitle, setExporterNameJobTitle] = useState("Mary Santos – Logistic Coordinator")
  const [exporterAddress, setExporterAddress] = useState("15 Allstate Parkway, Suite 600 Markham ON L3R 5B4 Canada")
  const [exporterTelephone, setExporterTelephone] = useState("437-460-4041")
  const [exporterEmail, setExporterEmail] = useState("msantos@yewtwist.com")
  const [exporterTaxId, setExporterTaxId] = useState("814203998RM0001")

  // Section 4 - Producer Details
  const [variousProducers, setVariousProducers] = useState(false)
  const [availableUponRequest, setAvailableUponRequest] = useState(false)
  const [producerCompanyName, setProducerCompanyName] = useState("Optimoule")
  const [producerName, setProducerName] = useState("Antoine Michaud")
  const [producerAddress, setProducerAddress] = useState("275 Monfette East, Thetford Mines, Quebec, Canada G6G7H4")
  const [producerTelephone, setProducerTelephone] = useState("418-338-6106")
  const [producerEmail, setProducerEmail] = useState("amichaud@optimoule.com")
  const [producerTaxId, setProducerTaxId] = useState("721730000AER2354469")

  // Section 5 - Importer Details
  const [unknown, setUnknown] = useState(false)
  const [variousImporters, setVariousImporters] = useState(false)
  const [importerCompanyName, setImporterCompanyName] = useState("")
  const [importerName, setImporterName] = useState("")
  const [importerAddress, setImporterAddress] = useState("")
  const [importerTelephone, setImporterTelephone] = useState("")
  const [importerEmail, setImporterEmail] = useState("")
  const [importerTaxId, setImporterTaxId] = useState("")

  // Section 6-9 - Goods Table
  // const [hsTariff1] = useState("9018.9080 - gripping device used for medical science")
  const [originCriterion1, setOriginCriterion1] = useState("C")
  const [countryOrigin1, setCountryOrigin1] = useState("Canada")

  // Section 10 - Blanket Period
  const [periodFrom, setPeriodFrom] = useState("")
  const [periodTo, setPeriodTo] = useState("")

  // Signature
  const [responsibleOfficial, setResponsibleOfficial] = useState("")
  const [signatureDate, setSignatureDate] = useState("")

  const handleChangeProducer = (tax: string) => {
    const targetDataset = ProducerDetails.find((p) => p.taxIdNumber.toLocaleLowerCase() === tax.toLocaleLowerCase());
    if (targetDataset) {
      setImporterCompanyName(targetDataset.companyName);
      setImporterName(targetDataset.importerName);
      setImporterAddress(targetDataset.address);
      setImporterTelephone(targetDataset.contactNumber);
      setImporterEmail(targetDataset.email);
      setImporterTaxId(targetDataset.taxIdNumber);
    }
  }
  
  
      useEffect(() => {
        if (!invoice) return;
        setInvoiceLine(invoice.Line.map((lineItems) => ({...lineItems, hidden: false })));
      }, [invoice])
      
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

  return (
    <Container className="max-w-4xl mx-auto p-8 bg-white">
      <div>
        {/* Header */}
        <Image alt="yewtwist logo" height={50} style={{objectFit: "contain"}} src={"/Yewtwist-logo.png"}/>
        <div className="text-center py-4 ">
          <h1 className="text-xl font-bold">Certification of Origin</h1>
          <h2 className="text-lg font-bold">(USMCA/T-MEC/CUSMA)</h2>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Section 1 - Certifier */}
          <div className="mb-4 border-1 border-black">
            <div className="flex items-center gap-4 mb-2">
              <span className="font-bold bg-[var(--origin-green)] !pt-1 !pb-2 !px-1" style={{backgroundColor: "#92d050"}}>1. CERTIFIER:</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={certifierType === "importer"}
                  onChange={() => setCertifierType(certifierType === "importer" ? "" : "importer")}
                />
                <span>Importer</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={certifierType === "exporter"}
                  onChange={() => setCertifierType(certifierType === "exporter" ? "" : "exporter")}
                />
                <span>Exporter</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={certifierType === "producer"}
                  onChange={() => setCertifierType(certifierType === "producer" ? "" : "producer")}
                />
                <span>Producer</span>
              </div>
            </div>
          </div>

          {/* Sections 2 & 3 - Side by side */}
          <div className="grid grid-cols-2 mb-4">
            {/* Section 2 - Certifier Details */}
            <div className="border p-3">
              <h3 className="font-bold mb-3 bg-[var(--origin-green)] !pt-1 !pb-2 !px-1" style={{backgroundColor: "#92d050"}}>2. CERTIFIER DETAILS</h3>
              <div className="space-y-2">
                <Ndiv>
                  <label className="text-sm font-medium">Company Name:</label>
                  <AdjustedInput
                    value={certifierCompanyName}
                    onChange={(e) => setCertifierCompanyName(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Name & Job Title:</label>
                  <AdjustedInput
                    value={certifierNameJobTitle}
                    onChange={(e) => setCertifierNameJobTitle(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Address:</label>
                  <AdjustedInput
                    value={certifierAddress}
                    onChange={(e) => setCertifierAddress(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-12 text-sm resize-none"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Telephone:</label>
                  <AdjustedInput
                    value={certifierTelephone}
                    onChange={(e) => setCertifierTelephone(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Email:</label>
                  <AdjustedInput
                    value={certifierEmail}
                    onChange={(e) => setCertifierEmail(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Tax ID Number:</label>
                  <AdjustedInput
                    value={certifierTaxId}
                    onChange={(e) => setCertifierTaxId(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
              </div>
            </div>

            {/* Section 3 - Exporter Details */}
            <div className="border p-3">
              <h3 className="font-bold mb-3 bg-[var(--origin-green)] !pt-1 !pb-2 !px-1" style={{backgroundColor: "#92d050"}}>3. EXPORTER&apos;S DETAILS <p className="text-xs inline">(If different than the certifier)</p></h3>
              <div className="space-y-2">
                <Ndiv>
                  <label className="text-sm font-medium">Company Name:</label>
                  <AdjustedInput
                    value={exporterCompanyName}
                    onChange={(e) => setExporterCompanyName(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Name & Job Title:</label>
                  <AdjustedInput
                    value={exporterNameJobTitle}
                    onChange={(e) => setExporterNameJobTitle(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Address:</label>
                  <AdjustedInput
                    value={exporterAddress}
                    onChange={(e) => setExporterAddress(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-12 text-sm resize-none"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Telephone:</label>
                  <AdjustedInput
                    value={exporterTelephone}
                    onChange={(e) => setExporterTelephone(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Email:</label>
                  <AdjustedInput
                    value={exporterEmail}
                    onChange={(e) => setExporterEmail(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Tax ID Number:</label>
                  <AdjustedInput
                    value={exporterTaxId}
                    onChange={(e) => setExporterTaxId(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
              </div>
            </div>
          </div>

          {/* Section 4 - Producer Details */}
          <div className="grid grid-cols-2 mb-4">
          <div className="border border-black p-3 mb-4">
            <h3 className="font-bold mb-3 bg-[var(--origin-green)] !pt-1 !pb-2 !px-1 h-8" style={{backgroundColor: "#92d050"}}>4. PRODUCER&apos;S DETAILS <p className="text-xs inline">(If different than the certifier or exporter)</p></h3>
            <div className="flex items-center gap-6 mb-3 bg-[var(--origin-green)] h-20 justify-center" style={{backgroundColor: "#92d050"}}>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={variousProducers}
                  onChange={(checked) => setVariousProducers(checked.target.checked)}
                />
                <span className="text-sm">Various Producers</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={availableUponRequest}
                  onChange={(checked) => setAvailableUponRequest(checked.target.checked)}
                />
                <span className="text-sm">Available upon request by <br/> the importing authorities</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {/* <div className="space-y-2"> */}
                <Ndiv>
                  <label className="text-sm font-medium">Company Name:</label>
                  <AdjustedInput
                    value={producerCompanyName}
                    onChange={(e) => setProducerCompanyName(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Name:</label>
                  <AdjustedInput
                    value={producerName}
                    onChange={(e) => setProducerName(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Address:</label>
                  <AdjustedInput
                    value={producerAddress}
                    onChange={(e) => setProducerAddress(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
              {/* </div> */}
              {/* <div className="space-y-2"> */}
                <Ndiv>
                  <label className="text-sm font-medium">Telephone:</label>
                  <AdjustedInput
                    value={producerTelephone}
                    onChange={(e) => setProducerTelephone(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Email:</label>
                  <AdjustedInput
                    value={producerEmail}
                    onChange={(e) => setProducerEmail(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Tax ID Number:</label>
                  <AdjustedInput
                    value={producerTaxId}
                    onChange={(e) => setProducerTaxId(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
              {/* </div> */}
            </div>
          </div>

          {/* Section 5 - Importer Details */}
          <div className="border border-black p-3 mb-4">
            <h3 className="font-bold mb-3 bg-[var(--origin-green)] !pt-1 !pb-2 !px-1 h-8" style={{backgroundColor: "#92d050"}}>5. IMPORTER&apos;S DETAILS <p className="text-xs inline">(If different than the certifier)</p></h3>
            <div className="flex items-center gap-6 mb-3 bg-[var(--origin-green)] h-20 justify-center" style={{backgroundColor: "#92d050"}}>
              <div className="flex items-center gap-2">
                <Checkbox checked={unknown} onChange={(checked) => setUnknown(checked.target.checked)} />
                <span className="text-sm">Unknown</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={variousImporters}
                  onChange={(checked) => setVariousImporters(checked.target.checked)}
                />
                <span className="text-sm">Various Importers</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {/* <div className="space-y-2"> */}
                <Ndiv>
                  <label className="text-sm font-medium">Company Name:</label>
                  
                  <Select variant="borderless" value={importerCompanyName} onChange={(val) => handleChangeProducer(val)}>
                    {
                      ProducerDetails.map((prod) => (<Select.Option key={prod.taxIdNumber}>{prod.companyName}</Select.Option>))
                    }
                  </Select>
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Name:</label>
                  <AdjustedInput
                    value={importerName}
                    onChange={(e) => setImporterName(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Address:</label>
                  <AdjustedInput
                    value={importerAddress}
                    onChange={(e) => setImporterAddress(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
              {/* </div>
              <div className="space-y-2"> */}
                <Ndiv>
                  <label className="text-sm font-medium">Telephone:</label>
                  <AdjustedInput
                    value={importerTelephone}
                    onChange={(e) => setImporterTelephone(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Email:</label>
                  <AdjustedInput
                    value={importerEmail}
                    onChange={(e) => setImporterEmail(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
                <Ndiv>
                  <label className="text-sm font-medium">Tax ID Number:</label>
                  <AdjustedInput
                    value={importerTaxId}
                    onChange={(e) => setImporterTaxId(e.target.value)}
                    className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
                  />
                </Ndiv>
              {/* </div> */}
            </div>
          </div>
          </div>

          {/* Sections 6-9 - Goods Table */}
          <div className="border border-black mb-4">
            <table className="w-full" style={{tableLayout: "fixed"}}>
              <thead>
                <tr className="border-b border-black bg-[var(--origin-green)]" style={{backgroundColor: "#92d050"}}>
                  <th className="border-r border-black p-2 text-left text-sm font-bold" colSpan={2}>6. DESCRIPTION OF THE GOOD</th>
                  <th className="border-r border-black p-2 text-left text-sm font-bold">7. HS TARIFF CLASSIFICATION</th>
                  <th className="border-r border-black p-2 text-left text-sm font-bold">8. ORIGIN CRITERION</th>
                  <th className="p-2 text-left text-sm font-bold">9. COUNTRY OF ORIGIN</th>
                </tr>
                <tr className="border-b border-black bg-[var(--origin-green)]" style={{backgroundColor: "#92d050"}}>
                  <th className="border-r border-black p-2 text-left text-xs">PART / SKU NUMBER</th>
                  <th className="border-r border-black p-2 text-left text-xs">DESCRIPTION</th>
                  <th />
                  <th className="border-r border-black p-2 text-left text-xs"></th>
                  <th className="p-2 text-left text-xs"></th>
                </tr>
              </thead>
              <tbody>
                {invoiceLine.map((item,idx) => {
            const itemDescription = item.DetailType === 'GroupLineDetail' ? item.GroupLineDetail?.GroupItemRef?.name :
            item.DetailType === 'DiscountLineDetail' ? item?.DiscountLineDetail?.DiscountAccountRef?.name : 
          item.SalesItemLineDetail?.ItemRef.name;
            const productCode = getProductCodeFromDesc(itemDescription?.toLocaleLowerCase() ?? "");           
                return <tr key={idx} className="border border-black" onClick={() => setInvoiceLine((pv) => [...pv.filter((lineItem) => lineItem.Id !== item.Id)])}>
                  <td className="border p-1 text-sm">
                      {productCode}
                      </td>
                      <td className="text-sm">
                      {itemDescription}
                  </td>
                  <td className="border border-black p-1 text-xs">
                    {/* {hsTariff1} */}
                    9018.9080 - <br/>gripping device used for medical science
                  </td>
                  <td className="border border-black p-1">
                    <AdjustedInput
                      value={originCriterion1}
                      onChange={(e) => setOriginCriterion1(e.target.value)}
                      className="border-0 rounded-none px-1 py-0 h-6 text-sm"
                    />
                  </td>
                  <td className="p-1">
                    <AdjustedInput
                      value={countryOrigin1}
                      onChange={(e) => setCountryOrigin1(e.target.value)}
                      className="border-0 rounded-none px-1 py-0 h-6 text-sm"
                    />
                  </td>
                </tr>})}
                
              </tbody>
            </table>
          </div>

          {/* Section 10 - Blanket Period */}
          <div className="border border-black p-3 mb-4">
            <h3 className="font-bold mb-3 bg-[var(--origin-green)]" style={{backgroundColor: "#92d050"}}>10. BLANKET PERIOD</h3>
            <div className="flex items-center gap-2 text-sm !p-2">
              <span>Period covered by certification (if applicable) is up to 12 months from</span>
              <AdjustedInput
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                className="border-0 !border-b border-gray-400 !rounded-none px-1 py-0 h-6 text-sm"
              />
              <span>to</span>
              <AdjustedInput
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                className="border-0 !border-b border-gray-400 !rounded-none px-1 py-0 h-6 text-sm"
              />
            </div>
          </div>

          {/* Certification Text and Signature */}
          <div className="space-y-4">
            <p className="text-xs leading-relaxed">
              I certify that the goods described in this document qualify as originating and the information contained
              in this document is true and accurate. I assume responsibility for proving such representations and agree
              to maintain and present upon request, or to make available during a verification visit, documentation
              necessary to support this certification.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium">
                Name of Responsible Official of Company or Authorized Agent if the invoice certified on behalf of a
                company or individual:
              </label>
              <AdjustedInput
                value={responsibleOfficial}
                onChange={(e) => setResponsibleOfficial(e.target.value)}
                className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm"
              />
            </div>

            <div className="flex items-center gap-8 mt-8">
              <div className="flex-1">
                <label className="text-sm font-bold">CERTIFIER&apos;S SIGNATURE</label>
                <div className="border-b border-gray-400 h-8 mt-2"></div>
              </div>
              <div className="w-32">
                <label className="text-sm font-bold">DATE</label>
                <AdjustedInput
                  value={signatureDate}
                  onChange={(e) => setSignatureDate(e.target.value)}
                  className="border-0 border-b border-gray-400 rounded-none px-1 py-0 h-6 text-sm mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 no-print">
        <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700">
          Print Form
        </Button>
      </div>
    </Container>
  )
}
