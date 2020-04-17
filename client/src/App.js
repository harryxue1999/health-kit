import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';
import logo from './logo.svg';
import AdminStore from './stores/AdminStore';
import { AdminPage, RootPage, UserPage } from './pages';
import './App.css';

import AppBar from '@material-ui/core/AppBar';
import ToolBar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography'

class App extends React.Component {

  // Gets current user login status when page loads
  async componentDidMount() {
    AdminStore.loading = true;
    try {
      const res = await fetch('/admin/status', { method: 'POST' });
      const data = await res.json();

      AdminStore.loggedIn = data.loggedIn;
      AdminStore.email = data.email;
      AdminStore.name = data.name;
      AdminStore.hasPerm = data.hasPerm;

    } catch(e) {
      AdminStore.loggedIn = false;
    }

    AdminStore.loading = false;
  }

  // Handles logout
  async logout() {
    try {
      const res = await fetch('/user/logout', { method: 'POST' });
      const data = await res.json();

      if (data.success) AdminStore.loggedIn = false;
      else throw new Error('Logout unsuccessful');

    } catch(e) {
      // No change in loggedIn state
    }
  }

  render() {
    if (AdminStore.loading) return (<div></div>);

    // Redirect to user page if logged in
    const indexPage = AdminStore.loggedIn ? <AdminPage store={AdminStore}/> : <RootPage/>;

    return (
      <React.Fragment>
        <AppBar position="static">
          <ToolBar>
            <Typography variant="h6" color="inherit">CSSA健康包分发</Typography>
          </ToolBar>
        </AppBar>
        <Router>
          <div className="App">
            <Switch>
              <Route exact path="/user/:hash"><UserPage/></Route>
              {/* <Route exact path="/user"></Route> */}
              <Route exact path="/">{indexPage}</Route>
            </Switch>
          </div>
        </Router>
      </React.Fragment>
    );
  }

}

export default observer(App);
