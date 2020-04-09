import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';
import logo from './logo.svg';
import UserStore from './stores/UserStore';
import RegisterForm from './RegisterForm';
import UserPage from './UserPage';
import LoginPage from './LoginPage';
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
    if (UserStore.loading) return (<div></div>);

    // Redirect to user page if logged in
    const rootPage = UserStore.loggedIn ? (<Redirect to='/user'/>) : <RegisterForm/>;

    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/user/:id"><LoginPage store={UserStore} onClick={this.logout}/></Route>
            <Route exact path="/user"><UserPage store={UserStore} onClick={this.logout}/></Route>
            <Route exact path="/">{rootPage}</Route>
          </Switch>
        </div>
      </Router>
    );
  }

}

export default observer(App);
