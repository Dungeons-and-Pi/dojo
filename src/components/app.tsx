import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import { Main } from './landing/main';
import { Player } from './landing/player';
import { Test } from './landing/test';

export class App extends React.Component {
	public render() {
		return (
			<HashRouter>
				<Switch>
					<Route path='/player'>
						<Player />
					</Route>
					<Route path='/test'>
						<Test />
					</Route>
					<Route>
						<Main />
					</Route>
				</Switch>
			</HashRouter>
		);
	}
}
