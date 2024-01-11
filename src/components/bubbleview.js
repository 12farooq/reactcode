import React from 'react'
import Cookies from 'universal-cookie';
import axios from 'axios';
import './style.css'
import Loader from "react-loader-spinner";
import configData from '../config';
const cookies = new Cookies();
class BubbleView extends React.Component {
  isComponentMounted = false;

  constructor(props) {
    super(props);
    this.state = { clusterLevel: 0, selectedBubble: undefined, selectedSubBubble: undefined, selectedSubBubble3: undefined, selectedSubBubble4: undefined, selectedSubBubble5: undefined, list: [], loading: true, width: window.innerWidth, height: window.innerHeight };
  }

  componentDidMount() {
    this.isComponentMounted = true;

    //console.log(Math.floor(0.415*window.innerHeight), Math.floor(0.695*window.innerWidth))
    this.getBubbles()
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentDidUpdate(prevProps) {
    if (!(this.props.job_id === prevProps.job_id)) {
      this.getBubbles()
      this.setState({ selectedBubble: undefined, selectedSubBubble: undefined, selectedSubBubble3: undefined, selectedSubBubble4: undefined, selectedSubBubble5: undefined })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);

    // Used For Handling Console Error.
    this.isComponentMounted = false;
    this.setState = (state, callback) => {
      return;
    };
  }

  onBubbleClick = (topic) => {
    this.props.passTopic(topic)
    this.setState({ selectedBubble: topic });
    this.getSubBubbles(topic);
    sessionStorage.setItem("level1", topic);
  }

  onSubBubbleClick = (topic) => {
    this.props.passSubTopic(this.state.selectedBubble, topic)
    this.getSubBubbles3(topic)
    sessionStorage.setItem("level2", topic);
    this.setState({ selectedSubBubble: topic })
  }

  //Function onclick for sub bubble3
  onSubBubble3Click = (topic) => {
    this.props.passSubTopic3(this.state.selectedSubBubble, this.state.selectedBubble, topic)
    this.getSubBubbles4(topic)
    sessionStorage.setItem("level3", topic);
    this.setState({ selectedSubBubble3: topic })
  }

  //Function onclick for sub bubble4
  onSubBubble4Click = (topic) => {
    this.props.passSubTopic4(this.state.selectedSubBubble3, this.state.selectedSubBubble, this.state.selectedBubble, topic)
    this.getSubBubbles4(topic)
    sessionStorage.setItem("level4", topic);
    this.setState({ selectedSubBubble4: topic })
  }

  //Function onclick for sub bubble4
  onSubBubble5Click = (topic) => {
    this.props.passSubTopic5(this.state.selectedSubBubble4, this.state.selectedSubBubble3, this.state.selectedSubBubble, this.state.selectedBubble, topic)
    this.getSubBubbles5(topic)
    sessionStorage.setItem("level5", topic);
    this.setState({ selectedSubBubble5: topic })
  }

  getBubbles = () => {
    if(this.isComponentMounted){
      this.setState({ list: [], loading: true, clusterLevel: 0, selectedBubble: undefined, selectedSubBubble: undefined, selectedSubBubble3: undefined, selectedSubBubble4: undefined, selectedSubBubble5: undefined })
    axios({
      method: "GET",
       url: configData.TranscriptAnalysis.AWSApiGateway.GetAnalysisBubbles,// Dev
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username')
      },
      params: { "job_id": this.props.job_id, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {

        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
        // this.setState({list: response.data, loading:false})
      }).catch(error => {
        //helpers.logOut()
        console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }

  parentBubbles = () => {
    this.props.passParentTopic();
    if(this.isComponentMounted) {this.setState({ list: [], loading: true, clusterLevel: 0, selectedBubble: undefined, selectedSubBubble: undefined, selectedSubBubble3: undefined })
    axios({
      method: "GET",
       url: configData.TranscriptAnalysis.AWSApiGateway.GetAnalysisBubbles,// Dev
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username')
      },
      params: { "job_id": this.props.job_id, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
    .then(response => {
  
      // console.log(JSON.parse(response.data.body))
      this.setState({list: JSON.parse(response.data.body), loading:false})
      // this.setState({list: response.data, loading:false})
    }).catch(error => {
      //helpers.logOut()
      console.log("Error", error)
      alert("Error loading Bubbles. Please Retry")
    });}
  }

  getSubBubbles = (val) => {
    if(this.isComponentMounted) {this.setState({ list: [], loading: true, clusterLevel: 1, selectedBubble: val, selectedSubBubble3: undefined, selectedSubBubble4: undefined, selectedSubBubble5: undefined })
    axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.GetAnalysisSubBubbles, // Dev API
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username'),
      },
      params: { "job_id": this.props.job_id, "cluster_name": val ? val : this.state.selectedBubble, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {
        // console.log("test")
        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
      }).catch(error => {
        //helpers.logOut()
        //console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }


  getSubBubblesPre = () => {
    this.props.passTopic(this.state.selectedBubble)
    if(this.isComponentMounted){this.setState({ list: [], loading: true, clusterLevel: 1, selectedSubBubble3: undefined, selectedSubBubble4: undefined, selectedSubBubble5: undefined, selectedSubBubble: undefined })
    axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.GetAnalysisSubBubbles, // Dev API
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username'),
      },
      params: { "job_id": this.props.job_id, "cluster_name": this.state.selectedBubble, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {
        // console.log("test")
        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
      }).catch(error => {
        //helpers.logOut()
        //console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }


  getSubBubbles3 = (val) => {
    if(this.isComponentMounted){this.setState({ list: [], loading: true, clusterLevel: 2, selectedSubBubble: val, selectedSubBubble4: undefined, selectedSubBubble5: undefined })
    axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.Level3Topics, // Dev API
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username'),
      },
      params: { "job_id": this.props.job_id, "cluster_name": this.state.selectedBubble, "sub_cluster_2_name": val, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {
        // console.log("test")
        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
      }).catch(error => {
        //helpers.logOut()
        //console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }

  getSubBubbles3Pre = () => {
    this.props.passSubTopic(this.state.selectedBubble, this.state.selectedSubBubble)
    this.setState({ list: [], loading: true, clusterLevel: 2, selectedSubBubble4: undefined, selectedSubBubble3: undefined, selectedSubBubble5: undefined })
    if(this.isComponentMounted){axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.Level3Topics, // Dev API
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username'),
      },
      params: { "job_id": this.props.job_id, "cluster_name": this.state.selectedBubble, "sub_cluster_2_name": this.state.selectedSubBubble, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {
        // console.log("test")
        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
      }).catch(error => {
        //helpers.logOut()
        //console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }

  getSubBubbles4 = (val) => {
    if(this.isComponentMounted){this.setState({ list: [], loading: true, clusterLevel: 3, selectedSubBubble3: val })
    axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.Level4Topics, // Dev API
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username'),
      },
      params: { "job_id": this.props.job_id, "cluster_name": this.state.selectedBubble, "sub_cluster_2_name": this.state.selectedSubBubble, "sub_cluster_3_name": val, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {
        // console.log("test")
        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
      }).catch(error => {
        //helpers.logOut()
        //console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }

  getSubBubbles4Pre = () => {
    this.props.passSubTopic3(this.state.selectedSubBubble, this.state.selectedBubble, this.state.selectedSubBubble3)
    this.setState({ list: [], loading: true, clusterLevel: 3, selectedSubBubble5: undefined, })
    if(this.isComponentMounted){axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.Level4Topics, // Dev API
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username'),
      },
      params: { "job_id": this.props.job_id, "cluster_name": this.state.selectedBubble, "sub_cluster_2_name": this.state.selectedSubBubble, "sub_cluster_3_name": this.state.selectedSubBubble3, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {
        // console.log("test")
        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
      }).catch(error => {
        //helpers.logOut()
        //console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }

  getSubBubbles5 = (val) => {
    this.setState({ list: [], loading: true, clusterLevel: 4, selectedSubBubble4: val })
    if(this.isComponentMounted){axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.Level5Topics, // Dev API
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username'),
      },
      params: { "job_id": this.props.job_id, "cluster_name": this.state.selectedBubble, "sub_cluster_2_name": this.state.selectedSubBubble, "sub_cluster_3_name": this.state.selectedSubBubble3, "sub_cluster_4_name": val, "height": Math.floor(0.415 * window.innerHeight), "width": Math.floor(0.695 * window.innerWidth) }
    })
      .then(response => {
        // console.log("test")
        // console.log(JSON.parse(response.data.body))
        this.setState({ list: JSON.parse(response.data.body), loading: false })
      }).catch(error => {
        //helpers.logOut()
        //console.log("Error", error)
        alert("Error loading Bubbles. Please Retry")
      });}
  }


  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
    this.state.clusterLevel === 0 ? this.getBubbles() : this.state.clusterLevel === 1 ? this.getSubBubbles(this.state.selectedBubble) : this.state.clusterLevel === 2 ? this.getSubBubbles3(this.state.selectedSubBubble) : this.state.clusterLevel === 3 ? this.getSubBubbles4(this.state.selectedSubBubble3) : this.getSubBubbles5(this.state.selectedSubBubble4)
  }

  render() {
    const loading = this.state.loading
    return (
      <section id="bubble-view">
        <div className="mainbox">
          <div className="bubble-controls">
            {this.state.clusterLevel === -1 ?
              <button className="parent-topic-btn" onClick={this.parentBubbles}>Parent Topic</button>
              :
              void 0
            }
            {this.state.clusterLevel === 1 ?
              <button className="parent-topic-btn" onClick={this.parentBubbles}>Parent Topic</button>
              :
              void 0
            }
            {this.state.clusterLevel === 2 ?
              <button className="parent-topic-btn" onClick={this.getSubBubblesPre}>Parent Topic</button>
              :
              void 0
            }
            {this.state.clusterLevel === 3 ?
              <button className="parent-topic-btn" onClick={this.getSubBubbles3Pre}>Parent Topic</button>
              :
              void 0
            }
            {this.state.clusterLevel === 4 ?
              <button className="parent-topic-btn" onClick={this.getSubBubbles4Pre}>Parent Topic</button>
              :
              void 0
            }
            {this.state.selectedBubble === undefined ?
              void 0
              :
              <div className="selected-topic">
                <span><b>{this.state.selectedBubble}</b> </span>
              </div>
            }
            {this.state.selectedSubBubble === undefined ?
              void 0
              :
              <div className="selected-subtopic">
                <span> / <b>{this.state.selectedSubBubble}</b> </span>
              </div>
            }
            {this.state.selectedSubBubble3 === undefined ?
              void 0
              :
              <div className="selected-subtopic">
                <span> / <b>{this.state.selectedSubBubble3}</b> </span>
              </div>
            }
            {this.state.selectedSubBubble4 === undefined ?
              void 0
              :
              <div className="selected-subtopic">
                <span> / <b>{this.state.selectedSubBubble4}</b> </span>
              </div>
            }
            {this.state.selectedSubBubble5 === undefined ?
              void 0
              :
              <div className="selected-subtopic">
                <span> / <b>{this.state.selectedSubBubble5}</b> </span>
              </div>
            }

          </div>
          {loading ? (
            <div className="loader">
              <Loader type="BallTriangle" color="#fe7e25" loading="true" size={60} />
              <span className="loader-desc">Loading Topics, Please wait...</span>
            </div>
          ) : (
            <div className="bubble-window">
              <div className="padding-box">
                {this.state.clusterLevel === 0 ?
                  this.state.list.map((item, index) => (
                    <Bubbles
                      key={index}
                      topic={item.topic}
                      radius={item.radius}
                      posX={item.posX}
                      posY={item.posY}
                      fun={this.onBubbleClick}
                    />
                  ))
                  :
                  this.state.clusterLevel === 1 ?
                    this.state.list.map((item, index) => (
                      <SubBubbles
                        key={index}
                        topic={item.topic}
                        radius={item.radius}
                        posX={item.posX}
                        posY={item.posY}
                        fun={this.onSubBubbleClick}
                      />
                    ))
                    :
                    this.state.clusterLevel === 2 ?
                      this.state.list.map((item, index) => (
                        <SubBubbles3
                          key={index}
                          topic={item.topic}
                          radius={item.radius}
                          posX={item.posX}
                          posY={item.posY}
                          fun={this.onSubBubble3Click}
                        />
                      ))
                      :
                      this.state.clusterLevel === 3 ?
                        this.state.list.map((item, index) => (
                          <SubBubbles4
                            key={index}
                            topic={item.topic}
                            radius={item.radius}
                            posX={item.posX}
                            posY={item.posY}
                            fun={this.onSubBubble4Click}
                          />
                        )) :
                        this.state.list.map((item, index) => (
                          <SubBubbles5
                            key={index}
                            topic={item.topic}
                            radius={item.radius}
                            posX={item.posX}
                            posY={item.posY}
                            fun={this.onSubBubble5Click}
                          />
                        ))
                }

              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
}

class Bubbles extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange = () => {
    const topic = this.props.topic
    //console.log(topic)
    this.props.fun(topic)
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color + '7f';
  }

  BubbleStyles = {
    //position: 'relative',
    top: this.props.posY,
    left: this.props.posX,
    width: this.props.radius * 2,
    height: this.props.radius * 2,
    backgroundColor: this.getRandomColor()
  }

  SetXY(r, frame) {
    let max = r * 2;
    let loc = Math.floor(Math.random() * (frame - max));
    return loc;
  }

  render() {
    return (
      <button className="bubbles" style={this.BubbleStyles} onClick={this.handleChange}><span className="button-text">{this.props.topic}</span></button>
    )
  }

}

class SubBubbles extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange = () => {
    const topic = this.props.topic
    //console.log(topic)
    this.props.fun(topic)
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color + '7f';
  }

  BubbleStyles = {
    position: 'absolute',
    top: this.props.posY,
    left: this.props.posX,
    width: this.props.radius * 2,
    height: this.props.radius * 2,
    backgroundColor: this.getRandomColor()
  }

  SetXY(r, frame) {
    let max = r * 2;
    let loc = Math.floor(Math.random() * (frame - max));
    return loc;
  }

  render() {
    return (
      <button className="bubbles" style={this.BubbleStyles} onClick={this.handleChange}><span className="button-text">{this.props.topic}</span></button>
    )
  }

}

class SubBubbles3 extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange = () => {
    const topic = this.props.topic
    //console.log(topic)
    this.props.fun(topic)
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color + '7f';
  }

  BubbleStyles = {
    position: 'absolute',
    top: this.props.posY,
    left: this.props.posX,
    width: this.props.radius * 2,
    height: this.props.radius * 2,
    backgroundColor: this.getRandomColor()
  }

  SetXY(r, frame) {
    let max = r * 2;
    let loc = Math.floor(Math.random() * (frame - max));
    return loc;
  }

  render() {
    return (
      <button className="bubbles" style={this.BubbleStyles} onClick={this.handleChange}><span className="button-text">{this.props.topic}</span></button>
    )
  }

}

class SubBubbles4 extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange = () => {
    const topic = this.props.topic
    //console.log(topic)
    this.props.fun(topic)
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color + '7f';
  }

  BubbleStyles = {
    position: 'absolute',
    top: this.props.posY,
    left: this.props.posX,
    width: this.props.radius * 2,
    height: this.props.radius * 2,
    backgroundColor: this.getRandomColor()
  }

  SetXY(r, frame) {
    let max = r * 2;
    let loc = Math.floor(Math.random() * (frame - max));
    return loc;
  }

  render() {
    return (
      <button className="bubbles" style={this.BubbleStyles} onClick={this.handleChange}><span className="button-text">{this.props.topic}</span></button>
    )
  }

}

class SubBubbles5 extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange = () => {
    const topic = this.props.topic
    //console.log(topic)
    this.props.fun(topic)
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color + '7f';
  }

  BubbleStyles = {
    position: 'absolute',
    top: this.props.posY,
    left: this.props.posX,
    width: this.props.radius * 2,
    height: this.props.radius * 2,
    backgroundColor: this.getRandomColor()
  }

  SetXY(r, frame) {
    let max = r * 2;
    let loc = Math.floor(Math.random() * (frame - max));
    return loc;
  }

  render() {
    return (
      <button className="bubbles" style={this.BubbleStyles} onClick={this.handleChange}><span className="button-text">{this.props.topic}</span></button>
    )
  }

}

export default BubbleView;