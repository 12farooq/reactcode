import React from "react";
import axios from "axios";
import "./style.css";
import Loader from "react-loader-spinner";
import Select from "react-select";
import "jspdf-autotable";
import Papa from "papaparse";

import configData from "../config";
class Anomalies extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      anomalies_data: [],
      transcripts: [],
      transcriptsGroup: [],
      loadingStatus: "loading",
    };
    this.getAnomaliesData = this.getAnomaliesData.bind(this);
    this.getAnomaliesTranscripts = this.getAnomaliesTranscripts.bind(this);
    this.getAnomaliesGroupTranscripts =
      this.getAnomaliesGroupTranscripts.bind(this);
  }

  async componentDidMount() {
    this.isComponentMounted = true;
    await this.getAnomaliesTranscripts();
    await this.getAnomaliesGroupTranscripts();
    await this.getAnomaliesData();
    // console.log(sessionStorage.getItem('anomalies_tids'), "====sessionStorage.getItem('anomalies_tids')=====")
  }

  componentWillUnmount() {
    // Used For Handling Console Error.
    this.isComponentMounted = false;
  }

  async getAnomaliesTranscripts() {
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: configData.TranscriptAnalysis.AWSApiGateway.GetAnomaliesFilter, //dev
        //data: JSON.stringify(body),
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: { summary: "contradiction" },
      }).then((response) => {
        // console.log(JSON.parse(response.data.body).transcripts);
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState({
              transcripts: JSON.parse(response.data.body).transcripts,
            });
          }
          //console.log(response.data.body)
        } else {
          console.log("Error");
        }
      });
    } catch (error) {
      //helpers.logOut()
      console.log("Error");
    }
  }

  async getAnomaliesGroupTranscripts() {
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        // url: api_url + "get-anomalies-filter",//Beta
        url: configData.TranscriptAnalysis.AWSApiGateway
          .GetAnomaliesGroupFilter, //dev
        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {},
      }).then((response) => {
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState({
              transcriptsGroup: JSON.parse(response.data.body).transcripts,
            });
          }
          //console.log(response.data.body)
        } else {
          console.log("Error");
        }
      });
    } catch (error) {
      //helpers.logOut()
      console.log("Error");
    }
  }

  async getAnomaliesData() {
    if (this.isComponentMounted) {
      this.setState({ loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: configData.TranscriptAnalysis.AWSApiGateway.GetAnomalies,
        //data: JSON.stringify(body),
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {
          t_ids: JSON.stringify(sessionStorage.getItem("anomalies_tids")),
        },
      }).then((response) => {
        // console.log(JSON.parse(response.data.body));
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                // anomalies_data : response.data//beta
                anomalies_data: JSON.parse(response.data.body), //dev
              },
              () => {
                this.setState({
                  loadingStatus: this.state.anomalies_data.length
                    ? "done"
                    : "empty",
                });
                this.sortData("cont_score");
              }
            );
          }
          // console.log(response.data)
        } else {
          console.log("Error");
        }
      });
    } catch (error) {
      //helpers.logOut()
      console.log("Error");
    }
  }

  sortData = (val) => {
    let temp = this.state.anomalies_data;
    temp.sort(function (a, b) {
      //  console.log(b.score - a.score)
      switch (val) {
        case "page_number":
          return a.page1 - b.page1;
        case "line_number":
          return a.line1 - b.line1;
        default:
          return b.score - a.score;
      }
    });
    if (this.isComponentMounted) {
      this.setState({ anomalies_data: temp });
    }
    // console.log(val)
  };
  makeid = (length) => {
    var result = "";
    var characters =
      "ABCDdfsdEFGHIJKLMNOPQRSTUVWXYZabcghjgdefghijklmnopqrstuvwxyzfdfgfdgf";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  render() {
    return (
      <section id="anomalies">
        <div className="heading"></div>

        <div className="filter-bar">
          <FilterGroup
            transcripts={this.state.transcriptsGroup}
            refreshAnomalies={this.getAnomaliesData}
          />
          <Filter
            transcripts={this.state.transcripts}
            refreshAnomalies={this.getAnomaliesData}
          />
          <GetPdf />
          <Sort sortData={this.sortData} />
        </div>

        {
          {
            loading: (
              <div className="loader">
                <span className="loader-text">Fetching Contradiction...</span>
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
              <div className="loader">
                <span className="loader-text">
                  No Anomalies in the Selected Transcript
                </span>
              </div>
            ),
            done: (
              <div className="container">
                {this.state.anomalies_data.map((rows) => (
                  <Cards
                    tname={rows.tname}
                    q1={rows.que1}
                    a1={rows.ans1}
                    p1={rows.page1}
                    l1={rows.line1}
                    q2={rows.que2}
                    a2={rows.ans2}
                    p2={rows.page2}
                    l2={rows.line2}
                    score={rows.score}
                    id={rows.id}
                    Status={rows.contradictionStatus}
                    str={this.makeid(8)}
                  />
                ))}
              </div>
            ),
          }[this.state.loadingStatus]
        }

        <div className="footer"></div>
      </section>
    );
  }
}

class Cards extends React.Component {
  async contraStatus(val, status) {
    var id = document.getElementById(val).value;
    var isContradiction;
    if (status === "yes") {
      isContradiction = 1;
    } else {
      isContradiction = 0;
    }
    // alert(id);
    var cnf;
    cnf = window.confirm(
      "If you think any of these search results are not contradiction, Please click on Ok Button"
    );
    if (cnf === true) {
      var axios = require("axios");

      var config = {
        method: "get",
        url:
          configData.TranscriptAnalysis.AWSApiGateway.UpdateContradiction +
          isContradiction +
          "&id=" +
          id,
        headers: {
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
          "Content-Type": "application/json",
        },
      };
      axios(config)
        .then(function (response) {
          // console.log(JSON.stringify(response));
          window.location.reload();
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
  render() {
    return (
      <div className="card-container">
        <div className="tname">
          <span className="card-items-title"> Transcript Name: </span>
          <span> {this.props.tname} </span>
        </div>
        <br />
        <div className="q1">
          <span className="card-items-title"> Question 1: </span>
          {this.props.q1}
        </div>
        <div className="a1">
          <span className="card-items-title"> Answer 1: </span>
          {this.props.a1}
        </div>
        <div className="page_line">
          <span className="card-items-title"> Page:Line: </span>
          {this.props.p1} : {this.props.l1}
        </div>
        <br />
        <div className="tname">
          <span className="card-items-title"> Transcript Name: </span>
          <span> {this.props.tname} </span>
        </div>
        <br />
        <div className="q2">
          <span className="card-items-title"> Question 2: </span>
          {this.props.q2}
        </div>
        <div className="a2">
          <span className="card-items-title"> Answer 2: </span>
          {this.props.a2}
        </div>
        <div className="page_line">
          <span className="card-items-title"> Page:Line: </span>
          {this.props.p2} : {this.props.l2}
        </div>
        <br />
        <div className="score">
          <span className="card-items-title"> Contradiction Score: </span>
          {(this.props.score + "").split(".")[0]}
          <span>%</span> &nbsp;&nbsp;&nbsp;&nbsp;{" "}
          <span className="contradiction-title">Is it a contradiction?</span>
          Yes{" "}
          <input
            name={this.props.str}
            checked={this.props.Status === 1 ? "checked" : void 0}
            className="contradiction-status"
            value="yes"
            onChange={() => this.contraStatus(this.props.str, "yes")}
            type="radio"
          />{" "}
          No{" "}
          <input
            checked={this.props.Status === 0 ? "checked" : void 0}
            className="contradiction-status"
            value="no"
            name={this.props.str}
            onChange={() => this.contraStatus(this.props.str, "no")}
            type="radio"
          />
          <input
            type="number"
            hidden
            value={this.props.id}
            id={this.props.str}
          />
          {/* <input className='contradiction-status' name={this.props.str} type="checkbox"/> */}
        </div>
      </div>
    );
  }
}

class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isTrancsriptsSearch: false, tnameSearchQuery: "" };
  }

  selectAllTranscripts = () => {
    sessionStorage.setItem("anomalies_tids", "");
    sessionStorage.setItem("anomaly_group", "transcipt");
    let temp = [];
    this.props.transcripts.map((row) => temp.push(row.id));
    sessionStorage.setItem("anomalies_tids", temp);
    this.props.refreshAnomalies();
  };

  removeAllTranscripts = () => {
    sessionStorage.setItem("anomalies_tids", "");
    sessionStorage.setItem("anomaly_group", "");
    this.props.refreshAnomalies();
  };

  addAnomaliesTranscripts = (val) => {
    let anomalies_tids = [];
    if (sessionStorage.getItem("anomaly_group") === "transcipt_group") {
      sessionStorage.setItem("anomalies_tids", "");
      sessionStorage.setItem("anomaly_group", "transcipt");
    }
    if (sessionStorage.getItem("anomalies_tids")) {
      let all_anomalies = sessionStorage.getItem("anomalies_tids").split(",");
      all_anomalies.forEach((t_id) => {
        if (!anomalies_tids.includes(anomalies_tids)) {
          anomalies_tids.push(t_id.toString());
        }
      });
    }
    if (val.length > 0) {
      val.forEach((t_id) => {
        if (!anomalies_tids.includes(t_id.toString())) {
          anomalies_tids.push(t_id);
        }
      });
    } else {
      anomalies_tids.push(val);
    }
    // if(sessionStorage.getItem('anomalies_tids')){
    //   anomalies_tids = sessionStorage.getItem('anomalies_tids').split(',')
    // }
    // anomalies_tids.push(val)
    sessionStorage.setItem("anomalies_tids", anomalies_tids);
    sessionStorage.setItem("anomaly_group", "transcipt");
    this.props.refreshAnomalies();
  };

  removeAnomaliesTranscripts = (val) => {
    // console.log(val)
    let anomalies_tids = sessionStorage
      .getItem("anomalies_tids")
      .split(",")
      .map((n) => parseInt(n, 10));
    sessionStorage.setItem(
      "anomalies_tids",
      anomalies_tids.filter((item) => item !== val)
    );
    this.props.refreshAnomalies();
  };

  render() {
    return (
      <div className="transcripts-filter">
        <div className="transcripts-searchbox-div">
          <input
            className="transcripts-searchbox"
            type="text"
            placeholder="Select Transcripts"
            onFocus={() => this.setState({ isTrancsriptsSearch: true })}
            onChange={(e) =>
              this.setState({ tnameSearchQuery: e.target.value })
            }
          />
          <button
            className="close-btn"
            onClick={() => this.setState({ isTrancsriptsSearch: false })}
          >
            OK
          </button>
        </div>
        {this.state.isTrancsriptsSearch ? (
          <div className="transcripts-list-div">
            <ul className="transcripts-list">
              <div className="transcript-names">
                <li
                  className="unselected-item"
                  onClick={() => this.selectAllTranscripts()}
                >
                  [Select All]
                </li>
                <li
                  className="unselected-item"
                  onClick={() => this.removeAllTranscripts()}
                >
                  [Select None]
                </li>
              </div>
              {this.props.transcripts.map((row) =>
                !this.state.tnameSearchQuery ||
                row.name
                  .toLowerCase()
                  .includes(this.state.tnameSearchQuery.toLowerCase()) ? (
                  <div className="transcript-names">
                    {sessionStorage
                      .getItem("anomalies_tids")
                      .split(",")
                      .map((n) => parseInt(n, 10))
                      .indexOf(row.id) > -1 ? (
                      <li
                        className="selected-item"
                        onClick={() => this.removeAnomaliesTranscripts(row.id)}
                      >
                        <span>✓</span> {row.name}
                      </li>
                    ) : (
                      <li
                        className="unselected-item"
                        onClick={() => this.addAnomaliesTranscripts(row.id)}
                      >
                        {row.name}
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

class FilterGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isTrancsriptsSearch: false, tnameSearchQuery: "" };
  }

  selectAllTranscripts = () => {
    sessionStorage.setItem("anomalies_tids", "");
    sessionStorage.setItem("anomaly_group", "transcipt_group");
    let temp = [];
    this.props.transcripts.map((row) => temp.push(row.id));
    sessionStorage.setItem("anomalies_tids", temp);
    this.props.refreshAnomalies();
  };

  removeAllTranscripts = () => {
    sessionStorage.setItem("anomalies_tids", "");
    sessionStorage.setItem("anomaly_group", "");
    this.props.refreshAnomalies();
  };

  addAnomaliesTranscripts = (val) => {
    let anomalies_tids = [];
    if (sessionStorage.getItem("anomaly_group") === "transcipt") {
      sessionStorage.setItem("anomalies_tids", "");
      sessionStorage.setItem("anomaly_group", "transcipt_group");
    }
    if (sessionStorage.getItem("anomalies_tids")) {
      let all_anomalies = sessionStorage.getItem("anomalies_tids").split(",");
      all_anomalies.forEach((t_id) => {
        if (!anomalies_tids.includes(anomalies_tids)) {
          anomalies_tids.push(t_id.toString());
        }
      });
    }
    if (val.length > 0) {
      val.forEach((t_id) => {
        if (!anomalies_tids.includes(t_id.toString())) {
          anomalies_tids.push(t_id);
        }
      });
    }
    sessionStorage.setItem("anomalies_tids", anomalies_tids);
    sessionStorage.setItem("anomaly_group", "transcipt_group");
    this.props.refreshAnomalies();
  };

  removeAnomaliesTranscripts = (val) => {
    // console.log(val)
    let anomalies_tids = sessionStorage
      .getItem("anomalies_tids")
      .split(",")
      .map((n) => parseInt(n, 10));
    sessionStorage.setItem(
      "anomalies_tids",
      anomalies_tids.filter((item) => item !== val)
    );
    this.props.refreshAnomalies();
  };

  render() {
    return (
      <div className="transcripts-filter">
        <div className="transcripts-searchbox-div">
          <input
            className="transcripts-searchbox"
            type="text"
            placeholder="Select Transcripts Group"
            onFocus={() => this.setState({ isTrancsriptsSearch: true })}
            onChange={(e) =>
              this.setState({ tnameSearchQuery: e.target.value })
            }
          />
          <button
            className="close-btn"
            onClick={() => this.setState({ isTrancsriptsSearch: false })}
          >
            OK
          </button>
        </div>
        {this.state.isTrancsriptsSearch ? (
          <div className="transcripts-list-div">
            <ul className="transcripts-list">
              <div className="transcript-names">
                <li
                  className="unselected-item"
                  onClick={() => this.selectAllTranscripts()}
                >
                  [Select All]
                </li>
                <li
                  className="unselected-item"
                  onClick={() => this.removeAllTranscripts()}
                >
                  [Select None]
                </li>
              </div>
              {this.props.transcripts.map((row) =>
                !this.state.tnameSearchQuery ||
                row.name
                  .toLowerCase()
                  .includes(this.state.tnameSearchQuery.toLowerCase()) ? (
                  <div className="transcript-names">
                    {sessionStorage
                      .getItem("anomalies_tids")
                      .split(",")
                      .map((n) => parseInt(n, 10))
                      .indexOf(row.id) > -1 ? (
                      <li
                        className="selected-item"
                        onClick={() => this.removeAnomaliesTranscripts(row.id)}
                      >
                        <span>✓</span> {row.name}
                      </li>
                    ) : (
                      <li
                        className="unselected-item"
                        onClick={() => this.addAnomaliesTranscripts(row.id)}
                      >
                        {row.name}
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

class GetPdf extends React.Component {
  async getPdf() {
    var axios = require("axios");
    var config = {
      method: "get",
      url:
        configData.TranscriptAnalysis.AWSApiGateway.GetAnomaliesPdfData +
        JSON.stringify(sessionStorage.getItem("anomalies_tids")),
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("token"),
        username: sessionStorage.getItem("username"),
      },
    };
    let headerNames,
      Fdata = [],
      data;
    axios(config)
      .then(function (response) {
        // console.log(JSON.parse(response.data.body));

        data = JSON.parse(response.data.body);
        headerNames = [
          "tname",
          "que1",
          "ans1",
          "que2",
          "ans2",
          "score",
          "page1",
          "line1",
          "page2",
          "line2",
          "isContradiction",
        ];
        data.forEach(myFunction);
        function myFunction(key) {
          const tmp = [
            key["tname"],
            key["que1"],
            key["ans1"],
            key["que2"],
            key["ans2"],
            key["score"],
            key["page1"],
            key["line1"],
            key["page2"],
            key["line2"],
            key["contradictionStatus"],
          ];
          Fdata.push(tmp);
        }

        // console.log(headerNames)
        // console.log(Fdata)
        const csvString = Papa.unparse({ fields: headerNames, data: Fdata });
        // console.log(csvString);
        const blob = new Blob([csvString], { type: "text/csv" });
        const a = document.createElement("a");
        a.download =
          "transcript_" + sessionStorage.getItem("anomalies_tids") + ".csv";
        a.href = window.URL.createObjectURL(blob);
        const clickEvt = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        a.dispatchEvent(clickEvt);
        a.remove();
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="transcripts-filter">
        <button
          className="btn btnexport"
          style={{ marginTop: "1px", padding: "8px" }}
          onClick={this.getPdf}
        >
          Export as CSV
        </button>
      </div>
    );
  }
}

class Sort extends React.Component {
  render() {
    const options = [
      { value: "cont_score", label: "Contradiction Score" },
      { value: "page_number", label: "Page Number" },
      { value: "line_number", label: "Line Number" },
    ];

    return (
      <div className="sort">
        <span>Sort By:</span>
        <Select
          options={options}
          onChange={(e) => this.props.sortData(e.value)}
          width="20px"
          defaultValue={{ value: "cont_score", label: "Contradiction Score" }}
        />
      </div>
    );
  }
}

export default Anomalies;
