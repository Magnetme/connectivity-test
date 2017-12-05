// Helper
function loadAsElement(type, parent, options) {
	return async () => {
		const element = window.document.createElement(type);
		options(element);
		parent.appendChild(element);
		try {
			await new Promise((resolve, reject) => {
					const timeout = setTimeout(() => {
						console.warn('Rejected due to timeout');
						reject();
					}, 15000);
					element.addEventListener('load', () => {
						clearTimeout(timeout);
						resolve();
					}, false);
					element.addEventListener('error', () => {
						clearTimeout(timeout);
						reject()
					}, false);
					element.addEventListener('abort', () => {
						clearTimeout(timeout);
						reject()
					}, false);
				}
			);
			return {
				success : true,
				response : {}
			};
		} catch (e) {
			console.error(e);
			return {
				success : false,
				response : e
			};
		}
	}
}

export function loadAsScript(uri) {
	return loadAsElement('script', window.document.body, (e) => {
		e.src = uri;
		e.type = 'text/javascript';
	});
}

export function loadAsStyleSheet(uri) {
	return loadAsElement('link', window.document.head, (e) => {
		e.href = uri;
		e.type = 'text/css';
		e.rel = 'stylesheet';
	});
}
