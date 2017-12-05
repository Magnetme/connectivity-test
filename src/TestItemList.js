import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './TestItemList.css';

const itemPropType = {
	name : PropTypes.string.isRequired,
	description : PropTypes.string.isRequired,
	test : PropTypes.func.isRequired,
};

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
		// Pick a delay between 250 and 2000ms
		const randomDelay = (Math.floor(Math.random() * 1750) + 250);
		const result = await new Promise(resolve => setTimeout(() => resolve(this.props.test()), randomDelay));

		if (!result.success) {
			console.warn(this.props.name, result);
		} else {
			console.log(this.props.name, result);
		}

		this.setState({result : result.success, isDone : true});
	}

	_renderResult() {
		if (!this.state.isDone) {
			return <span className="inProgress">In progress</span>;
		}
		return this.state.result ? <span className="pass">Passed</span> : <span className="fail">Failed</span>;
	}

	render() {

		return <tr>
			<td>{this.props.name}</td>
			<td>{this.props.description}</td>
			<td>{this._renderResult()}</td>
		</tr>
	}
}

class TestItemList extends PureComponent {

	static propTypes = {
		tests : PropTypes.arrayOf(PropTypes.shape(itemPropType)),
	};

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
			{this.props.tests.map((e, i) => <TestItemRow key={i} {...e} />)}
			</thead>

		</table>
	}
}

export default TestItemList;
