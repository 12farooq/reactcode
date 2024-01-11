import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import './style.css'

class Navbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = { whichPage: '' }
    this.changeTab = this.changeTab.bind(this)
  }

  changeTab(val) {
    this.setState({ whichPage: val })
  }

  render() {
    return (
      <section id="navbar">
        <div className="mainbar">

          <GetCurrLocation updateLocation={this.changeTab} />

          <Link to='/' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/' ?
              <p className="selected-tab">Home</p>
              :
              <p className="tabs">Home</p>
            }
          </Link>
          <Link to='/analysis' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/analysis' ?
              <p className="selected-tab">Analysis</p>
              :
              <p className="tabs">Analysis</p>
            }
          </Link>
          <Link to='/stats' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/stats' ?
              <p className="selected-tab">Statistics</p>
              :
              <p className="tabs">Statistics</p>
            }
          </Link>
          <Link to='/anomalies' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/anomalies' ?
              <p className="selected-tab">Contradiction</p>
              :
              <p className="tabs">Contradiction</p>
            }
          </Link>
          {/* <Link to='/summary' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/summary' ?
              <p className="selected-tab">Summary</p>
              :
              <p className="tabs">Summary</p>
            }
          </Link>
          <Link to='/summaryTopic' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/summaryTopic' ?
              <p className="selected-tab">Summary Topic</p>
              :
              <p className="tabs">Summary Topic</p>
            }
          </Link> */}
          <Link to='/Summarization' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/Summarization' ?
              <p className="selected-tab">Summarization</p>
              :
              <p className="tabs">Summarization</p>
            }
          </Link>
          {/* <Link to='/summarySamsum' style={{ textDecoration: 'none', color: 'inherit' }} >
            {this.state.whichPage === '/summarySamsum' ?
              <p className="selected-tab">Summary Samsum</p>
              :
              <p className="tabs">Summary Samsum</p>
            }
          </Link> */}
        </div>
        <div className="filler-top"></div>
      </section>
    );
  }
}

function GetCurrLocation(props) {
  const location = useLocation().pathname

  React.useEffect(() => {
    props.updateLocation(location)
  }, [location])

  return (null)
}

export default Navbar;