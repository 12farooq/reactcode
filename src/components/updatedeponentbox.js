import React from "react";
import "./style.css";
import Loader from "react-loader-spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import configData from "../config";

const ref = React.createRef();
const CustomDatePicker = React.forwardRef(({ value, onClick }, ref) => (
  <input
    required
    type="text"
    className="custom-input"
    // onChange={(e) => this.setState({ depositionDate: e.target.value })}
    onClick={onClick}
    ref={ref}
    value={value}
  />
));

class UpdateDeponentBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdating: false,
      firstName: this.props.selectedTranscripts.original.FirstName || "",
      middleName: this.props.selectedTranscripts.original.MiddleName || "",
      lastName: this.props.selectedTranscripts.original.LastName || "",
      depositionDate:
        this.props.selectedTranscripts.original.DepositionDate &&
        this.props.selectedTranscripts.original.DepositionDate !== "None"
          ? new Date(this.props.selectedTranscripts.original.DepositionDate)
          : new Date(),
    };
    this.updateDeponent = this.updateDeponent.bind(this);
  }

  async updateDeponent() {
    if (this.state.firstName === "") {
      alert("Please enter first name");
    } else if (this.state.depositionDate === "") {
      alert("Please enter deponent date");
    } else {
      this.setState({ isUpdating: true });
      const payload = {
        TranscriptId: this.props.selectedTranscripts.original.id,
        FirstName: this.state.firstName,
        MiddleName: this.state.middleName,
        LastName: this.state.lastName,
        depositiondate: this.state.depositionDate,
      };

      try {
        const requestOptions = {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
            Authorization: sessionStorage.getItem("token"),
          },
        };
        await fetch(
          configData.TranscriptAnalysis.AWSApiGateway.UpdateDeponentDetails,
          requestOptions
        ).then((response) => {
          console.log("Deponent Response ==> ", response);
          if (response.status === 200) {
            this.setState({ isUpdating: false });
            alert("Deponent Details Updated Successfully!");
            window.location.reload();
          } else {
            this.setState({ isUpdating: false });
            alert("Something went wrong!");
          }
        });
      } catch (error) {
        console.log("Error ==> ", error);
      }
    }
  }

  render() {
    return (
      <>
        <div id={"deponent-container"}>
          <div className="heading">
            <h1>Update Deponent Details</h1>
          </div>
          <div className="form-container">
            <div className="input-container">
              <div className="input-item">
                <p className="label">Enter First Name:</p>
                <input
                  required
                  type="text"
                  className="custom-input"
                  onChange={(e) => this.setState({ firstName: e.target.value })}
                  value={this.state.firstName}
                />
              </div>
              <div className="input-item">
                <p className="label">Enter Middle Name:</p>
                <input
                  type="text"
                  className="custom-input"
                  onChange={(e) =>
                    this.setState({ middleName: e.target.value })
                  }
                  value={this.state.middleName}
                />
              </div>
              <div className="input-item">
                <p className="label">Enter Last Name:</p>
                <input
                  type="text"
                  className="custom-input"
                  onChange={(e) => this.setState({ lastName: e.target.value })}
                  value={this.state.lastName}
                />
              </div>
              <div className="input-item">
                <p className="label">Enter Deponent Date:</p>
                <DatePicker
                  selected={this.state.depositionDate}
                  onChange={(date) =>
                    this.setState({
                      ...this.state,
                      depositionDate: date,
                    })
                  }
                  dateFormat={"yyyy-MM-dd"}
                  customInput={<CustomDatePicker ref={ref} />}
                  value={this.state.depositionDate}
                />
              </div>
            </div>
            <div>
              {this.state.isUpdating ? (
                <button className="update-deponent-btn-loading">
                  <Loader type="Oval" color="#ffffff" height={15} width={15} />
                </button>
              ) : (
                <button
                  className="update-deponent-btn"
                  onClick={this.updateDeponent}
                >
                  Update
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default UpdateDeponentBox;
