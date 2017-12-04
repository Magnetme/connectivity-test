import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './TestItemList.css';

const itemPropType = {
	name : PropTypes.string.isRequired,
	description : PropTypes.string.isRequired,
	test : PropTypes.object.isRequired,
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
		try {
			const result = await this.props.test;
			console.log(`${this.props.name}: ${result}`);
			this.setState({result, isDone : true});
		} catch (e) {
			console.warn(e);
			this.setState({result: false, isDone: true});
		}
	}

	_renderResult() {
		if (!this.state.isDone) {
			return 'In progress';
		}
		return this.state.result ? <span className="pass">Pass</span> : <span className="fail">Failure</span>;
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
				<th width={150}>Test</th>
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
