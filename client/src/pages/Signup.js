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
    const errors = {};

    if (!values.email) {
        errors.email = 'Required';
    }

    if (!/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(values.email)) {
        errors.email = '请确认email格式';
    }

    return errors;
};

export default function SignupPage({ theme }) {
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
    const [exists, setExists] = useState(true);
    const [loading, setLoading] = useState(true);
    const [redirect, setRedirect] = useState('');
    const [visible, setVisible] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const { hash } = useParams();

   

    async function onSubmit (values) {
        

    }

    useEffect(() => {
        // fetchInfo();
    },[]);


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
    <div style={{ padding: 16, margin: 'auto', maxWidth: 640, textAlign: "left" }}>
      <CssBaseline />
      <Typography variant="h5" align="center" component="h1" gutterBottom style={{ paddingTop: 60 }}>
        中国驻芝加哥总领馆"健康包”第二批信息登记
      </Typography>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit, submitting, pristine, values }) => (
          <form onSubmit={handleSubmit} noValidate>
              <Paper style={{ padding: 16 }}>
                <Typography variant="p" align="left" component="p" gutterBottom>
                    中国驻芝加哥总领馆和CSSA at UW-Madison一直在为了麦屯同学的健康努力。考虑到在第一批健康包发放过程中未能领取或没有得到急需物资的同学，我们将在本周末开放第二批物资发放。也请各位同学互相转告身边尚不知情或未能在第一批发放中领取到物资的同学。CSSA at UW-Madison不会对外泄漏任何个人信息和隐私，请大家放心填写。为了确保更好的为大家分发“健康包”，请大家如实并且详细地填写相关信息。我们将会公平公正的为大家分发物资，<strong>严格按照大家的需求和报名顺序进行物资发放</strong>。所以本次链接将会于周四（4.23）晚11:59暂时关闭，请大家尽快填写。后续的发放我们将会通过CSSA官方公众号(UW-CSSA)和邮件通知大家，也请大家持续关注。
                </Typography>
            </Paper>
            <Paper style={{ padding: 16, marginTop: 16 }}>
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={12}>
                  <FormLabel
                  component="legend"
                  style={{ marginBottom: 6 }}
                  >请先填写您的邮箱，并根据确认邮件进行下一步操作</FormLabel>
                  <Field
                    name="email"
                    fullWidth
                    required
                    component={TextField}
                    type="email"
                    label="Email（请尽量使用wisc.edu）"
                  />
                </Grid>
              </Grid>
            </Paper>
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={submitting}
                style={{ marginTop: 16 }}
                >
                发送确认邮件
            </Button>
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

