import React from "react";
import { Bar } from "react-chartjs-2";
import Loader from "react-loader-spinner";
import Select from "react-select";
import axios from "axios";
import "./style.css";
import configData from "../config";

class Stats extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      stats_data: [],
      groups: [],
      filter_data: [],
      lawyer_names: [],
      transcripts: sessionStorage.getItem("stats_tids"),
      loading: true,
      loadingStatus: "loading",
      showWhichChart: "all",
      number_of_que: [],
      average_words: [],
      objection_ratio: [],
      strike_ratio: [],
    };
    this.getStatsData = this.getStatsData.bind(this);
    this.getFilterOptions = this.getFilterOptions.bind(this);
  }

  async componentDidMount() {
    this.isComponentMounted = true;

    await this.getAllGroups();
    await this.getFilterOptions();
    await this.getStatsData();
  }

  componentWillUnmount() {
    // Used For Handling Console Error.

    this.isComponentMounted = false;
    this.setState = (state, callback) => {
      return;
    };
  }

  async getAllGroups() {
    if (this.isComponentMounted) {
      await axios({
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        url: configData.TranscriptAnalysis.AWSApiGateway.GetClusteringJobsList,
      })
        .then((response) => {
          this.setState({ groups: response.data.body });
        })
        .catch((error) => {
          console.log("Error", error);
        });
    }
  }

  async getFilterOptions() {
    console.log("getFilterOptions called....  ==> ");
    this.setState({ loadingStatus: "loading" });
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: "GET",
        url: configData.TranscriptAnalysis.AWSApiGateway.GetStatsFilterDataDev,
        //data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
        },
        params: {
          stats_job_id: sessionStorage.getItem("stats_job_id"),
          t_ids: JSON.stringify(sessionStorage.getItem("stats_tids")),
        },
      }).then((response) => {
        // console.log(response);
        if (response.status === 200) {
          this.setState(
            {
              filter_data: JSON.parse(response.data.body).transcripts,
              lawyer_names: JSON.parse(response.data.body).lawyer_names,
            },
            () => this.setState({ loadingStatus: "done" })
          );
          //console.log(this.state.stats_data)
        } else {
          console.log("Error");
        }
      });
    } catch (error) {
      //helpers.logOut()
      console.log("Error");
    }
  }

  async getStatsData() {
    this.setState({ loadingStatus: "loading" });
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      if (this.isComponentMounted) {
        await axios({
          method: "GET",
          url: configData.TranscriptAnalysis.AWSApiGateway.GetStatsDev,
          //data: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            Authorization: sessionStorage.getItem("token"),
            username: sessionStorage.getItem("username"),
          },
          params: {
            t_ids: JSON.stringify(sessionStorage.getItem("stats_tids")),
            lawyer_names: JSON.stringify(
              sessionStorage.getItem("lawyer_names")
            ),
          },
        }).then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.setState(
              {
                stats_data: JSON.parse(response.data.body),
              },
              () => this.setChartData()
            );
            //console.log(this.state.stats_data)
          } else {
            console.log("Error");
          }
        });
      }
    } catch (error) {
      //helpers.logOut()
      console.log("Error");
    }
  }

  setChartData = () => {
    let num_que = [];
    let avg_words = [];
    let obj_ratio = [];
    let str_ratio = [];
    let num_que_list = [];
    let avg_words_list = [];
    let obj_ratio_list = [];
    let str_ratio_list = [];

    this.state.stats_data.map(
      (rows) => (
        (num_que_list = []),
        (avg_words_list = []),
        (obj_ratio_list = []),
        (str_ratio_list = []),
        rows.data.map(
          (fields) => (
            num_que_list.push([fields.lawyer_name, fields.num_que]),
            avg_words_list.push([fields.lawyer_name, fields.avg_words]),
            obj_ratio_list.push([fields.lawyer_name, fields.obj_ratio]),
            str_ratio_list.push([fields.lawyer_name, fields.strike_ratio])
          )
        ),
        num_que.push({ tname: rows.tname, data: num_que_list }),
        avg_words.push({ tname: rows.tname, data: avg_words_list }),
        obj_ratio.push({ tname: rows.tname, data: obj_ratio_list }),
        str_ratio.push({ tname: rows.tname, data: str_ratio_list })
      )
    );

    //console.log(temp)
    //console.log(num_que)
    this.setState(
      {
        number_of_que: num_que,
        average_words: avg_words,
        objection_ratio: obj_ratio,
        strike_ratio: str_ratio,
      },
      () => this.setState({ loadingStatus: "done" })
    );
  };

  changeChartDisplay = (val) => {
    this.setState({ showWhichChart: val });
  };

  render() {
    const options = [
      { value: "all", label: "All" },
      { value: "chart1", label: "Number of Questions" },
      { value: "chart2", label: "Average Questions" },
      { value: "chart3", label: "Objection Ratio" },
      { value: "chart4", label: "Strike Ratio" },
    ];

    return (
      <section id="stats">
        <div className="heading"></div>

        <div className="main-window">
          <GlobalFilter
            groups={this.state.groups}
            transcripts={this.state.filter_data}
            lawyers={this.state.lawyer_names}
            updateStats={this.getStatsData}
            updateLawyerNames={this.getFilterOptions}
          />

          <div className="select-chart-div">
            <Select
              value={options.map((row) =>
                row.value === this.state.showWhichChart ? row : null
              )}
              onChange={(e) => this.changeChartDisplay(e.value)}
              options={options}
              placeholder="Select Chart to Display"
            />
          </div>

          {
            {
              all: (
                <div className="stat-charts-container">
                  <Charts
                    label="Number of Questions"
                    data={this.state.number_of_que}
                    lawyers={this.state.lawyer_names}
                    onClick={() => this.changeChartDisplay("chart1")}
                    display="all"
                    loadingStatus={this.state.loadingStatus}
                  />
                  <Charts
                    label="Average Words"
                    data={this.state.average_words}
                    lawyers={this.state.lawyer_names}
                    onClick={() => this.changeChartDisplay("chart2")}
                    display="all"
                    loadingStatus={this.state.loadingStatus}
                  />
                  <Charts
                    label="Objection Ratio (%)"
                    data={this.state.objection_ratio}
                    lawyers={this.state.lawyer_names}
                    onClick={() => this.changeChartDisplay("chart3")}
                    display="all"
                    loadingStatus={this.state.loadingStatus}
                  />
                  <Charts
                    label="Strike Ratio (%)"
                    data={this.state.strike_ratio}
                    lawyers={this.state.lawyer_names}
                    onClick={() => this.changeChartDisplay("chart4")}
                    display="all"
                    loadingStatus={this.state.loadingStatus}
                  />
                </div>
              ),

              chart1: (
                <div className="stat-charts-container">
                  <Charts
                    label="Number of Questions"
                    data={this.state.number_of_que}
                    lawyers={this.state.lawyer_names}
                    display="single"
                    loadingStatus={this.state.loadingStatus}
                  />
                </div>
              ),

              chart2: (
                <div className="stat-charts-container-single">
                  <Charts
                    label="Average Words"
                    data={this.state.average_words}
                    lawyers={this.state.lawyer_names}
                    display="single"
                    loadingStatus={this.state.loadingStatus}
                  />
                </div>
              ),

              chart3: (
                <div className="stat-charts-container-single">
                  <Charts
                    label="Objection Ratio (%)"
                    data={this.state.objection_ratio}
                    lawyers={this.state.lawyer_names}
                    display="single"
                    loadingStatus={this.state.loadingStatus}
                  />
                </div>
              ),

              chart4: (
                <div className="stat-charts-container-single">
                  <Charts
                    label="Strike Ratio (%)"
                    data={this.state.strike_ratio}
                    lawyers={this.state.lawyer_names}
                    display="single"
                    loadingStatus={this.state.loadingStatus}
                  />
                </div>
              ),
            }[this.state.showWhichChart]
          }
        </div>

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
      isTrancsriptsSearch: false,
      isLawyersList: false,
      groupSearchQuery: "",
      tnameSearchQuery: "",
      lawyerSearchQuery: "",
    };
    this.changeGroup = this.changeGroup.bind(this);
    this.addStatsTranscripts = this.addStatsTranscripts.bind(this);
    this.removeStatsTranscripts = this.removeStatsTranscripts.bind(this);
    this.addLawyerNames = this.addLawyerNames.bind(this);
    this.removeLawyerNames = this.removeLawyerNames.bind(this);
  }

  async changeGroup(val) {
    console.log("val ==> ", val);
    parseInt(sessionStorage.getItem("stats_job_id"), 10) === val
      ? sessionStorage.setItem("stats_job_id", "")
      : sessionStorage.setItem("stats_job_id", val);
    sessionStorage.setItem("stats_tids", "");
    sessionStorage.setItem("lawyer_names", "");
    await this.props.updateLawyerNames();

    this.selectAllTranscripts();
    await this.props.updateStats();
    this.selectAllLawyers();
  }

  async addStatsTranscripts(val) {
    let tids = [];
    if (sessionStorage.getItem("stats_tids")) {
      tids = sessionStorage
        .getItem("stats_tids")
        .split(",")
        .map((n) => parseInt(n, 10));
    }
    tids.push(val);
    sessionStorage.setItem("stats_tids", tids);
    await this.props.updateLawyerNames();
    await this.props.updateStats();
  }

  async removeStatsTranscripts(val) {
    //console.log(selectedItem.id)
    let tids = sessionStorage
      .getItem("stats_tids")
      .split(",")
      .map((n) => parseInt(n, 10));
    sessionStorage.setItem(
      "stats_tids",
      tids.filter((item) => item !== val)
    );
    await this.props.updateLawyerNames();
    await this.props.updateStats();
  }

  async selectAllTranscripts() {
    sessionStorage.setItem("stats_tids", "");
    let temp = [];
    this.props.transcripts.map((row) => temp.push(row.id));
    sessionStorage.setItem("stats_tids", temp);
    await this.props.updateLawyerNames();
    await this.props.updateStats();
  }

  async removeAllTranscripts() {
    sessionStorage.setItem("stats_tids", "");
    await this.props.updateLawyerNames();
    await this.props.updateStats();
  }

  addLawyerNames(val) {
    //console.log(sessionStorage.getItem('lawyer_names'))
    let lawyer_names = [];
    if (sessionStorage.getItem("lawyer_names")) {
      lawyer_names = sessionStorage.getItem("lawyer_names").split(",");
    }
    lawyer_names.push(val);
    sessionStorage.setItem("lawyer_names", lawyer_names);
    this.props.updateStats();
  }

  removeLawyerNames(val) {
    //console.log(selectedItem.id)
    let lawyer_names = sessionStorage.getItem("lawyer_names").split(",");
    sessionStorage.setItem(
      "lawyer_names",
      lawyer_names.filter((item) => item !== val)
    );
    this.props.updateStats();
  }

  async selectAllLawyers() {
    sessionStorage.setItem("lawyer_names", "");
    let temp = [];
    this.props.lawyers.map((row) => temp.push(row));
    sessionStorage.setItem("lawyer_names", temp);
    await this.props.updateStats();
  }

  async removeAllLawyers() {
    sessionStorage.setItem("lawyer_names", "");
    await this.props.updateStats();
  }

  render() {
    console.log("GlobalFilter ==> ", this.props.groups);
    return (
      <div className="stats-filter">
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
          <p className="user-guide">Select group to get transcripts</p>
          {this.state.isGroupsSearch ? (
            <div className="groups-list-div">
              <ul className="groups-list">
                {this.props.groups.map((row) =>
                  !this.state.groupSearchQuery ||
                  row.job_name
                    .toLowerCase()
                    .includes(this.state.groupSearchQuery.toLowerCase()) ? (
                    <div className="groups">
                      {parseInt(sessionStorage.getItem("stats_job_id"), 10) ===
                      row.job_id ? (
                        <li
                          className="selected-item"
                          onClick={() => this.changeGroup(row.job_id)}
                        >
                          <span>✓</span> {row.job_name}
                        </li>
                      ) : (
                        <li
                          className="unselected-item"
                          onClick={() => this.changeGroup(row.job_id)}
                        >
                          {row.job_name}
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
          <p className="user-guide">Select transcipt to get lawyers</p>
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
                        .getItem("stats_tids")
                        .split(",")
                        .map((n) => parseInt(n, 10))
                        .indexOf(row.id) > -1 ? (
                        <li
                          className="selected-item"
                          onClick={() => this.removeStatsTranscripts(row.id)}
                        >
                          <span>✓</span> {row.name}
                        </li>
                      ) : (
                        <li
                          className="unselected-item"
                          onClick={() => this.addStatsTranscripts(row.id)}
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
        <div className="lawyer-filter">
          <div className="lawyer-searchbox-div">
            <input
              className="lawyer-searchbox"
              type="text"
              placeholder="Select Lawyers"
              onFocus={() => this.setState({ isLawyersList: true })}
              onChange={(e) =>
                this.setState({ lawyerSearchQuery: e.target.value })
              }
            />
            <button
              className="close-btn"
              onClick={() => this.setState({ isLawyersList: false })}
            >
              OK
            </button>
          </div>

          {this.state.isLawyersList ? (
            <div className="lawyers-list-div">
              <ul className="lawyers-list">
                <div className="lawyer-names">
                  <li
                    className="unselected-item"
                    onClick={() => this.selectAllLawyers()}
                  >
                    [Select All]
                  </li>
                  <li
                    className="unselected-item"
                    onClick={() => this.removeAllLawyers()}
                  >
                    [Select None]
                  </li>
                </div>

                {this.props.lawyers.map((row) =>
                  !this.state.lawyerSearchQuery ||
                  row
                    .toLowerCase()
                    .includes(this.state.lawyerSearchQuery.toLowerCase()) ? (
                    <div className="lawyer-names">
                      {sessionStorage
                        .getItem("lawyer_names")
                        .split(",")
                        .indexOf(row) > -1 ? (
                        <li
                          className="selected-item"
                          onClick={() => this.removeLawyerNames(row)}
                        >
                          <span>✓</span> {row}
                        </li>
                      ) : (
                        <li
                          className="unselected-item"
                          onClick={() => this.addLawyerNames(row)}
                        >
                          {row}
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

class Charts extends React.Component {
  getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color + "91";
  }

  render() {
    let y_data = [];
    let temp;
    let datasets = [];
    let x_data = sessionStorage.getItem("lawyer_names").split(",");

    this.props.data
      ? this.props.data.map(
          (row) => (
            (y_data = []),
            x_data.map(
              (row2) => (
                (temp = false),
                row.data.map((row3) =>
                  row3[0] === row2 ? (temp = row3[1]) : null
                ),
                y_data.push(temp ? temp : 0)
              )
            ),
            datasets.push({
              label: row.tname,
              data: y_data,
              backgroundColor: this.getRandomColor,
            })
          )
        )
      : void 0;

    let data = {
      labels: x_data,
      datasets: datasets,
    };

    let options = {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    return this.props.display === "all" ? (
      <div className="stat-charts-items">
        <div className="individual-charts" onClick={this.props.onClick}>
          <div className="pseudo-div">
            <h3 className="chart-title">{this.props.label}</h3>
            {
              {
                loading: (
                  <div className="loader">
                    <span className="loader-text">Plotting Chart...</span>
                    <Loader
                      type="Oval"
                      color="#fe7e25"
                      loading="true"
                      height={20}
                      width={20}
                    />
                  </div>
                ),
                done: this.props.data.length ? (
                  <div className="charts">
                    <Bar data={data} options={options} />
                  </div>
                ) : (
                  <span className="loader-text">Not Enough Data</span>
                ),
              }[this.props.loadingStatus]
            }
          </div>
        </div>
      </div>
    ) : (
      <div className="single-chart-sizing-div">
        <div className="single-chart-div">
          <h3 className="chart-title-single">{this.props.label}</h3>
          {
            {
              loading: (
                <div className="loader">
                  <span className="loader-text">Plotting Charts...</span>
                  <Loader
                    type="Oval"
                    color="#fe7e25"
                    loading="true"
                    height={20}
                    width={20}
                  />
                </div>
              ),
              done: this.props.data.length ? (
                <div className="chart-single">
                  <Bar data={data} options={options} />
                </div>
              ) : (
                <span className="loader-text">Not Enough Data</span>
              ),
            }[this.props.loadingStatus]
          }
        </div>
      </div>
    );
  }
}

export default Stats;
