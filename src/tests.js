function dummyTest() {
	const randomSecondDelay = Math.floor(Math.random() * 10) + 1;
	const result = {
		success : Math.random() > 0.4,
	};
	return async () => new Promise(resolve => setTimeout(() => resolve(result), randomSecondDelay * 1000));
}

function performNetworkRequest(uri, mode = 'cors') {
	return async () => {
		try {
			const result = await fetch(uri, {
				mode,
			});
			return {
				success : result.ok || result.type === 'opaque',
				response : result,
			}
		} catch (e) {
			console.warn(e);
			return {
				success : false,
				error : e,
			}
		}
	}
}

async function checkHttp2() {
	const result = await performNetworkRequest(`https://clients.magnet.me/http_version`)();
	try {
		const text = await result.response.text();
		return {
			success : text === 'h2',
			response : text,
		}
	} catch (e) {
		return {
			success : false,
			response : e,
		}
	}
}

function loadAsScript(uri) {
	return async () => {
		const element = window.document.createElement('script');
		element.src = uri;
		element.type = 'text/javascript';
		window.document.body.appendChild(element);
		try {
			await new Promise((resolve, reject) => {
					const timeout = setTimeout(() => {
						console.warn('Rejected due to timeout');
						reject();
					}, 15000);
					element.addEventListener('load', () => {
						clearTimeout(timeout);
						resolve()
					}, false);
					element.addEventListener('error', () => {
						clearTimeout(timeout);
						reject()
					}, false);
					element.addEventListener('abort', () => {
						clearTimeout(timeout);
						reject()
					}, false);
				}
			);
			return {
				success : true,
				response : {}
			};
		} catch (e) {
			console.error(e);
			return {
				success : false,
				response : e
			};
		}
	}
}

function testOf(name, description, test) {
	return {
		name,
		description,
		test,
	}
}

const tests = [
	testOf('DNS', 'Can your computer translate Magnet.me?', performNetworkRequest('http://magnet.me', 'no-cors')),
	testOf('IPv4', 'Does connecting over ipv4 work?', performNetworkRequest('http://clients-4.magnet.me')),
	testOf('IPv6', 'Does connecting over ipv6 work?', performNetworkRequest('http://clients-6.magnet.me')),
	testOf('HTTP', 'Can you communicate over HTTP', loadAsScript(`http://${window.location.host}/demo.js`)),
	testOf('HTTPS', 'Can you communicate over HTTPS', loadAsScript(`https://${window.location.host}/demo.js`)),
	testOf('Image', 'Can you reach our imaging subsystem?', performNetworkRequest(`https://customerimages.magnet.me/_health`)),
  // TODO the test below is not working
  // testOf('Proxy image', 'Can you reach our proxy imaging subsystem?', loadAsScript(`https://camo.magnet.me/`)),
  testOf('Web', 'Can you reach our web servers?', performNetworkRequest(`https://magnet.me/_health`, 'no-cors')),
  testOf('API', 'Can you reach our APIs?', performNetworkRequest(`https://api.magnet.me/healthcheck`)),
	// TODO the test below is not working
	// testOf('Email', 'Can you reach our email servers?', performNetworkRequest(`https://email.magnet.me/_health`)),
	testOf('CDN', 'Can you reach our CDN servers?', performNetworkRequest(`https://cdn.magnet.me/images/logo-bigger.png`)),
	testOf('HTTP2', 'Can you communicate over HTTP2?', checkHttp2),
	testOf('Intercom', 'Can you reach Intercom?', loadAsScript('https://widget.intercom.io/widget/jvjwxo89')),
	testOf('Tentamenrooster', 'Can you reach Tentamenrooster.nl?', loadAsScript('https://tentamenrooster.nl')),
];

export default tests;
