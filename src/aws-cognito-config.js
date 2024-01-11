import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import config from "./config";

const axios = require('axios');
let data = JSON.stringify({
  "user_id": 20
});

let configs = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://gbr41dfod8.execute-api.us-east-1.amazonaws.com/dev/get-summary-filter',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

axios.request(configs)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


var poolData = {
  UserPoolId: config.TranscriptAnalysis.AWSCognitoConfig.UserPoolId, // Your user pool id here
  ClientId: config.TranscriptAnalysis.AWSCognitoConfig.ClientId, // Your client id here
};

var userPool = new CognitoUserPool(poolData);

const helpers = {
  signUp(fname, lname, username, email, password) {
    //console.log("here")
    // console.log(fname, lname, username, email, password)
    var attributeList = [];

    var dataFname = { Name: "given_name", Value: fname };
    var dataLname = { Name: "family_name", Value: lname };
    var dataEmail = { Name: "email", Value: email };

    var attributeFname = new CognitoUserAttribute(dataFname);
    var attributeLname = new CognitoUserAttribute(dataLname);
    var attributeEmail = new CognitoUserAttribute(dataEmail);

    attributeList.push(attributeFname);
    attributeList.push(attributeLname);
    attributeList.push(attributeEmail);

    userPool.signUp(
      username,
      password,
      attributeList,
      null,
      function (err, result) {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        //Signup in database
        var axios = require("axios");
        const data =
          "username=" +
          username +
          "&FirstName=" +
          fname +
          "&LastName=" +
          lname +
          "&ProcessType=signup&email=" +
          email;

        var config = {
          method: "get",
          url:
            "https://cuygi7j9fj.execute-api.us-east-1.amazonaws.com/dev/userloginupdate?" +
            data,
          headers: {},
        };

        axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
        //
        alert(
          "User added successfully! Please check you Email and activate your account before logging in."
        );
        window.location.reload();
      }
    );
  },

  logIn(username, password, settoken) {
    var authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    var userData = {
      Username: username,
      Pool: userPool,
    };
    var cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async function (result) {
        var idToken = result.getIdToken().getJwtToken();
        var getusername = cognitoUser.getUsername();

        console.log(result);
        // console.log(cognitoUser);
        // console.log(username)
        //login in database
        // console.log(authenticationDetails);
        //Signup in database

        var axios = require("axios");
        const datas =
          "username=" +
          getusername +
          "&FirstName=" +
          result.getIdToken().payload.given_name +
          "&LastName=" +
          result.getIdToken().payload.family_name +
          "&ProcessType=signup&email=" +
          result.getIdToken().payload.email;
        // console.log(data)
        var config = {
          method: "get",
          url:
            "https://cuygi7j9fj.execute-api.us-east-1.amazonaws.com/dev/userloginupdate?" +
            datas,
          headers: {},
        };
        await axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
        //

        // var axios = require("axios");
        const data =
          "username=" +
          username +
          "&FirstName=none&LastName=none&ProcessType=login&email=none" +
          "&refreshtoken=" +
          idToken;
        var config1 = {
          method: "get",
          url:
            "https://cuygi7j9fj.execute-api.us-east-1.amazonaws.com/dev/userloginupdate?" +
            data,
          headers: {},
        };

        await axios(config1)
          .then(function (response) {
            const res = JSON.parse(response.data["body-json"]["body"])[0];
            // console.log(['UserId']);
            const UserId = res["UserId"];
            const FirstName = res["FirstName"];
            const LastName = res["LastName"];
            sessionStorage.setItem("UserId", UserId);
            sessionStorage.setItem("FirstName", FirstName);
            sessionStorage.setItem("LastName", LastName);
          })
          .catch(function (error) {
            console.log(error);
          });
        //
        sessionStorage.setItem("username", getusername);
        sessionStorage.setItem("password", password);
        sessionStorage.setItem("token", idToken);
        settoken(idToken);
      },

      onFailure: function (err) {
        alert(err.message || JSON.stringify(err));
        settoken(undefined);
      },
    });
  },

  logOut() {
    var userData = {
      Username: sessionStorage.getItem("username"),
      Pool: userPool,
    };
    var cognitoUser = new CognitoUser(userData);

    var authenticationDetails = new AuthenticationDetails({
      Username: sessionStorage.getItem("username"),
      Password: sessionStorage.getItem("password"),
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        //console.log("Authenticated")
        cognitoUser.globalSignOut({
          onSuccess: (e) => {
            console.log(e);
          },
          onFailure: (e) => {
            console.log(e);
          },
        });
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("token");
        alert("You have been logged out from the session!");
        window.location.reload();
      },

      onFailure: function (err) {
        alert(err.message || JSON.stringify(err));
        //console.log("Error")
      },
    });
  },

  forgotPassword(email, handleForgotPassword) {
    var userData = {
      Username: email.toLowerCase(),
      Pool: userPool,
    };
    var cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: async function (result) {
        console.log("forgot password result ==> ", result);
      },
      onFailure: function (err) {
        alert(err.message || JSON.stringify(err));
      },
      inputVerificationCode: function (data) {
        console.log("inputVerificationCode ==> ", data);
        handleForgotPassword(true);
      },
    });
  },

  changePassword(formData, handleForgotPassword) {
    var userData = {
      Username: formData.email.toLowerCase(),
      Pool: userPool,
    };
    var cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(formData.code, formData.password, {
      onSuccess: async function (result) {
        console.log("change password result ==> ", result);
        handleForgotPassword(true);
      },
      onFailure: function (err) {
        alert(err.message || JSON.stringify(err));
      },
    });
  },
};

export default helpers;
