import React from "react";
import { Link } from "react-router-dom";
import "./LogInPage.css";

class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: "" };
    this.setPass = this.setPass.bind(this);
    this.setUsername = this.setUsername.bind(this);
  }

  handleChange = () => {
    this.props.submit(this.state.username, this.state.password);
  };

  setPass(para) {
    this.setState({ password: para });
  }

  setUsername(para) {
    this.setState({ username: para });
  }

  render() {
    return (
      <section id="LogInPage">
        <div className="header">
          <p id="text">Transcript Analysis</p>
        </div>
        <div className="content-heading">
          <h1 id="text">Log In</h1>
        </div>

        <div className="form">
          <div className="formitems">
            <InputField
              type="input"
              field="Username"
              sample="username"
              set={this.setUsername}
            />
          </div>
          <div className="formitems">
            <InputField
              type="password"
              field="Password"
              sample="**********"
              set={this.setPass}
            />
          </div>
          <div className="formitems-button">
            <SubmitButton handleChange={this.handleChange} />
          </div>
          <div className="formitems forgot-password-container">
            <CheckBox />
            <Link to="/forgotPassword">
              <span className="main-row">Forgot Password</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }
}

function InputField(props) {
  return (
    <label>
      <span className="fieldlabels"> {props.field}: </span>
      <input
        type={props.type}
        className="inputfield"
        placeholder={props.sample}
        onChange={(e) => props.set(e.target.value)}
      />
    </label>
  );
}

function SubmitButton(props) {
  return (
    <button type="Submit" className="button" onClick={props.handleChange}>
      <span id="text"> Log In </span>
    </button>
  );
}

function CheckBox() {
  return (
    <label>
      <input type="checkbox" defaultChecked="true" />
      <span id="checkbox-text"> Remember Me</span>
    </label>
  );
}

export default LoginContainer;
