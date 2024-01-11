import React from 'react'
import axios from 'axios';
import './style.css'
import Loader from 'react-loader-spinner';
import "jspdf-autotable";
import configData from "../config";

class Summary extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.state = {anomalies_data: [], transcripts: [], loadingStatus: 'loading'};
    this.getAnomaliesData = this.getAnomaliesData.bind(this);
    this.getAnomaliesTranscripts = this.getAnomaliesTranscripts.bind(this);
  }

  async componentDidMount() {
    sessionStorage.getItem('summary_tids') === null ? sessionStorage.setItem('summary_tids', '') :void 0;

    this.isComponentMounted = true;
    // if(!sessionStorage.getItem('summary_tids')){
    //   sessionStorage.setItem('summary_tids', []);  
    // }

    await this.getAnomaliesTranscripts();
    await this.getAnomaliesData();
  }

  componentWillUnmount() {
    // Used For Handling Console Error.
    this.isComponentMounted = false;
  }

  async getAnomaliesTranscripts() {
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: 'GET',
        url: configData.TranscriptAnalysis.AWSApiGateway.GetAnomaliesFilter,//dev
        //data: JSON.stringify(body),
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type" : "application/json",
          "Authorization": sessionStorage.getItem('token'),
          "username": sessionStorage.getItem('username')
        },
        params: {"summary":'flat'}
      })
      .then(
        response => {
          // console.log(JSON.parse(response.data.body).transcripts);
          if(response.status === 200) {
            if(this.isComponentMounted){this.setState({
              transcripts: JSON.parse(response.data.body).transcripts
            })}
            //console.log(response.data.body)
          }
          else {
            console.log("Error")
          }
        }
      )
    }
    catch (error) {
      //helpers.logOut()
      console.log("Error");
    }
  }

  async getAnomaliesData() {

    if(this.isComponentMounted){
      this.setState({loadingStatus: 'loading'})}
    try {
      //const body = { job_id: sessionStorage.getItem("job_id") }
      await axios({
        method: 'GET',
        url: configData.TranscriptAnalysis.AWSApiGateway.GetSummary,
        //data: JSON.stringify(body),
        headers: {
          "Content-Type" : "application/json",
          "Authorization": sessionStorage.getItem('token'),
          "username": sessionStorage.getItem('username')
        },
        params: { "t_ids": JSON.stringify(sessionStorage.getItem('summary_tids')), "topic":false, }
      })
      .then(
        response => {
          console.log(JSON.parse(response.data.body));
          if(response.status === 200) {
            
            if(this.isComponentMounted){
              this.setState({
              anomalies_data : JSON.parse(response.data.body)//dev
             
            },() => {
              this.setState({loadingStatus: this.state.anomalies_data.length ? 'done' : 'empty'});
              this.sortData("cont_score");
            })}
            // console.log(response.data)
          }
          else {
            console.log("Error")
          }
        }
      )
    }
    catch (error) {
      //helpers.logOut()
      console.log("Error");
    }
  }

  sortData = (val) => {
    let temp = this.state.anomalies_data
    temp.sort(function(a, b) {
    //  console.log(b.score - a.score)
      return b.score - a.score;
    });
    if(this.isComponentMounted){
      this.setState({anomalies_data: temp})}
    // console.log(val)
  }
  makeid=(length)=> {
    var result           = '';
    var characters       = 'ABCDdfsdEFGHIJKLMNOPQRSTUVWXYZabcghjgdefghijklmnopqrstuvwxyzfdfgfdgf';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


  render() {
    return (
      <section id="anomalies">
        <div className="heading">
          
        </div>

        <div className="filter-bar">
          {/* <FilterGroup transcripts={this.state.transcripts} refreshAnomalies={this.getAnomaliesData} /> */}
          <Filter transcripts={this.state.transcripts} refreshAnomalies={this.getAnomaliesData} />
          {/* <GetPdf />
          <Sort sortData={this.sortData} /> */}
        </div>

        {
          {
            'loading': 
              <div className="loader">
                <span className="loader-text">Fetching Summary...</span>
                <Loader type="Oval" color="#fe7e25" loading="true" height={20} width={20} />
              </div>,
            'empty':
              <div className="loader">
                <span className="loader-text">No Summary in the Selected Transcript</span>
              </div>,
            'done':
              <div className="container">
                {this.state.anomalies_data.map(rows => (
                  <Cards 
                    tname={rows.tname}
                    summary={rows.summary}
                    str={this.makeid(8)}

                  />
                ))}
              </div>
          }[this.state.loadingStatus]
        }
        
        <div className="footer">
          
        </div>
      </section>
    );
  }
}

class Cards extends React.Component {
  async contraStatus(val,status) {
    var id=document.getElementById(val).value;
    var isContradiction;
    if(status==='yes')
    {
      isContradiction=1;
    }else
    {
      isContradiction=0;
    }
    // alert(id);
    var cnf;
    cnf=window.confirm("If you think any of these search results are not contradiction, Please click on Ok Button");
    if(cnf===true)
  {
        var axios = require('axios');
        
        var config = {
          method: 'get',
          url: configData.TranscriptAnalysis.AWSApiGateway.UpdateContradiction+isContradiction+'&id='+id,
          headers: { 
            'Authorization': sessionStorage.getItem('token'), 
            'username': sessionStorage.getItem('username'), 
            'Content-Type': 'application/json'
          }
        };
        axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response));
          window.location.reload();
        })
        .catch(function (error) {
          console.log(error);
        }); 
      }
    
  }
  render() {
    return (
      <div className="card-container">
        <div className="tname">
          <span className="card-items-title"> Transcript Name: </span>
          <span> {this.props.tname} </span>
        </div>
        <br />
        <div className="q1">
          <span className="card-items-title"> Summary: </span>
          {this.props.summary}
        </div>
        
      </div>
    )
  }
}

class Filter extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = ({isTrancsriptsSearch: false, tnameSearchQuery: ''})
  }

  selectAllTranscripts = () => {
    sessionStorage.setItem('summary_tids', '')
    let temp = []
    this.props.transcripts.map(row => (
      temp.push(row.id)
    ))
    sessionStorage.setItem('summary_tids', temp)
    this.props.refreshAnomalies()
  }

  removeAllTranscripts = () => {
    sessionStorage.setItem('summary_tids', '')
    this.props.refreshAnomalies()
  }

  addAnomaliesTranscripts = (val) => {
    let summary_tids = []
    if(sessionStorage.getItem('summary_tids')){
      summary_tids = sessionStorage.getItem('summary_tids').split(',')
    }
    summary_tids.push(val)
    sessionStorage.setItem('summary_tids', summary_tids)
    this.props.refreshAnomalies()
  }

  removeAnomaliesTranscripts = (val) => {
    console.log(val)
    let summary_tids = sessionStorage.getItem('summary_tids').split(',').map( n => parseInt(n, 10))
    sessionStorage.setItem('summary_tids', summary_tids.filter(item => item !== val))
    this.props.refreshAnomalies()
  }

  render() {
    return (
      <div className="transcripts-filter">
        <div className="transcripts-searchbox-div">
          <input
            className="transcripts-searchbox"
            type="text"
            placeholder="Select Transcripts"
            onFocus={() => this.setState({isTrancsriptsSearch: true})}
            onChange={(e) => this.setState({ tnameSearchQuery: e.target.value })}
          />
          <button className="close-btn" onClick={() => this.setState({isTrancsriptsSearch: false})} >OK</button>
        </div>
        {this.state.isTrancsriptsSearch ?
          <div className="transcripts-list-div">
            <ul className="transcripts-list">
              <div className="transcript-names">
                <li className="unselected-item" onClick={() => this.selectAllTranscripts()}>[Select All]</li>
                <li className="unselected-item" onClick={() => this.removeAllTranscripts()}>[Select None]</li>
              </div>
              {this.props.transcripts.map(row => (
                !this.state.tnameSearchQuery || row.name.toLowerCase().includes(this.state.tnameSearchQuery.toLowerCase()) ?
                  <div className="transcript-names">
                  {sessionStorage.getItem('summary_tids').split(',').map( n => parseInt(n, 10)).indexOf(row.id) > -1 ?
                    <li className="selected-item" onClick={() => this.removeAnomaliesTranscripts(row.id)}><span>✓</span> {row.name}</li>
                    :
                    <li className="unselected-item" onClick={() => this.addAnomaliesTranscripts(row.id)}>{row.name}</li>
                  }
                  </div>
                  :
                  null
              ))}
            </ul>
          </div>
          :
          void 0
        }
      </div>

      
    )
  }
}

export default Summary;