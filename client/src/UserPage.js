import React from 'react';

export default class UserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { email: '' }
    }

    handleSubmit(e) {
        e.preventDefault();
        alert('Submit button pressed!');
    }

    handleChange(e) {
        this.setState({ email: e.target.value });
    }

    render() {
        const UserStore = this.props.store;
        const completeProfile = typeof UserStore.name !== 'undefined';
        
        return (
            <div className="user-landing">
                <h1>{this.props.store.name}</h1>
                <p>{this.props.store.email}</p>
                <button onClick={this.props.onClick}>退出登录</button>
            </div>
        );
    }
}
