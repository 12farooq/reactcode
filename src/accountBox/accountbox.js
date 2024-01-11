import React, { useState } from "react";
import LoginContainer from "./LogInPage";
import SignUpContainer from "./SignUpPage";
import Loader from "../utils/Loader";
import "./accountbox.css";

function AccountBox(props) {
  const [state, setstate] = useState({ status: true });
  const ChangeState = () => {
    setstate({ status: 1 - state.status });
  };

  return (
    <>
      {props.loader && <Loader />}
      <section id="account-box">
        <div className="container">
          {state.status ? (
            <div>
              <LoginContainer submit={props.login} />
              {/* <div className="footer">
								<span id="text">Not a Member? </span>
								<a href="#" id="link" onClick={ChangeState}>Sign Up</a>
							</div> */}
            </div>
          ) : (
            <div>
              <SignUpContainer />
              <div className="footer">
                <span id="text">Already a Member? </span>
                <a href="#" id="link" onClick={ChangeState}>
                  Log In
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AccountBox;
