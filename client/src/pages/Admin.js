import React from 'react';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Collapse from '@material-ui/core/Collapse'
import Fab from '@material-ui/core/Fab';
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InfoIcon from '@material-ui/icons/Info';
import io from 'socket.io-client';

export default class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            sorted: [],
            maxRows: 20,
            pageNum: 1,
            dialogOpen: false,
            dialogUser: {},
            nameFilterBar: false,
            addrFilterBar: false,
            confirmDialog: false,
            success: false,
            error: false,
            nameVal: '',
            addrVal: ''
        };
    }

    async componentDidMount() {
        if (!this.props.store.hasPerm) return;

        const socket = io();
        socket.on('delivery', data => this.onDelivery(data));

        const res = await fetch('/admin/all');
        const data = await res.json();
        this.setState({ users: data, sorted: data });
    }

    showDialog(user) {
        const { kids, equipment, symptoms, info } = user;
        const hasKid = kids ? '有小孩' : '';
        const hasSymptoms = symptoms.length > 0 ? '有症状;   ' : '';
        const equipmentList = equipment.join(', ');
        const otherInfo = info ? ';  其它信息: ' + info : '';
        const dialogContent = `${hasSymptoms}防疫物资：${equipmentList || '无'} ${otherInfo}`;

        this.setState({
            dialogOpen: true,
            dialogUser: user,
            dialogContent
        });
    }

    async deliver() {
        const { users, sorted, dialogUser } = this.state;
        const { wechat } = dialogUser;

        this.setState({ confirmDialog: false });

        const res = await fetch('/admin/deliver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wechat })
        });
        const data = await res.json();

        if (data.success) {
            this.setState({ success: true });
            setTimeout(() => {
                this.setState({ success: false });
            }, 5000);
        } else if (data.error) {
            this.setState({ error: true });
            setTimeout(() => {
                this.setState({ error: false });
            }, 5000);
        }
    }

    // Socket delivery event emitted
    onDelivery({ wechat }) {
        const { users, sorted } = this.state;

        const newUsersList = users.filter(a => a.wechat !== wechat);
        const newSortedList  = users.filter(a => a.wechat !== wechat);

        this.setState({ users: newUsersList, sorted: newSortedList });
    }

    // Display users based on some filter
    showUsers (pageIndex) {
        const { sorted, maxRows } = this.state;
        const startIndex = pageIndex * maxRows;
        const endIndex = (startIndex + maxRows) > sorted.length ? sorted.length : startIndex + maxRows;

        const sortedArray = sorted.slice(startIndex, endIndex);

        return sortedArray.map(user => {
            
            return (
                <TableRow key={user.wechat}>
                    <TableCell>
                        <Fab color={user.priority ? "primary" : user.need ? "inherit" : "secondary"} size="small" variant="outlined" onClick={() => this.showDialog(user)}>
                            <InfoIcon/>
                        </Fab>
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.addr1}</TableCell>
                    <TableCell>{user.addr2}</TableCell>
                </TableRow>
            );

        });
    }

    // Find by name
    findName(name) {
        
        if (!name) {
            this.setState({ sorted: this.state.users });
            return;
        }
        const regexp = new RegExp(name.trim(), 'i');
        const { users } = this.state;
        
        const sorted = users.filter(a => regexp.test(a.name));

        this.setState({ sorted, pageNum: 1 });
    }

    // Find by address (match) and sort by Apartment num
    findAndSortAddr(addr) {
        
        if (!addr) {
            this.setState({ sorted: this.state.users });
            return;
        }
        const regexp = new RegExp(addr.trim(), 'i');
        const { users } = this.state;
        
        const sorted = users.filter(a => regexp.test(a.addr1)).sort((a, b) => {
            const numFormat = /^\d+/g;
            const matchA = a.addr2.match(numFormat);
            const matchB = b.addr2.match(numFormat);

            if (!(matchA && matchB)) return a.addr2.localeCompare(b.addr2);
            else return +matchA - +matchB;
        });

        this.setState({ sorted, pageNum: 1 });
    }

    render() {
        const { email, name, hasPerm } = this.props.store;
        const { sorted, maxRows, pageNum } = this.state;
        const { length } = sorted;

        if (hasPerm) return (
            <>
                <Typography variant="h5" align="center" component="h1" gutterBottom style={{ paddingTop: 80 }}>
                    { `${name}: ${email}` }
                </Typography>
                <Button variant="contained" color="primary" href="/admin/logout">退出登录</Button>
                <br/><br/>
                <Collapse in={this.state.success}>
                    <Alert severity="success">成功递送健康包</Alert>
                </Collapse>
                <Collapse in={this.state.error}>
                    <Alert severity="error">递送健康包失败：已递送</Alert>
                </Collapse>
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
                                <TableCell style={{ paddingBottom: 0 }}>Action</TableCell>
                                <TableCell>
                                    <TextField
                                    size="small"
                                    label="姓名..."
                                    type="text"
                                    onChange={e => {
                                        // this.setState({ addrVal: '' });
                                        this.findName(e.target.value);
                                    }}
                                />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                    size="small"
                                    label="地址..."
                                    type="text"
                                    onChange={e => {
                                        // this.setState({ nameVal: '' });
                                        this.findAndSortAddr(e.target.value);
                                    }}
                                />
                                </TableCell>
                                <TableCell style={{ paddingBottom: 0 }}>门牌号</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{this.showUsers(this.state.pageNum - 1)}</TableBody>
                    </Table>
                </TableContainer>
                <ButtonGroup size="small" style={{ padding: 30 }}>
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
                <Dialog open={this.state.dialogOpen} onClose={() => this.setState({ dialogOpen: false })}>
                    <DialogTitle>{this.state.dialogUser.name}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{this.state.dialogContent}</DialogContentText>
                        <DialogContentText>邮件：{this.state.dialogUser.email}</DialogContentText>
                        <DialogContentText>微信：{this.state.dialogUser.wechat}</DialogContentText>
                        <DialogContentText>电话：{this.state.dialogUser.phone}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ dialogOpen: false })}>返回</Button>
                        <Button color="primary" onClick={() => this.setState({ dialogOpen: false, confirmDialog: true })}>递送健康包</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
                    <DialogTitle>确认已将健康包递送至{this.state.dialogUser.name}?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>此操作无法撤回，请再次确认健康包已送达！</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ confirmDialog: false })}>取消</Button>
                        <Button color="primary" onClick={() => this.deliver()}>确认</Button>
                    </DialogActions>
                </Dialog>
            </>
        );

        else return (
            <>
                <Typography variant="h5" align="center" component="h1" gutterBottom style={{ paddingTop: 80 }}>
                    {email} - 无权限
                </Typography>
                <Button variant="contained" color="primary" href="/admin/logout">请您退出登录</Button>
            </>
        );
    }
}
