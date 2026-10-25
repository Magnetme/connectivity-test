import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import TestItemList from './TestItemList';

test.each(['HTTP/2', 'HTTP/3', 'TLSv1.2', 'TLSv1.3'])('%s shows only Passed or Failed while other rows retain details', async protocol => {
	jest.useFakeTimers();
	jest.spyOn(console, 'warn').mockImplementation(() => {});
	jest.spyOn(console, 'log').mockImplementation(() => {});
	const container = document.createElement('div');
	const results = [
		{success : true, response : 'Negotiated h2'},
		{success : null, response : 'Negotiated h2; h3 was not observed'},
		{success : false, response : 'Protocol request timed out'},
	];
	try {
		await act(async () => {
			ReactDOM.render(<TestItemList tests={results.map((result, index) => ({
				name : `Protocol ${index}`,
				description : 'Protocol check',
				test : async () => result,
			})).concat(results.map(result => ({
				name : protocol,
				description : 'HTTP protocol check',
				test : async () => result,
			})))}/>, container);
		});
		await act(async () => { jest.advanceTimersByTime(2000); });
		const rows = Array.from(container.querySelectorAll('tr')).filter(row => row.textContent.startsWith('Protocol'));
		expect(rows[0].lastChild.textContent).toBe('PassedNegotiated h2');
		expect(rows[1].lastChild.textContent).toBe('Not observedNegotiated h2; h3 was not observed');
		expect(rows[2].lastChild.textContent).toBe('FailedProtocol request timed out');
		const protocolRows = Array.from(container.querySelectorAll('tr')).filter(row => row.firstChild.textContent === protocol);
		expect(protocolRows.map(row => row.lastChild.textContent)).toEqual(['Passed', 'Failed', 'Failed']);
	} finally {
		act(() => { ReactDOM.unmountComponentAtNode(container); });
		jest.clearAllTimers();
		jest.useRealTimers();
		jest.restoreAllMocks();
	}
});
