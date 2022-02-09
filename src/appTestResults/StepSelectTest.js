import React from 'react';
import {
    StyleSheet, Alert, FlatList, TouchableHighlight
} from 'react-native';
import {
    View, Text, Card, CardItem, Input,
    Icon, Content, Picker, Toast
} from "native-base";

import DatePicker from 'react-native-datepicker';
import InternetConn from '../networkConn/OfflineNotice';
import NetInfo from "@react-native-community/netinfo";
import appColor from '../config/color.json'
import AwesomeAlert from 'react-native-awesome-alerts';
import HTTPRequestMng from "./HTTPRequestMng";
import Moment from 'moment';

import { connect } from 'react-redux';
import { ActionAddTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTestResultStudentList } from '../redux_reducers/TestResultsReducer';
import { ActionUpdateTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

class StepSelectTest extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false, loadingMsg: '',
            //sectionList: this.props.sectionList, examList:this.props.examList, 
            sectionList: [], classList: [], examList: this.props.examList,
            subjectList: [], testTypeList: this.props.testTypeList, selectedClassID: this.props.selectedClassID, selectedSectionID: this.props.selectedSectionID, selectedExamID: this.props.selectedExamID, selectedSubjectID: this.props.selectedSubjectID, testTypeID: this.props.testTypeID, maxMarks: this.props.maxMarks, minMarks: this.props.minMarks, testDate: this.props.testDate,
            isSectionsListLoaded: this.props.isSectionsListLoaded,
            IsGradeSubject: this.props.IsGradeSubject,
            gradingTitle: this.props.gradingTitle,
            formatedDateToDisplay: '',
            classObject: '',
            sectionObject: '',
            // for displaying selected value in picker
            pickerSectionObj: '', pickerSubjectObj: ''
        }
    }

    componentDidMount() {
        this.props.onRef(this)

        console.log(this.props)

        let formatedDate = Moment(this.props.testDate).format('DD/MM/YYYY');
        this.setState({ formatedDateToDisplay: formatedDate });

        if (this.props.isEdit) {
            this.getTestTypeList();
        }
        else if (!this.props.isSectionsListLoaded) {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    this.getClassList();
                    //  this.getSectionList();
                    this.getExamList();
                    this.getTestTypeList();
                }
                else {
                    this.changeLoadingStatus(false);
                    Alert.alert('Message', 'No Internet Connection, Please try again after some time. ');
                }
            });
        }

    }


    getClassList() {
        // this.changeLoadingStatus(true);
        const obj = new HTTPRequestMng('', 'GetClassList', this)
        console.log(this.props.instituteId);
        obj.executeRequest("InstituteId=" + this.props.instituteId);
    }


    getSectionList(classId) {
        const obj = new HTTPRequestMng('', 'GetSectionList', this)
        //obj.executeRequest("InstituteId="+ this.props.instituteId);
        obj.executeRequest("InstituteId=" + this.props.instituteId + "&AutoClassId=" + classId);
    }
    getExamList() {
        const obj = new HTTPRequestMng('', 'GetExamList', this)
        obj.executeRequest("InstituteId=" + this.props.instituteId);
    }
    getTestTypeList() {
        const obj = new HTTPRequestMng('', 'GetTestType', this)
        obj.executeRequest();
    }
    getSubjectList() {

        const obj = new HTTPRequestMng('', 'GetSubjectList', this)
        obj.executeRequest("AutoClassId=" + this.state.selectedClassID);

    }

    onHTTPReponseClassList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {

                const listData = jsonRec['Data'];
                console.info("ClassListData", listData);
                let recordCurrentList = [];
                this.setState({ isClassListLoaded: true });
                var classobject = '';
                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'ClassName': singleObj['Name'],
                            'AutoClassId': singleObj['AutoClassId']
                        }
                        classobject = arrayObj;
                        recordCurrentList.push(arrayObj);
                    });

                    // var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                    // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.ClassName, b.ClassName))
                    this.setState({ classList: recordCurrentList, subjectList: [] });
                }
            }
            else {
                Alert.alert('Message', 'There is no Class found for given Institute.');
                this.setState({ isClassListLoaded: false });
            }
        }
        catch (error) {
            console.error("error", error);
            this.setState({ isClassListLoaded: false });
        }
        // this.changeLoadingStatus(false)
    }

    onHTTPResponseSectionList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {

                const listData = jsonRec['Data'];
                console.info("SectionListData", listData);
                let recordCurrentList = [];
                let SectionObject = '';

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'SectionName': singleObj['SectionName'],
                            'AutoSectionId': singleObj['AutoSectionId'],
                            'AutoInstructorId': singleObj['AutoInstructorId'],
                            'AutoClassId': singleObj['AutoClassId']
                        }
                        SectionObject = arrayObj;
                        recordCurrentList.push(arrayObj);
                    });
                    // var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                    // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.SectionName, b.SectionName))
                    this.setState({ sectionList: recordCurrentList, isSectionsListLoaded: true, subjectList: [] });
                }

            }

            else {
                Alert.alert('Message', 'Section is not created for given Class.');
                this.setState({ sectionList: [], subjectList: [] });
            }

        }
        catch (error) {
            console.error("error", error);
        }
    }

    onHTTPResponseExamList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {
                const listData = jsonRec['Data'];
                console.info("ExamListData", listData);
                let recordCurrentList = [];

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'AutoExamId': singleObj['AutoExamId'],
                            'ExamType': singleObj['ExamType'],
                            'DisplayName': singleObj['DisplayName']
                        }
                        recordCurrentList.push(arrayObj);
                    });

                    // var collator = new Intl.Collator(undefined, {numeric: false, sensitivity: 'base',usage:'sort',ignorePunctuation:true});
                    // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.DisplayName, b.DisplayName))
                    this.setState({ examList: recordCurrentList });
                }
            }
            else {
                Alert.alert('Message', 'Exam list is not created for given Class or Section.');
            }
        }
        catch (error) {
            console.error("error", error);
        }
    }

    onHTTPResponseTestTypeList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {

                const listData = jsonRec['Data'];
                console.info("TestTypeData", listData);
                let recordCurrentList = [];

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'TestTypeKey': singleObj['Key'],
                            'TestTypeValue': singleObj['Value'],
                        }

                        recordCurrentList.push(arrayObj);
                    });
                    // var collator = new Intl.Collator(undefined, {numeric: false, sensitivity: 'base',usage:'sort',ignorePunctuation:true});
                    // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.TestTypeValue, b.TestTypeValue))
                    this.setState({ testTypeList: recordCurrentList });
                }
            }
            else {
                Alert.alert('Message', 'No Test type is created for given Subject.');
            }
        }
        catch (error) {
            console.error("error", error);
        }
    }

    onHTTPResponseSubjectList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {

                const listData = jsonRec['Data'];
                console.info("SubjectListData", listData);
                let recordCurrentList = [];

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'AutoSubjectId': singleObj['AutoSubjectId'],
                            'Name': singleObj['Name'],
                            'SubCode': singleObj['SubCode'],
                            'IsOptional': singleObj['IsOptional'],
                            'IsGradeSubject': singleObj['IsGradeSubject']
                        }

                        recordCurrentList.push(arrayObj);
                    });
                    // var collator = new Intl.Collator(undefined, {numeric: false, sensitivity: 'base',usage:'sort',ignorePunctuation:true});
                    // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.Name, b.Name))
                    this.setState({ subjectList: recordCurrentList });
                }
            }
            else {
                Alert.alert('Message', 'No Subject list is created for given Class or Section.');
            }
        }
        catch (error) {
            console.error("error", error);
        }
    }

    onHTTPError() {
        //this.changeLoadingStatus(false);
        Alert.alert('Message', 'Unable to connect with server, Please try again after some time');
    }

    changeLoadingStatus(isShow, msg) {
        this.setState({ loading: isShow, loadingMsg: msg });
    }

    onSectionValueChange(value) {
        this.setState({
            selectedSectionID: value.AutoSectionId,
            selectedClassID: value.AutoClassId, pickerSectionObj: value
        }, () => {
            if (value != 0) {
                this.getSubjectList();
            }
        });
    }

    // Added  by Nitin B on 17-01-2020
    onClassValueChange(value) {
        if (value != 0) {
            this.setState({ classObject: value }, () => {
                this.getSectionList(value.AutoClassId);
            });
        } else {
            this.setState({ classObject: value, SectionList: [] });
        }
    }

    onExamValueChange(value) {
        this.setState({ selectedExamID: value });
    }

    onTestTypeValueChange(value) {
        this.setState({ testTypeID: value });
    }

    onSubjectValueChange(value) {
        let str;
        if (value.IsGradeSubject == 1)
            str = "(Grading)";
        else
            str = "";

        this.setState({
            selectedSubjectID: value.AutoSubjectId, IsGradeSubject: value.IsGradeSubject,
            gradingTitle: str, pickerSubjectObj: value
        });
    }

    performSelectDate(type, date) {
        const dateResult = Moment(date, 'DD/MM/YYYY').toDate();
        const currDateVal = Moment(dateResult).format('YYYY/MM/DD');

        this.setState({ testDate: currDateVal, formatedDateToDisplay: dateResult });
    }

    checkForValidation() {
        if (!this.props.isEdit) {
            if (this.state.classObject == 0) {
                Alert.alert('Message', 'Please select class');
                return false;
            }
            else if (this.state.selectedSectionID == 0) {
                Alert.alert('Message', 'Please select section');
                return false;
            }
            else if (this.state.pickerSectionObj == 0) {
                Alert.alert('Message', 'Please select section');
                return false;
            }
            else if (this.state.selectedExamID == 0) {
                Alert.alert('Message', 'Please select exam');
                return false;
            }
            else if (this.state.pickerSubjectObj == 0) {
                Alert.alert('Message', 'Please select subject');
                return false;
            }


            else if (this.state.selectedSubjectID == 0) {
                Alert.alert('Message', 'Please select subject');
                return false;
            }
            else if (!Number(this.state.maxMarks) > 0) {
                Alert.alert('Message', 'Please add maximum marks for test');
                return false;
            } else if (Number(this.state.maxMarks) > 999) {
                Alert.alert('Message', 'Maximum Marks should contain three digits only.');
            } else if (!Number(this.state.minMarks) > 0) {
                Alert.alert('Message', 'Please add minimum marks for test');
                return false;
            } else if (Number(this.state.minMarks) > Number(this.state.maxMarks)) {
                Alert.alert('Message', 'Minimum Marks should not be greater than Maximum marks.');
            }
            else {
                this.addTestDetails();
                return true;
            }
        }
        else {
            if (!this.state.maxMarks > 0) {
                Alert.alert('Message', 'Please add maximum marks for test');
                return false;
            }
            else {
                this.addTestDetails();
                return true;
            }
        }

    }

    addTestDetails() {

        if (this.props.isEdit) {
            this.props.ActionAddTestResult({
                autoSectionId: this.props.selectedSectionID,
                autoExamId: this.props.selectedExamID,
                autoSubjectId: this.props.selectedSubjectID,
                testTypeID: this.state.testTypeID,
                maxMarks: this.state.maxMarks,
                minMarks: this.state.minMarks,
                testDate: this.state.testDate,
                sectionList: [], examList: [],
                subjectList: [], testTypeList: [],
                isSectionsListLoaded: true,
                isEdit: this.props.isEdit,
                IsGradeSubject: this.state.IsGradeSubject,
                gradingTitle: this.state.gradingTitle,
            });
            this.props.ActionUpdateTestResult({ sectionName: this.props.sectionName,examName: this.props.examName, subjectName: this.props.subjectName, AutoTestId: this.props.AutoTestId });
        }
        else {
            this.props.ActionAddTestResult({
                instituteId: this.props.instituteId,
                sectionList: this.state.sectionList,
                examList: this.state.examList,
                subjectList: this.state.subjectList,
                testTypeList: this.state.testTypeList,
                selectedClassID: this.state.selectedClassID,
                autoSectionId: this.state.selectedSectionID,
                autoExamId: this.state.selectedExamID,
                autoSubjectId: this.state.selectedSubjectID,
                IsGradeSubject: this.state.IsGradeSubject,
                gradingTitle: this.state.gradingTitle,
                testTypeID: this.state.testTypeID,
                pickerSectionObj: this.state.pickerSectionObj,
                pickerSubjectObj: this.state.pickerSubjectObj,
                maxMarks: this.state.maxMarks,
                minMarks: this.state.minMarks,
                testDate: this.state.testDate,
                isSectionsListLoaded: this.state.isSectionsListLoaded,
                isEdit: this.props.isEdit
            });
        }
    }

    render() {
        const sectionPickerItems = [];
        const sectionList = this.state.sectionList;
        sectionPickerItems.push(<Picker.Item label="Select section" value={0} />);
        sectionList.forEach(singleObj => {
            sectionPickerItems.push(<Picker.Item label={singleObj.SectionName} value={singleObj}
            />);
        });

        const examPickerItems = [];
        const examList = this.state.examList;
        let examName;

        examPickerItems.push(<Picker.Item label="Select exam" value={0} />);
        examList.forEach(singleObj => {
            if (singleObj.DisplayName == "")
                examName = singleObj.ExamType;
            else
                examName = singleObj.DisplayName + "(" + singleObj.ExamType + ")";

            examPickerItems.push(<Picker.Item label={examName} value={singleObj.AutoExamId} />);
        });

        const testTypePickerItems = [];
        const testTypeList = this.state.testTypeList;
        testTypeList.forEach(singleObj => {
            testTypePickerItems.push(<Picker.Item label={singleObj.TestTypeValue} value={singleObj.TestTypeKey} />);
        });


        const classPickerItems = [];
        const classList = this.state.classList;
        classPickerItems.push(<Picker.Item label="Select" value={0} />);
        classList.forEach(singleObj => {
            classPickerItems.push(<Picker.Item label={singleObj.ClassName} value={singleObj} />);
        });


        const subjectPickerItems = [];
        const subjectList = this.state.subjectList;
        subjectPickerItems.push(<Picker.Item label="Select subject" value={0} />);
        subjectList.forEach(singleObj => {
            subjectPickerItems.push(<Picker.Item label={singleObj.Name} value={singleObj} />);
        });

        let sectionNameLayout, examNameLayout, testTypeLayout, SubjectNameLayout, classNameLayout;

        if (this.props.isEdit) {
            classNameLayout = <Text style={{ width: '100%', paddingLeft: 5 }}>{this.props.className} </Text>
            sectionNameLayout = <Text style={{ width: '100%', paddingLeft: 5 }}>{this.props.sectionName} </Text>
        }

        else {
            // Added  by Nitin B on 17-01-2020
            classNameLayout = <Picker
                mode="dropdown"
                iosIcon={<Icon name="ios-arrow-down" />}
                placeholder="Select class"
                iosHeader="Select"
                style={{ width: '100%', height: 40 }}
                textStyle={{ maxWidth: '85%', paddingLeft: 5, paddingRight: 0 }}
                selectedValue={this.state.classObject}
                onValueChange={this.onClassValueChange.bind(this)}>
                {classPickerItems}
            </Picker>

            sectionNameLayout = <Picker
                mode="dropdown"
                iosIcon={<Icon name="ios-arrow-down" />}
                placeholder="Select section"
                iosHeader="Select section"
                style={{ width: '100%', height: 40 }}
                textStyle={{ maxWidth: '85%', paddingLeft: 5, paddingRight: 0 }}
                selectedValue={this.state.pickerSectionObj}
                onValueChange={this.onSectionValueChange.bind(this)}
            >
                {sectionPickerItems}
            </Picker>
        }


        if (this.props.isEdit) {
            examNameLayout = <Text style={{ width: '100%', paddingLeft: 5 }}>{this.props.examName} </Text>
        }
        else {
            examNameLayout = <Picker
                mode="dropdown"
                iosIcon={<Icon name="ios-arrow-down" />}
                placeholder="Select exam"
                iosHeader="Select exam"
                style={{ width: '100%', height: 40 }}
                textStyle={{ maxWidth: '85%', paddingLeft: 5, paddingRight: 0 }}
                selectedValue={this.state.selectedExamID}
                onValueChange={this.onExamValueChange.bind(this)}
            >
                {examPickerItems}
            </Picker>
        }

        testTypeLayout = <Picker
            mode="dropdown"
            iosIcon={<Icon name="ios-arrow-down" />}
            placeholder="Select test type"
            iosHeader="Select test type"
            style={{ width: '100%', height: 40 }}
            textStyle={{ maxWidth: '85%', paddingLeft: 5, paddingRight: 0 }}
            selectedValue={this.state.testTypeID}
            onValueChange={this.onTestTypeValueChange.bind(this)}
        >
            {testTypePickerItems}
        </Picker>

        if (this.props.isEdit) {
            SubjectNameLayout = <Text style={{ width: '100%', paddingLeft: 5 }}>{this.props.subjectName} </Text>
        }
        else {
            SubjectNameLayout = <Picker
                mode="dropdown"
                iosIcon={<Icon name="ios-arrow-down" />}
                placeholder="Select subject"
                iosHeader="Select subject"
                style={{ width: '100%', height: 40 }}
                textStyle={{ maxWidth: '85%', paddingLeft: 5, paddingRight: 0 }}
                selectedValue={this.state.pickerSubjectObj}
                onValueChange={this.onSubjectValueChange.bind(this)}
            >
                {subjectPickerItems}

            </Picker>
        }

        let dateFontStyle = { dateInput: { marginLeft: 8, color: appColor.font_gray, alignItems: 'flex-start', borderWidth: 0, fontSize: 20, width: '80%' } }

        // validate attendance date should start and end between session year
        // default date format(mm/dd/yyyy)
        let strSessionStartDate = this.props.SessionStartMonth + "/1/" + (this.props.SessionYear);

        const today = new Date();
        const sessionStartDate = new Date(strSessionStartDate);
        const sessionEndDate = new Date((sessionStartDate.getFullYear() + 1), (sessionStartDate.getMonth()), 0)

        let bool = (sessionEndDate.getTime() > today.getTime())
        if (!bool)
            Alert.alert('Message', "Your academic session is expired.Please login again to get updated session.", [{ 'text': 'OK' }]);

        return (
            <View style={{ flex: 1, backgroundColor: appColor.backgroundColor }}>
                <InternetConn />

                <Content style={{ padding: 10 }}>
                    <Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 10 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: -5, marginRight: -5, }}>

                                <Text style={layoutDesign.headingText}>Class </Text>
                                <View style={[layoutDesign.pickerLayout, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                                    {classNameLayout}
                                </View>
                                <Text style={layoutDesign.headingText}>Section </Text>
                                <View style={[layoutDesign.pickerLayout, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                                    {sectionNameLayout}
                                </View>

                                <Text style={layoutDesign.headingText}>Exam </Text>

                                <View style={[layoutDesign.pickerLayout, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                                    {examNameLayout}
                                </View>

                                <View style={{ flex: 1, flexDirection: 'row' }}>

                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <Text ref='HeadingText' style={layoutDesign.headingText}>Subject </Text>
                                            <Text style={layoutDesign.gradeText}>{this.state.gradingTitle} </Text>
                                        </View>

                                        <View style={[layoutDesign.pickerLayout, { flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: 10 }]}>
                                            {SubjectNameLayout}
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text style={layoutDesign.headingText}>Test Type </Text>
                                        <View style={layoutDesign.pickerLayout}>
                                            {testTypeLayout}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flex: 1, flexDirection: 'row' }}>

                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text style={layoutDesign.headingText}>Max. marks</Text>
                                        <View style={[layoutDesign.pickerLayout, { marginRight: 10 }]}>
                                            <Input
                                                ref="MaxMarks"
                                                onChangeText={(text) =>
                                                    this.setState({ maxMarks: text })}
                                                value={String(this.state.maxMarks)}
                                                keyboardType='decimal-pad'
                                                maxLength={3}
                                                returnKeyType="next"
                                                onBlur={() => {
                                                    if (this.state.maxMarks == '' || Number(this.state.maxMarks) == 0) {
                                                        Alert.alert('Message', 'Please add maximum marks for test');
                                                        this.refs.MaxMarks._root.focus();
                                                    } else {
                                                        if (Number(this.state.maxMarks) > 999) {
                                                            Alert.alert('Message', 'Maximum Marks should contain three digits only.');
                                                            this.refs.MaxMarks._root.focus();
                                                        }
                                                    }
                                                }}


                                            />
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text style={layoutDesign.headingText}>Min. marks</Text>
                                        <View style={[layoutDesign.pickerLayout]}>
                                            <Input
                                                ref="MinMarks"
                                                style={[{ height: 40 }]}
                                                onChangeText={(text) => this.setState({ minMarks: text })}
                                                value={String(this.state.minMarks)}
                                                keyboardType='decimal-pad'
                                                maxLength={3}
                                                returnKeyType="next"
                                                onSubmitEditing={() => {
                                                    if (this.state.minMarks == '' || Number(this.state.minMarks) == 0) {
                                                        Alert.alert('Message', 'Please add minimum marks for test');
                                                        this.refs.MinMarks._root.focus();
                                                    }
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flex: 1, flexDirection: 'column' }}>
                                    <Text style={layoutDesign.headingText}>Test Date</Text>
                                    <View style={[layoutDesign.pickerLayout, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
                                        <Icon name="calendar" style={{ color: appColor.black, fontSize: 30, marginLeft: 5, }} />
                                        <DatePicker
                                            date={this.state.formatedDateToDisplay}
                                            mode="date"
                                            androidMode="calendar"
                                            locale={"en"}
                                            confirmBtnText='Select'
                                            cancelBtnText='Cancel'
                                            iconComponent={<Icon name="md-calendar" style={{ fontSize: 0, color: appColor.black }} />}
                                            format='DD/MM/YYYY'
                                            onDateChange={(date) => this.performSelectDate('start', date)}
                                            customStyles={dateFontStyle}
                                            maxDate={sessionEndDate}
                                            minDate={sessionStartDate}
                                        />
                                    </View>
                                </View>

                            </View>
                        </CardItem>
                    </Card>

                </Content>

                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%', textAlign: 'center' }}
                    messageStyle={{ textAlign: 'center' }}
                    showProgress={true}
                    progressSize="large"
                    message={this.state.loadingMsg}
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={false}
                />}
            </View>
        );
    }
}

const layoutDesign = StyleSheet.create({

    headingText: {
        fontSize: 11, color: appColor.gray_title, marginTop: 5,
    },
    gradeText: {
        fontSize: 11, color: appColor.googleBlue, marginTop: 5,
    },
    pickerLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD', height: 40
    },
    item:
    {
        paddingLeft: 5,
        paddingRight: 2,
        paddingTop: 7,
        paddingBottom: 7,
        alignItems: 'center'
    }

});

const mapStateToProps = state => {
    return {

        instituteId: state.teacherInfo.InstituteId,
        SessionStartMonth: state.teacherInfo.SessionStartMonth,
        SessionYear: state.teacherInfo.SessionYear,
        sectionList: state.testResultInfo.sectionList,
        examList: state.testResultInfo.examList,
        subjectList: state.testResultInfo.subjectList,
        testTypeList: state.testResultInfo.testTypeList,
        selectedClassID: state.testResultInfo.selectedClassID,
        selectedSectionID: state.testResultInfo.autoSectionId,
        selectedExamID: state.testResultInfo.autoExamId,
        selectedSubjectID: state.testResultInfo.autoSubjectId,
        testTypeID: state.testResultInfo.testTypeID,
        pickerSectionObj: state.testResultInfo.pickerSectionObj,
        pickerSubjectObj: state.testResultInfo.pickerSubjectObj,
        maxMarks: state.testResultInfo.maxMarks,
        minMarks: state.testResultInfo.minMarks,
        testDate: state.testResultInfo.testDate,
        isSectionsListLoaded: state.testResultInfo.isSectionsListLoaded,
        isEdit: state.testResultInfo.isEdit,
        sectionName: state.testResultInfo.sectionName,
        className: state.testResultInfo.className,
        examName: state.testResultInfo.examName,
        subjectName: state.testResultInfo.subjectName,
        AutoTestId: state.testResultInfo.AutoTestId,
        IsGradeSubject: state.testResultInfo.IsGradeSubject,
        gradingTitle: state.testResultInfo.gradingTitle

    };
};
export default connect(mapStateToProps, { ActionAddTestResult, ActionAddTestResultStudentList, ActionAddTeacher, ActionUpdateTestResult })(StepSelectTest);