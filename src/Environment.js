import React, {PureComponent, Fragment} from "react";
import Device from 'react-device';

import './Environment.css';

function testStorage(storageReference) {
	const mod = 'testStorage';
	return (function() {
		try {
			storageReference.setItem(mod, mod);
			storageReference.removeItem(mod);
			return true;
		} catch (exception) {
			return false;
		}
	}());
}

class Environment extends PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			ip : {},
		};
		this.onChange = this.onChange.bind(this);
	}

	async componentDidMount() {
		const result = await fetch('http://freegeoip.net/json/');
		const json = await result.json();
		console.log('New IP data received');
		this.setState({ip : json});
	}

	onChange(data) {
		console.log('New device data received');
		const browser = {
			...data.browser,
			browserOnline: window.navigator.onLine,
			javaEnabled: window.navigator.javaEnabled(),
			dataCookiesEnabled: window.navigator.cookieEnabled,
			localStorageEnabled: testStorage(window.localStorage),
			sessionStorageEnabled: testStorage(window.sessionStorage),
		};
		this.setState(Object.assign({}, data, {browser}));
	}

	render() {
		return <Fragment>
			<Device onChange={this.onChange} />
			<pre className="environment">
			<code>
				{JSON.stringify(this.state, null, 4)}
				</code>
		</pre>
		</Fragment>;
	}
}

export default Environment;
