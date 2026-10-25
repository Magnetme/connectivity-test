import React, {PureComponent} from 'react';
import './App.css';

class Header extends PureComponent {
	render() {
		return (
			<a href="https://magnet.me" target="_blank" rel="noopener noreferrer">
				<img alt="" src="https://cdn.magnet.me/images/logo-2015-full.svg" width={171}/>
			</a>
		);
	}
}

export default Header;
