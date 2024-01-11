import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import './style.css'

class scriptSave extends React.Component {

  render() {
    return(
      <section id="jobs-box">
        <h1 className="jobs-heading">Are you sure you want to submit selected row?</h1>
        <div className="selected-transcripts">
          <div className='row'>
                <div className='col-md-6'>
                     <button className="scriptSave-btn">Yes</button>
                </div>
                <div className='col-md-6'>    
                      <button className="scriptSave-btn">NO</button>
                </div>
          </div>
        </div>
      </section>
    )
  }
}

export default scriptSave;