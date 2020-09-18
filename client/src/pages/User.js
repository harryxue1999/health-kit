import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { TextField, Checkbox, Radio, Select } from 'final-form-material-ui';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Collapse from '@material-ui/core/Collapse'
import Alert from '@material-ui/lab/Alert'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import MuiTextField from '@material-ui/core/TextField';
import UserStore from '../stores/UserStore';

const symptomsList = [
  '咳嗽', '发热', '乏力', '头痛', '咽痛', '气促',
  '呼吸困难', '胸闷', '腹泻', '结膜充血', '其它症状'
];

const equipmentList = [
  'N95-KN95口罩', '医用口罩', '手套',
  '退烧药或相关药品', '其它物资'
];

const locationMap = [ 'Humanities', 'Sheboygan', 'Eagle Heights' ];

const validate = values => {
       const errors = {};
    if (!values.name) {
        errors.name = 'Required';
    }
    if (!values.phone) {
        errors.phone = 'Required';
    }
    if (!values.wechat) {
        errors.wechat = 'Required';
    }
    if (!values.email) {
        errors.email = 'Required';
    }
    if (!/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(values.email)) {
        errors.email = '请确认email格式';
    }

    return errors;
};

export default function UserPage({ theme }) {
    const [user, setUser] = useState({
        name: '',
        phone: 0,
        email: '',
        wechat: '',
        time: '',
        kids: false,
        symptoms: [],
        equipment: [],
        info: '',
        hasKids: false,
        travel: false,
        willTravel: false,
        location: 0,
        locationText: '',
        timeOk: false,
        timeBad: false,
        proposedTime: '',
    });
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [redirect, setRedirect] = useState('');
    const [visible, setVisible] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [timeSelectDialogOpen, setTimeSelectDialogOpen] = useState(false);
    const [timeOkDialogOpen, setTimeOkDialogOpen] = useState(false);
    const [timeBadDialogOpen, setTimeBadDialogOpen] = useState(false);
    const [userProposedTime, setUserProposedTime] = useState('');
    const { hash } = useParams();

    async function fetchInfo() {
        const res = await fetch('/user/' + hash, { method: 'POST' });
        const data = await res.json();
        if (data.user) {
            setExists(true);
        
            const {
                name, phone, email, wechat, time,
                kids, symptoms, equipment, info, travel, location,
                timeOk, timeBad, proposedTime, 
            } = data.user;

            const hasKids = kids ? 'yes' : 'no';
            const willTravel = travel ? 'yes' : 'no';
            const locationText = locationMap[location];

            setUser({
                name, phone, email, wechat, locationText, location,
                kids, symptoms, equipment, info, hasKids, willTravel, time,
                timeOk, timeBad, proposedTime,
            });
            UserStore.email = email;            
            
            // User has not indicated if time is ok or bad
            if (!timeOk && !timeBad) {
                setTimeSelectDialogOpen(true);
            }
        }

        setLoading(false);
    }

    async function timeOkConfirm () {
        const res = await fetch(`/user/${hash}/update`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.assign({}, user, { timeOk: true, onUserConfirm: true }))
        });
        const data = await res.json();
        
        const {
            name, phone, email, wechat, time,
            kids, symptoms, equipment, info, travel, location,
            timeOk, timeBad, proposedTime,
        } = data.user;

        const hasKids = kids ? 'yes' : 'no';
        const willTravel = travel ? 'yes' : 'no';
        const locationText = locationMap[location];

        setUser({
            name, phone, email, wechat, 
            kids, symptoms, equipment, info, time,
            hasKids, willTravel, location, locationText,
            timeOk, timeBad, proposedTime,
        });
      
        setTimeOkDialogOpen(false);
    }
    
    async function timeBadConfirm () {
      const res = await fetch(`/user/${hash}/update`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({}, user, { timeBad: true, proposedTime: userProposedTime, onUserConfirm: true }))
      });
      const data = await res.json();
      
      const {
          name, phone, email, wechat, time,
          kids, symptoms, equipment, info, travel, location,
          timeOk, timeBad, proposedTime,
      } = data.user;

      const hasKids = kids ? 'yes' : 'no';
      const willTravel = travel ? 'yes' : 'no';
      const locationText = locationMap[location];

      setUser({
          name, phone, email, wechat, 
          kids, symptoms, equipment, info, time,
          hasKids, willTravel, location, locationText,
          timeOk, timeBad, proposedTime,
      });
    
      setTimeBadDialogOpen(false);
  }

    async function finalSubmit (values) {
        values.kids = values.hasKids === 'yes';
        values.travel = values.willTravel === 'yes';

        // Normal submission flow
        const res = await fetch(`/user/${hash}/update`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
        });
        const data = await res.json();

        // Check if redirect needed
        if (hash !== data.hash) setRedirect(data.hash);

        const {
            name, phone, email, wechat, time,
            kids, symptoms, equipment, info, travel, location,
            timeOk, timeBad, proposedTime,
        } = data.user;

        const hasKids = kids ? 'yes' : 'no';
        const willTravel = travel ? 'yes' : 'no';
        const locationText = locationMap[location];

        setUser({
            name, phone, email, wechat, 
            kids, symptoms, equipment, info, time,
            hasKids, willTravel, location, locationText,
            timeOk, timeBad, proposedTime,
        });
        UserStore.email = email;

        setVisible(true);
        setTimeout(() => {
            setVisible(false);
        }, 2000);
    }

    async function confirmSubmit() {
        setDialogOpen(false);
        const { values } = UserStore;
        const res = await fetch('/user/unique', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email })
        });
        const data = await res.json();
        if (!data.available) {
            setAlertDialogOpen(true);
            return;
        }

        else finalSubmit(values);
    }

    async function onSubmit (values) {
        UserStore.values = values;
        if (values.email.toLowerCase() !== UserStore.email) {
            setDialogOpen(true);
        }
        
        else finalSubmit(values);

    }

    useEffect(() => {
        fetchInfo();
    },[]);

    if (redirect) window.location.href=`/user/${redirect}`;

    if (loading) return null;

    if (!exists) return (
        <div style={{ padding: 16, margin: 'auto', maxWidth: 600, textAlign: "left" }}>
          <CssBaseline/>
          <Typography variant="h4" align="center" component="h1" gutterBottom style={{ paddingTop: 60 }}>
              无法找到该用户
          </Typography>
        </div>
    )

  return (
    <div style={{ padding: 16, margin: 'auto', maxWidth: 600, textAlign: "left" }}>
      <Typography variant="h5" align="center" component="h1" gutterBottom style={{ paddingTop: 60 }}>
        个人信息
      </Typography>
      <Form
        onSubmit={onSubmit}
        initialValues={user}
        validate={validate}
        render={({ handleSubmit, submitting, pristine, values }) => (
          <form onSubmit={handleSubmit} noValidate>
            <Paper style={{ padding: 16 }}>
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={4}>
                  <Field
                    fullWidth
                    required
                    name="name"
                    component={TextField}
                    type="text"
                    label="姓名"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Field
                    fullWidth
                    required
                    name="phone"
                    component={TextField}
                    type="number"
                    label="联系电话"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Field
                    fullWidth
                    required
                    name="wechat"
                    component={TextField}
                    type="text"
                    label="微信号"
                  />
                </Grid>
                <Grid item xs={5}>
                  <Field
                    name="email"
                    fullWidth
                    required
                    component={TextField}
                    type="email"
                    label="Email"
                  />
                </Grid>
                <Grid item xs={3}>
                  <Field
                    name="locationText"
                    fullWidth
                    disabled
                    component={TextField}
                    type="text"
                    label="领取地点"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Field
                    name="time"
                    fullWidth
                    disabled
                    component={TextField}
                    type="text"
                    label={user.timeBad ? '时间待定 邮件通知' : '领取时间'}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">是否携带子女</FormLabel>
                    <RadioGroup row>
                      <FormControlLabel
                        label="是"
                        control={
                          <Field
                            name="hasKids"
                            component={Radio}
                            type="radio"
                            value="yes"
                          />
                        }
                      />
                      <FormControlLabel
                        label="否"
                        control={
                          <Field
                            name="hasKids"
                            component={Radio}
                            type="radio"
                            value="no"
                          />
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">是否有出行计划</FormLabel>
                    <RadioGroup row>
                      <FormControlLabel
                        label="是"
                        control={
                          <Field
                            name="willTravel"
                            component={Radio}
                            type="radio"
                            value="yes"
                          />
                        }
                      />
                      <FormControlLabel
                        label="否"
                        control={
                          <Field
                            name="willTravel"
                            component={Radio}
                            type="radio"
                            value="no"
                          />
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">是否出现以下不适症状（若无则无需选择）</FormLabel>
                    <FormGroup row>
                      { symptomsList.map(item => (
                        <FormControlLabel label={item} control={
                          <Field name="symptoms" component={Checkbox} type="checkbox" value={item}/>
                        }/>
                      )) }
                    </FormGroup>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">目前已备有哪些防疫物资（若都没有则无需选择）</FormLabel>
                    <FormGroup row>
                      { equipmentList.map(item => (
                        <FormControlLabel label={item} control={
                            <Field name="equipment" component={Checkbox} type="checkbox" value={item}/>
                        }/>
                      )) }
                    </FormGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    fullWidth
                    name="info"
                    component={TextField}
                    type="text"
                    label="其它信息和需求"
                  />
                </Grid>
                <Grid item style={{ marginTop: 16 }}>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => fetchInfo()}
                    disabled={submitting || pristine}
                  >
                    还原
                  </Button>
                </Grid>
                <Grid item style={{ marginTop: 16 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting || pristine}
                  >
                    更新信息
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </form>
        )}
      />
      <Collapse in={visible}>
                <Alert severity="success">信息更新成功！</Alert>
            </Collapse>
            {/* <Typography variant="h6" align="center" component="h1" gutterBottom>
                {`${window.location.origin}/user/${hash}`}
            </Typography> */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>修改email将会同时修改您的主页URL。确认继续吗？</DialogTitle>
                <DialogContent>
                    <DialogActions visible={false}>
                        <Button onClick={() => setDialogOpen(false)}>取消</Button>
                        <Button color="primary" onClick={confirmSubmit}>确认更改</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)}>
                <DialogTitle>此email重复，请重新填写</DialogTitle>
                <DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => setAlertDialogOpen(false)}>OK</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            <Dialog open={timeSelectDialogOpen}>
                <DialogTitle>{user.name}, 请您确认领取健康包的时间：{user.time}</DialogTitle>
                <DialogActions>
                    <Button onClick={() => {setTimeSelectDialogOpen(false); setTimeOkDialogOpen(true);}}>确认可以领取</Button>
                    <Button onClick={() => {setTimeSelectDialogOpen(false); setTimeBadDialogOpen(true);}}>时间冲突</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={timeOkDialogOpen}>
                <DialogTitle>您领取健康包的时间和地点是：{user.time} @ {locationMap[user.location]}</DialogTitle>
                <DialogActions>
                    <Button onClick={() => {setTimeSelectDialogOpen(true); setTimeOkDialogOpen(false);}}>返回</Button>
                    <Button color="primary" onClick={timeOkConfirm}>确认可以领取</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={timeBadDialogOpen}>
                <DialogTitle>请在下方填写您方便的时间段</DialogTitle>
                <DialogContent>
                    <DialogContentText>我们的工作人员将会再次给您分配一个时间，请查收邮件通知</DialogContentText>
                    <MuiTextField
                      autoFocus
                      fullWidth
                      type="text"
                      label={"原定时间：" + user.time}
                      onChange={e => {
                          setUserProposedTime(e.target.value);
                      }}
                    />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {setTimeSelectDialogOpen(true); setTimeBadDialogOpen(false);}}>返回</Button>
                        <Button color="primary" onClick={timeBadConfirm}>确认时间段</Button>
                    </DialogActions>
            </Dialog>
            {/* <pre>{JSON.stringify(values, 0, 2)}</pre> */}
    </div>
  );
}
