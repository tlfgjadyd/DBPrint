import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const truncateString = (str, num) => {
    if (str.length > num) {
      return str.slice(0, num) + "...";
    }
    return str;
  };

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = 'https://dbprint.onrender.com'; // 배포된 백엔드 서버 주소

  // 컴포넌트 마운트 시 테이블 목록 가져오기
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${backendUrl}/api/tables`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTables(data);
      } catch (err) {
        setError("테이블 목록을 가져오는 데 실패했습니다: " + err.message);
        console.error("Error fetching tables:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  // 선택된 테이블의 데이터 가져오기
  useEffect(() => {
    const fetchTableData = async () => {
      if (!selectedTable) return;

      setLoading(true);
      setError(null);
      setTableData([]); // 이전 데이터 초기화

      try {
        const response = await fetch(
          `${backendUrl}/api/table/${selectedTable}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (err) {
        setError(
          `'${selectedTable}' 테이블 데이터를 가져오는 데 실패했습니다: ` +
            err.message
        );
        console.error(`Error fetching data for ${selectedTable}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchTableData();
  }, [selectedTable]); // selectedTable이 변경될 때마다 실행

  return (
    <div className="App">
      <header className="App-header">
        <h1>PostgreSQL Table Viewer</h1>
      </header>
      <main className="App-main">
        <div className="table-list-container">
          <h2>Tables</h2>
          {loading && !tables.length && <p>로딩 중...</p>}
          {error && <p className="error">{error}</p>}
          <ul className="table-list">
            {tables.map((table) => (
              <li
                key={table}
                className={selectedTable === table ? "selected" : ""}
                onClick={() => setSelectedTable(table)}
              >
                {table}
              </li>
            ))}
          </ul>
        </div>

        <div className="table-data-container">
          <h2>{selectedTable ? `${selectedTable} Data` : "Select a Table"}</h2>
          {loading && selectedTable && <p>로딩 중...</p>}
          {error && selectedTable && <p className="error">{error}</p>}
          {selectedTable && tableData.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {Object.keys(tableData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} title={String(value)}>
                          {truncateString(String(value), 25)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedTable && !loading && !error && tableData.length === 0 && (
            <p>데이터가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
