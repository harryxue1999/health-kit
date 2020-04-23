import React from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

export default class RootPage extends React.Component {

    render() {
        return (
            <Paper>
                <Typography variant="h5" align="center" component="h1" gutterBottom style={{ paddingTop: 80 }}>
                    未登录
                </Typography>
                <Button variant="contained" color="primary" href="/admin/login">使用 wisc.edu 邮箱登录</Button>
            </Paper>
        );
    }
}
