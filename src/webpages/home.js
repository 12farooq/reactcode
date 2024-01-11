import React from "react";
import TranscriptsTable from "../components/transcriptstable";
import UploadBox from "../components/uploadbox.js";
import JobsBox from "../components/jobspage";
import CreateGroupBox from "../components/creategroupbox";
import UpdateDeponentBox from "../components/updatedeponentbox";
import "./style.css";

class Home extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      updatedGroupList: [],
      isJobsPageOpen: false,
      isUpdateDialogueOpen: false,
      isUploadBoxOpen: false,
      isCreateGroupOpen: false,
      isUpdateDeponentOpen: false,
      updateDeponentTranscripts: null,
      createGroupTranscripts: [],
    };
    this.toggleJobPage = this.toggleJobPage.bind(this);
    this.toggleUploadBox = this.toggleUploadBox.bind(this);
    this.toggleCreateGroup = this.toggleCreateGroup.bind(this);
    this.toggleUpdateDeponent = this.toggleUpdateDeponent.bind(this);
  }

  updateGroupData(event) {
    if (this.isComponentMounted) {
      this.setState({ updatedGroupList: event });
      this.setState({ isJobsPageOpen: false });
    }
  }

  componentDidMount() {
    this.isComponentMounted = true;

    this.setState({
      isJobsPageOpen: false,
      isUploadBoxOpen: false,
      isCreateGroupOpen: false,
      isCreateAnomaliesGroupOpen: false,
      isUpdateDeponentOpen: false,
    });
  }

  componentWillUnmount() {
    // Used For Handling Console Error.
    this.isComponentMounted = false;
    this.setState = (state, callback) => {
      return;
    };
  }

  toggleJobPage(input) {
    if (this.isComponentMounted) {
      this.setState({ isJobsPageOpen: input });
    }
  }

  toggleUploadBox(input) {
    if (this.isComponentMounted) {
      this.setState({ isUploadBoxOpen: input });
    }
  }

  toggleCreateGroup(input, val) {
    if (this.isComponentMounted) {
      this.setState(
        {
          createGroupTranscripts: val,
        },
        () => this.setState({ isCreateGroupOpen: input })
      );
    }
  }

  toggleUpdateDeponent(input, val) {
    if (this.isComponentMounted) {
      this.setState(
        {
          updateDeponentTranscripts: val,
        },
        () => this.setState({ isUpdateDeponentOpen: input })
      );
    }
  }

  render() {
    return (
      <section id="home">
        <div className="heading"></div>
        <center>
          {this.state.updatedGroupList.length !== 0 && (
            <>
              <b>Updating Job Id/Name:</b> {this.state.updatedGroupList.job_id}{" "}
              / {this.state.updatedGroupList.job_name}
              <br />
              <button
                className="primary-btn"
                onClick={() => {
                  this.setState({ updatedGroupList: [] });
                }}
              >
                Reset
              </button>
            </>
          )}
        </center>
        <TranscriptsTable
          toggleJobPage={this.toggleJobPage}
          toggleUploadBox={this.toggleUploadBox}
          toggleCreateGroup={this.toggleCreateGroup}
          toggleUpdateDeponent={this.toggleUpdateDeponent}
          updatedGroupList={this.state.updatedGroupList}
        />

        {this.state.isUploadBoxOpen ? (
          <div className="popup-container">
            <div className="align-container">
              <span
                className="closebtn-upload"
                onClick={() => this.toggleUploadBox(false)}
              >
                X
              </span>
              <div className="upload-box">
                <UploadBox />
              </div>
            </div>
          </div>
        ) : (
          <> </>
        )}

        {this.state.isJobsPageOpen ? (
          <div className="popup-container">
            <div className="align-container">
              <span
                className="closebtn-jobs"
                onClick={() => this.toggleJobPage(false)}
              >
                X
              </span>
              <div className="jobs-box">
                <JobsBox
                  updateValueCallback={(cellData) => {
                    this.updateGroupData(cellData);
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <> </>
        )}

        {this.state.isCreateGroupOpen ? (
          <div className="popup-container">
            <div className="align-container">
              <span
                className="closebtn-upload"
                onClick={() => this.toggleCreateGroup(false, [])}
              >
                X
              </span>
              <div className="create-grp-box">
                <CreateGroupBox
                  selectedTranscripts={this.state.createGroupTranscripts}
                />
              </div>
            </div>
          </div>
        ) : (
          <> </>
        )}

        {/* {this.state.isUpdateDeponentOpen ? (
          <div className="popup-container">
            <div className="align-container">
              <span
                className="closebtn-upload"
                onClick={() => this.toggleUpdateDeponent(false, null)}
              >
                X
              </span>
              <div className="create-grp-box">
                <UpdateDeponentBox
                  selectedTranscripts={this.state.createGroupTranscripts}
                />
              </div>
            </div>
          </div>
        ) : (
          <> </>
        )} */}

        {this.state.isUpdateDeponentOpen ? (
          <div className="popup-container deponent-main-container">
            <div className={"deponent-popup"}>
              <span
                className="closebtn-upload custom-close"
                onClick={() => this.toggleUpdateDeponent(false, null)}
              >
                X
              </span>
              <UpdateDeponentBox
                selectedTranscripts={this.state.updateDeponentTranscripts}
              />
            </div>
          </div>
        ) : (
          <> </>
        )}

        <div className="footer"></div>
      </section>
    );
  }
}

export default Home;
