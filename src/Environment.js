import React, {Fragment, PureComponent} from "react";
import Device from 'react-device';

import './Environment.css';

function generateRandomString(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

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
			httpVersion : undefined,
			proxy : undefined,
			via : undefined,
			sslProtocol : undefined,
			sslCipher : undefined,
			urlLengths : {
				100 : undefined,
				250 : undefined,
				500 : undefined,
				750 : undefined,
				1000 : undefined,
				1250 : undefined,
				1500 : undefined,
				1750 : undefined,
				1875 : undefined,
				1925 : undefined,
				1975 : undefined,
				2000 : undefined,
				2050 : undefined,
				2100 : undefined,
				2250 : undefined,
				2500 : undefined,
				3000 : undefined,
			}
		};
		this.onChange = this.onChange.bind(this);
	}

	async componentDidMount() {
		fetch('https://clients.magnet.me/ip')
			.then(response => response.text())
			.then(ip => this.setState({ip}));

		fetch('https://clients.magnet.me/user_agent')
			.then(response => response.json())
			.then(userAgent => this.setState({userAgent}));

		fetch('https://clients.magnet.me/http_version')
			.then(response => response.text())
			.then(httpVersion => this.setState({httpVersion}));

		fetch('https://clients.magnet.me/proxy')
			.then(response => response.text())
			.then(proxy => this.setState({proxy}));

		fetch('https://clients.magnet.me/via')
			.then(response => response.text())
			.then(via => this.setState({via}));

		fetch('https://clients.magnet.me/ssl_protocol')
			.then(response => response.text())
			.then(sslProtocol => this.setState({sslProtocol}));

		fetch('https://clients.magnet.me/ssl_cipher')
			.then(response => response.text())
			.then(sslCipher => this.setState({sslCipher}));

		const baseUri = 'https://clients.magnet.me/dont_care';
		const include = 'include=';
		const exclude = 'exclude=';
		Object.keys(this.state.urlLengths).forEach(length => {
			const toAdd = length - baseUri.length - include.length - exclude.length - 2; // for the ? and &
			const toAddToInclude = toAdd - Math.round(toAdd / 2);
			const toAddToExclude = toAdd - toAddToInclude;
			const toInclude = generateRandomString(toAddToInclude);
			const toExclude = generateRandomString(toAddToExclude);

			fetch(`${baseUri}?${include}${toInclude}&${exclude}${toExclude}`)
				.then(response => {
					const status = response.status;
					this.setState(state => {
						const {urlLengths} = state;
						return {
							...state,
							urlLengths : {
								...urlLengths,
								[length] : status,
							}
						}
					})
				})
				.catch(e => {
					// window.alert(`URL length (${length}) violation: ${e}`);
					debugger;
					this.setState(state => {
						const {urlLengths} = state;
						return {
							...state,
							urlLengths : {
								...urlLengths,
								[length] : 'FAIL',
							}
						}
					})
				});
		})
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
