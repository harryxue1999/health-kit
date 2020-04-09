import React from 'react';

export default class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { email: '' }
    }

    async submit(e) {
        e.preventDefault();
        try {
            const res = await fetch('/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.state.email })
            });

            const data = await res.json();
      
      
        } catch(e) {
            console.error(e);
        }
    }

    handleChange(e) {
        this.setState({ email: e.target.value });
    }

    render() {
        return (
            <div className="form-container">
                <form onSubmit={e => this.submit(e)}>
                    <label htmlFor="email">Email</label>
                    <input value={this.state.email} onChange={e => this.handleChange(e)} />
                    <input type="submit" value="注册" />
                </form>
            </div>
        );
    }
}
