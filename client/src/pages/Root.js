import React from 'react';
import Button from '@material-ui/core/Button';

export default class RootPage extends React.Component {

    render() {
        return (
            <React.Fragment>
                <h1>未登录</h1>
                <Button variant="contained" color="primary" href="/admin/login">使用 wisc.edu 邮箱登录</Button>
            </React.Fragment>
        );
    }
}
