import {loadAsStyleSheet} from './loaders';
import tests from './internalTests';

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
	document.head.innerHTML = '';
});

test('OAuth loads the requested CSS without applying it to the diagnostic page', async () => {
	jest.spyOn(document.head, 'appendChild').mockImplementation(element => {
		expect(element.tagName).toBe('LINK');
		expect(element.href).toBe('https://oauth.magnet.me/static/css/main.css');
		expect(element.rel).toBe('stylesheet');
		expect(element.media).toBe('not all');
		element.dispatchEvent(new Event('load'));
		return element;
	});
	await expect(tests.find(test => test?.name === 'OAuth').test()).resolves.toMatchObject({success : true});
	expect(jest.getTimerCount()).toBe(0);
});

test('stylesheet load errors fail and clear the timer', async () => {
	jest.spyOn(console, 'error').mockImplementation(() => {});
	jest.spyOn(document.head, 'appendChild').mockImplementation(element => {
		element.dispatchEvent(new Event('error'));
		return element;
	});
	await expect(loadAsStyleSheet('https://example.com/main.css')()).resolves.toMatchObject({success : false});
	expect(jest.getTimerCount()).toBe(0);
});
