import React, { Component } from 'react';
import {
    View, Alert, Keyboard,
    StyleSheet, Dimensions,BackHandler
} from 'react-native';

import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Item, Input, Form,
    Label, Toast, Thumbnail
} from "native-base";

import InternetConn from '../networkConn/OfflineNotice';
import HTTPRequestMng from "./HTTPRequestMng";
import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';
import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';



export default class ForgotPassword extends Component {
    constructor(props) {
        super(props)

        this.state = {
            emailID: '', userName: '',
            loading: false,
        }

        this._onOrientationChange = this._onOrientationChange.bind(this)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this)
    }

    componentDidMount() {
        this._isMounted = true;
        Dimensions.addEventListener('change', this._onOrientationChange);
        BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    )
    }
    componentWillUnmount() {
        this._isMounted = false;
        Dimensions.removeEventListener('change', this._onOrientationChange);
        BackHandler.removeEventListener(
        'hardwareBackPress',
        this.handleBackButtonClick,
    )
    }

     handleBackButtonClick () {
        this.props.navigation.goBack(null)
        return true
    }

    _onOrientationChange(newDimensions) {
        onChangeScreenSize(newDimensions, this, true)
    }

    changeLoadingStatus(isShow) {
        this.setState({ loading: isShow })
    }
    
    //function for submit request of Generate OTP
    onResetPassword = async () => {
        Keyboard.dismiss();
            
        if (this.state.userName == '') {
            Toast.show({
                text: "Please Enter Username!",
                buttonText: "",
                type: "warning"
            })
        } else if (this.state.emailID == '') {
            Toast.show({
                text: "Please Enter Email Id!",
                buttonText: "",
                type: "warning"
            })
        } else {
            this.changeLoadingStatus(true)

            const requestJson = {
                'LoginId': this.state.userName,
                'EmailId': this.state.emailID,
            };

            //request to get new token from server
            let obj = new HTTPRequestMng('', 'ForgotPassword', this)
            obj.executeRequest("LoginId=" + String(this.state.userName).trim() + "&EmailId=" + String(this.state.emailID).trim());
        }
    }

    onHttpForgotPassResp(respData) {
        if(!this._isMounted) return;

        try {
            const jsonRec = respData[0];
            const status = jsonRec['Status'];
            const message = jsonRec['Message'];
            
            if (status == 1) {
                Alert.alert('Reset Password', message,
                    [{ 'text': 'OK', onPress: () => {  this.props.navigation.goBack(); }}],
                    { cancelable: false }
                )
            } else {
                this.changeLoadingStatus(false)
                Alert.alert('Reset Password', message)
            }
        } catch (error) { }
    }

    onHTTPError() {
        if(!this._isMounted) return;

        this.changeLoadingStatus(false)
        Alert.alert('Reset Password', 'Unable to connect with server, Please try after some time')
    }

    render() {
        const childWidth = (screenWidth /
            (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : (isTablet ? 2 : 1.5)));

        return (
            <Container style={{ backgroundColor: 'white' }}>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title> Forgot Password </Title>
                    </Body>
                    <Right />
                </Header>

                <Content>
                    <InternetConn />

                    <View style={{ width: childWidth, alignSelf: 'center' }}>
                        <View style={{ flexDirection: 'column', justifyContent: 'center', margin: 30 }} >

                            <Thumbnail square large source={require("../../assets/outline_lock_black_48dp.png")}
                                style={{ alignSelf: 'center', resizeMode: 'contain', width: 100, height: 100, marginTop: 20, tintColor: appColor.colorPrimaryDark }} />

                            <Text style={{ marginTop: 20, fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: appColor.colorPrimary }}>
                                Trouble with logging in?
                                </Text>
                            <Text style={{ marginTop: 10, fontSize: 15, textAlign: 'center', color: appColor.semi_dark_gray }}>
                                Enter your username and email address, we'll send you login details to get back into your account.
                            </Text>

                            <Form style={{ alignSelf: 'stretch' }}>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 50 }]}>
                                    <Input
                                        placeholder='Username'
                                        returnKeyType='next'
                                        autoCapitalize='none'
                                        style={{ backgroundColor: '#00000005' }}
                                        keyboardType='default'
                                        onChangeText={(text) => this.setState({ userName: text })}
                                        onSubmitEditing={() => {
                                            this.refs.emailInput._root.focus();
                                        }} />
                                </Item>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10 }]}>
                                    <Input
                                        ref='emailInput'
                                        placeholder='Email Address'
                                        returnKeyType='done'
                                        autoCapitalize='none'
                                        style={{ backgroundColor: '#00000005' }}
                                        keyboardType='email-address'
                                        onChangeText={(text) => this.setState({ emailID: text })}
                                        onSubmitEditing={() => {
                                            this.onResetPassword()
                                        }} />
                                </Item>
                            </Form>
                            <Button block style={{ marginTop: 50 }}
                                onPress={() => this.onResetPassword()}>
                                <Text>Send Login Details</Text>
                            </Button>
                        </View>
                    </View>
                </Content>

                <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%' }}
                    showProgress={true}
                    progressSize="large"
                    message="Resetting password, Please wait..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={false}
                />
            </Container>
        );
    }
}

const layoutDesign = StyleSheet.create({
    formLayout: {
        alignSelf: 'stretch', padding: 10, paddingTop: 25, paddingBottom: 25,
        borderRadius: 10, backgroundColor: appColor.backgroundLayoutTrans
    },
    inputBoxLayout: {
        backgroundColor: appColor.inputLayoutTrans, borderRadius: 5,
    },
});