import React from 'react';
import helpers from '../aws-cognito-config';
import './SignUpPage.css';

class SignUpContainer extends React.Component {

  constructor (props) {
    super(props);
    this.state = {fname:"", lname:"", username: "", email:"", password: ""};
    this.setFname = this.setFname.bind(this);
    this.setLname = this.setLname.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setPass = this.setPass.bind(this);
    this.setUsername = this.setUsername.bind(this);
  }

  handleChange = () => {
    //console.log(this.state.fname, this.state.lname, this.state.username, this.state.email, this.state.password)
    helpers.signUp(this.state.fname, this.state.lname, this.state.username, this.state.email, this.state.password)
  }

  setFname(para) {
    this.setState({fname: para})
  }

  setLname(para) {
    this.setState({lname: para})
  }

  setEmail(para) {
    this.setState({email: para})
  }

  setPass(para) {
    this.setState({password: para})
  }

  setUsername(para) {
    this.setState({username: para})
  }

  render() {
    return (
        <section id="SignUpPage">
          <div className="header">
            <p id="text">Transcript Analysis</p>
          </div>
          <div className="content-heading">
            <h1 id="text">Sign Up</h1>
          </div>

          <div className="form">
            <div className="formitems-multiple">
              <div id="name">
                <InputField type="text" field="First Name" sample="John" set={this.setFname} />
              </div>
              <div id="name">
                <InputField type="text" field="Last Name" sample="Doe" set={this.setLname} />
              </div>
            </div>
            <div className="formitems">
              <InputField type="username" field="Username" sample="username" set={this.setUsername} />
            </div>
            <div className="formitems">
              <InputField type="email" field="E-Mail ID" sample="someone@example.com" set={this.setEmail} />
            </div>
            <div className="formitems">
              <InputField type="password" field="Password" sample="**********" set={this.setPass} />
            </div>
            <div className="formitems-button">
              <SubmitButton handleChange={this.handleChange} />
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
      <input type={props.type} className="inputfield" placeholder={props.sample} onChange={(e) => props.set(e.target.value)} />
    </label>
    
  );
}

function SubmitButton(props) {
  return (
    <button type="Submit" className="button" onClick={props.handleChange}><span id="text"> Register </span></button>
  );
}


export default SignUpContainer;
