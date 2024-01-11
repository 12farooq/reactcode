import React from 'react'
import './style.css'

class FilterSearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {query:""}
    this.handleKeypress = this.handleKeypress.bind(this)
  }

  searchQuery(e){
    this.setState({query:e})
  }

  formSumit() {
    this.props.querySearchFun(this.state.query, this.props.model)
  }

  handleKeypress(e) {
      //it triggers by pressing the enter key
    if (e.charCode === 13) {
      this.formSumit()

      // console.log('here')
    }
  }

  placeholder = this.props.model === 'qqpd' ? "Semantic Query Search" : "Related Query Search"

  render() {
    return (
      <section id="filter-search">
        <div className="searchbar">
          
          <input type="text" placeholder={this.placeholder} className="searchbox" onChange={(e) => this.searchQuery(e.target.value)} onKeyPress={this.handleKeypress} ></input>
          <button onClick={() => this.formSumit()}> Go! </button>
          
        </div>
      </section>
    );
  }
}

export default FilterSearch;