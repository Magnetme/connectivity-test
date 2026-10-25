const HTTP_VERSION_URL = 'https://clients.magnet.me/http_version';

export function checkHttpProtocol(expectedProtocol) {
	return async () => {
		// The first response advertises HTTP/3 via Alt-Svc. Allow time to negotiate it.
		const attempts = expectedProtocol === 'h3' ? 4 : 1;
		let observedProtocol;
		for (let attempt = 0; attempt < attempts; attempt++) {
			if (attempt > 0) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 3000);
			try {
				const response = await fetch(HTTP_VERSION_URL, {
					mode : 'cors',
					cache : 'no-store',
					signal : controller.signal,
				});
				if (!response.ok) {
					return {success : false, response : `Protocol endpoint returned HTTP ${response.status}`};
				}
				observedProtocol = (await response.text()).trim();
				if (observedProtocol === expectedProtocol) {
					return {success : true, response : `Negotiated ${observedProtocol}`};
				}
				if (!['h2', 'h3', 'http/1.0', 'http/1.1'].includes(observedProtocol)) {
					return {success : false, response : 'Unrecognized protocol response'};
				}
			} catch (error) {
				return {success : false, response : error.name === 'AbortError' ? 'Protocol request timed out' : 'Protocol request failed'};
			} finally {
				clearTimeout(timeout);
			}
		}
		// Fetch cannot force a protocol. A different selection does not prove lack of support.
		return {
			success : null,
			response : `Negotiated ${observedProtocol}; ${expectedProtocol} was not observed. Browser settings, proxies or network policy may affect protocol selection.`,
		};
	};
}
