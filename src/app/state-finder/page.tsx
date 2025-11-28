'use client'; // Required for AG Grid interaction

import React, { useState, useMemo } from 'react';
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

  // 2. Define your columns based on the JSON keys
  // 'field' must match the JSON key exactly.
  // 'flex: 1' makes columns auto-size to fill width.
  const [colDefs] = useState<ColDef[]>([
    { field: "Country", filter: true, width: 100 },
    { field: "State Name", filter: true, headerName: "State/Province" },
    { field: "Hospital Count", filter: "agNumberColumnFilter", width: 130 },
    { field: "Since", filter: true, },
    { field: "Distributor Name", filter: true },
    { field: "Name", headerName: "Contact Name", filter: true },
    { field: "Title", width: 120 },
    { field: "Contact Number", width: 150 },
    { field: "Address", width: 220 },
    { field: "Email", width: 220 },
    { field: "Area Representative", filter: true },
    { field: "Rep Area Scope", filter: true },
    { field: "Rep Status", filter: true, cellStyle: params => 
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

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search anything (State, Name, Email)..."
          className="border border-gray-300 rounded p-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* The Grid Container */}
      <div className="ag-theme-quartz" style={{ height: 800, width: '100%' }}>
        <AgGridReact
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