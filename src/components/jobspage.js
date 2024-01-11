import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loader from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import { useTable, useSortBy, useRowSelect, useGlobalFilter, useAsyncDebounce, usePagination } from 'react-table'
import './style.css'
import configData from "../config";
class JobsBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = { jobstable: [], transcriptsInJob: [], loadingStatus: true };
    this.performOpertaion = this.performOpertaion.bind(this);
  }

  updateDataInGroup(cell) {
    this.props.updateValueCallback(cell);
  }

  async componentDidMount() {
    await axios({
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username')
      },
      url: configData.TranscriptAnalysis.AWSApiGateway.GetClusteringJobsList,
    })
    .then(response => {
      // console.log("test")
      this.setState({ jobstable : response.data.body, loadingStatus: false })
    }).catch(error => {
      this.setState({ loadingStatus: false })
      console.log("Error", error)
    });
    //console.log(this.state.jobstable);
  }

  async performOpertaion(val, operation) {
    if(!(val === undefined)) {
      switch (operation) {
        case 'analyse':
          sessionStorage.setItem("job_id", val)
          break;


        case 'show-transcripts':
          //console.log("show", val);
          try {
            const body = { job_id: val}
            await axios({
              method: 'POST',
              url: configData.TranscriptAnalysis.AWSApiGateway.GetTranscriptsInJobs,
              data: JSON.stringify(body),
              headers: {
                "Content-Type" : "application/json",
                "Authorization": sessionStorage.getItem('token'),
                "username": sessionStorage.getItem('username')
              }
            })
            .then(
              response => {
                // alert("test")
                // alert(response);
                if(response.status === 200){
                  // this.setState({transcriptsInJob: response.data.body})//beta
                  this.setState({transcriptsInJob: response.data.body, loadingStatus: false})//dev
                }
                else {
                 console.log("Error")
                }
              }
            )
          }
          catch (error) {
            console.log("Error");
          }
          break;


        case 'delete':
          //console.log("delete", val);
          try {
            const body = { job_id: val}
            const requestOptions = {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {
                "Content-Type" : "application/json",
                "Authorization": sessionStorage.getItem('token'),
                "username": sessionStorage.getItem('username'),
              }
            };
            await fetch(configData.TranscriptAnalysis.AWSApiGateway.RemoveClusteringJobs, requestOptions)
            .then(
              response => {
                if(response.status === 200){
                  alert("Group Removed Successfully!")
                  window.location.reload()
                }
                else {
                  console.log("Error")
                }
              }
            )
          }
          catch (error) {
            console.log("Error");
          }
          break;

        default:
          break;
      }
    }
    else {
      this.setState({transcriptsInJob: []})
    }
  }

  columns = [   
    // {
    //   Header: 'Group Id',
    //   accessor: 'job_id',
    // },
    {
      Header: 'Group Name',
      accessor: 'job_name',
    },
    {
      Header: 'Analysis Status',
      accessor: 'status',
    },
    {
      Header: 'Contradiction Status',
      accessor: 'contraStatus'
    },
    {
      Header: 'Update Data',
      accessor: 'updateData',
      Cell: cell => (
        <button value='Update Data'
                className='primary-btn'
                onClick={(data) => {
                  this.updateDataInGroup(cell.row.values);
                }}>
          Update
        </button>
      )
    },
  ]

  render() {
    return(
      <section id="jobs-box">
        <h1 className="jobs-heading">All Groups</h1>
        <TableComp
          columns={this.columns}
          data={this.state.jobstable}
          transcriptsInJob={this.state.transcriptsInJob}
          sentToParent={this.performOpertaion}
          loadingStatus={this.state.loadingStatus}
        />
        <div className="selected-transcripts">
          <h3>Transcripts in the Selected Group:</h3>
          <div className="tlist">
            {this.state.transcriptsInJob.map( t_ids =>
              <p className="tnames">{t_ids}<br /></p>
            )}
          </div>
        </div>
      </section>
    )
  }
}


function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
      setGlobalFilter(value || undefined)
  }, 200)

  return (
    <span>
      <input
        className="searchallbox"
        value={value || ""}
        onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
        }}
        placeholder="Search Here..."
      />
    </span>
  )
}


function TableComp({ columns, data, sentToParent, loadingStatus }) {

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
    state: { pageIndex, pageSize },
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      disableSortRemove:true,
      initialState: { pageSize: 5 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
  )

  const [isOpen, setOpen] = useState(false);
  const DropdownSetState = () => {
    setOpen(!isOpen)
  };

  const [whichSelected, setSelect] = useState(undefined);
  function detSelected (i) {
    return whichSelected === i ? false : true;
  }

  useEffect(() => {
    //console.log("here")
    sentToParent(whichSelected, 'show-transcripts')
  }, [whichSelected])

  function onSelectingJobs (val) {
    setSelect(val === whichSelected ? undefined : val)
  }

  return (
    <div className="jobstable">
      <div className="actionbar">
        <div className="search-bar">
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>

        <div className="action-btns">
          <button onClick={DropdownSetState} className="dropdown-menu" disabled={(whichSelected === undefined)}>Actions</button>
          {
            isOpen ?
              <div className="dropdown-itmes">
                <ul className="dropdown-list">
                  <Link to="/analysis"
                    onClick={() => sentToParent(whichSelected, 'analyse')}
                    style={{ textDecoration: 'none', color: 'inherit' }}>
                    <li className="list-items">View Analysis</li>
                  </Link>
                  <li className="list-items"><a onClick={() => sentToParent(whichSelected, 'delete')}>Delete</a></li>
                </ul>
              </div>
            :
            <></>
          }
        </div>
      </div>

      <div className="tablecontainer">
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {loadingStatus
            ?
            <tbody>
                <tr>
                  <td className="table-row-status" colSpan="6">
                    <div className="loader">
                    <span className="loader-text">Fetching Groups...</span>
                      <Loader type="Oval" color="#fe7e25" loading="true" height={30} width={30} />
                    </div>
                  </td>
                </tr>
              </tbody>
            :
            <tbody {...getTableBodyProps()}>
          
            {page.map(
              (row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}
                    style={{backgroundColor : detSelected(row.cells[0].value) ? 'white' : "#e7e7e7" }}
                    onClick={() => onSelectingJobs(row.cells[0].value)}>

                    {row.cells.map(cell => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      )
                    })}
                  </tr>
                )
              })
            }
          </tbody>
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
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
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
            {[5, 10, 15].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  )
}


export default JobsBox;