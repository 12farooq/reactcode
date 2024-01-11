import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import helpers from "../aws-cognito-config";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
    formType: "forgotPassword",
  });

  const history = useHistory();

  useEffect(() => {
    const forgotPasswordEmail = sessionStorage.getItem("forgotPasswordEmail");

    if (forgotPasswordEmail) {
      setFormData({
        ...formData,
        email: forgotPasswordEmail,
        formType: "verifyCode",
      });
    }

    return () => {};
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPassword = (successResponse) => {
    if (successResponse) {
      if (formData.formType === "forgotPassword") {
        sessionStorage.setItem("forgotPasswordEmail", formData.email);
        setFormData({
          ...formData,
          formType: "verifyCode",
        });
      } else {
        sessionStorage.removeItem("forgotPasswordEmail");
        setFormData({
          email: "",
          code: "",
          password: "",
          confirmPassword: "",
          formType: "forgotPassword",
        });
        alert("Your password changed successfully!");
        history.push("/");
      }
    } else {
      alert("Something went wrong!");
    }
  };

  const handleClick = () => {
    if (formData.formType === "forgotPassword") {
      if (!formData.email) {
        alert("Please enter email");
      } else {
        helpers.forgotPassword(formData.email, handleForgotPassword);
      }
    } else if (formData.formType === "verifyCode") {
      if (!formData.code) {
        alert("Please enter code");
      } else if (!formData.password) {
        alert("Please enter password");
      } else if (!formData.confirmPassword) {
        alert("Please enter confirm password");
      } else if (formData.password !== formData.confirmPassword) {
        alert("passwork and confirm password must be same");
      } else {
        helpers.changePassword(formData, handleForgotPassword);
      }
    }
  };

  return (
    <section id="forgot-password-container">
      <div className="container">
        <section id="forgot-password-section">
          <div className="header">
            <p id="text">Transcript Analysis</p>
          </div>
          <div className="content-heading">
            <h1 id="text">
              {formData.formType !== "verifyCode"
                ? "Forgot Password"
                : "Change Password"}
            </h1>
          </div>
          <div className="form">
            {formData.formType === "forgotPassword" && (
              <div className="formitems">
                <label>
                  <span className="fieldlabels">Email:</span>
                  <input
                    name={"email"}
                    type={"email"}
                    className="inputfield"
                    placeholder={"Please enter email"}
                    value={formData.email}
                    onChange={(e) => handleChange(e)}
                    required
                  />
                </label>
              </div>
            )}
            {formData.formType === "verifyCode" && (
              <>
                <div className="formitems">
                  <label>
                    <span className="fieldlabels">Code:</span>
                    <input
                      name={"code"}
                      type={"text"}
                      className="inputfield"
                      placeholder={"Please enter code"}
                      value={formData.code}
                      onChange={(e) => handleChange(e)}
                      required
                    />
                  </label>
                </div>
                <div className="formitems">
                  <label>
                    <span className="fieldlabels">Password:</span>
                    <input
                      name={"password"}
                      type={"password"}
                      className="inputfield"
                      placeholder={"Please enter password"}
                      value={formData.password}
                      onChange={(e) => handleChange(e)}
                      required
                    />
                  </label>
                </div>
                <div className="formitems">
                  <label>
                    <span className="fieldlabels">Confirm Password:</span>
                    <input
                      name={"confirmPassword"}
                      type={"password"}
                      className="inputfield"
                      placeholder={"Please enter confirm password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange(e)}
                      required
                    />
                  </label>
                </div>
              </>
            )}
            <div className="formitems-button">
              <button className="button" onClick={handleClick}>
                <span id="text">
                  {formData.formType !== "verifyCode"
                    ? "Get Code"
                    : "Change Password"}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default ForgotPassword;
