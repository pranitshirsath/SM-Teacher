import React from 'react';
import {
    Dimensions, Alert, StyleSheet, FlatList,
    ScrollView, TouchableHighlight, StatusBar, Switch
} from 'react-native';

import {
    Container, Header, Title, Button, Icon,
    Text, Body, Right, Left, View, Subtitle, Toast, Card, CardItem,
    Picker, Content
} from "native-base";

import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';

import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';


import DatePicker from 'react-native-datepicker';
import Moment from 'moment';
import HTTPRequestMng from "./HTTPRequestMng";
import InternetConn from '../networkConn/OfflineNotice';
import NetInfo from "@react-native-community/netinfo";

import { connect } from 'react-redux';
import { ActionAddTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTestResultStudentList } from '../redux_reducers/TestResultsReducer';
import { ActionUpdateTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionDeleteTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

import StepSelectTest from './StepSelectTest';
import StepAddStudentMarks from './StepAddStudentMarks';

class AddEditTestResultsWnd extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: false, loadingMsg: '', currPageIndex: 0
        }

        this.steps = [
            { component: <StepSelectTest onRef={ref => (this.selectTestTab = ref)} openStepByIndex={this.openStepByIndex.bind(this)} />, routeName: 'Select test' },
            {
                component: <StepAddStudentMarks onRef={ref => (this.stepStudentMarkTab = ref)}
                    navigation={this.props.navigation} />, routeName: 'Add student marks',
            },
        ];
    }

    componentDidMount() {
        StatusBar.setBackgroundColor(appColor.colorPrimaryDark);
    }

    componentWillUnmount() {
        //delete data from global status
        this.props.ActionDeleteTestResult();
    }


    performSubmitTestDetails() {
        if (this.props.isEdit) {
            //delete test result first and then save new one
            this.changeLoadingStatus(true);
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    const obj = new HTTPRequestMng('', 'DeleteTestResultInBG', this)
                    obj.executeRequest("InstituteId=" + this.props.instituteId +
                        "&AutoTestId=" + this.props.AutoTestId);
                }
                else {
                    this.changeLoadingStatus(false);
                    Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
                }
            });

        }
        else {
            this.stepStudentMarkTab.performSubmitTestResult();
        }

    }

    performDeleteTestResult() {
        Alert.alert('Confirmation', "Are you sure you want to delete this test details?", [
            { text: 'No' },
            { text: 'Yes', onPress: () => { this.deleteTestResultFromServer(); } },
        ]);
    }

    deleteTestResultFromServer() {
        this.changeLoadingStatus(true, "Deleting test result");
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                const obj = new HTTPRequestMng('', 'DeleteTestResult', this)
                obj.executeRequest("InstituteId=" + this.props.instituteId +
                    "&AutoTestId=" + this.props.AutoTestId);
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
        });
    }

    onHTTPResponseTestResultDelete(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Status'];
            const msg = jsonRec['Message'];

            if (status == 1) {
                Alert.alert('Success', msg, [
                    {
                        'text': 'OK', onPress: () => {
                            this.props.navigation.state.params.onScreenRefresh();
                            this.props.navigation.goBack();
                        }
                    }
                ]);
            }
            else {
                Alert.alert('Message', msg, [
                    { 'text': 'OK' }
                ]);
            }
        }
        catch (error) {
            console.error("error", error);
        }
        finally {
            this.changeLoadingStatus(false)
        }
    }

    onHTTPResponseDeleteInBG(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Status'];
            const msg = jsonRec['Message'];

            if (status == 1) {
                this.stepStudentMarkTab.performSubmitTestResult();
            }
            else {
                Alert.alert('Success', "Unable to update details. Please try again.", [{ 'text': 'OK' }]);
            }
        }
        catch (error) {
            console.error("error", error);
        }
        finally {
            this.changeLoadingStatus(false)
        }
    }

    onHTTPError() {
        this.changeLoadingStatus(false);
        Alert.alert('Message', 'Unable to connect with server, Please try after some time');
    }

    changeLoadingStatus(isShow, msg) {
        this.setState({ loading: isShow, loadingMsg: msg });
    }


    openStepByIndex(index, isValid) {
        if (index >= this.steps.length) return;
        if (index < 0) return;

        if (this.state.currPageIndex == 0 && !isValid) {
            if (this.selectTestTab.checkForValidation()) {
                this.setState({ currPageIndex: index });
                this.scrollView.scrollTo({ y: 0, x: 180 * index, animated: true });
            }
        }
        else if (this.state.currPageIndex == 1) {
            this.stepStudentMarkTab.saveStudentMarksList();
            this.setState({ currPageIndex: index });
            this.scrollView.scrollTo({ y: 0, x: 180 * index, animated: true });

        }
        else if (isValid) {
            this.setState({ currPageIndex: index });
            this.scrollView.scrollTo({ y: 0, x: 180 * index, animated: true });
        }
    }

    render() {
        const steps = this.steps;
        const currPageIndex = this.state.currPageIndex;
        let wizardTitles;
        const stepsLen = steps.length;
        for (let index = 0; index < stepsLen; index++) {
            let linePanel, textPanel;
            if (index < stepsLen - 1) {
                linePanel = <View style={{ height: 2, width: 60, backgroundColor: appColor.light_gray }} />
            }

            let indicatorLayout = <Text style={{ color: 'white', fontWeight: '500' }}>{index + 1}</Text>
            let selColorCircle;
            if (index <= currPageIndex) {
                textPanel = <Text style={{ marginLeft: 10, marginRight: 10, color: appColor.black, fontWeight: '500', fontSize: 17 }}>{steps[index].routeName}</Text>
                selColorCircle = appColor.googleBlue;

                if (index < currPageIndex) {
                    indicatorLayout = <Icon name="md-checkmark" style={{ color: 'white', fontSize: 16 }} />
                }
            } else {
                textPanel = <Text style={{ marginLeft: 10, marginRight: 10, color: appColor.semi_dark_gray }}>{steps[index].routeName}</Text>
                selColorCircle = appColor.semi_dark_gray;
            }

            // onPress={() => this.openStepByIndex(index, true) }
            const view = <TouchableHighlight key={index} underlayColor='#00000010' >
                <View key={index} style={{ flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                    <View style={{ width: 26, height: 26, backgroundColor: selColorCircle, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                        {indicatorLayout}
                    </View>

                    {textPanel}
                    {linePanel}
                </View>
            </TouchableHighlight>

            wizardTitles = [wizardTitles, view];
        }

        let footerPrevBtn, footerNextBtn;
        if (currPageIndex > 0) {
            footerPrevBtn = <Button transparent onPress={() => this.openStepByIndex(this.state.currPageIndex - 1, true)}>
                <Icon name="ios-arrow-back" style={{ color: 'white' }} />
                <Text style={{ color: 'white', fontSize: 18, marginLeft: -20, alignItems: 'center' }}>Prev</Text>
            </Button>
        }
        if (currPageIndex == (stepsLen - 1)) {
            let btnSubmitText;
            if (this.props.isEdit)
                btnSubmitText = "Update"
            else
                btnSubmitText = "Submit"

            footerNextBtn = <Button transparent onPress={() => this.performSubmitTestDetails()}>
                <Text style={{ color: 'white', fontSize: 18, marginRight: -20, alignItems: 'center' }}>{btnSubmitText}</Text>
                <Icon name="md-checkmark" style={{ color: 'white' }} />
            </Button>
        }
        else {
            footerNextBtn = <Button transparent onPress={() => this.openStepByIndex(this.state.currPageIndex + 1)}>
                <Text style={{ color: 'white', fontSize: 18, marginRight: -20, alignItems: 'center' }}>Next</Text>
                <Icon name="ios-arrow-forward" style={{ color: 'white' }} />
            </Button>
        }

        let deleteLayout
        if (this.props.isEdit) {
            deleteLayout = <Right>
                <Button transparent
                    onPress={() => this.performDeleteTestResult()}
                >
                    <Icon name="trash" />
                </Button>
            </Right>
        }
        else {
            deleteLayout = <View></View>;
        }

        return (
            <Container style={{ backgroundColor: appColor.background_gray }}>
                <Header>
                    <Left>
                        <Button transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Test Results</Title>
                    </Body>
                    {deleteLayout}
                </Header>

                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <ScrollView horizontal={true} contentContainerStyle={{ alignItems: 'center' }}
                        showsHorizontalScrollIndicator={false}
                        style={{ backgroundColor: 'white', height: 40, maxHeight: 60, }}
                        ref={(scroll) => this.scrollView = scroll} >
                        {wizardTitles}
                    </ScrollView>

                    <View style={{ flex: 1 }}>
                        {steps[this.state.currPageIndex].component}
                    </View>

                    <View style={{ flexDirection: 'row', height: 50, backgroundColor: appColor.colorPrimaryDark }}>
                        {footerPrevBtn}
                        <View style={{ flex: 1, flexDirection: 'row' }}></View>
                        {footerNextBtn}
                    </View>
                </View>

                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%', textAlign: 'center' }}
                    messageStyle={{ textAlign: 'center' }}
                    showProgress={true}
                    progressSize="large"
                    message={this.state.loadingMsg}
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={true}
                    showConfirmButton={false}
                />}
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return {
        instituteId: state.teacherInfo.InstituteId,
        isEdit: state.testResultInfo.isEdit,
        AutoTestId: state.testResultInfo.AutoTestId
    };
};
export default connect(mapStateToProps, {
    ActionAddTestResult, ActionAddTestResultStudentList,
    ActionUpdateTestResult, ActionDeleteTestResult, ActionAddTeacher
})(AddEditTestResultsWnd);