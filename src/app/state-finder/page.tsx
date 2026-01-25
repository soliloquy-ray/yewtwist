'use client'; // Required for AG Grid interaction

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
// 2. Register the modules immediately
ModuleRegistry.registerModules([AllCommunityModule]);
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { ColDef } from 'ag-grid-community';
import distributorData from '../sources/stateFinder.json';
import PageWithNav from '../components/PageWithNav';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 24px;
  .ant-table-cell {
  font-size: 12px;
  }
  .ant-btn {
  font-size: 12px;
  }
`;
export default function DistributorTablePage() {
  const [searchText, setSearchText] = useState('');
  const [rowData] = useState(distributorData);
  const gridRef = useRef<AgGridReact>(null);

  // Export to CSV function
  const onExportClick = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: 'distributor-network.csv',
    });
  }, []);

  // 2. Define your columns based on the JSON keys
  // 'field' must match the JSON key exactly.
  // 'flex: 1' makes columns auto-size to fill width.
  const [colDefs] = useState<ColDef[]>([
    { field: "Country", filter: true, width: 100 },
    { field: "State Name", filter: true, headerName: "State/Province" },
    { field: "Hospital Count", filter: "agNumberColumnFilter", width: 130 },
    // { field: "Since", filter: true, },
    { field: "Distributor Name", filter: true },
    { field: "Name", headerName: "Contact Name", filter: true },
    // { field: "Title", width: 120 },
    { field: "Contact Number", width: 150 },
    { field: "Address", width: 220 },
    { field: "Email", width: 220 },
    { field: "Area Representative", filter: true },
    // { field: "Rep Area Scope", filter: true },
    {
      field: "Rep Status", filter: true, cellStyle: params =>
        params.value === 'Active' ? { color: 'green', fontWeight: 'bold' } : null
    },
  ]);

  // 3. Default Column Definitions (applies to all cols)
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    floatingFilter: true, // Adds the mini-filter row under headers
  }), []);

  return (
    <PageWithNav>
      <PageContainer>
        <h1 className="text-3xl font-bold mb-6">Distributor Network</h1>

        {/* Search Input and Export Button */}
        <div className="mb-4 flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search anything (State, Name, Email)..."
            className="border border-gray-300 rounded p-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            onClick={onExportClick}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* The Grid Container */}
        <div className="ag-theme-quartz" style={{ height: 800, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50]}
            quickFilterText={searchText} // This enables the global search
          />
        </div>
      </PageContainer>
    </PageWithNav>
  );
}