import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            maxRows: 20,
            pageNum: 1,
            dialogOpen: false,
            dialogEmail: ''
        };
    }

    async componentDidMount() {
        if (!this.props.store.hasPerm) return;
        const res = await fetch('/admin/all');
        const data = await res.json();
        this.setState({ users: data });
    }

    showDialog(user) {
        this.setState({
            dialogOpen: true,
            dialogEmail: user.email
        });
    }

    sendEmail() {
        const user = this.state.dialogUser;

        this.setState({
            dialogOpen: false,
            dialogEmail: ''
        });
    }

    // Display users based on some filter
    showUsers (pageIndex) {
        const { users, maxRows } = this.state;
        const startIndex = pageIndex * maxRows;
        const endIndex = (startIndex + maxRows) > users.length ? users.length : startIndex + maxRows;

        const userArray = users.slice(startIndex, endIndex);

        return userArray.map(user => (
            <TableRow key={user.wechat}>
                <TableCell>
                    <Button variant="outlined" onClick={() => this.showDialog(user)}>投递</Button>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                {/* <TableCell>{user.email}</TableCell> */}
                <TableCell>{user.addr1}</TableCell>
                <TableCell>{user.addr2}</TableCell>
            </TableRow>
        ))
    }

    render() {
        const { email, name, hasPerm } = this.props.store;
        const { users, maxRows, pageNum } = this.state;
        const { length } = users;

        if (hasPerm) return (
            <React.Fragment>
                <h1>{name} {email}</h1>
                <Button variant="contained" color="primary" href="/admin/logout">退出登录</Button>
                <br/><br/>
                <ButtonGroup size="small">
                    <Button
                    disabled={this.state.pageNum === 1}
                    onClick={() => this.setState({ pageNum: pageNum - 1 })}
                    >上一页</Button>
                    <Button disabled >{
                    `${pageNum*maxRows-maxRows+1}-${pageNum*maxRows > length ? length : pageNum*maxRows} of ${length}`}
                    </Button>
                    <Button
                    disabled={this.state.pageNum === Math.ceil(length / maxRows)}
                    onClick={() => this.setState({ pageNum: pageNum + 1 })}
                    >下一页</Button>
                </ButtonGroup>

                {/* Tables here */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Action</TableCell>
                                <TableCell>姓名</TableCell>
                                {/* <TableCell>邮箱</TableCell> */}
                                <TableCell>地址1</TableCell>
                                <TableCell>地址2</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{this.showUsers(this.state.pageNum - 1)}</TableBody>
                    </Table>
                </TableContainer>
                <Dialog open={this.state.dialogOpen} onClose={() => this.setState({ dialogOpen: false })}>
                    <DialogTitle>{`发送“确认送达”邮件至 ${this.state.dialogEmail}?`}</DialogTitle>
                    <DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ dialogOpen: false })}>取消</Button>
                            <Button color="primary" onClick={() => this.sendEmail()}>确认发送</Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );

        else return (
            <React.Fragment>
                <h1>{email} - 无权限</h1>
                <Button variant="contained" color="primary" href="/admin/logout">请您退出登录</Button>
            </React.Fragment>
        );
    }
}
