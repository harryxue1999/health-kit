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
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import io from 'socket.io-client';

const locationMap = [ 'Humanities', 'Sheboygan', 'Eagle Heights' ];

export default class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            sorted: [],
            maxRows: 20,
            pageNum: 1,
            dialogOpen: false,
            dialogUser: {
                symptoms: [],
                equipment: []
            },
            confirmDialog: false,
            success: false,
            error: false,
            nameVal: '',
            addrVal: '',
            conflict: false,
        };
    }

    async componentDidMount() {
        if (!this.props.store.hasPerm) return;

        const socket = io();
        socket.on('delivery', data => this.onDelivery(data));
        socket.on('timeChange', data => this.onTimeChange(data));
        socket.on('userConfirm', data => this.onUserConfirm(data));

        const res = await fetch('/admin/all');
        const data = await res.json();

        const newData = data.sort((a, b) => a.time.localeCompare(b.time) );

        this.setState({ users: newData, sorted: newData });
    }

    showDialog(user) {
        this.setState({
            dialogOpen: true,
            dialogUser: user
        });
    }

    async deliver() {
        const { dialogUser } = this.state;
        const { email } = dialogUser;

        this.setState({ confirmDialog: false });

        const res = await fetch('/admin/deliver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
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

    async reviseTime() {
        const { dialogUser } = this.state;
        const { email, newTime } = dialogUser;

        const res = await fetch('/admin/time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newTime })
        });
        const data = await res.json();

        this.setState({ reviseDialog: false });
    }

    // Socket delivery event emitted
    onDelivery({ email }) {
        const { users, sorted } = this.state;

        const newUsersList = users.filter(a => a.email !== email);
        const newSortedList  = sorted.filter(a => a.email !== email);

        this.setState({ users: newUsersList, sorted: newSortedList });
    }

    // Socket time change event emitted
    onTimeChange({ email, newTime }) {
        const { users, sorted } = this.state;

        let usersCopy = users;
        let sortedCopy = sorted;

        const userIndex = users.findIndex(u => u.email === email);
        const newUser = Object.assign({}, users[userIndex], { time: newTime, timeOk: false, timeBad: false });
        usersCopy[userIndex] = newUser;
        
        const sortedIndex = sorted.findIndex(u => u.email === email);
        const newSorted = Object.assign({}, sorted[sortedIndex], { time: newTime, timeOk: false, timeBad: false });
        sortedCopy[sortedIndex] = newSorted;

        if (newUser.email === this.state.dialogUser.email) this.setState({ dialogUser: newUser });

        this.setState({ users: usersCopy, sorted: sortedCopy });
    }

    // Socket user confirm event emitted
    onUserConfirm({ email, timeOk, timeBad, proposedTime }) {
        const { users, sorted } = this.state;

        let usersCopy = users;
        let sortedCopy = sorted;

        const userIndex = users.findIndex(u => u.email === email);
        const newUser = Object.assign({}, users[userIndex], { timeOk, timeBad, proposedTime });
        usersCopy[userIndex] = newUser;
        
        const sortedIndex = sorted.findIndex(u => u.email === email);
        const newSorted = Object.assign({}, sorted[sortedIndex], { timeOk, timeBad, proposedTime });
        sortedCopy[sortedIndex] = newSorted;

        if (newUser.email === this.state.dialogUser.email) this.setState({ dialogUser: newUser });

        this.setState({ users: usersCopy, sorted: sortedCopy });
    }

    // Display users based on some filter
    showUsers (pageIndex) {
        const { sorted, maxRows } = this.state;
        const startIndex = pageIndex * maxRows;
        const endIndex = (startIndex + maxRows) > sorted.length ? sorted.length : startIndex + maxRows;

        const sortedArray = sorted.slice(startIndex, endIndex);

        return sortedArray.map(user => {
            
            return (
                <TableRow key={user.email}>
                    <TableCell>
                        <Fab color={user.symptoms.length > 0 ? "primary" : "inherit"} size="small" onClick={() => this.showDialog(user)}>
                            {!user.timeOk && !user.timeBad ? (<ContactSupportIcon/>) : user.timeBad ? (<WarningIcon/>) : (<AssignmentTurnedInIcon/>)}
                        </Fab>
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{locationMap[user.location]}</TableCell>
                    <TableCell>{user.time}</TableCell>
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

    // Find by location and sort by time
    findLocationAndSort(addr) {
        
        if (!addr) {
            this.setState({ sorted: this.state.users });
            return;
        }
        const regexp = new RegExp(addr.trim(), 'i');
        const { users } = this.state;

        const target = regexp.test('humanities') ? 0
            : regexp.test('sheboygan') ? 1
            : regexp.test('eagle') ? 2 : -1;
        
        const sorted = users
            .filter(a => a.location === target)
            .sort((a, b) => a.time.localeCompare(b.time));

        this.setState({ sorted, pageNum: 1 });
    }

    showOnlyConflict(option) {
        const { sorted, users } = this.state;

        if (option) return this.setState({ sorted: users });

        const newSorted = sorted.filter(a => a.timeBad);

        this.setState({ sorted: newSorted });
    }

    render() {
        const { email, name, hasPerm } = this.props.store;
        const { sorted, maxRows, pageNum } = this.state;
        const { length } = sorted;

        if (hasPerm) return (
            <div style={{ padding: 16, margin: 'auto' }}>
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
                <br/>
                <Button size="small" onClick={() => this.setState({ filterBar: !this.state.filterBar })}>Filter</Button>
                <Collapse in={this.state.filterBar}>
                    <FormControl component="fieldset">
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox name="conflict"
                                checked={this.state.conflict}/>}
                                onChange={e => {
                                    this.setState({ conflict: !this.state.conflict });
                                    this.showOnlyConflict(this.state.conflict);
                                }}
                                label="仅显示时间冲突"
                            />
                        </FormGroup>
                    </FormControl>
                </Collapse>
                {/* Tables here */}
                <TableContainer component={Paper}>
                    <Table style={{wordBreak: 'break-all' }}>
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
                                    label="区域..."
                                    type="text"
                                    onChange={e => {
                                        // this.setState({ nameVal: '' });
                                        this.findLocationAndSort(e.target.value);
                                    }}/>
                                </TableCell>
                                <TableCell style={{ paddingBottom: 0 }}>时间</TableCell>
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
                    <DialogTitle>{this.state.dialogUser.name} @ {this.state.dialogUser.time}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{this.state.dialogUser.kids ? '有小孩' : ''}</DialogContentText>
                        <DialogContentText>{this.state.dialogUser.symptoms.length > 0 ? '有症状' : ''}</DialogContentText>
                        <DialogContentText>{this.state.dialogUser.travel ? '有出行计划' : ''}</DialogContentText>
                        <DialogContentText>防疫物资：{this.state.dialogUser.equipment.join(', ') || '无'}</DialogContentText>
                        <DialogContentText>邮件：{this.state.dialogUser.email}</DialogContentText>
                        <DialogContentText>微信：{this.state.dialogUser.wechat}</DialogContentText>
                        <DialogContentText>电话：{this.state.dialogUser.phone}</DialogContentText>
                        <DialogContentText>{this.state.dialogUser.timeBad ? '--------------' : ''}</DialogContentText>
                        <DialogContentText>{this.state.dialogUser.timeBad ? '时间冲突 - 备注：' : ''}</DialogContentText>
                        <DialogContentText>{this.state.dialogUser.timeBad ? this.state.dialogUser.proposedTime : ''}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ dialogOpen: false, reviseDialog: true })}>修改时间</Button>
                        <Button color="primary" onClick={() => this.setState({ dialogOpen: false, confirmDialog: true })}>递送健康包</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
                    <DialogTitle>确认已健康包已由 {this.state.dialogUser.name} 自取?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>此操作无法撤回，请再次确认健康包已收到！</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ confirmDialog: false })}>取消</Button>
                        <Button color="primary" onClick={() => this.deliver()}>确认</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.reviseDialog} onClose={() => this.setState({ reviseDialog: false, dialogOpen: true })}>
                    <DialogTitle>修改 {this.state.dialogUser.name} 的领取时间</DialogTitle>
                    <DialogContent>
                    <TextField
                        label="新的领取时间"
                        type="text"
                        placeholder={this.state.dialogUser.time}
                        autoFocus
                        onChange={e => {
                            // this.setState({ nameVal: '' });
                            const dialogUser = {...this.state.dialogUser};
                            dialogUser.newTime = e.target.value;
                            this.setState({ dialogUser });
                        }}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ reviseDialog: false, dialogOpen: true })}>返回</Button>
                        <Button color="primary" onClick={() => this.reviseTime()}>确认修改</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );

        else return (
            <div>
                <Typography variant="h5" align="center" component="h1" gutterBottom style={{ paddingTop: 80 }}>
                    {email} - 无权限
                </Typography>
                <Button variant="contained" color="primary" href="/admin/logout">请您退出登录</Button>
            </div>
        );
    }
}
