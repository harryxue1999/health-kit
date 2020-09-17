import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';
import logo from './logo.svg';
import AdminStore from './stores/AdminStore';
import { AdminPage, RootPage, SignupPage, UserPage, UserPageSecondPass } from './pages';
import './App.css';

import AppBar from '@material-ui/core/AppBar';
import ToolBar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import LightModeIcon from '@material-ui/icons/WbSunny';
import DarkModeIcon from '@material-ui/icons/NightsStay';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';


function App() {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  console.log(prefersDarkMode);

  const [darkMode, setDarkMode] = useState(useMediaQuery('(prefers-color-scheme: dark)'));

  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#92151a'
      },
      secondary: {
        main: '#d7ccc8'
      }
    }
  });

  const lightTheme = createMuiTheme({
    palette: {
      type: 'light',
      primary: {
        main: '#92151a'
      },
      secondary: {
        main: '#d7ccc8'
      }
    }
  });
  
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

  useEffect(() => {
    fetchInfo();
  }, ['']);


  if (AdminStore.loading) return (<div></div>);

  // Redirect to user page if logged in
  const indexPage = AdminStore.loggedIn ? <AdminPage store={AdminStore}/> : <RootPage/>;

  return (
    <ThemeProvider theme={!darkMode ? darkTheme : lightTheme}>
      <AppBar position="fixed">
        <ToolBar>
          <img className="app-logo" src={logo}/>
          <Typography variant="h6">CSSA健康包分发</Typography>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle Light/Dark mode">
            {!darkMode ? <DarkModeIcon/> : <LightModeIcon/>}
          </IconButton>
        </ToolBar>
      </AppBar>
      <Router>
        <div className="App">
          <CssBaseline/>
          <Switch>
            <Route exact path="/user/:hash"><UserPage/></Route>
            {/* <Route exact path="/signup"><SignupPage/></Route> */}
            {/* <Route exact path="/user"></Route> */}
            <Route exact path="/">{indexPage}</Route>
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default observer(App);
