import React, { useState } from "react";
import scriptSave from "./scriptsavepop";
import axios from "axios";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useAsyncDebounce,
  useRowSelect,
  selectedFlatRows,
} from "react-table";
import { useExportData } from "react-table-plugins";
import Papa from "papaparse";
import * as XLSX from "xlsx/xlsx.mjs";
import JsPDF from "jspdf";
import "jspdf-autotable";
import "./style.css";
import Loader from "react-loader-spinner";

class AnalyseAllTable extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.initiateSearch = this.initiateSearch.bind(this);
  }

  componentDidMount() {
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    // Used For Handling Console Error.
    this.isComponentMounted = false;
  }

  initiateSearch(query, model) {
    this.props.search(query, model);
  }

  columns = [
    {
      Header: "Question/Answer Text",
      accessor: "que",
      Cell: ({ row }) => {
        return (
          <div className="rowdata">
            <span
              onClick={() => this.props.search(row.original.que, "qqpd")}
              className="main-row"
              title="Search for Similar Questions"
            >
              Q: {row.original.que}
            </span>
            <br />
            <span className="hidden-row">A: {row.original.ans}</span>
          </div>
        );
      },
    },
    // {
    //   Header: "Answer Text",
    //   accessor: "ans",
    //   Cell: ({ row }) => {
    //     return (
    //       <div className="rowdata">
    //         <span
    //           onClick={() => this.props.search(row.original.ans, "qqpd")}
    //           className="main-row"
    //           title="Search for Similar Answers"
    //         >
    //           A: {row.original.ans}
    //         </span>

    //       </div>
    //     );
    //   },
    // },
    {
      Header: "Attorney",
      accessor: "q_speaker",
      disableGlobalFilter: true,
    },
    {
      Header: "Witness",
      accessor: "a_speaker",
      disableGlobalFilter: true,
    },
    {
      Header: "Page : Line",
      accessor: "page_line",
      disableGlobalFilter: true,
    },
    {
      Header: "Transcript",
      accessor: "tname",
      disableGlobalFilter: true,
    },
    {
      Header: "Score",
      accessor: "score",
      disableGlobalFilter: true,
    },
  ];

  renderColums = () => {
    if (this.props.table_data_list && this.props.table_data_list.length > 0) {
      const findScore = this.props.table_data_list.find((data) => data.score);
      return findScore
        ? this.columns
        : this.columns.filter((columnData) => columnData.accessor !== "score");
    } else {
      return this.columns.filter(
        (columnData) => columnData.accessor !== "score"
      );
    }
  };

  render() {
    return (
      <section id="analysealltable">
        <TableComp
          columns={this.renderColums()}
          data={this.props.table_data_list}
          gotoAnalysisHome={this.props.gotoAnalysisHome}
          querySearch={this.initiateSearch}
          loadingStatus={this.props.loadingStatus}
        />
      </section>
    );
  }
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);
function GlobalFilter({ globalFilter, setGlobalFilter, setSearchQuery }) {
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);
  // console.log(sessionStorage.getItem('token'));
  return (
    <input
      className="searchallbox"
      value={value || ""}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
        setSearchQuery(e.target.value, "qqpd");
      }}
      placeholder="Search Here..."
    />
  );
}

// console.log()

function TableComp({
  columns,
  data,
  gotoAnalysisHome,
  querySearch,
  loadingStatus,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    exportData,
    // The rest of these things are super handy, too ;)
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data,
      getExportFileBlob,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    usePagination,
    useExportData,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div className="checkcol" style={{ width: 10 }}>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div className="checkcol" style={{ width: 10 }}>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  function getExportFileBlob({ columns, data, fileType, fileName }) {
    if (fileType === "csv") {
      // CSV example
      const headerNames = columns
        .filter((c) => c.Header != "Action")
        .map((col) => col.exportValue);
      // console.log(headerNames);
      // console.log(data);
      const csvString = Papa.unparse({ fields: headerNames, data });
      return new Blob([csvString], { type: "text/csv" });
    } else if (fileType === "xlsx") {
      // XLSX example

      const header = columns
        .filter((c) => c.Header != "Action")
        .map((c) => c.exportValue);
      const compatibleData = data.map((row) => {
        const obj = {};
        header.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });

      let wb = XLSX.utils.book_new();
      let ws1 = XLSX.utils.json_to_sheet(compatibleData, {
        header,
      });
      XLSX.utils.book_append_sheet(wb, ws1, "React Table Data");
      XLSX.writeFile(
        wb,
        sessionStorage.getItem("deponentName") +
          "-" +
          sessionStorage.getItem("username") +
          ".xlsx"
      );

      // Returning false as downloading of file is already taken care of
      return false;
    }
    //PDF example
    if (fileType === "pdf") {
      const headerNames = columns
        .filter((c) => c.Header != "Action")
        .map((column) => column.exportValue);
      const doc = new JsPDF();
      doc.autoTable({
        head: [headerNames],
        body: data,
        styles: {
          minCellHeight: 9,
          halign: "left",
          valign: "center",
          fontSize: 11,
        },
      });
      doc.save(`${fileName}.pdf`);

      return false;
    }

    if (fileType === "server") {
      var cnf;
      var data = JSON.stringify(selectedFlatRows.map((d) => d.original));
      if (data.length == 2) {
        alert("Please check on checkbox!");
      } else {
        cnf = window.confirm(
          "If you think any of these search results are not relevant, Please click on Ok Button"
        );
        if (cnf == true && data.length != 2) {
          var axios = require("axios");

          var config = {
            method: "post",
            url: "https://gbr41dfod8.execute-api.us-east-1.amazonaws.com/dev/manual-store-data",
            headers: {
              Authorization: sessionStorage.getItem("token"),
              username: sessionStorage.getItem("username"),
              "Content-Type": "application/json",
            },
            data: data,
          };
          if (this.isComponentMounted) {
            axios(config)
              .then(function (response) {
                // console.log(JSON.stringify(response.data));
                // window.location.reload();
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      }
    }

    // Other formats goes here
    return false;
  }

  let [SearchQuery, setSearchQuery] = useState();

  const initiateSearch = (model) => {
    querySearch(SearchQuery, model);
  };

  return (
    <div className="analysistable">
      <div className="action-bar">
        <div className="actions-left">
          <button className="refresh" onClick={() => window.location.reload()}>
            Reset Search
          </button>
        </div>
        <div className="searchbars">
          <div className="keyword-search-bar">
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
              setSearchQuery={setSearchQuery}
            />
          </div>

          <button className="search-btn" onClick={() => initiateSearch("qqpd")}>
            Semantic Search
          </button>
          <button className="search-btn" onClick={() => initiateSearch("mnli")}>
            Related Search
          </button>

          {/*
          <div className="models-searchbars">
            <div className="semantic-searchbar">
              <FilterSearch querySearchFun={querySearch} model='qqpd' />
            </div>
            <div className="mnli-searchbar">
              <FilterSearch querySearchFun={querySearch} model='mnli' />
            </div>
          </div>
          */}
        </div>
      </div>

      <div className="tableTopRow">
        <p
          style={{
            fontWeight: 400,
            paddingBottom: "20px",
            textTransform: "capitalize",
            fontSize: "20px",
          }}
        >
          {" "}
          &nbsp;Select irrelevant search results and send feedback
        </p>
      </div>

      <div className="tablecontainer">
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <th
                    {...column.getHeaderProps()}
                    style={{
                      width: index === 0 ? 20 : index === 1 ? "50%" : "auto",
                    }}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {
            {
              loading: (
                <tbody>
                  <tr>
                    <td className="table-row-status" colSpan="6">
                      <div className="loader">
                        <span className="loader-text">Fetching Data...</span>
                        <Loader
                          type="Oval"
                          color="#fe7e25"
                          loading="true"
                          height={20}
                          width={20}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              ),
              empty: (
                <tbody>
                  <tr>
                    <td className="table-row-status" colSpan="6">
                      <span>No Results Fetched</span>
                    </td>
                  </tr>
                </tbody>
              ),
              done: (
                <tbody {...getTableBodyProps()}>
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return (
                            <td {...cell.getCellProps()}>
                              <div className="rowdata">
                                {cell.render("Cell")}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              ),
            }[loadingStatus]
          }
        </table>

        <div className="form-group input-group">
          {/* <button
                    onClick={() => {
                        exportData("csv", true);
                    }}
                ><i ></i>{' '}
                  Export  as CSV
      </button>{' '} */}
          <button
            onClick={() => {
              exportData("xlsx", true);
            }}
          >
            <i></i> Export as xlsx
          </button>{" "}
          <button
            onClick={() => {
              exportData("server", true);
            }}
          >
            Send Feedback
          </button>
        </div>
      </div>

      <div className="pagination">
        <div className="page-nav">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {"<<"}
          </button>{" "}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            Previous
          </button>{" "}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </button>{" "}
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {">>"}
          </button>{" "}
        </div>
        <div className="currpage">
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </span>
          <span>
            | Go to page:{" "}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const pageNumber = e.target.value
                  ? Number(e.target.value) - 1
                  : 0;
                gotoPage(pageNumber);
              }}
              style={{ width: "50px" }}
            />
          </span>{" "}
        </div>
        <div className="pagesize">
          <span style={{ marginRight: `8px` }}>Rows per Page</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default AnalyseAllTable;
