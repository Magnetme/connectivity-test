import React, { PureComponent } from 'react';
import './App.css';
import Header from './Header';
import TestItemList from "./TestItemList";
import tests from './tests';

class App extends PureComponent {
  render() {
    return (
      <div className="App">
        <Header />
        <p className="App-intro">
          This system will determine whether there are any connectivity issues between your computer and the Magnet.me network.
        </p>
        <TestItemList tests={tests}/>
      </div>
    );
  }
}

export default App;
