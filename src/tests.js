function testOf(name, description, test) {
	const randomSecondDelay = Math.floor(Math.random() * 10) + 1;
	const result = Math.random() > 0.4;
	return {
		name,
		description,
		test : new Promise(resolve => {
			setTimeout(() => resolve(result), randomSecondDelay * 1000)
		}),
	}
}

const tests = [
	testOf('DNS resolution', 'Can your computer translate Magnet.me?', () => Promise.resolve(true)),
	testOf('IPv4 test', 'Does connecting over ipv4 work?', () => true),
	testOf('IPv6 test', 'Does connecting over ipv6 work?', () => Promise.resolve(true)),
	testOf('HTTPS test', 'Can you communicate over HTTPS', () => Promise.resolve(true)),
	testOf('Image test', 'Can you reach our imaging subsystem?', () => Promise.resolve(true)),
	testOf('API test', 'Can you reach our APIs?', () => Promise.resolve(true)),
	testOf('Web test', 'Can you reach our web servers?', () => Promise.resolve(true)),
	testOf('HTTP2 test', 'Can you communicate over HTTP2', () => Promise.resolve(true)),
];

export default tests;
