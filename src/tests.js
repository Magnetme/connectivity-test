import ping from 'web-pingjs';
import {loadAsScript, loadAsStyleSheet} from "./loaders";

function dummyTest() {
	const randomSecondDelay = Math.floor(Math.random() * 10) + 1;
	const result = {
		success : Math.random() > 0.4,
	};
	return async () => new Promise(resolve => setTimeout(() => resolve(result), randomSecondDelay * 1000));
}

function pingTest(domain) {
	return async () => {
		try {
			const delta = await ping(domain, 0.3);
			return {
				success : true,
				response : delta
			};
		} catch (e) {
			return {
				success : false,
				response : e,
			}
		}
	};
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

function testOf(name, description, test) {
	return {
		name,
		description,
		test,
	}
}

const tests = [
	testOf('Ping', 'Can you contact Magnet.me at all?', pingTest('http://magnet.me')),
	testOf('Ping LB', 'Can you contact our datacenter?', pingTest('http://lb.magnet.me')),
	testOf('Ping CDN', 'Can you contact our CDN?', pingTest('http://cdn.magnet.me')),
	// No pings for Oauth, since it adoes not allow remote checks for security reasons

	testOf('IPv4 / HTTP', 'Does connecting over ipv4 work?', performNetworkRequest('http://clients-4.magnet.me')),
	testOf('IPv4 / HTTPS', 'Does connecting over ipv4 with HTTPS work?', performNetworkRequest('https://clients-4.magnet.me')),
	testOf('IPv6 / HTTP', 'Does connecting over ipv6 work?', performNetworkRequest('http://clients-6.magnet.me')),
	testOf('IPv6 / HTTPS', 'Does connecting over ipv6 with HTTPS work?', performNetworkRequest('https://clients-6.magnet.me')),

	// The two tests below only work in production
	testOf('HTTP', 'Can you communicate over HTTP', loadAsScript(`http://${window.location.host}/demo.js`)),
	testOf('HTTPS', 'Can you communicate over HTTPS', loadAsScript(`https://${window.location.host}/demo.js`)),

	testOf('Image', 'Can you reach our imaging subsystem?', performNetworkRequest(`https://customerimages.magnet.me/_health`)),
	testOf('OAuth', 'Can you reach our authentication subsystem?', loadAsScript(`https://oauth.magnet.me/static/js/authentication.js`)),
	// TODO the test below is not working
	// testOf('Proxy image', 'Can you reach our proxy imaging subsystem?', loadAsIframe(`https://camo.magnet.me/status`)),
	testOf('Web', 'Can you reach our web servers?', loadAsScript(`https://magnet.me/markdown/autolinker`)),
	testOf('API', 'Can you reach our APIs?', performNetworkRequest(`https://api.magnet.me/healthcheck`)),
	// TODO the test below is not working
	// testOf('Email', 'Can you reach our email servers?', performNetworkRequest(`https://email.magnet.me/_health`)),
	testOf('CDN', 'Can you reach our CDN servers?', performNetworkRequest(`https://cdn.magnet.me/images/logo-bigger.png`)),
	testOf('Fonts', 'Can you load our fonts?', loadAsStyleSheet(`https://cdn.magnet.me/fonts/source_sans_pro/source_sans_pro_v3.css`)),
	testOf('HTTP2', 'Can you communicate over HTTP2?', checkHttp2),
	testOf('Intercom', 'Can you reach Intercom?', loadAsScript('https://widget.intercom.io/widget/jvjwxo89')),
	testOf('Tentamenrooster', 'Can you reach Tentamenrooster.nl?', loadAsScript('https://tentamenrooster.nl')),
];

export default tests;
