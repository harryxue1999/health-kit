import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';
import logo from './logo.svg';
import AdminStore from './stores/AdminStore';
import { AdminPage, RootPage, UserPage } from './pages';
import './App.css';

import AppBar from '@material-ui/core/AppBar';
import ToolBar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography'

import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { red, green } from '@material-ui/core/colors';


function App() {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(() => createMuiTheme({
    palette: {
      type: prefersDarkMode ? 'dark' : 'light'
    }
  }), [ prefersDarkMode ]);
  
  // Gets current user login status when page loads
  async function fetchInfo() {
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
  async function logout() {
    try {
      const res = await fetch('/user/logout', { method: 'POST' });
      const data = await res.json();

      if (data.success) AdminStore.loggedIn = false;
      else throw new Error('Logout unsuccessful');

    } catch(e) {
      // No change in loggedIn state
    }
  }

  useEffect(() => {
    fetchInfo();
  }, []);


  if (AdminStore.loading) return (<div></div>);

  // Redirect to user page if logged in
  const indexPage = AdminStore.loggedIn ? <AdminPage store={AdminStore}/> : <RootPage/>;

  return (
    // <ThemeProvider theme={theme}>
    <>
      <AppBar position="fixed">
        <ToolBar>
          <Typography variant="h6">CSSA健康包分发</Typography>
        </ToolBar>
      </AppBar>
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/user/:hash"><UserPage theme={theme}/></Route>
            {/* <Route exact path="/user"></Route> */}
            <Route exact path="/">{indexPage}</Route>
          </Switch>
        </div>
      </Router>
    </>
    // </ThemeProvider>
  );
}

export default observer(App);
