import {expect, test, vi} from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import App from './App';

const {mockCheck} = vi.hoisted(() => ({mockCheck : vi.fn()}));
vi.mock('./internalTests', () => ({default : [undefined, {
	name : 'Direct connection',
	description : 'Do the browser and Magnet.me observe the same HTTP protocol?',
	test : () => mockCheck(),
}]}));
vi.mock('react-device', () => ({default : () => null}));

test.each([
	{success : true, status : 'No protocol difference observed', response : 'Matching protocols do not rule out TLS interception.', details : {browserProtocol : 'h2', server : {httpProtocol : 'HTTP/2.0', requestId : 'example'}}},
	{success : false, status : 'Protocol translation observed', response : 'An intermediary may be involved.', details : {browserProtocol : 'h2', server : {httpProtocol : 'HTTP/1.1'}}},
	{success : false, status : 'Comparison unavailable', response : 'Could not compare browser and server protocols.'},
	{success : false, response : 'Connection check timed out'},
])('Direct connection renders $success compactly and records its full result in JSON', async result => {
	vi.useFakeTimers();
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	vi.spyOn(console, 'log').mockImplementation(() => {});
	mockCheck.mockClear();
	mockCheck.mockResolvedValue(result);
	let finishMetadata;
	global.fetch = vi.fn(url => Promise.resolve({
		text : () => url.endsWith('/ip') ? new Promise(resolve => { finishMetadata = resolve; }) : Promise.resolve('metadata'),
		json : async () => ({}), status : 200,
	}));
	const container = document.createElement('div');
	try {
		await act(async () => { ReactDOM.render(<App/>, container); });
		await act(async () => { vi.advanceTimersByTime(2000); });
		const row = Array.from(container.querySelectorAll('tr')).find(row => row.firstChild.textContent === 'Direct connection');
		expect(container.querySelectorAll('tr')).toHaveLength(4);
		expect(row.lastChild.textContent).toBe(result.success ? 'Passed' : 'Failed');
		expect(row.textContent).not.toContain(result.response);
		expect(JSON.parse(container.querySelector('pre code').textContent).directConnection).toEqual(result);
		// An independent metadata request finishing later must retain the comparison.
		await act(async () => { finishMetadata('192.0.2.1'); });
		const environment = JSON.parse(container.querySelector('pre code').textContent);
		expect(environment.ip).toBe('192.0.2.1');
		expect(environment.directConnection).toEqual(result);
		expect(mockCheck).toHaveBeenCalledTimes(1);
	} finally {
		act(() => { ReactDOM.unmountComponentAtNode(container); });
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.restoreAllMocks();
		delete global.fetch;
	}
});
