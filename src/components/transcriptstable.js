import React, { useState } from "react";
import "./style.css";
import {
  useTable,
  useSortBy,
  useRowSelect,
  useGlobalFilter,
  useAsyncDebounce,
  usePagination,
} from "react-table";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "react-loader-spinner";
import ProgressBar from "@ramonak/react-progress-bar";
import configData from "../config";

class TranscriptsTable extends React.Component {
  isComponentMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      tabledata: [],
      selectedids: [],
      contradictionStatusPercentage: 0,
      currPage: 1,
      totPages: 1,
      pageSize: 5,
      loadingStatus: "loading",
      anomalyStatusPercentage: {},
      anomalyMinutes: 0,
    };
    this.getFromChild = this.getFromChild.bind(this);
    this.performOperation = this.performOperation.bind(this);
    this.singleTranscriptAnomaly = this.singleTranscriptAnomaly.bind(this);
    this.singleTranscriptAnalysis = this.singleTranscriptAnalysis.bind(this);
    this.getUserTable = this.getUserTable.bind(this);
  }

  componentDidMount() {
    this.isComponentMounted = true;

    this.getUserTable();
  }

  componentWillUnmount() {
    // Used For Handling Console Error.
    this.isComponentMounted = false;
    this.setState = (state, callback) => {
      return;
    };
  }

  async getUserTable() {
    if (this.isComponentMounted) {
      this.setState({ loadingStatus: "loading" });
      await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        url: configData.TranscriptAnalysis.AWSApiGateway.GetUserTable,
      })
        .then((response) => {
          this.setState(
            {
              tabledata: response.data.body,
            },
            () =>
              this.setState({
                loadingStatus: this.state.tabledata.length ? "done" : "empty",
              })
          );
        })
        .catch((error) => {
          console.log("Error", error);
        });
    }
  }

  getFromChild(val, operation) {
    this.setState({ selectedids: [] });
    let temp = [];
    val.map((row) => temp.push(row["original"]["id"]));
    if (operation === "anomalies") {
      sessionStorage.setItem("anomalies_tids", temp);
    } else if (operation === "stats") {
      sessionStorage.setItem("stats_tids", temp);
    } else if (operation === "summary") {
      console.error("called");
      sessionStorage.setItem("summary_tids", temp);
    } else if (operation === "summary_topic") {
      sessionStorage.setItem("summary_topic_tids", temp);
    } else {
      this.setState(
        {
          selectedids: temp,
        },
        () => this.performOperation(operation)
      );
    }
  }

  singleTranscriptAnomaly(val) {
    sessionStorage.setItem("anomalies_tids", val);
  }

  singleTranscriptAnalysis(val) {
    sessionStorage.setItem("job_id", val);
  }

  async performOperation(operation) {
    //console.log(operation, this.state.selectedids)
    switch (operation) {
      case "delete":
        console.log(this.state.selectedids);
        try {
          const body = {
            files: this.state.selectedids,
            job_id: this.props.job_id,
          };
          // console.log(body);
          const requestOptions = {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
              Authorization: sessionStorage.getItem("token"),
              username: sessionStorage.getItem("username"),
            },
          };
          await fetch(
            configData.TranscriptAnalysis.AWSApiGateway.DeleteTranscript,
            requestOptions
          ).then((response) => {
            // console.log(response)
            if (response.status === 200) {
              alert("Transcripts Deleted Successfully!");
              window.location.reload();
            } else {
              console.log("Error!");
            }
          });
        } catch (error) {
          console.log("Error");
        }
        break;
      case "update_group":
        try {
          const job_id = this.props?.updatedGroupList?.job_id;
          const body = { job_id: job_id, files: this.state.selectedids };
          alert("Updating");
          // console.log(body, "body")
          const requestOptions = {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
              Authorization: sessionStorage.getItem("token"),
              username: sessionStorage.getItem("username"),
            },
          };
          await fetch(
            configData.TranscriptAnalysis.AWSApiGateway.QueueClusteringJobs,
            requestOptions
          ).then((response) => {
            // console.log(response)
            if (response.status === 200) {
              alert("Group Updated Successfully!");
              window.location.reload();
            } else {
              console.log("Error!");
            }
          });
        } catch (error) {
          console.log("Error", error);
        }
        break;

      default:
        break;
    }
  }

  // Bad Code Remove in Future
  temp = setInterval(() => {
    this.setState({
      contradictionStatusPercentage:
        this.state.contradictionStatusPercentage + 1,
    });
  }, 800);

  calculatePropgressStatus(row) {
    const startDate = row.original.start_date;
    const endDate = row.original.end_date;
    const noOfQuestions = row.original.no_of_que;
    if (Boolean(startDate) === true && Boolean(endDate) === false) {
      let timeTakenToComlpleteClustringJob = 0.0055 * noOfQuestions + 1.29;
      let timeForInterval = (timeTakenToComlpleteClustringJob * 60) / 100;
      let max = 100;
    } else {
      return false;
    }
  }

  columns = [
    {
      Header: "Transcript Name",
      accessor: "transcript_name",
      Cell: ({ row }) => {
        return (
          <div className="rowdata">
            <Link
              to="/analysis"
              onClick={() => this.singleTranscriptAnalysis(row.original.job_id)}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="main-row">{row.original.transcript_name}</span>
            </Link>
          </div>
        );
      },
    },
    {
      Header: "Deponent Name",
      Cell: ({ row }) => {
        return (
          <span>{`${row?.original?.FirstName || ""} ${
            row?.original?.MiddleName || ""
          } ${row?.original?.LastName || ""}`}</span>
        );
      },
    },
    {
      Header: "Deposition Date (UTC)",
      accessor: "DepositionDate",
      Cell: ({ row }) => {
        return row?.original?.DepositionDate ? (
          <span>{row?.original?.DepositionDate}</span>
        ) : null;
      },
    },
    {
      Header: "Size",
      accessor: "size",
    },
    {
      Header: "Modified On (UTC)",
      accessor: "mod_on",
    },
    {
      Header: "No. of Questions",
      accessor: "no_of_que",
    },
    {
      Header: "Clustering Status",
      accessor: "ClusteringStatus",
      Cell: ({ row }) => {
        return (
          <div className="rowdata">
            {row.original?.ClusteringStatus === "Completed" ? (
              <Link
                to="/analysis"
                onClick={() => this.singleTranscriptAnalysis(row.original.id)}
              >
                <span className="main-row">View</span>
              </Link>
            ) : (
              <span className="main-row">
                {/* {console.log(this.state.anomalyStatusPercentage[row.original.id], "11111111111111111")} */}
                {/* {Math.floor(
                  (this.calculatePropgressStatus(row))*100) <=100
                  ?
                  <ProgressBar 
                  bgColor={'#fe7e25'} 
                  completed={Number(this.state.anomalyStatusPercentage[row.original.id] !== undefined ? this.state.anomalyStatusPercentage[row.original.id] : 100)}
                  // completed={this.calculatePropgressStatus(row)} 
                />
                : <ProgressBar completed={100} />} */}
                {row.original?.ClusteringStatus || ""}
              </span>
            )}
          </div>
        );
      },
    },
    {
      Header: "Contradiction Status",
      accessor: "ContradictionStatus",
      Cell: ({ row }) => {
        return (
          <div className="rowdata" style={{ paddingLeft: "25px" }}>
            {row.original?.ContradictionStatus === "Completed" ? (
              <Link
                to="/anomalies"
                onClick={() => this.singleTranscriptAnomaly(row.original.id)}
              >
                <span className="main-row">View</span>
              </Link>
            ) : (
              <span className="main-row">
                {row.original?.ContradictionStatus || ""}
              </span>
            )}
          </div>
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => {
        return (
          <button
            className="primary-btn custom-action-button"
            onClick={() => this.props.toggleUpdateDeponent(true, row)}
          >
            Update Deponent
          </button>
        );
      },
    },
  ];

  render() {
    // console.log(this.state.anomalyStatusPercentage, "333333333333333")
    return (
      <>
        <TableComp
          columns={this.columns}
          data={this.state.tabledata}
          sendToparent={this.getFromChild}
          refresh={this.getUserTable}
          toggleUploadBox={this.props.toggleUploadBox}
          toggleJobPage={this.props.toggleJobPage}
          toggleCreateGroup={this.props.toggleCreateGroup}
          loadingStatus={this.state.loadingStatus}
          updatedGroupList={this.props.updatedGroupList}
        />
      </>
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

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      <input
        className="searchallbox"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Search Here..."
      />
    </span>
  );
}

function TableComp({
  columns,
  data,
  sendToparent,
  refresh,
  toggleUploadBox,
  toggleJobPage,
  toggleCreateGroup,
  loadingStatus,
  updatedGroupList,
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
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, selectedRowIds },
    prepareRow,
    state,
    selectedFlatRows,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      disableSortRemove: true,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div className="checkcol">
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div className="checkcol">
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  const DeleteFiles = () => {
    sendToparent(selectedFlatRows, "delete");
    //console.log("done")
  };

  const ViewAnomalies = () => {
    //console.log('here')
    sendToparent(selectedFlatRows, "anomalies");
    //console.log("done")
  };

  const ViewSummary = () => {
    //console.log('here')
    sendToparent(selectedFlatRows, "summary");
    //console.log("done")
  };

  const ViewStats = () => {
    //console.log('here')
    sendToparent(selectedFlatRows, "stats");
    //console.log("done")
  };

  const [isOpen, setOpen] = useState(false);
  const DropdownSetState = () => {
    setOpen(!isOpen);
  };

  function updateGroupData(selectedFlatRows) {
    sendToparent(selectedFlatRows, "update_group");
  }

  return (
    <section id="transcripts-table">
      <div className="actionbar">
        <div className="search-bar">
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
        <div className="buttons-right">
          <div className="action-btns">
            <div className="pseudo">
              <button className="refresh" onClick={refresh}>
                <p>↻</p>
              </button>
              <button className="jobs-btn" onClick={() => toggleJobPage(true)}>
                Groups
              </button>
              <button
                className="upload-btn"
                onClick={() => toggleUploadBox(true)}
              >
                Upload
              </button>
            </div>
          </div>
          <div className="action-btns">
            <button
              onClick={DropdownSetState}
              className="dropdown-menu"
              disabled={!Object.keys(selectedRowIds).length}
            >
              Actions
            </button>
            {isOpen ? (
              <div className="dropdown-itmes">
                <ul className="dropdown-list">
                  <li
                    className="list-items"
                    onClick={() => toggleCreateGroup(true, selectedFlatRows)}
                  >
                    Create Group
                  </li>

                  <li
                    className="list-items"
                    onClick={() => {
                      updateGroupData(selectedFlatRows);
                    }}
                  >
                    Update Group
                  </li>
                  <Link
                    to="/anomalies"
                    onClick={ViewAnomalies}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <li className="list-items">Contradiction</li>
                  </Link>
                  <Link
                    to="/summary"
                    onClick={ViewSummary}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <li className="list-items">Summary</li>
                  </Link>
                  <Link
                    to="/stats"
                    onClick={ViewStats}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <li className="list-items">View Stats</li>
                  </Link>
                  <Link
                    to="/summaryTopic"
                    onClick={ViewStats}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <li className="list-items">Summary Topic</li>
                  </Link>
                  {/* <Link to="/summarySamsum"
                      onClick={ViewStats}
                      style={{ textDecoration: 'none', color: 'inherit' }}>
                      <li className="list-items">Summary Samsum</li>
                    </Link> */}
                  <li className="list-items" onClick={DeleteFiles}>
                    Delete
                  </li>
                </ul>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      <div className="tablecontainer">
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
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
                      <span>Nothing to Display</span>
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
                              {cell.render("Cell")}
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
    </section>
  );
}

export default TranscriptsTable;
