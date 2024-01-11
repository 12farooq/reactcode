import React from "react";
import { Route, Switch } from "react-router-dom";
import helpers from "./aws-cognito-config";
import AccountBox from "./accountBox/accountbox.js";
import ForgotPassword from "./accountBox/ForgotPassword.js";
import Header from "./components/header";
import Home from "./webpages/home.js";
import Analysis from "./webpages/analysis.js";
import Anomalies from "./webpages/anomalies";
import Summary from "./webpages/summary";
import Stats from "./webpages/stats";
import Navbar from "./components/navbar";
import SummarySamsum from "./webpages/summary_samsum";
import SummaryTopic from "./webpages/summary_topic";
import scriptSave from "./components/scriptsavepop";
import Summarization from "./webpages/Summarization";

class IndexRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { token: undefined, loader: false };
    this.setToken = this.setToken.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  componentDidMount() {
    //helpers.logIn('pranshukapri', 'Abcd@1234', this.setToken );
    this.setState({
      token: sessionStorage.getItem("token")
        ? sessionStorage.getItem("token")
        : undefined,
    });
    sessionStorage.getItem("lawyer_names") === null
      ? sessionStorage.setItem("lawyer_names", "")
      : void 0;
    sessionStorage.getItem("stats_tids") === null
      ? sessionStorage.setItem("stats_tids", "")
      : void 0;
    sessionStorage.getItem("s_job_id") === null
      ? sessionStorage.setItem("s_job_id", "")
      : void 0;
    sessionStorage.getItem("job_id") === null
      ? sessionStorage.setItem("job_id", "")
      : void 0;
    sessionStorage.getItem("anomalies_tids") === null
      ? sessionStorage.setItem("anomalies_tids", "")
      : void 0;
    sessionStorage.getItem("summar_tids") === null
      ? sessionStorage.setItem("summar_tids", "")
      : void 0;
    this.setState({
      token: sessionStorage.getItem("token")
        ? sessionStorage.getItem("token")
        : undefined,
    });
    sessionStorage.getItem("lawyer_names") === null
      ? sessionStorage.setItem("lawyer_names", "")
      : void 0;
    sessionStorage.getItem("stats_tids") === null
      ? sessionStorage.setItem("stats_tids", "")
      : void 0;
    sessionStorage.getItem("s_job_id") === null
      ? sessionStorage.setItem("s_job_id", "")
      : void 0;
    sessionStorage.getItem("job_id") === null
      ? sessionStorage.setItem("job_id", "")
      : void 0;
    sessionStorage.getItem("anomalies_tids") === null
      ? sessionStorage.setItem("anomalies_tids", "")
      : void 0;
    sessionStorage.getItem("summar_tids") === null
      ? sessionStorage.setItem("summar_tids", "")
      : void 0;
  }

  componentDidUpdate() {
    //console.log(this.state.token);
  }

  setToken(val) {
    this.setState({ token: val, loader: false });
  }

  logIn(username, password) {
    this.setState({ ...this.state, loader: true });
    helpers.logIn(username, password, this.setToken);
  }

  logOut() {
    helpers.logOut();
  }

  render() {
    if (!this.state.token) {
      return (
        <Switch>
          <Route path="/forgotPassword" component={ForgotPassword} exact />
          <AccountBox login={this.logIn} loader={this.state.loader} />
        </Switch>
      );
    } else {
      return (
        <div>
          <Header logout={this.logOut} />
          <Navbar />
          <Switch>
            <Route path="/" component={Home} exact />
            <Route path="/analysis" component={Analysis} exact />
            <Route path="/anomalies" component={Anomalies} exact />
            {/* <Route path="/summary" component={Summary} exact />
            <Route path="/summaryTopic" component={SummaryTopic} exact />
            <Route path="/summarySamsum" component={SummarySamsum} exact /> */}
            <Route path="/Summarization" component={Summarization} exact />
            <Route path="/stats" component={Stats} exact />
            {/* <Route path="/test" component={scriptSave} exact /> */}
          </Switch>
        </div>
      );
    }
  }
}

export default IndexRouter;
