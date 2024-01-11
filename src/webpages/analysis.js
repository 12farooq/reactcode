import React from "react";
import axios from "axios";
import { selectedFlatRows } from "react-table";
import AnalyseAllTable from "../components/analysealltable";
import BubbleView from "../components/bubbleview";
import "./style.css";
import config from "../config";

class Analysis extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      table_data: [],
      job_id: sessionStorage.getItem("job_id"),
      checkSearchResults: false,
      loadingStatus: "loading",
      filter_data: { groups: [], transcripts: [] },
    };
    this.changeGroup = this.changeGroup.bind(this);
    this.querySearch = this.querySearch.bind(this);
    this.topicwiseResults = this.topicwiseResults.bind(this);
    this.subtopicwiseResults = this.subtopicwiseResults.bind(this);
    this.subtopicwiseResults3 = this.subtopicwiseResults3.bind(this);
    this.subtopicwiseResults4 = this.subtopicwiseResults4.bind(this);
    this.subtopicwiseResults5 = this.subtopicwiseResults5.bind(this);
    this.setAnalysisTableData = this.setAnalysisTableData.bind(this);
    this.ParentTopic = this.ParentTopic.bind(this);
    this.getFilterData = this.getFilterData.bind(this);
  }

  async componentDidMount() {
    this.isComponentMounted = true;
    await this.getFilterData();
    this.setAnalysisTableData();
  }

  componentWillUnmount() {
    // Used For Handling Console Error.
    this.isComponentMounted = false;
    //console.log("unounted")
    //window.location.reload()
    this.setState({ checkForResults: false });
  }

  changeGroup(id, val) {
    sessionStorage.setItem("job_id", id);
    sessionStorage.setItem("deponentName", val);
    this.setState(
      {
        job_id: id,
      },
      () => this.setAnalysisTableData()
    );
  }

  async getFilterData() {
    try {
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.GetAnalysisFilterUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
      }).then((response) => {
        if (response.status === 200) {
          this.setState({
            filter_data: JSON.parse(response.data.body),
          });
        } else {
          console.log("Error");
        }
      });
    } catch (error) {
      console.log("Error");
    }
  }

  async ParentTopic() {
    if (this.isComponentMounted) {
      this.setState({ checkSearchResults: false, loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.GetAnalysisUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: { job_id: this.state.job_id },
      }).then((response) => {
        // console.log(JSON.parse(response.data.body));
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                table_data: JSON.parse(response.data.body),
              },
              () =>
                this.setState({
                  loadingStatus: this.state.table_data.length
                    ? "done"
                    : "empty",
                })
            );
          }
          // console.log(response.data.body)
        } else {
          console.log("Error");
          this.setState({ loadingStatus: "empty" });
        }
      });
    } catch (error) {
      console.log("Error");
      this.setState({ loadingStatus: "empty" });
    }
  }

  async setAnalysisTableData() {
    if (this.isComponentMounted) {
      this.setState({ checkSearchResults: false, loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.GetAnalysisUrl,
        // url: "https://gbr41dfod8.execute-api.us-east-1.amazonaws.com/dev/" + "get-analysis",
        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: { job_id: this.state.job_id },
      }).then((response) => {
        // console.log(JSON.parse(response.data.body));
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                table_data: JSON.parse(response.data.body),
              },
              () =>
                this.setState({
                  loadingStatus: this.state.table_data.length
                    ? "done"
                    : "empty",
                })
            );
          }
          // console.log(response.data.body)
        } else {
          console.log("Error");
          this.setState({ loadingStatus: "empty" });
        }
      });
    } catch (error) {
      console.log("Error");
      this.setState({ loadingStatus: "empty" });
    }
  }
  querySearch(query, model) {
    let path = "";

    if (sessionStorage.getItem("level1") != null) {
      path += sessionStorage.getItem("level1") + "/";
    }
    if (sessionStorage.getItem("level2") != null) {
      path += sessionStorage.getItem("level2") + "/";
    }
    if (sessionStorage.getItem("level3") != null) {
      path += sessionStorage.getItem("level3") + "/";
    }
    if (sessionStorage.getItem("level4") != null) {
      path += sessionStorage.getItem("level4") + "/";
    }
    if (sessionStorage.getItem("level5") != null) {
      path += sessionStorage.getItem("level5") + "/";
    }

    console.log(path);

    if (this.isComponentMounted) {
      this.setState({ table_data: [], loadingStatus: "loading" });
    }
    try {
      axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.InitiateSearch,
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {
          job_id: this.state.job_id,
          q: query,
          model: model,
          path: path,
        },
      }).then((response) => {
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState({ checkSearchResults: true }, () =>
              this.checkForResults(query, model)
            );
          }
        } else if (response.status === 208) {
          if (this.isComponentMounted) {
            this.setState({ checkSearchResults: true }, () =>
              this.checkForResults(query, model)
            );
          }
        } else {
          console.log("Error");
        }
      });
    } catch (error) {
      console.log("Error");
    }
  }

  checkForResults(query, model) {
    if (this.state.checkSearchResults) {
      console.log("here", this.state.checkSearchResults);
      axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.GetResults,
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: { job_id: this.state.job_id, q: query, model: model },
      })
        .then((response) => {
          console.log(JSON.parse(response.data.body));
          if (JSON.parse(response.data.body).done === 1) {
            // server done, deliver data to script to consume
            if (this.isComponentMounted) {
              this.setState(
                {
                  // table_data: response.data.result,// beta
                  table_data: JSON.parse(response.data.body).result, // dev
                  checkSearchResults: false,
                },
                () =>
                  this.setState({
                    loadingStatus: this.state.table_data.length
                      ? "done"
                      : "empty",
                  })
              );
            }
          } else {
            // server not done yet
            setTimeout(() => this.checkForResults(query, model), 2000);
          }
        })
        .catch((error) => {
          console.log("Error", error);
          this.setState({ loadingStatus: "empty" });
        });
    }
  }

  async topicwiseResults(topic) {
    //console.log(topic)
    // alert(topic)
    if (sessionStorage.getItem("level2") != null) {
      sessionStorage.removeItem("level2");
    }
    if (sessionStorage.getItem("level3") != null) {
      sessionStorage.removeItem("level3");
    }
    if (sessionStorage.getItem("level4") != null) {
      sessionStorage.removeItem("level4");
    }
    if (sessionStorage.getItem("level5") != null) {
      sessionStorage.removeItem("level5");
    }
    if (this.isComponentMounted) {
      this.setState({ checkSearchResults: false, loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.GetTopicwiseQuestions,
        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: { job_id: this.state.job_id, topic: topic },
      }).then((response) => {
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                table_data: JSON.parse(response.data.body),
              },
              () =>
                this.setState({
                  loadingStatus: this.state.table_data.length
                    ? "done"
                    : "empty",
                })
            );
          }
          //console.log(response.data.body)
        } else {
          console.log("Error");
          this.setState({ loadingStatus: "empty" });
        }
      });
    } catch (error) {
      console.log("Error");
      this.setState({ loadingStatus: "empty" });
    }
  }

  async subtopicwiseResults(topic, subtopic) {
    if (sessionStorage.getItem("level3") != null) {
      sessionStorage.removeItem("level3");
    }
    if (sessionStorage.getItem("level4") != null) {
      sessionStorage.removeItem("level4");
    }
    if (sessionStorage.getItem("level5") != null) {
      sessionStorage.removeItem("level5");
    }
    // console.log(topic)
    if (this.isComponentMounted) {
      this.setState({ checkSearchResults: false, loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.GetTopicwiseQuestions, //Dev Version
        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {
          job_id: this.state.job_id,
          topic: topic ? topic : "",
          subtopic: subtopic ? subtopic : "",
        },
      }).then((response) => {
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                table_data: JSON.parse(response.data.body),
              },
              () =>
                this.setState({
                  loadingStatus: this.state.table_data.length
                    ? "done"
                    : "empty",
                })
            );
          }
          //console.log(response.data.body)
        } else {
          console.log("Error");
          this.setState({ loadingStatus: "empty" });
        }
      });
    } catch (error) {
      console.log("Error");
      this.setState({ loadingStatus: "empty" });
    }
  }

  async subtopicwiseResults3(topic, subtopic, subtopicl3) {
    // console.log(topic)

    if (sessionStorage.getItem("level4") != null) {
      sessionStorage.removeItem("level4");
    }
    if (sessionStorage.getItem("level5") != null) {
      sessionStorage.removeItem("level5");
    }
    if (this.isComponentMounted) {
      this.setState({ checkSearchResults: false, loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.Level3Questions, //Dev Version

        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {
          job_id: this.state.job_id,
          topic: subtopic ? subtopic : "",
          subtopic: topic ? topic : "",
          subtopic_3: subtopicl3 ? subtopicl3 : "",
        },
      }).then((response) => {
        console.log(JSON.parse(response.data.body));
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                table_data: JSON.parse(response.data.body),
              },
              () =>
                this.setState({
                  loadingStatus: this.state.table_data.length
                    ? "done"
                    : "empty",
                })
            );
          }
          //console.log(response.data.body)
        } else {
          console.log("Error");
          this.setState({ loadingStatus: "empty" });
        }
      });
    } catch (error) {
      console.log("Error");
      this.setState({ loadingStatus: "empty" });
    }
  }

  async subtopicwiseResults4(topic, subtopic, subtopicl3, subtopicl4) {
    // console.log(topic)
    if (sessionStorage.getItem("level5") != null) {
      sessionStorage.removeItem("level5");
    }
    if (this.isComponentMounted) {
      this.setState({ checkSearchResults: false, loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.Level4Questions, //Dev Version

        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {
          job_id: this.state.job_id,
          topic: subtopicl3 ? subtopicl3 : "",
          subtopic: subtopic ? subtopic : "",
          subtopic_3: topic ? topic : "",
          subtopic_4: subtopicl4 ? subtopicl4 : "",
        },
      }).then((response) => {
        console.log(JSON.parse(response.data.body));
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                table_data: JSON.parse(response.data.body),
              },
              () =>
                this.setState({
                  loadingStatus: this.state.table_data.length
                    ? "done"
                    : "empty",
                })
            );
          }
          //console.log(response.data.body)
        } else {
          console.log("Error");
          this.setState({ loadingStatus: "empty" });
        }
      });
    } catch (error) {
      console.log("Error");
      this.setState({ loadingStatus: "empty" });
    }
  }

  async subtopicwiseResults5(
    topic,
    subtopic,
    subtopicl3,
    subtopicl4,
    subtopicl5
  ) {
    // console.log(topic)
    if (this.isComponentMounted) {
      this.setState({ checkSearchResults: false, loadingStatus: "loading" });
    }
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: config.TranscriptAnalysis.AWSApiGateway.Level5Questions, //Dev Version

        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {
          job_id: this.state.job_id,
          topic: subtopic ? subtopic : "",
          subtopic: topic ? topic : "",
          subtopic_3: subtopicl3 ? subtopicl3 : "",
          subtopic_4: subtopicl4 ? subtopicl4 : "",
          subtopic_5: subtopicl5 ? subtopicl5 : "",
        },
      }).then((response) => {
        console.log(JSON.parse(response.data.body));
        if (response.status === 200) {
          if (this.isComponentMounted) {
            this.setState(
              {
                table_data: JSON.parse(response.data.body),
              },
              () =>
                this.setState({
                  loadingStatus: this.state.table_data.length
                    ? "done"
                    : "empty",
                })
            );
          }
          //console.log(response.data.body)
        } else {
          console.log("Error");
          this.setState({ loadingStatus: "empty" });
        }
      });
    } catch (error) {
      console.log("Error");
      this.setState({ loadingStatus: "empty" });
    }
  }

  render() {
    return (
      <section id="analyse">
        <div className="filter-bar">
          <GlobalFilter
            changeGroup={this.changeGroup}
            groups={this.state.filter_data.groups}
            transcripts={this.state.filter_data.transcripts}
          />
        </div>
        <div className="bubble-view-window">
          <BubbleView
            job_id={this.state.job_id}
            passTopic={this.topicwiseResults}
            passSubTopic={this.subtopicwiseResults}
            passSubTopic3={this.subtopicwiseResults3}
            passSubTopic4={this.subtopicwiseResults4}
            passSubTopic5={this.subtopicwiseResults5}
            passParentTopic={this.ParentTopic}
          />
        </div>

        <AnalyseAllTable
          table_data_list={this.state.table_data}
          gotoAnalysisHome={this.setAnalysisTableData}
          search={this.querySearch}
          loadingStatus={this.state.loadingStatus}
        />

        <div className="footer"></div>
      </section>
    );
  }
}

class GlobalFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isGroupsSearch: false,
      istnameSearch: false,
      groupSearchQuery: "",
      tnameSearchQuery: "",
    };
  }

  render() {
    return (
      <div className="analyse-filter">
        <div className="groups-filter">
          <div className="groups-searchbox-div">
            <input
              className="groups-searchbox"
              type="text"
              placeholder="Select Group"
              onFocus={() => this.setState({ isGroupsSearch: true })}
              onChange={(e) =>
                this.setState({ groupSearchQuery: e.target.value })
              }
            />
            <button
              className="close-btn"
              onClick={() => this.setState({ isGroupsSearch: false })}
            >
              OK
            </button>
          </div>
          {this.state.isGroupsSearch ? (
            <div className="groups-list-div">
              <ul className="groups-list">
                {this.props.groups.map((row) =>
                  !this.state.groupSearchQuery ||
                  row.name
                    .toLowerCase()
                    .includes(this.state.groupSearchQuery.toLowerCase()) ? (
                    <div className="groups">
                      {parseInt(sessionStorage.getItem("job_id"), 10) ===
                      row.id ? (
                        <li
                          className="selected-item"
                          onClick={() =>
                            this.props.changeGroup(row.id, row.name)
                          }
                        >
                          <span>✓</span> {row.name}
                        </li>
                      ) : (
                        <li
                          className="unselected-item"
                          onClick={() =>
                            this.props.changeGroup(row.id, row.name)
                          }
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

        <div className="transcript-filter">
          <div className="transcript-searchbox-div">
            <input
              className="transcript-searchbox"
              type="text"
              placeholder="Select Transcript"
              onFocus={() => this.setState({ istnameSearch: true })}
              onChange={(e) =>
                this.setState({ tnameSearchQuery: e.target.value })
              }
            />
            <button
              className="close-btn"
              onClick={() => this.setState({ istnameSearch: false })}
            >
              OK
            </button>
          </div>
          {this.state.istnameSearch ? (
            <div className="transcript-list-div">
              <ul className="transcript-list">
                {this.props.transcripts.map((row) =>
                  !this.state.tnameSearchQuery ||
                  row.name
                    .toLowerCase()
                    .includes(this.state.tnameSearchQuery.toLowerCase()) ? (
                    <div className="transcript">
                      {parseInt(sessionStorage.getItem("job_id"), 10) ===
                      row.id ? (
                        <li
                          className="selected-item"
                          onClick={() =>
                            this.props.changeGroup(row.id, row.name)
                          }
                        >
                          <span>✓</span> {row.name}
                        </li>
                      ) : (
                        <li
                          className="unselected-item"
                          onClick={() =>
                            this.props.changeGroup(row.id, row.name)
                          }
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
      </div>
    );
  }
}

export default Analysis;
