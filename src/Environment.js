import React, {Fragment, PureComponent} from "react";
import Device from 'react-device';

import './Environment.css';

function testStorage(storageReference) {
	const mod = 'testStorage';
	return (function () {
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
			userAgent : {},
		};
		this.onChange = this.onChange.bind(this);
	}

	async componentDidMount() {
		fetch('http://api.ipstack.com/check?hostname=1&access_key=c7de533b6bb95365e6f4efc3779e17de')
			.then(response => response.json())
			.then(ip => this.setState({ip}));

		fetch('https://clients.magnet.me/user_agent')
			.then(response => response.json())
			.then(userAgent => this.setState({userAgent}));
	}

	onChange(data) {
		console.log('New device data received');
		const browser = {
			...data.browser,
			browserOnline : window.navigator.onLine,
			javaEnabled : window.navigator.javaEnabled(),
			dataCookiesEnabled : window.navigator.cookieEnabled,
			localStorageEnabled : testStorage(window.localStorage),
			sessionStorageEnabled : testStorage(window.sessionStorage),
		};
		this.setState(Object.assign({}, data, {browser}));
	}

	render() {
		return <Fragment>
			<Device onChange={this.onChange}/>
			<pre className="environment">
			<code>
				{JSON.stringify(this.state, null, 4)}
			</code>
		</pre>
		</Fragment>;
	}
}

export default Environment;
