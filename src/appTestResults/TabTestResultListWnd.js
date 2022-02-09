import React, {
    Component, PureComponent
} from 'react';

import {
    Dimensions, Alert, StyleSheet, FlatList,
    ScrollView, TouchableHighlight, StatusBar, Image
} from 'react-native';

import {
    Container, Header, Title, Button, Icon,
    Text, Body, Right, Left, View, Subtitle, Toast, Card, CardItem
    , Content
} from "native-base";

import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';

import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';

import HTTPRequestMng from "./HTTPRequestMng";
import InternetConn from '../networkConn/OfflineNotice';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import ActionButton from 'react-native-action-button';
import ProgressBar from 'react-native-progress/Bar';
import Moment from 'moment';
import NoDataFound from '../utils/NoDataView';

import { connect } from 'react-redux';
import { ActionAddTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTestResultStudentList } from '../redux_reducers/TestResultsReducer';
import { ActionUpdateTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

class TestResultCell extends PureComponent {

    constructor(props) {
        super(props);
    }
    render() {
        const data = this.props.data;

        let percent = 0, percentStr = '0';
        if (data.presentStud != 0 && data.totalStud != 0) {
            percent = (data.presentStud) / data.totalStud;
            percentStr = (percent * 100).toFixed(2);
        }

        let formatedTestResultDate;
        if (data.TestDate != undefined) {
            const dateResult = Moment(data.TestDate, 'YYYY/MM/DD').toDate();
            formatedTestResultDate = String(Moment(dateResult).format('DD/MM/YYYY'));
        }
        else {
            formatedTestResultDate = ""
        }

        let strSubject
        if (data.TestType == "")
            strSubject = data.Subject;
        else
            strSubject = data.Subject + "(" + data.TestType + ")";

        let monthView;

        if (data.isFirstTestResultInMonth) {
            monthView = <View style={{ marginLeft: 10, backgroundColor: '#41a5bd', borderRadius: 4, width: 140 }}>
                <Text style={{ color: appColor.white, padding: 5 }}>{data.strMonth}</Text>
            </View>
        }
        else {
            <View></View>
        }

        return (
            <View style={{ flex: 1, paddingLeft: 5, paddingRight: 10 }}>
                {monthView}
                <View style={{ width: 1, height: 10, marginLeft: 20, backgroundColor: appColor.colorPrimary }}
                />

                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ width: 1, height: '100%', marginLeft: 20, backgroundColor: appColor.colorPrimary }} />
                    <View style={{ position: 'absolute', width: 20, height: 20, marginLeft: 10, backgroundColor: appColor.colorAccent, borderRadius: 10 }} />

                    <TouchableHighlight underlayColor='#00000010' style={{ flex: 1, marginLeft: 10 }}
                        onPress={() => this.props.onTestResultSelection(this.props.index, data)}>
                        <Card style={{ borderTopEndRadius: 15, borderBottomStartRadius: 15, borderBottomEndRadius: 15, marginLeft: 10 }}>
                            <CardItem bordered style={{ borderTopEndRadius: 15, borderBottomStartRadius: 15, borderBottomEndRadius: 15, borderColor: 'white' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1, flexDirection: 'column' }}>

                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={layoutDesign.headingText}>Test Date : </Text>
                                            <Text numberOfLines={1} ellipsizeMode={'tail'}>{formatedTestResultDate}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                            <Text style={layoutDesign.headingText}>Section    : </Text>
                                            <Text numberOfLines={1} ellipsizeMode={'tail'}>{data.sectionName}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', marginTop: 10, alignContent: 'space-between' }}>
                                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                                <Text style={layoutDesign.headingText}>Exam</Text>
                                                <Text style={layoutDesign.dataText}>{data.Exam}</Text>
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                                <Text style={layoutDesign.headingText}>Subject</Text>
                                                <Text style={layoutDesign.dataText}>{strSubject}</Text>
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                                <Text style={layoutDesign.headingText}>Marks</Text>
                                                <Text style={layoutDesign.dataText}>{data.MaxMarks}</Text>
                                            </View>
                                        </View>

                                        <Text style={[layoutDesign.headingText, { marginTop: 10, alignSelf: 'flex-end' }]}>{percentStr}% stud. attempted</Text>
                                        <ProgressBar unfilledColor={appColor.googleRed} color={appColor.googleGreen} progress={percent} borderWidth={0}
                                            height={2} width={this.props.progressBarWidth} style={{ marginTop: 5 }} />

                                        <Text style={[layoutDesign.headingText, { alignSelf: 'flex-end' }]}>Total {data.totalStud} students</Text>

                                        <View style={{ flexDirection: 'row', marginTop: 5, alignContent: 'space-around' }}>
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[layoutDesign.view_bg_present]}>{data.presentStud}</Text>
                                                <Text numberOfLines={2} style={[layoutDesign.headingText, { flexWrap: 'wrap', alignItems: 'flex-start', marginLeft: 5 }]}>Students attempted</Text>
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                                                <Text style={[layoutDesign.view_bg_absent]}>{data.absentStud}</Text>
                                                <Text numberOfLines={2} style={[layoutDesign.headingText, { flexWrap: 'wrap', alignItems: 'flex-start', marginLeft: 5 }]}>Students absent</Text>
                                            </View>
                                        </View>

                                    </View>
                                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                        <Image resizeMode={'stretch'} source={require('../../assets/ic_next.png')}
                                            style={{ width: 15, height: 30, marginLeft: 10, marginRight: -10 }} />
                                    </View>
                                </View>
                            </CardItem>
                        </Card>
                    </TouchableHighlight>
                </View>

                <View style={{ width: 1, height: 10, marginLeft: 20, backgroundColor: appColor.colorPrimary }} />
            </View>);
    }
}

class TabTestResultListWnd extends React.Component {

    constructor(props) {
        super(props)
        this.state =
        {
            loading: false, loadingMsg: '', instituteId: this.props.instituteId,
            testList: []
        }
    }

    componentDidMount() {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                this.getTestResultsFromServer();
            }
        });
    }


    changeLoadingStatus(isShow, msg) {
        this.setState({ loading: isShow, loadingMsg: msg });
    }

    getTestResultsFromServer() {
        this.changeLoadingStatus(true);
        const obj = new HTTPRequestMng('', 'GetTestResultList', this)
        obj.executeRequest("InstituteId=" + this.state.instituteId);
    }

    onHTTPResponseTestResultList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {
                const listData = jsonRec['Data'];
                console.info("TestList", listData);

                let tmpStudList = [], tmpTestList = [];
                let totalCount = 0, presentCount = 0, absentCount = 0;
                let prevMonth = "", i = 0;

                if (listData != undefined) {
                    listData.forEach((singleObj) => {

                        totalCount = 0, presentCount = 0, absentCount = 0, tmpStudList = []
                        let studListData = singleObj['StudentDetails'];

                        studListData.forEach((singleStudObj) => {
                            const arrayObj = {
                                'StudentName': singleStudObj['StudentName'],
                                'IsAbsent': singleStudObj['IsAbsent'],
                                'AutoStudId': singleStudObj['AutoStudId'],
                                'MarksObtained': singleStudObj['MarksObtained'],
                                'Grade': singleStudObj['Grade']
                            }
                            if (singleStudObj['IsAbsent'])
                                absentCount++;
                            else
                                presentCount++;


                            tmpStudList.push(arrayObj);
                        });

                        totalCount = presentCount + absentCount;
                        let AttJsonObj = singleObj['TestDetails'];

                        let strMonth = "", isFirstTestResultInMonth = false;
                        try {

                            const dateResult = Moment(AttJsonObj['TestDate'], 'YYYY/MM/DD').toDate();
                            strMonth = String(Moment(dateResult).format('MMMM YYYY'));

                            if (prevMonth != strMonth) {
                                isFirstTestResultInMonth = true;
                            }
                            prevMonth = strMonth;
                        }
                        catch (error) { }

                        const arrayObj = {
                            'AutoSectionId': AttJsonObj['AutoSectionId'],
                            'AutoExamId': AttJsonObj['AutoExamId'],
                            'AutoSubjectId': AttJsonObj['AutoSubjectId'],
                            'AutoTestId': AttJsonObj['AutoTestId'],
                            'Exam': AttJsonObj['Exam'],
                            'ClassName': AttJsonObj['ClassName'],
                            'sectionName': AttJsonObj['SectionName'],
                            'Subject': AttJsonObj['Subject'],
                            'TestType': AttJsonObj['TestType'],
                            'TestDate': AttJsonObj['TestDate'],
                            'MaxMarks': AttJsonObj['MaxMarks'],
                            'MinMarks': AttJsonObj['MinMarks'],
                            'IsGradeSubject': AttJsonObj['IsGradeSubject'],
                            'totalStud': totalCount,
                            'presentStud': presentCount,
                            'absentStud': absentCount,
                            'StudentList': tmpStudList,
                            'isFirstTestResultInMonth': isFirstTestResultInMonth,
                            'strMonth': strMonth,
                        }
                        tmpTestList.push(arrayObj);

                        this.setState({ testList: tmpTestList });
                        i++;
                    });
                }
            }
            else if (status == 'failure') {
                this.setState({ testList: [] });
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            this.changeLoadingStatus(false);
        }
    }

    onHTTPError() {
        this.changeLoadingStatus(false);
        Alert.alert('Message', 'Unable to connect with server, Please try after some time');
    }

    addNewTestResult() {
        this.props.ActionAddTestResult({
            autoSectionId: 0, autoExamId: 0, autoSubjectId: '', testType: '',
            maxMarks: 0, minMarks: 0, testDate: Moment(new Date()).toDate(),
            sectionList: [], examList: [], subjectList: [], testTypeList: [],
            isSectionsListLoaded: false, isEdit: false, IsGradeSubject: 0, gradingTitle: ''
        });
        this.props.ActionAddTestResultStudentList({ studentDetails: [], isStudentListLoaded: false });

        this.props.navigation.navigate('AddEditTestResultsWnd', {
            'onScreenRefresh': this.onScreenRefresh.bind(this)
        });
    }

    onTestResultSelection = (index, data) => {

        console.info("Selected", index, data);
        try {

            let isGradeSub, gradeTitle;

            if (data.IsGradeSubject) { isGradeSub = 1, gradeTitle = "(Grading)" }
            else { isGradeSub = 0, gradeTitle = "" }

            //Add test result info into global status
            this.props.ActionAddTestResult({
                autoSectionId: data.AutoSectionId, autoExamId: data.AutoExamId,
                autoSubjectId: data.AutoSubjectId,
                testTypeID: data.TestType,
                maxMarks: data.MaxMarks, minMarks: data.MinMarks, testDate: data.TestDate,
                sectionList: [], examList: [], subjectList: [], testTypeList: [],
                isSectionsListLoaded: true, isEdit: true,
                IsGradeSubject: isGradeSub, gradingTitle: gradeTitle,
                className: data.ClassName
            });

            this.props.ActionAddTestResultStudentList({ studentDetails: data.StudentList, isStudentListLoaded: false });

            this.props.ActionUpdateTestResult({
                sectionName: data.sectionName, 
                examName: data.Exam, 
                subjectName: data.Subject, 
                AutoTestId: data.AutoTestId,
                ClassName: data.ClassName
            });

            this.props.navigation.navigate('AddEditTestResultsWnd', {
                'onScreenRefresh': this.onScreenRefresh.bind(this)
            });

        } catch (error) {
            console.log("error", error);
        }
    }

    onScreenRefresh() {
        setTimeout(() => {
            this.getTestResultsFromServer();
        }, 100);
    }

    render() {
        const childWidth = (screenWidth / (getOrientation() == 'portrait' ? 1 : 1.5));
        const progressBarWidth = childWidth / 1.4;

        //no data available panel
        let noDataLayout;
        if (this.state.testList == 0) {
            noDataLayout = <NoDataFound
                orientation={getOrientation()}
                imageName='blank_test'
                title='No details found'
                body='Test results which are not sync to the offline will be shown here.
                  Click on + icon to add new test result' />
        }

        return (
            <Container style={{ backgroundColor: appColor.background_gray }}>
                <View style={{ flex: 1 }}>
                    <InternetConn />
                    {noDataLayout}
                    <FlatList
                        style={{ alignSelf: 'center', width: childWidth, marginTop: 5 }}
                        data={this.state.testList}
                        renderItem={({ item, index }) => <TestResultCell data={item} index={index} onTestResultSelection={this.onTestResultSelection} progressBarWidth={progressBarWidth} />}
                        enableEmptySections={true}
                        keyExtractor={(item, index) => String(item.index)}
                        onRefresh={() => { this._PageIndex = 0; this.getTestResultsFromServer() }}
                        refreshing={false}
                        onEndReachedThreshold={0.5}
                    />

                </View>

                <ActionButton buttonColor={appColor.colorAccent} buttonTextStyle={{ fontSize: 36 }}
                    onPress={() => this.addNewTestResult()} fixNativeFeedbackRadius={true} />

                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%', textAlign: 'center' }}
                    messageStyle={{ textAlign: 'center' }}
                    showProgress={true}
                    progressSize="large"
                    message="Getting test results, please wait..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={false}
                />}
            </Container>
        );
    }
}

const layoutDesign = StyleSheet.create({
    headingText: {
        fontSize: 12, color: appColor.font_gray
    },

    dataText: {
        fontSize: 14, color: appColor.darkgray, fontWeight: '400'
    },

    verticalText: {
        fontSize: 20, color: appColor.white, fontWeight: '200',
        width: 20, textAlign: 'center',
        textAlignVertical: 'center',
    },
    titleDateText: {
        fontSize: 18, color: appColor.black, fontWeight: '300',
        marginBottom: 5
    },
    view_bg_present:
    {
        height: 20,
        width: 20,
        backgroundColor: '#34A85399',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'

    },
    view_bg_absent:
    {
        height: 20,
        width: 20,
        backgroundColor: '#EA433599',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'

    },

});

const mapStateToProps = state => {
    return {
        instituteId: state.teacherInfo.InstituteId,
    };
};
export default connect(mapStateToProps, { ActionAddTestResult, ActionAddTestResultStudentList, ActionAddTeacher, ActionUpdateTestResult })(TabTestResultListWnd);
