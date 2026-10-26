import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {checkConnection} from './connectionTest';
import {randomFillSync} from 'crypto';

const server = {
	requestId : 'a'.repeat(32), httpProtocol : 'HTTP/2.0', tlsProtocol : 'TLSv1.3',
	cipher : 'TLS_AES_256_GCM_SHA384', offeredCiphers : '', offeredGroups : '', sessionReused : 'r',
};
const reply = data => ({ok : true, json : async () => data});
let getEntries;
const originalCrypto = Object.getOwnPropertyDescriptor(window, 'crypto');

beforeEach(() => {
	Object.defineProperty(window, 'crypto', {configurable : true, value : {getRandomValues : randomFillSync}});
	global.fetch = vi.fn().mockResolvedValue(reply(server));
	getEntries = vi.fn().mockReturnValue([{nextHopProtocol : 'h2'}]);
	Object.defineProperty(window.performance, 'getEntriesByName', {configurable : true, value : getEntries});
});

afterEach(() => {
	if (originalCrypto) Object.defineProperty(window, 'crypto', originalCrypto);
	else delete window.crypto;
	delete global.fetch;
	delete window.performance.getEntriesByName;
	vi.useRealTimers();
});

test.each([
	['HTTP/1.0', 'http/1.0'], ['HTTP/1.1', 'http/1.1'], ['HTTP/2.0', 'h2'], ['HTTP/3.0', 'h3'],
])('matching %s observations do not claim the absence of interception', async (httpProtocol, browserProtocol) => {
	fetch.mockResolvedValue(reply({...server, httpProtocol}));
	getEntries.mockReturnValue([{nextHopProtocol : browserProtocol}]);
	await expect(checkConnection()).resolves.toMatchObject({
		success : true, status : 'No protocol difference observed',
		response : expect.stringContaining('do not rule out TLS interception'),
		details : {server : {...server, httpProtocol}, browserProtocol},
	});
	const [url, options] = fetch.mock.calls[0];
	expect(url).toMatch(/^https:\/\/clients\.magnet\.me\/connection\?probe=[a-f0-9]{32}$/);
	expect(options).toMatchObject({mode : 'cors', cache : 'no-store', credentials : 'omit'});
	expect(getEntries).toHaveBeenCalledWith(url, 'resource');
	expect(options.signal.aborted).toBe(false);
});

test('a mismatch reports protocol translation without asserting interception', async () => {
	fetch.mockResolvedValue(reply({...server, httpProtocol : 'HTTP/1.1'}));
	await expect(checkConnection()).resolves.toMatchObject({
		success : false, status : 'Protocol translation observed',
		response : expect.stringContaining('does not establish TLS interception'),
	});
});

test.each([[[]], [[{nextHopProtocol : ''}]], [[{nextHopProtocol : 'unknown'}]]])('missing or unsupported browser protocol fails the comparison: %j', async entries => {
	getEntries.mockReturnValue(entries);
	await expect(checkConnection()).resolves.toMatchObject({success : false, status : 'Comparison unavailable'});
});

test('Resource Timing API unavailable fails the comparison', async () => {
	delete window.performance.getEntriesByName;
	await expect(checkConnection()).resolves.toMatchObject({success : false, status : 'Comparison unavailable'});
});

test('an unknown server protocol fails the comparison', async () => {
	fetch.mockResolvedValue(reply({...server, httpProtocol : 'HTTP/9.0'}));
	await expect(checkConnection()).resolves.toMatchObject({success : false, status : 'Comparison unavailable'});
});

test('overlapping probes only read their own timing entry, even if responses finish out of order', async () => {
	let finishFirst;
	fetch.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }))
		.mockResolvedValueOnce(reply({...server, httpProtocol : 'HTTP/3.0'}));
	getEntries.mockImplementation(url => [{nextHopProtocol : url === fetch.mock.calls[0][0] ? 'h2' : 'h3'}]);
	const first = checkConnection();
	const second = await checkConnection();
	finishFirst(reply(server));
	expect((await first).details.browserProtocol).toBe('h2');
	expect(second.details.browserProtocol).toBe('h3');
	expect(fetch.mock.calls[0][0]).not.toBe(fetch.mock.calls[1][0]);
});

test.each([
	['HTTP failure', {ok : false, status : 404}, 'HTTP 404'],
	['redirect', {ok : true, redirected : true}, 'redirected'],
	['missing fields', reply({httpProtocol : 'HTTP/2.0'}), 'invalid diagnostic data'],
	['null JSON', reply(null), 'invalid diagnostic data'],
	['invalid JSON', {ok : true, json : async () => { throw new SyntaxError(); }}, 'failed'],
])('%s cannot become a successful observation', async (name, response, message) => {
	fetch.mockResolvedValue(response);
	await expect(checkConnection()).resolves.toMatchObject({success : false, response : expect.stringContaining(message)});
});

test('network errors are reported as failed checks', async () => {
	fetch.mockRejectedValue(new TypeError('Network error'));
	await expect(checkConnection()).resolves.toMatchObject({success : false, response : 'Connection check failed'});
});

test.each(['headers', 'body'])('timeout bounds waiting for response %s and clears its timer', async phase => {
	vi.useFakeTimers();
	fetch.mockImplementation((url, {signal}) => {
		const stalled = () => new Promise((resolve, reject) => {
			signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
		});
		return phase === 'headers' ? stalled() : Promise.resolve({ok : true, json : stalled});
	});
	const result = checkConnection();
	await Promise.resolve();
	vi.advanceTimersByTime(5000);
	await expect(result).resolves.toMatchObject({success : false, response : 'Connection check timed out'});
	expect(vi.getTimerCount()).toBe(0);
});
