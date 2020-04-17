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
import UserStore from '../stores/UserStore';

const validate = values => {
    const regexp = /^((\d+)(\s(N|S|E|W|NORTH|SOUTH|EAST|WEST)\.?)?(\s\d+(ST|ND|RD|TH)?)?(\s[A-Za-z]+\.?)*\s(HOUSES|HEIGHTS|HTS|AVENUE|AVE|ROAD|RD|WAY|ROW|BRAE|STREET|ST|COURT|CT|HARBOR|DRIVE|DR|LANE|LN|CIRCLE|CIR|BOULEVARD|BLVD|PARKWAY|PKWY|PASS|MALL|TERRACE|RUN|TRAIL|TRL|PLACE|PL)\.?)(([\w\.\,\s\-\#])*)/i;
    const regexpStrict = /^((\d+)(\s(N|S|E|W|NORTH|SOUTH|EAST|WEST)\.?)?(\s[A-Za-z]+\.?)*\s(HOUSES|HEIGHTS|HTS|AVENUE|AVE|ROAD|RD|WAY|ROW|BRAE|STREET|ST|COURT|CT|HARBOR|DRIVE|DR|LANE|LN|CIRCLE|CIR|BOULEVARD|BLVD|PARKWAY|PKWY|PASS|MALL|TERRACE|RUN|TRAIL|TRL|PLACE|PL)\.?)(\s*((\d+[A-Z]?)|([A-Z])))?$/i;
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
    // Strict address checking
    if (values.area <= 1) {
        if (!regexpStrict.test(values.address)) {
            errors.address = '请填写 街号 街名 St|Ave|Ln|Rd... (房间号); 房间号前无需加"Apt", "Unit" 等前缀，也无需填写城市名、zipcode等 | Example: 123 College Rd 305';
        }
    }
    else if (!regexp.test(values.address)) {
        errors.address = '请填写标准US地址: 123 Street Name St|Ave|Pkwy|Ln|Ct|Rd... 房间号|宿舍号...';
    }

    return errors;
};

export default function UserPage() {
    const [user, setUser] = useState({
        name: '',
        phone: 0,
        email: '',
        wechat: '',
        identity: '本科生',
        area: 0,
        address: '',
        addr1: '',
        addr2: '',
        kids: false,
        symptoms: [],
        equipment: [],
        info: '',
        need: false,
        kitNeeded: false,
        hasKids: false,
    });
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [redirect, setRedirect] = useState('');
    const [visible, setVisible] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const { hash } = useParams();

    async function fetchInfo() {
        const res = await fetch('/user/' + hash, { method: 'POST' });
        const data = await res.json();
        if (data.user) {
            setExists(true);
        
            const {
                name, phone, email, wechat, identity, area, address,
                addr1, addr2, kids, symptoms, equipment, info, need
            } = data.user;

            const kitNeeded = need ? 'yes' : 'no';
            const hasKids = kids ? 'yes' : 'no';

            setUser({
                name, phone, email, wechat, identity, area, address,
                addr1, addr2, kids, symptoms, equipment, info, need,
                kitNeeded, hasKids
            });
            UserStore.wechat = wechat;
        }

        setLoading(false);
    }

    async function finalSubmit (values) {
        values.need = values.kitNeeded === 'yes';
        values.kids = values.hasKids === 'yes';

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
            name, phone, email, wechat, identity, area, address,
            addr1, addr2, kids, symptoms, equipment, info, need
        } = data.user;

        const kitNeeded = need ? 'yes' : 'no';
        const hasKids = kids ? 'yes' : 'no';

        setUser({
            name, phone, email, wechat, identity, area, address,
            addr1, addr2, kids, symptoms, equipment, info, need,
            kitNeeded, hasKids
        });
        UserStore.wechat = wechat;

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
            body: JSON.stringify({ wechat: values.wechat })
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
        if (values.wechat.toLowerCase() !== UserStore.wechat) {
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
            <Typography variant="h4" align="center" component="h1" gutterBottom>
                无法找到该用户
            </Typography>
        </div>
    )

  return (
    <div style={{ padding: 16, margin: 'auto', maxWidth: 600, textAlign: "left" }}>
      <CssBaseline />
      <Typography variant="h5" align="center" component="h1" gutterBottom>
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
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">是否需要健康包</FormLabel>
                    <RadioGroup row>
                      <FormControlLabel
                        label="需要"
                        control={
                          <Field
                            name="kitNeeded"
                            component={Radio}
                            type="radio"
                            value="yes"
                          />
                        }
                      />
                      <FormControlLabel
                        label="不需要"
                        control={
                          <Field
                            name="kitNeeded"
                            component={Radio}
                            type="radio"
                            value="no"
                          />
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
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
                <Grid item xs={12}>
                  <Field
                    name="email"
                    fullWidth
                    required
                    component={TextField}
                    type="email"
                    label="Email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    fullWidth
                    required
                    name="area"
                    component={Select}
                    label="麦迪逊住址"
                    formControlProps={{ fullWidth: true }}
                  >
                    <MenuItem value={0}>校园周围公寓/House</MenuItem>
                    <MenuItem value={1}>学校宿舍</MenuItem>
                    <MenuItem value={2}>Sheboygan区域</MenuItem>
                    <MenuItem value={3}>Eagle Heights区域</MenuItem>
                    <MenuItem value={4}>其它麦迪逊周边区域</MenuItem>
                    <MenuItem value={8}>不在麦迪逊附近</MenuItem>
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field
                    name="address"
                    fullWidth
                    required
                    component={TextField}
                    type="address"
                    label="详细地址（具体到门牌号）"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    name="addr1"
                    fullWidth
                    disabled
                    component={TextField}
                    type="address"
                    label="解析地址 PART 1"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Field
                    name="addr2"
                    fullWidth
                    disabled
                    component={TextField}
                    type="address"
                    label="解析地址 PART 2"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    fullWidth
                    required
                    name="identity"
                    component={Select}
                    label="身份"
                    formControlProps={{ fullWidth: true }}
                  >
                    <MenuItem value="国家公派留学人员">国家公派留学人员</MenuItem>
                    <MenuItem value="本科生">本科生</MenuItem>
                    <MenuItem value="研究生">研究生</MenuItem>
                    <MenuItem value="交换生">交换生</MenuItem>
                    <MenuItem value="访问学者">访问学者</MenuItem>
                  </Field>
                </Grid>
                <Grid item xs={12}>
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
                <Grid item>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">是否出现以下不适症状（若无则无需选择）</FormLabel>
                    <FormGroup row>
                      <FormControlLabel
                        label="咳嗽"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="咳嗽"
                          />
                        }
                      />
                      <FormControlLabel
                        label="发热"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="发热"
                          />
                        }
                      />
                      <FormControlLabel
                        label="乏力"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="乏力"
                          />
                        }
                      />
                      <FormControlLabel
                        label="头痛"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="头痛"
                          />
                        }
                      />
                      <FormControlLabel
                        label="咽痛"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="咽痛"
                          />
                        }
                      />
                      <FormControlLabel
                        label="气促"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="气促"
                          />
                        }
                      />
                      <FormControlLabel
                        label="呼吸困难"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="呼吸困难"
                          />
                        }
                      />
                      <FormControlLabel
                        label="胸闷"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="胸闷"
                          />
                        }
                      />
                      <FormControlLabel
                        label="腹泻"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="腹泻"
                          />
                        }
                      />
                      <FormControlLabel
                        label="结膜充血"
                        control={
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="结膜充血"
                          />
                        }
                      />
                      <FormControlLabel
                        label="其它症状"
                        control={
                        <React.Fragment>
                          <Field
                            name="symptoms"
                            component={Checkbox}
                            type="checkbox"
                            value="其它症状"
                          />
                        </React.Fragment>
                        }
                      />
                    </FormGroup>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">目前已备有哪些防疫物资（若都没有则无需选择）</FormLabel>
                    <FormGroup row>
                      <FormControlLabel
                        label="N95-KN95口罩"
                        control={
                          <Field
                            name="equipment"
                            component={Checkbox}
                            type="checkbox"
                            value="N95-KN95口罩"
                          />
                        }
                      />
                      <FormControlLabel
                        label="医用口罩"
                        control={
                          <Field
                            name="equipment"
                            component={Checkbox}
                            type="checkbox"
                            value="医用口罩"
                          />
                        }
                      />
                      <FormControlLabel
                        label="手套"
                        control={
                          <Field
                            name="equipment"
                            component={Checkbox}
                            type="checkbox"
                            value="手套"
                          />
                        }
                      />
                      <FormControlLabel
                        label="消毒湿巾"
                        control={
                          <Field
                            name="equipment"
                            component={Checkbox}
                            type="checkbox"
                            value="消毒湿巾"
                          />
                        }
                      />
                      <FormControlLabel
                        label="退烧药或相关药品"
                        control={
                          <Field
                            name="equipment"
                            component={Checkbox}
                            type="checkbox"
                            value="退烧药或相关药品"
                          />
                        }
                      />
                      <FormControlLabel
                        label="其它物资"
                        control={
                          <Field
                            name="equipment"
                            component={Checkbox}
                            type="checkbox"
                            value="其他物资"
                          />
                        }
                      />
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
            <Collapse in={visible}>
                <Alert severity="success">信息更新成功！</Alert>
            </Collapse>
            {/* <Typography variant="h6" align="center" component="h1" gutterBottom>
                {`${window.location.origin}/user/${hash}`}
            </Typography> */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>修改微信号将会同时修改您的主页URL。确认继续吗？</DialogTitle>
                <DialogContent>
                    <DialogActions visible={false}>
                        <Button onClick={() => setDialogOpen(false)}>取消</Button>
                        <Button color="primary" onClick={confirmSubmit}>确认更改</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)}>
                <DialogTitle>此微信名重复，请重新填写</DialogTitle>
                <DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => setAlertDialogOpen(false)}>OK</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            {/* <pre>{JSON.stringify(values, 0, 2)}</pre> */}
          </form>
        )}
      />
    </div>
  );
}

