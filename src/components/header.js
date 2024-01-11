import React from "react";
import { Link } from "react-router-dom";
import "./style.css";
import logo from "../lexitas-logo.png";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.firstName = sessionStorage.getItem("FirstName");
    this.lastName = sessionStorage.getItem("LastName");
  }

  handleChange = () => {
    //console.log('here')
    this.props.logout();
  };

  DropdownState = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    return (
      <section id="header">
        <nav className="mainbar">
          <div className="logo">
            <Link to="/" className="buttons-left">
              <img src={logo} height="45px" alt="Lexitas Logo" />
            </Link>
          </div>
          <div className="heading">
            <p className="heading-text">Transcript Analysis</p>
          </div>

          <div className="user-details">
            <div className="username">
              <span onClick={this.DropdownState} className="profileName">
                {/* {sessionStorage.getItem("FirstName")}{" "}
                {sessionStorage.getItem("LastName")} */}
                {this?.firstName && this?.firstName?.charAt(0)}
                {this?.lastName && this?.lastName?.charAt(0)}
              </span>
            </div>
            {/* {this.state.isOpen ? (
              <div className="dropdown-itmes">
                <ul className="dropdown-list">
                  <li className="list-items" onClick={this.handleChange}>
                    Log Out
                  </li>
                </ul>
              </div>
            ) : (
              <></>
            )} */}
            <ul
              className="dropdown-items custom-dropdown"
              style={{ display: this.state.isOpen ? "block" : "none" }}
            >
              <li>
                <span className="customSpan default-cursor">
                  {this?.firstName || ""} {this?.lastName || ""}
                </span>
              </li>
              <li onClick={this.handleChange}>
                <span className="customSpan">Log Out</span>
              </li>
            </ul>
          </div>
        </nav>
        <div className="filler-top"></div>
      </section>
    );
  }
}

export default Header;
