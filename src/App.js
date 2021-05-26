import React, {PureComponent} from 'react';
import './App.css';
import Header from './Header';
import TestItemList from "./TestItemList";
import internalTests from './internalTests';
import dceTests from './digitalCareerEventTests';
import Environment from "./Environment";

const Line = <p className="line"/>;

function InternalTest() {
	return (
		<>
			<TestItemList tests={internalTests}/>

			<p>
				<sup>*</sup>
				In case the your network does not support IPv6 the IPv6 tests can fail.
				This does not indicate a problem as long as the IPv4 tests succeed.
			</p>
		</>
	);
}

function DigitalCareerEventTests() {
	return (
		<>
			<TestItemList tests={dceTests}/>

			<p>
				<sup>*</sup>
				The app will continue to function properly if these analytics services fail. Less data might be available though.
				<br/>
				<sup>**</sup>
				These are overarching domains, and may fail without impacting the application.
			</p>

			<p className="disclaimer">
				This application is only provided as a tool for debugging purposes. It does not in any way guarantee access to the application.
				No rights can be derived from the data in this tool.
			</p>
		</>
	);
}

function loadTests() {
	return window.location.pathname === '/dce' ? <DigitalCareerEventTests/> : <InternalTest/>;
}

class App extends PureComponent {

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
					Please send a screenshot of the entire page to your account manager or supporter.
				</p>

				{Line}

				{loadTests()}

				{Line}

				<p>
					The following information will tell our engineers more about the system you are using. No personal
					information is collected.
				</p>

				<Environment/>
			</div>
		);
	}
}

export default App;
