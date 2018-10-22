import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './TestItemList.css';

const itemPropType = {
	name : PropTypes.string.isRequired,
	description : PropTypes.string.isRequired,
	test : PropTypes.func.isRequired,
};
const marginStyle = {
	height : 6,
	borderTop : '1px solid #DBDBDB',
};

const IN_PROGRESS = <span className="inProgress">In progress</span>;
const PASSED = <span className="pass">Passed</span>;
const FAILED = <span className="fail">Failed</span>;

class TestItemRow extends PureComponent {

	static propTypes = itemPropType;

	constructor(props) {
		super(props);
		this.state = {
			isDone : false,
			result : null,
		}
	}

	async componentDidMount() {
		if (this.isMarginOnly()) {
			// No need to execute tests for these
			return;
		}

		// Pick a delay between 250 and 2000ms
		// Otherwise the tests are being done too quickly and people think nothing really happened...
		const randomDelay = (Math.floor(Math.random() * 1750) + 250);
		const result = await new Promise(resolve => setTimeout(() => resolve(this.props.test()), randomDelay));

		if (!result.success) {
			console.warn(this.props.name, result);
		} else {
			console.log(this.props.name, result);
		}

		this.setState({result : result.success, isDone : true});
	}

	isMarginOnly() {
		return Object.keys(this.props).length === 0;
	}

	_renderResult() {
		if (!this.state.isDone) {
			return IN_PROGRESS;
		}
		return this.state.result ? PASSED : FAILED;
	}

	render() {
		if (this.isMarginOnly()) {
			return <tr style={marginStyle}>
				<td colspan="3" style={marginStyle}>{` `}</td>
			</tr>
		}

		return <tr>
			<td>{this.props.name}</td>
			<td>{this.props.description}</td>
			<td>{this._renderResult()}</td>
		</tr>
	}
}

class TestItemList extends PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			adBlockDetected : null
		};
		this.detectAdBlocker = this.detectAdBlocker.bind(this);
	}

	static propTypes = {
		tests : PropTypes.arrayOf(PropTypes.shape(itemPropType)),
	};

	componentDidMount() {
		// Slow this down for UX
		setTimeout(() => this.detectAdBlocker(), 920);
	}

	detectAdBlocker() {
		const head = document.getElementsByTagName('head')[0];

		const noAdBlockDetected = () => {
			this.setState({
				adBlockDetected : false
			});
		};

		const adBlockDetected = () => {
			this.setState({
				adBlockDetected : true
			});
		};

		// clean up stale bait
		const oldScript =
			document.getElementById('adblock-detection');
		if (oldScript) {
			head.removeChild(oldScript);
		}

		// Build the bait
		const script = document.createElement('script');
		script.id = 'adblock-detection';
		script.type = 'application/javascript';
		script.src = '/ads/analytics/tracking.js';
		script.onload = noAdBlockDetected;
		script.onerror = adBlockDetected;
		head.appendChild(script);

		setTimeout(() => {
			if (this.state.adBlockDetected === null) {
				// Still not resolved apparently, so probably an adblocker prevented the callbacks from firing
				console.log('Ad blocking test script callbacks did not fire, marking ad block as active');
				this.setState({adBlockDetected : true});
			}
		}, 5000)
	}

	adBlockView() {
		switch (this.state.adBlockDetected) {
			case true:
				return FAILED;
			case false:
				return PASSED;
			case null:
			default:
				return IN_PROGRESS;
		}
	}

	render() {
		return <table width="100%">
			<thead>
			<tr>
				<th width={160}>Test</th>
				<th>Description</th>
				<th width={100}>Status</th>
			</tr>
			</thead>
			<thead>
			<tr>
				<td>Executed at</td>
				<td>{new Date().toISOString()}</td>
				<td>{PASSED}</td>
			</tr>
			<tr>
				<td>Ad blocker</td>
				<td>Is any adblocker active?</td>
				<td>{this.adBlockView()}</td>
			</tr>
			{this.props.tests.map((e, i) => <TestItemRow key={i} {...e} />)}
			</thead>

		</table>
	}
}

export default TestItemList;
