import React from 'react';
import { Redirect } from 'react-router-dom';

export default class UserPage extends React.Component {

    render() {
        const UserStore = this.props.store;
        const profileComplete = typeof UserStore.name !== 'undefined';
        const { loggedIn } = UserStore;

        if (!loggedIn) return (<Redirect to="/"/>);
        
        return (
            <div className="user-landing">
                <h1>{this.props.store.name || 'Profile incomplete - Please verify your information'}</h1>
                <p>{this.props.store.email}</p>
                <button onClick={this.props.onClick}>退出登录</button>
            </div>
        );
    }
}
