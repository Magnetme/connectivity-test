import ping from 'web-pingjs';
import {loadAsImage, loadAsScript, loadAsStyleSheet} from "./loaders";

function dummyTest() {
	const randomSecondDelay = Math.floor(Math.random() * 10) + 1;
	const result = {
		success : Math.random() > 0.4,
	};
	return async () => new Promise(resolve => setTimeout(() => resolve(result), randomSecondDelay * 1000));
}

function pingTest(domain) {
	const DELTA = 0.3;
	return async () => {
		try {
			const delta = await ping(domain, DELTA);
			if (delta < 3 * DELTA) {
				// too low, most likely no resolving possible
				console.warn(`${domain} had a very low delta of ${delta}, marking as failed`);
				return {
					success : false,
					response : delta
				};
			}
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

async function checkTlsProtocol() {
	const result = await performNetworkRequest(`https://clients.magnet.me/ssl_protocol`)();
	try {
		const text = await result.response.text();
		return {
			success : text === 'TLSv1.3',
			response : text,
		}
	} catch (e) {
		return {
			success : false,
			response : e,
		}
	}
}

function websockets(secure = false) {
	const message = `Magnet.me websocket test ${Math.random()}`;
	return async () => new Promise(((resolve, reject) => {
		const failed = () => reject({
			success : false,
		});
		const timeout = setTimeout(() => {
			console.warn('WSS took too long');
			failed();
		}, 5000);

		try {
			const websocket = new WebSocket(`${secure ? 'wss' : 'ws'}://echo.websocket.org/`);
			let start;
			websocket.onopen = () => {
				start = new Date();
				websocket.send(message);
			};

			websocket.onmessage = (evt) => {
				const responseData = evt.data;
				if (responseData === message) {
					clearTimeout(timeout);
					resolve({
						success : true,
						response : new Date() - start,
					});
				} else {
					console.log(`Response data was '${responseData}', expected '${message}'.`);
					failed();
				}
			};
			websocket.onerror = () => {
				clearTimeout(timeout);
				failed();
			}
		} catch (e) {
			console.warn(e);
			clearTimeout(timeout);
			failed();
		}
	}));
}

function testOf(name, description, test) {
	return {
		name,
		description,
		test,
	}
}

function margin() {
	return {};
}

const tests = [
		margin(),

		testOf('Ping', 'Can you contact Magnet.me at all (domain)?', pingTest('http://magnet.me')),
		testOf('Ping LB', 'Can you contact our datacenter?', pingTest('http://loadbalancer.magnet.me')),
		testOf('Ping CDN', 'Can you contact our CDN?', pingTest('http://cdn.magnet.me')),
		testOf('Ping CDN2', 'Can you contact our alternate CDN?', pingTest('http://cdn2.magnet.me')),
		testOf('Ping OAuth', 'Can you contact our authentication layer?', performNetworkRequest('https://oauth.magnet.me', 'no-cors')),
		// No pings for Oauth, since it adoes not allow remote checks for security reasons
		margin(),

		testOf('IPv4 - no DNS', 'Does connecting over ipv4 without DNS work?', performNetworkRequest('http://136.144.129.63', 'no-cors')),
		margin(),

		testOf('IPv4 / HTTP', 'Does connecting over ipv4 work?', performNetworkRequest('http://clients-4.magnet.me')),
		testOf('IPv4 / HTTPS', 'Does connecting over ipv4 with HTTPS work?', performNetworkRequest('https://clients-4.magnet.me')),
		margin(),

		// These are allowed to fail if the client network does not support ipv6
		testOf('IPv6 / HTTP', 'Does connecting over ipv6 work? *', performNetworkRequest('http://clients-6.magnet.me')),
		testOf('IPv6 / HTTPS', 'Does connecting over ipv6 with HTTPS work? *', performNetworkRequest('https://clients-6.magnet.me')),
		margin(),

		// The two tests below only work in production
		testOf('HTTP', 'Can you communicate over HTTP?', loadAsScript(`http://${window.location.host}/demo.js`)),
		testOf('HTTPS', 'Can you communicate over HTTPS?', loadAsScript(`https://${window.location.host}/demo.js`)),
		testOf('Secure websockets', 'Can you communicate over secure websockets?', websockets(true)),
		margin(),

		testOf('Image', 'Can you reach our imaging subsystem?', performNetworkRequest(`https://customerimages.magnet.me/_health`)),
		testOf('OAuth', 'Can you reach our authentication subsystem?', loadAsScript(`https://oauth.magnet.me/static/js/authentication.js`)),
		margin(),

		testOf('Web', 'Can you reach our web servers?', loadAsScript(`https://magnet.me/healthcheck`)),
		testOf('API', 'Can you reach our APIs?', performNetworkRequest(`https://api.magnet.me/healthcheck`)),
		testOf('Email', 'Can you reach our email servers?', performNetworkRequest(`https://email.magnet.me/_health`, 'no-cors')),
		testOf('CDN', 'Can you reach our CDN servers?', performNetworkRequest(`https://cdn.magnet.me/images/logo-bigger.png`)),
		testOf('Fonts', 'Can you load our fonts?', loadAsStyleSheet(`https://magnet.me/fonts/css?family=Source+Sans+Pro:300,400,400i,600,700&display=swap&subset=latin`)),
		testOf('HTTP2', 'Can you communicate over HTTP2?', checkHttp2),
		testOf('TLSv1.3', 'Can you communicate using TLSv1.3?', checkTlsProtocol),
		testOf('Hubspot', 'Can you reach Hubspot?', loadAsScript('https://www.hubspot.com/hs/hsstatic/cos-i18n/static-1.16/bundles/project.js')),
		testOf('Tentamenrooster', 'Can you reach Tentamenrooster.nl?', loadAsScript('https://tentamenrooster.nl')),
		margin(),

		// This checks whether Social stuff might be blocked
		testOf('Facebook', 'Can you contact Facebook.com at all?', pingTest('https://facebook.com')),
		testOf('LinkedIn', 'Can you contact LinkedIn.com at all?', pingTest('https://www.linkedin.com')),
		testOf('Twitter', 'Can you contact Twitter.com at all?', pingTest('https://twitter.com')),
		margin(),

		// Or parts of our Google platform
		testOf('Google SE', 'Can you contact google.com?', performNetworkRequest('https://www.google.com/', 'no-cors')),
		testOf('Google Docs', 'Can you contact Google Docs?', performNetworkRequest('https://docs.google.com/forms/d/e/1FAIpQLSf-UqflUetJ64U_h1K8eGjePLArMeBknoaH_tkOZPqq9dizLg/viewform', 'no-cors')),
		margin(),

		// More internal test of social networks
		testOf('Facebook CSS', 'Can you reach Facebook Network?', performNetworkRequest('https://facebook.com/security/hsts-pixel.gif')),
		testOf('LinkedIn JS', 'Can you reach LinkedIn JS?', loadAsScript('https://platform.linkedin.com/litms/utag/voyager-web-feed/utag.js')),
		margin(),

		// Test sites in our data centre
		testOf('DCGA1', 'Can you reach our primary data centre?', loadAsImage('https://www.transip.nl/img/_beyourself/trustpilot-v3.png')),
		testOf('DCGA2', 'Can you reach our secondary data centre?', loadAsImage('https://team.blue/img/cms/index/brands6.png')),
	]
;

export default tests;
