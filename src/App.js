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
        <p className="App-explanation">
          After taking note of the displayed test results, please inform your account manager or supporter of the results below.
        </p>

        <TestItemList tests={tests}/>
      </div>
    );
  }
}

export default App;
