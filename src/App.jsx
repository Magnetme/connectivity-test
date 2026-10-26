import React, {PureComponent} from 'react';
import './App.css';
import Header from './Header';
import TestItemList from "./TestItemList";
import internalTests from './internalTests';
import Environment from "./Environment";

const Line = <p className="line"/>;

function InternalTest({onResult}) {
	return (
		<>
			<TestItemList tests={internalTests} onResult={onResult}/>

			<p>
				<sup>*</sup>
				In case the your network does not support IPv6 the IPv6 tests can fail.
				This does not indicate a problem as long as the IPv4 tests succeed.
			</p>
		</>
	);
}

class App extends PureComponent {

	constructor(props) {
		super(props);
		this.state = {directConnection : null};
		this.onTestResult = this.onTestResult.bind(this);
	}

	onTestResult(name, result) {
		if (name === 'Direct connection') {
			this.setState({directConnection : result});
		}
	}

	render() {
		return (
			<div className="App">
				<Header/>
				<p className="App-intro">
					This system will determine whether there are any connectivity issues between your computer and the Magnet.me network.
				</p>
				<p>
					The test consists of two separate parts.
				</p>
				<ol>
					<li>The first part will automatically perform several connectivity checks.</li>
					<li>The second part includes information about the system you are using (no personal information will be included).</li>
				</ol>

				{Line}

				<p className="App-explanation focus">
					Please send a screenshot of the entire page to your account manager or customer success manager.
				</p>

				{Line}

				<InternalTest onResult={this.onTestResult}/>

				{Line}

				<p>
					The following information will tell our engineers more about the system you are using. No personal
					information is collected.
				</p>

				<Environment directConnection={this.state.directConnection}/>
			</div>
		);
	}
}

export default App;
