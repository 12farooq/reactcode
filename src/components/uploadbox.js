import React from 'react'
import axios from 'axios';
import './style.css'
import Loader from 'react-loader-spinner';
import configData from '../config';

class UploadBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {files : [], isUploading: false, isDrag: false};
    this.uploadFile = this.uploadFile.bind(this);
  }

  uploadAll = () => {
    this.setState({isUploading: true})
    this.state.files.map(file => (
      this.uploadFile(file)
    ))
  }

  uploadFile(file) {
    axios({
      method: "GET",
      url: configData.TranscriptAnalysis.AWSApiGateway.PresignedUrl + file.name,
      headers: {
        "Content-Type" : "application/json",
        "Authorization": sessionStorage.getItem('token'),
        "username": sessionStorage.getItem('username')
      }
    })
    .then(response => {
      // console.log(response)
      // console.log(JSON.parse(response.data.body).fileUploadURL)
      const presignedurl = JSON.parse(response.data.body).fileUploadURL;
      // alert(presignedurl);
      axios({
        method: "PUT",
        url: presignedurl,
        data: file,
        headers: { "Content-Type": "text/plain" }
      })
      .then(res => {
        this.setState({files: this.state.files.filter(function(stateFile) { 
          return stateFile !== file 
        })}, () => this.alertUpload());
        this.setState({isUploading: false})
      })
      .catch(err => {
        this.setState({isUploading: false})
        alert("There was an error while uploading. Please try again later.")
      });
    }).catch(error => {
      this.setState({isUploading: false})
      alert("There was an error while uploading. Please try again later.")
    });
  }

  alertUpload = () => {
    if(this.state.files.length === 0) {
      alert("Files Uploaded Successfully!")
      window.location.reload()
    }
  }

  dragOver = (e) => {
    e.preventDefault();
  }

  dragEnter = (e) => {
    e.preventDefault();
    //this.setState({isDrag: true})
  }

  dragLeave = (e) => {
    e.preventDefault();
    //this.setState({isDrag: false})
  }

  fileDrop = (e) => {
    e.preventDefault();
    let files = e.dataTransfer.files;
    let currFiles = this.state.files;
    let allowedTypes = ['zip', 'txt']
    //console.log(typeof(files))
    for(let i = 0; i < files.length; i++) {
      //console.log(files[i].type)
      //console.log(files[i])
      if(allowedTypes.indexOf(files[i].name.split('.').pop()) !== -1) {
        currFiles.push(files[i])
      }
    }
    //console.log(currFiles)
    this.setState({files: currFiles})
  }

  addFile = (e) => {
    let files = e.target.files
    let currFiles = this.state.files;
    let allowedTypes = ['zip', 'txt']
    //console.log(typeof(files))
    for(let i = 0; i < files.length; i++) {
      //console.log(files[i].type)
      //console.log(files[i])
      if(allowedTypes.indexOf(files[i].name.split('.').pop()) !== -1) {
        currFiles.push(files[i])
      }
    }
    //console.log(currFiles)
    this.setState({files: currFiles})
  }

  render() {
    return (
      <section id="upload-box">
        <div className="borderbox">
          <div className="uploadcontainer"
            onDragOver={this.dragOver}
            onDragEnter={this.dragEnter}
            onDragLeave={this.dragLeave}
            onDrop={this.fileDrop}
          >
            {!this.state.isDrag ?
              <div className="dragdrop-box">
                <span>Drag and Drop Files (.zip or .txt) Here</span>
                <br /><br />
                <span className="orline">OR</span>
                <br />
                <input id="files" type="file" multiple className="choosebtn" title="" value="" onChange={this.addFile}/>
                <label for="files" className="choosebtn-label"> Choose Files </label>
                <div className="selected-files">
                  {
                    this.state.files.map(file => (
                      <p className="selected-files-names">{file.name}</p>
                    ))
                  }
                </div>
                <div className="uploadbtndiv">
                  {this.state.files.length ? (
                    this.state.isUploading ?
                      <button className="uploadbtn-loading" disabled="true" ><Loader type="Oval" color="#000000" height={15} width={15} /></button>
                      :
                      <button className="uploadbtn" onClick={this.uploadAll}>Upload</button>
                    ) : null
                  }
                </div>
              </div>
              :
              <div className="drop-box-active">
                <p>Drop Here</p>
              </div>
            }
          </div>
        </div>
      </section>
    );
  }
}

export default UploadBox;