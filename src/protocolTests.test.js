import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {checkHttpProtocol} from './protocolTests';

const flushPromises = async () => {
	for (let i = 0; i < 8; i++) await Promise.resolve();
};

const reply = (protocol, ok = true) => ({ok, status : ok ? 200 : 503, text : vi.fn().mockResolvedValue(protocol)});

beforeEach(() => {
	vi.useFakeTimers();
	global.fetch = vi.fn();
});

afterEach(() => {
	vi.clearAllTimers();
	vi.useRealTimers();
	delete global.fetch;
});

test('HTTP/2 checks a successful, fresh server response and trims whitespace', async () => {
	fetch.mockResolvedValue(reply('h2\n'));
	await expect(checkHttpProtocol('h2')()).resolves.toMatchObject({success : true});
	expect(fetch).toHaveBeenCalledWith('https://clients.magnet.me/http_version', expect.objectContaining({cache : 'no-store', mode : 'cors'}));
	expect(vi.getTimerCount()).toBe(0);
});

test('HTTP/3 selected instead of HTTP/2 is inconclusive, not a false failure or pass', async () => {
	fetch.mockResolvedValue(reply('h3'));
	await expect(checkHttpProtocol('h2')()).resolves.toMatchObject({success : null, response : expect.stringContaining('Negotiated h3')});
});

test('HTTP/3 allows negotiation after the initial Alt-Svc response', async () => {
	fetch.mockResolvedValueOnce(reply('h2')).mockResolvedValueOnce(reply('h3'));
	const result = checkHttpProtocol('h3')();
	// Flush fetch and body promises before advancing the retry delay.
	await flushPromises();
	vi.advanceTimersByTime(500);
	await expect(result).resolves.toMatchObject({success : true, response : 'Negotiated h3'});
	expect(fetch).toHaveBeenCalledTimes(2);
	expect(vi.getTimerCount()).toBe(0);
});

test('HTTP/3 fallback stays inconclusive with a fixed request budget', async () => {
	fetch.mockResolvedValue(reply('h2'));
	const result = checkHttpProtocol('h3')();
	for (let i = 0; i < 3; i++) {
		await flushPromises();
		vi.advanceTimersByTime(500);
	}
	await expect(result).resolves.toMatchObject({success : null, response : expect.stringContaining('Negotiated h2')});
	expect(fetch).toHaveBeenCalledTimes(4);
	expect(vi.getTimerCount()).toBe(0);
});

test.each([
	['HTTP error', () => Promise.resolve(reply('h2', false))],
	['malformed response', () => Promise.resolve(reply('<html>error</html>'))],
	['network error', () => Promise.reject(new TypeError('Network error'))],
	['body error', () => Promise.resolve({ok : true, text : () => Promise.reject(new Error('body error'))})],
])('%s cannot pass a protocol check', async (name, request) => {
	fetch.mockImplementation(request);
	await expect(checkHttpProtocol('h2')()).resolves.toMatchObject({success : false});
	expect(vi.getTimerCount()).toBe(0);
});

test('the timeout covers response body consumption', async () => {
	fetch.mockImplementation((uri, {signal}) => Promise.resolve({
		ok : true,
		text : () => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))),
	}));
	const result = checkHttpProtocol('h3')();
	await Promise.resolve();
	vi.advanceTimersByTime(3000);
	await expect(result).resolves.toEqual({success : false, response : 'Protocol request timed out'});
	expect(fetch).toHaveBeenCalledTimes(1);
});
