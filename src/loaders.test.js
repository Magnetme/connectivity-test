import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {loadAsStyleSheet} from './loaders';
import tests from './internalTests';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
	document.head.innerHTML = '';
});

test('OAuth loads the requested CSS without applying it to the diagnostic page', async () => {
	vi.spyOn(document.head, 'appendChild').mockImplementation(element => {
		expect(element.tagName).toBe('LINK');
		expect(element.href).toBe('https://oauth.magnet.me/static/css/main.css');
		expect(element.rel).toBe('stylesheet');
		expect(element.media).toBe('not all');
		element.dispatchEvent(new Event('load'));
		return element;
	});
	await expect(tests.find(test => test?.name === 'OAuth').test()).resolves.toMatchObject({success : true});
	expect(vi.getTimerCount()).toBe(0);
});

test('stylesheet load errors fail and clear the timer', async () => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
	vi.spyOn(document.head, 'appendChild').mockImplementation(element => {
		element.dispatchEvent(new Event('error'));
		return element;
	});
	await expect(loadAsStyleSheet('https://example.com/main.css')()).resolves.toMatchObject({success : false});
	expect(vi.getTimerCount()).toBe(0);
});
