import { BookOutlined, BulbOutlined, InfoCircleOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import React from 'react';

interface Props {
    sidebar: string | null;
    setSidebar: (type: string | null) => void;
}

export default class PageHeader extends React.Component<Props> {
    public render() {
        try {
            return (
                <div className='page-header'>
                    <div className='app-title app-name'>dojo</div>
                    <ToolOutlined
                        className={this.props.sidebar === 'tools' ? 'title-bar-icon selected' : 'title-bar-icon'}
                        title='tools'
                        onClick={() => this.props.setSidebar(this.props.sidebar === 'tools' ? null : 'tools')}
                    />
                    <BulbOutlined
                        className={this.props.sidebar === 'generators' ? 'title-bar-icon selected' : 'title-bar-icon'}
                        title='generators'
                        onClick={() => this.props.setSidebar(this.props.sidebar === 'generators' ? null : 'generators')}
                    />
                    <BookOutlined
                        className={this.props.sidebar === 'reference' ? 'title-bar-icon selected' : 'title-bar-icon'}
                        title='reference'
                        onClick={() => this.props.setSidebar(this.props.sidebar === 'reference' ? null : 'reference')}
                    />
                    <SearchOutlined
                        className={this.props.sidebar === 'search' ? 'title-bar-icon selected' : 'title-bar-icon'}
                        title='search'
                        onClick={() => this.props.setSidebar(this.props.sidebar === 'search' ? null : 'search')}
                    />
                    <InfoCircleOutlined
                        className={this.props.sidebar === 'about' ? 'title-bar-icon selected' : 'title-bar-icon'}
                        title='about'
                        onClick={() => this.props.setSidebar(this.props.sidebar === 'about' ? null : 'about')}
                    />
                </div>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}
