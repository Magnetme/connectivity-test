const CONNECTION_URL = 'https://clients.magnet.me/connection';
const SERVER_PROTOCOLS = {
	'HTTP/1.0' : 'http/1.0',
	'HTTP/1.1' : 'http/1.1',
	'HTTP/2.0' : 'h2',
	'HTTP/3.0' : 'h3',
};
const FIELDS = ['requestId', 'httpProtocol', 'tlsProtocol', 'cipher', 'offeredCiphers', 'offeredGroups', 'sessionReused'];

export async function checkConnection() {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);
	try {
		// getRandomValues also works on the page's HTTP aliases.
		const nonce = Array.from(window.crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16).padStart(8, '0')).join('');
		const url = `${CONNECTION_URL}?probe=${nonce}`;
		const response = await fetch(url, {
			mode : 'cors',
			cache : 'no-store',
			credentials : 'omit',
			signal : controller.signal,
		});
		if (!response.ok) {
			return {success : false, response : `Connection endpoint returned HTTP ${response.status}`};
		}
		if (response.redirected) {
			return {success : false, response : 'Connection endpoint unexpectedly redirected'};
		}
		const server = await response.json();
		if (!server || !FIELDS.every(field => typeof server[field] === 'string')) {
			return {success : false, response : 'Connection endpoint returned invalid diagnostic data'};
		}

		// Allow the browser to publish the completed resource timing entry.
		await new Promise(resolve => setTimeout(resolve, 0));
		const entries = typeof window.performance?.getEntriesByName === 'function'
			? window.performance.getEntriesByName(url, 'resource') : [];
		const browserProtocol = entries[entries.length - 1]?.nextHopProtocol || null;
		const serverProtocol = SERVER_PROTOCOLS[server.httpProtocol];
		const details = {server, browserProtocol};
		if (!['http/1.0', 'http/1.1', 'h2', 'h3'].includes(browserProtocol) || !serverProtocol) {
			return {
				success : false,
				status : 'Comparison unavailable',
				response : 'Could not compare browser and server protocols. TLS interception could not be assessed.',
				details,
			};
		}
		const mismatch = browserProtocol !== serverProtocol;
		return {
			success : !mismatch,
			status : mismatch ? 'Protocol translation observed' : 'No protocol difference observed',
			response : `Browser: ${browserProtocol}; server: ${serverProtocol}. ${mismatch
				? 'An intermediary may be involved; this does not establish TLS interception.'
				: 'Matching protocols do not rule out TLS interception.'}`,
			details,
		};
	} catch (error) {
		return {success : false, response : error.name === 'AbortError' ? 'Connection check timed out' : 'Connection check failed'};
	} finally {
		clearTimeout(timeout);
	}
}
