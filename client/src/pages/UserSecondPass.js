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
import { ThemeProvider } from '@material-ui/core/styles';

const symptomsList = [
  '咳嗽', '发热', '乏力', '头痛', '咽痛', '气促',
  '呼吸困难', '胸闷', '腹泻', '结膜充血', '其它症状'
];

const equipmentList = [
  'N95-KN95口罩', '医用口罩', '手套',
  '消毒湿巾', '退烧药或相关药品', '其它物资'
];

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

export default function UserSecondPassPage({ theme }) {
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

    async function onSubmit (values) {
        // UserStore.values = values;
        // if (values.wechat.toLowerCase() !== UserStore.wechat) {
        //     setDialogOpen(true);
        // }
        
        // else finalSubmit(values);

    }

    async function fetchInfo() {

    }

    useEffect(() => {
        // fetchInfo();
    },[]);

    // if (redirect) window.location.href=`/user/${redirect}`;

    // if (loading) return null;

    // if (!exists) return (
    //   <ThemeProvider theme={theme}>
    //     <div style={{ padding: 16, margin: 'auto', maxWidth: 600, textAlign: "left" }}>
    //         <CssBaseline/>
    //         <Typography variant="h4" align="center" component="h1" gutterBottom style={{ paddingTop: 60 }}>
    //             无法找到该用户
    //         </Typography>
    //     </div>
    //   </ThemeProvider>
    // )

  return (
    <ThemeProvider theme={theme}>
    <div style={{ padding: 16, margin: 'auto', maxWidth: 600, textAlign: "left" }}>
      <CssBaseline />
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
                <Grid item xs={12}>
                  <Field
                    name="email"
                    fullWidth
                    // disabled
                    component={TextField}
                    type="email"
                    label="Email"
                  />
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
              </Grid>
            </Paper>
            <Paper style={{ padding: 16, marginTop: 16 }}>
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">物资领取地点</FormLabel>
                    <RadioGroup row>
                        {["Capitol附近", "Humanities Building (455 N Park St, Madison, WI 53706)", "Sheboygan", "Eagle Heights"].map(item => 
                            <FormControlLabel
                            style={{ whiteSpace: 'pre-wrap' }}
                            key={item}
                            label={item}
                            control={
                              <Field
                                name="location"
                                component={Radio}
                                type="radio"
                                value={item}
                              />
                            }
                          />
                        )}
                        <FormControlLabel
                        label="其它"
                        control={
                          <Field required
                            name="location"
                            component={Radio}
                            type="radio"
                            value="yes"
                          />
                        }
                        />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            <Paper style={{ padding: 16, marginTop: 16 }}>
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">是否备有消毒湿巾作为防疫物资？</FormLabel>
                    <RadioGroup row>
                      <FormControlLabel
                        label="是"
                        control={
                          <Field required
                            name="hasWipes"
                            component={Radio}
                            type="radio"
                            value="yes"
                          />
                        }
                      />
                      <FormControlLabel
                        label="否"
                        control={
                          <Field required
                            name="hasWipes"
                            component={Radio}
                            type="radio"
                            value="no"
                          />
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">您近期是否有准备出行，尤其是远距离出行的计划？</FormLabel>
                    <RadioGroup row>
                      <FormControlLabel
                        label="是"
                        control={
                          <Field required
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
                          <Field required
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
              </Grid>
            </Paper>
            <Paper style={{ padding: 16, marginTop: 16 }}>
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">是否出现以下不适症状（若无则无需选择）</FormLabel>
                    <FormGroup row>
                      { symptomsList.map(item => (
                        <FormControlLabel label={item} key={item} control={
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
                        <FormControlLabel label={item} key={item} control={
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
            <Collapse in={visible}>
                <Alert severity="success">信息更新成功！</Alert>
            </Collapse>
            
            {/* <pre>{JSON.stringify(values, 0, 2)}</pre> */}
          </form>
        )}
      />
    </div>
    </ThemeProvider>
  );
}

