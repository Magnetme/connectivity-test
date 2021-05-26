import ping from 'web-pingjs';

export function dummyTest() {
	const randomSecondDelay = Math.floor(Math.random() * 10) + 1;
	const result = {
		success : Math.random() > 0.4,
	};
	return async () => new Promise(resolve => setTimeout(() => resolve(result), randomSecondDelay * 1000));
}

const DELTA = 0.3;

export function pingTest(domain) {
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

export function performNetworkRequest(uri, mode = 'cors') {
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
