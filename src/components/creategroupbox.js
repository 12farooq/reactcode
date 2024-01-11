import React from 'react'
import './style.css'
import Loader from 'react-loader-spinner';
import configData from "../config";
class CreateGroupBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {grp_name: '', isCreating: false}
    this.createGroup = this.createGroup.bind(this)
  }

  async createGroup() {
    var contradictionStatus=document.getElementById('contradictionStatus');
    let contraStatus=false;
    if (contradictionStatus.checked){
      contraStatus=true;
  }else{
    contraStatus=false;
  }
    let t_ids = []
    this.props.selectedTranscripts.map(row =>(
      t_ids.push(row.original.id)
    ))

    if (this.state.grp_name === '') {
      alert("Please enter a group name")
    }
    else {
      this.setState({isCreating: true})
      try {
        const body = { files: t_ids, grp_name: this.state.grp_name,isContradiction:contraStatus,UserId:sessionStorage.getItem('UserId') }
        // console.log("sansar");
        // console.log(body);
        const requestOptions = {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            "Content-Type" : "application/json",
            "Authorization": sessionStorage.getItem('token'),
            "username": sessionStorage.getItem('username')
          }
        };
        await fetch(configData.TranscriptAnalysis.AWSApiGateway.QueueClusteringJobs, requestOptions)
        .then(
          response => {
            // console.log(response)
            if(response.status === 200) {
              this.setState({isCreating: false})
              alert("Group Created Successfully!")
              window.location.reload()
            }
            else {
              this.setState({isCreating: false})
              alert("Group Already Exists!")
            }
          }
        )
      }
      catch (error) {
        console.log("Error");
      }
    }
  }

  render() {
    return (
      <section id="create-group-box">
        <div className="container">
          <div className="heading">
            <h1>Create New Group</h1>
          </div>
          <div className="form">
            <p className="label">Enter Group Name:</p>
            <input required type="text" className="input" onChange={(e) => this.setState({grp_name: e.target.value})} />
            {
              this.state.isCreating ?
                <button className="create-btn-loading" ><Loader type="Oval" color="#ffffff" height={15} width={15} /></button>
                :
                <button className="create-btn" onClick={this.createGroup} >Create</button>
            }
          </div>
          <div className="selected-transcripts">
            <h3>Transcripts selected:</h3>
            <span style={{fontWeight:500, padding:'10px 12px'}}>Do you want to detect contradictions? :</span> <input type="checkbox" id='contradictionStatus' name="contradictionStatus"/>
            <div style={{marginTop:'10px'}} className="tlist">
              {
                this.props.selectedTranscripts.map(row => (
                  <p className="tnames">{row.original.transcript_name}</p>
                ))
              }
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CreateGroupBox;