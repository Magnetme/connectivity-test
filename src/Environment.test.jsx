import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import {expect, test, vi} from 'vitest';
import Environment from './Environment';

test('the real react-device package still renders device metadata', async () => {
	vi.useFakeTimers();
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.stubGlobal('fetch', vi.fn(async () => ({
		status: 200,
		text: async () => 'metadata',
		json: async () => ({}),
	})));
	const container = document.createElement('div');
	try {
		await act(async () => { ReactDOM.render(<Environment/>, container); });
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		const metadata = JSON.parse(container.querySelector('pre code').textContent);
		expect(metadata.screen.width).toBe(window.innerWidth);
		expect(metadata.browser.dataCookiesEnabled).toBe(window.navigator.cookieEnabled);
	} finally {
		act(() => { ReactDOM.unmountComponentAtNode(container); });
		vi.unstubAllGlobals();
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.restoreAllMocks();
	}
});
