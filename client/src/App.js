import React from 'react';
import { observer } from 'mobx-react';
import logo from './logo.svg';
import UserStore from './stores/UserStore';
import RegisterForm from './RegisterForm';
import UserPage from './UserPage';
import './App.css';

class App extends React.Component {

  // Gets current user login status when page loads
  async componentDidMount() {
    try {
      const res = await fetch('/user/status', { method: 'POST' });
      const data = await res.json();

      UserStore.loggedIn = data.loggedIn;
      UserStore.email = data.email;
      UserStore.name = data.name;

    } catch(e) {
      UserStore.loggedIn = false;
    }

    UserStore.loading = false;
  }

  // Handles logout
  async logout() {
    try {
      const res = await fetch('/user/logout', { method: 'POST' });
      const data = await res.json();

      if (data.success) UserStore.loggedIn = false;
      else throw('Logout unsuccessful');

    } catch(e) {
      // No change in loggedIn state
    }
  }

  render() {
    const UserView = UserStore.loggedIn
      ? <UserPage store={UserStore} onClick={this.logout} />
      : <RegisterForm />;
    const Content = !UserStore.loading ? UserView : '';

    return (
      <div className="App">
        {Content}
      </div>
    );
  }

}

export default observer(App);
