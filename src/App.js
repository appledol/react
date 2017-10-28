import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      requestFailed: false,
      dataVolume: null,
      searchValue: '',
      searchPressed: '',
      sortBy: 'id',
      sortDir: 'ASC',
      clickedIndex: null,
      currentPage: 1,
      entriesPerPage: 50
    }
    this.updateSearchValue = this.updateSearchValue.bind(this)
  }

  fetchEntries(url) {
    fetch(url)
    .then(response => {
      if (!response.ok) {
        throw Error("Network request failed")
      }
      return response
    })
    .then(d => d.json())
    .then(d => {
      this.setState({
        tableData: d
        })
      }, () => {
        this.setState({
          requestFailed: true
        })
      })
    }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.searchValue === this.state.searchValue) {
      return true;
    }
    else return false;
  }

  componentDidMount() {
  }

  setDataVolume(type){
    var url = null; if (type === 'big') {
        url = 'http://www.filltext.com/?rows=1000&id={number|1000}&firstName={firstName}&delay=3&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}';  } else {
        url = 'http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}';  }
        this.fetchEntries(url);
        this.setState({
          dataVolume: type
        });
  }

  onSearchPressed() {
    this.setState({
      searchPressed: this.state.searchValue
    });
  }

  updateSearchValue(evt) {
    this.setState({
      searchValue: evt.target.value
    });
  }

  updateSortProps(sortByVal) {
    let sortDirVal = null;
    if (sortByVal !== this.state.sortBy) sortDirVal = 'ASC';
    else {
      sortDirVal = this.state.sortDir === 'ASC' ? 'DESC' : 'ASC';
    }

    this.setState({
      sortBy: sortByVal,
      sortDir: sortDirVal
    });
  }

  sortRowsBy(cellDataKey, entryList) {
    var sortDir = this.state.sortDir;
    var sortBy = cellDataKey;
    var rows = entryList.slice();
    rows.sort((a, b) => {
      var sortVal = 0;
      if (a[sortBy] > b[sortBy]) {
        sortVal = 1;
      }
      if (a[sortBy] < b[sortBy]) {
        sortVal = -1;
      }
      if (sortDir === 'DESC') {
        sortVal = sortVal * -1;
      }
      return sortVal;
    });

    return rows;
  }

  getSearchSymbolFor(fieldType) {
    if (fieldType !== this.state.sortBy) return ('icon-down');
    else {
      return ( this.state.sortDir === 'ASC' ? ('icon-up') : ('icon-down') );
    }
  }

  setIndex(indexVal) {
    this.setState ({
      clickedIndex : indexVal
    });
  }

  getDetailedInfo() {
    var result = '';
    var numrows = this.state.tableData.length;
    for (var i = 0; i < numrows; i++) {

      var item = this.state.tableData[i];
      if (item.id === this.state.clickedIndex){
        result = (<div className="detail-info">
        <p>Выбран пользователь: <b>{item.firstName} {item.lastName}</b></p>
        <p>Описание:</p>
        <textarea value={item.description} onChange={this.doNothing.bind(this)}/>
        <p>Адрес проживания: <b>{item.address.streetAddress}</b></p>
        <p>Город: <b>{item.address.city}</b></p>
        <p>Провинция/штат: <b>{item.address.state}</b></p>
        <p>Индекс: <b>{item.address.zip}</b></p>
        </div>);
      }
    }
    return result;
  }

  switchPage(event) {
    this.setState({
      currentPage: Number(event.target.id)
    });
  }

  doNothing() {

  }

  onKeyPress(event) {
    if (event.which === 13) {
      event.preventDefault();
    }
  }

  render() {
    if (!this.state.dataVolume)
      return (
        <div>
          <h3>Пожалуйста, выберите объем данных: </h3>
          <form class="choice-db">
            <input type="button"  name="Малый" value="Малый" onClick={this.setDataVolume.bind(this, 'small')}/>
            <input type="button"  name="Большой" value="Большой" onClick={this.setDataVolume.bind(this, 'big')}/>
          </form>
        </div>
      );
    if (this.state.requestFailed) return (<p>Network request failed.</p>);
    if (!this.state.tableData) return (<div className="loader"></div>);

    // init state vars
    const tableData = this.state.tableData;
    const currentPage = this.state.currentPage;
    const entriesPerPage = this.state.entriesPerPage;

    // filter and sort
    let filteredEntries = tableData.filter(
      (entry) => {
        return (entry.firstName.toLowerCase().indexOf(this.state.searchPressed.toLowerCase()) !== -1
        || entry.lastName.toLowerCase().indexOf(this.state.searchPressed.toLowerCase()) !== -1
        || entry.email.toLowerCase().indexOf(this.state.searchPressed.toLowerCase()) !== -1
        || entry.phone.toLowerCase().indexOf(this.state.searchPressed.toLowerCase()) !== -1);
      }
    );

    // check if button was pressed
    let sortedEntries = this.sortRowsBy(this.state.sortBy, filteredEntries);

    // pagination vars
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = sortedEntries.slice(indexOfFirstEntry, indexOfLastEntry);
    const renderedEntries = currentEntries.map((item, index) => {
      return (
        <tr key = {index} onClick={this.setIndex.bind(this,item.id)}>
          <td>{item.id}</td>
          <td>{item.firstName}</td>
          <td>{item.lastName}</td>
          <td>{item.email}</td>
          <td>{item.phone}</td>
        </tr>
      )
    });

    // render page numbers
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(sortedEntries.length / entriesPerPage); i++) {
      pageNumbers.push(i);
    }

    const renderedPageNumbers = pageNumbers.map(number => {
      return (
        <li
          key={number}
          id={number}
          onClick={this.switchPage.bind(this)}
        >
        {number}
        </li>
      );
    });

    return (
      <div className="App">
        <form onKeyPress={this.onKeyPress}>
          <input type="text"  name="searchValue"  defaultValue={this.state.searchValue}  onChange={this.updateSearchValue.bind(this)}/>
          <input type="button"  name="searchButton" value="Search" onClick={this.onSearchPressed.bind(this)}/>
        </form>

        <table>
          <tbody>
            <tr>
              <td onClick={this.updateSortProps.bind(this,'id')}>id <span className={this.getSearchSymbolFor('id')}></span></td>
              <td onClick={this.updateSortProps.bind(this,'firstName')}>firstName <span className={this.getSearchSymbolFor('firstName')}></span></td>
              <td onClick={this.updateSortProps.bind(this,'lastName')}>lastName <span className={this.getSearchSymbolFor('lastName')} ></span></td>
              <td onClick={this.updateSortProps.bind(this,'email')}>email  <span className={this.getSearchSymbolFor('email')} ></span></td>
              <td onClick={this.updateSortProps.bind(this,'phone')}>phone <span className={this.getSearchSymbolFor('phone')} ></span></td>
            </tr>
            {renderedEntries}
          </tbody>
        </table>

        <div className="pagination">
          <ul id="page-numbers">{renderedPageNumbers}</ul>
          {this.getDetailedInfo()}
        </div>

      </div>
    );
  }
}
export default App;
