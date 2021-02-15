import { CloseCircleOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import React, { ErrorInfo } from 'react';

import { Textbox } from '../controls/textbox';

interface ErrorBoundaryProps {
}

interface ErrorBoundaryState {
	error: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			error: null
		};
	}

	protected static getDerivedStateFromError(error: any) {
		return {
			error: error
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Error recorded by ErrorBoundary:');
		console.error(error.name);
		console.error(error.message);
		console.error(error.stack);
		console.error(errorInfo.componentStack);
	}

	public render() {
		if (this.state.error) {
			return (
				<RenderError error={this.state.error} />
			);
		}

		return this.props.children;
	}
}

interface RenderErrorProps {
	error: any;
}

export class RenderError extends React.Component<RenderErrorProps> {
	private showError() {
		notification.open({
			message: (
				<div>
					<div className='subheading'>error</div>
					<Textbox text={this.props.error} multiLine={true} onChange={text => null} />
				</div>
			),
			closeIcon: <CloseCircleOutlined />,
			duration: 5
		});
	}
	public render() {
		return (
			<div className='render-error'>
				<div className='message'>error</div>
				<div className='message'>please refresh</div>
				<button className='link' onClick={() => this.showError()}>details</button>
			</div>
		);
	}
}
