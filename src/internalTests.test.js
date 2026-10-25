import tests from './internalTests';

beforeEach(() => {
	global.fetch = jest.fn();
	jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	delete global.fetch;
	jest.restoreAllMocks();
});

test('TLS 1.2 is listed immediately above TLS 1.3', () => {
	const names = tests.filter(Boolean).map(test => test.name);
	expect(names[names.indexOf('TLSv1.3') - 1]).toBe('TLSv1.2');
});

test.each([
	['TLSv1.2', 'TLSv1.2', true],
	['TLSv1.2', 'TLSv1.3', true],
	['TLSv1.2', 'TLSv1.1', false],
	['TLSv1.3', 'TLSv1.3\n', true],
	['TLSv1.3', 'TLSv1.2', false],
	['TLSv1.2', '<html>error</html>', false],
])('%s minimum with %s returns %s', async (name, protocol, success) => {
	fetch.mockResolvedValue({ok : true, text : async () => protocol});
	await expect(tests.find(test => test?.name === name).test()).resolves.toMatchObject({success});
	expect(fetch).toHaveBeenCalledWith('https://clients.magnet.me/ssl_protocol', {mode : 'cors'});
});

test('an HTTP error cannot pass a TLS check even if the body contains a matching version', async () => {
	fetch.mockResolvedValue({ok : false, text : async () => 'TLSv1.2'});
	await expect(tests.find(test => test?.name === 'TLSv1.2').test()).resolves.toMatchObject({success : false});
});

test('a network error fails the TLS check', async () => {
	fetch.mockRejectedValue(new TypeError('Network error'));
	await expect(tests.find(test => test?.name === 'TLSv1.2').test()).resolves.toMatchObject({success : false});
});
