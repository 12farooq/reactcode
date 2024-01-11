import React from "react";
import axios from "axios";
import "./style.css";
import Loader from "react-loader-spinner";
import { AiOutlineEnter } from 'react-icons/ai';

import configData from "../config";

class Summarization extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      summaryData: {},
      transcripts: [],
      isLoading: true,
      summaryType: 'FullSummary',
      loadingStatus: "loading",
    };
    this.changeGroup = this.changeGroup.bind(this);
    this.getSummarizeData = this.getSummarizeData.bind(this);
    this.getSummarizeTranscripts = this.getSummarizeTranscripts.bind(this);
  }

  async componentDidMount() {
    this.isComponentMounted = true;
    await this.getSummarizeTranscripts();
    await this.getSummarizeData();
  }

  componentWillUnmount() {
    // Used For Handling Console Error.
    this.isComponentMounted = false;
  }

  changeSummarizeDisplay = (val) => {
    this.setState({ showSummarize: val });
  };

  async getSummarizeTranscripts() {
    let data = JSON.stringify({
      "user_id": sessionStorage.getItem("UserId")
    })

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: configData.TranscriptAnalysis.AWSApiGateway.GetSummarizationFilterData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: data
    }

    try {
      await axios.request(config)
        .then((response) => {
          if (response.status === 200) {
            if (this.isComponentMounted) {
              this.setState({
                transcripts: response.data.body
              },
                () =>
                  this.setState({
                    loadingStatus: this.state.transcripts.length
                      ? "empty"
                      : "done",
                  })
              );
            }
            //console.log(response.data.body)
          } else {
            console.log("Error");
          }
        })
        .catch((error) => {
          console.log(error);
        })
    } catch (error) {
      console.log(error);
    }
  }

  async getSummarizeData() {
    if (this.isComponentMounted) {
      this.setState({ loadingStatus: "loading" });
    }

    let data = JSON.stringify({
      "job_id": sessionStorage.getItem("s_job_id")
    })

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: configData.TranscriptAnalysis.AWSApiGateway.GetSummary,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: data
    }

    try {
      await axios.request(config)
        .then((response) => {
          if (response.status === 200) {
            if (this.isComponentMounted) {
              this.setState({
                summaryData: response.data.body,
                isLoading: false
              },
                () =>
                  this.setState({
                    loadingStatus: this.state.summaryData.length
                      ? "empty"
                      : "done",
                  })
              )
            }
            // console.log(response.data.body)
          } else {
            console.log("Error");
          }
        })
        .catch((error) => {
          console.log(error);
        })
    } catch (error) {
      console.log(error);
    }
  }

  changeGroup(id, val) {
    sessionStorage.setItem("s_job_id", id);
    sessionStorage.setItem("Data", val);
    this.setState(
      {
        s_job_id: id,
      },
      () => this.getSummarizeData()
    );
  }

  handleDropdownChange = (event) => {
    this.setState({ summaryType: event.target.value });
  }

  render() {
    return (
      <section id="anomalies">
        <div className="heading"></div>

        <div className="filter-bar">
          <Filter
            changeGroup={this.changeGroup}
            transcripts={this.state.transcripts}
          />
        </div>

        {
          {
            loading: (
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
            ),
            empty: (
              <div className="table-row-status" colSpan="6">
                <span>No Results Fetched</span>
              </div>
            ),
            done: (
              <Cards
                summaryData={this.state.summaryData}
                summaryType={this.state.summaryType}
                handleDropdownChange={this.handleDropdownChange}
              />
            ),
          }[this.state.loadingStatus]
        }

        <div className="footer"></div>
      </section>
    );
  }
}

class Cards extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      searchResults: {},
      // timeoutId: null,
      isSearchClicked: false,
      loadingStatus: "loading"
    };
  };


  handleSearchTermChange = (event) => {
    this.setState({
      isSearchClicked: true,
    });

    const searchTerm = event.target.value;

    // Clear the previous timeout if it exists
    // clearTimeout(this.state.timeoutId);

    // Set a new timeout to fetch the data after 3 seconds
    // const timeoutId = setTimeout(() => {
    if (event.key === "Enter") {
      const axios = require('axios');
      let data = JSON.stringify({
        "job_id": sessionStorage.getItem("s_job_id"),
        "query": searchTerm
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: configData.TranscriptAnalysis.AWSApiGateway.SearchSummary,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: data
      };

      axios.request(config)
        .then((response) => {
          this.setState({
            searchResults: response.data.body,
            isSearchClicked: true,
          },
            () =>
              this.setState({
                loadingStatus: this.state.searchResults.length
                  ? "empty"
                  : "done",
              })
          )
          // console.log(response.data.body);
        })
        .catch((error) => {
          this.setState({
            isSearchClicked: false,
          })
          console.log(error);
        });
      // }, 3000);
    }

    // Update the state with the new search term and timeout ID
    this.setState({ searchTerm });
  }

  render() {

    const { searchTerm } = this.state;

    return (
      <div className="card__container">
        <div className="card">
          <div className="d-flex">

            <select
              id="select__data"
              onChange={this.props.handleDropdownChange}
              value={this.props.summaryType}
            >
              <option value="FullSummary">Full Summary</option>
              <option value="MidSummary">Medium Summary</option>
              <option value="SmallSummary">Small Summary</option>
            </select>

            <div className="search-bar">
              <div className="keyword-search-bar">
                <GlobalFilter
                  searchTerm={searchTerm}
                  handleSearchTermChange={this.handleSearchTermChange}
                  searchResults={this.state.searchResults}
                />
              </div>
            </div>
          </div>

          <br />

          {this.state.isSearchClicked &&
            <div>
              <div className="tname">
                <span className="card-items-title"> Search Results: </span>
                <span> {this.state.searchResults.SearchData} </span>
              </div>
            </div>
          }

          <br />

          <div>
            <div className="tname">
              <span className="card-items-title"> Transcript Name: </span>
              <span> {this.props.summaryData.TranscriptName} </span>
            </div>

            <br />

            <div className="tname">
              <span className="card-items-title"> {this.props.summaryType}: </span>
              <span> {this.props.summaryData[this.props.summaryType]} </span>
            </div>
          </div>

          <br />

        </div>
      </div>
    )
  }
}

class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isTranscriptsSearch: false, tNameSearchQuery: "" };
  }

  render() {
    return (
      <div className="transcripts-filter">
        <div className="transcripts-searchbox-div">
          <input
            className="transcripts-searchbox"
            type="text"
            placeholder="Select Transcripts"
            onFocus={() => this.setState({ isTranscriptsSearch: true })}
            onChange={(e) =>
              this.setState({ tNameSearchQuery: e.target.value })
            }
          />
          <button
            className="close-btn"
            onClick={() => this.setState({ isTranscriptsSearch: false })}
          >
            OK
          </button>
        </div>
        {this.state.isTranscriptsSearch ? (
          <div className="transcripts-list-div">
            <ul className="transcripts-list">
              {this.props.transcripts.map((row) =>
                !this.state.tNameSearchQuery ||
                  row.transcript
                    .toLowerCase()
                    .includes(this.state.tNameSearchQuery.toLowerCase()) ? (
                  <div className="transcript-names" key={row.job_id}>
                    {sessionStorage
                      .getItem("s_job_id")
                      .split(",")
                      .map((n) => parseInt(n, 10))
                      .indexOf(row.job_id) > -1 ? (
                      <li
                        className="selected-item"
                        onClick={() =>
                          this.props.changeGroup(row.job_id, row.transcript)
                        }
                      >
                        <span>✓</span> {row.transcript}
                      </li>
                    ) : (
                      <li
                        className="unselected-item"
                        onClick={() =>
                          this.props.changeGroup(row.job_id, row.transcript)
                        }
                      >
                        {row.transcript}
                      </li>
                    )}
                  </div>
                ) : null
              )}
            </ul>
          </div>
        ) : (
          void 0
        )}
      </div>
    );
  }
}

class GlobalFilter extends React.Component {
  render() {
    return (
      <span>
        <label className="search-label" htmlFor="search-input">
          <input
            className="searchallbox"
            type="text"
            name="query"
            value={this.props.searchTerm}
            id="search-input"
            placeholder="Search..."
            onKeyDown={this.props.handleSearchTermChange}
            onChange={this.props.handleSearchTermChange}
          />
          <p style={{
            position: "absolute",
            top: "12.4em",
            right: "6em"
          }} ><AiOutlineEnter /></p>
        </label>
      </span>
    )
  }
}

export default Summarization;