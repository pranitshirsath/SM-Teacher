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
import { ActionAddDiaryDetailsStep1 } from '../redux_reducers/SchoolDiaryReducer';

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
import { ActionAddAttendance } from '../redux_reducers/AttendanceReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';
import { TouchableOpacity } from 'react-native-gesture-handler';

class AddEditAttendanceWnd extends React.Component {

    constructor(props) {
        super(props)
        this.state =
        {
            loading: false, loadingMsg: '',
            attendanceDate: this.props.attDate,
            formattedDateForDisplay: '',
            selectedSectionID: this.props.sectionID,
            sectionObject: '',
            sectionName: this.props.sectionName,
            studentList: this.props.studentList,
            AllSectionList: [], SectionList: [],
            classList: [],
            sectionWithNoAttendance: false,
            strHolidayMsg: '', isEditDetails: this.props.isEditDetails,
            isAttendanceTaken: 0,
            selectedClass: 0,
            classObject: '',
        }
    }

    componentDidMount() {
        if (this.props.isEditDetails) {
            // this.getSectionList();
            this.getClassList();

            console.info("sectionID", this.state.selectedSectionID);
            console.info("studentList", this.state.studentList);
            console.info("date from props", this.state.attendanceDate);

            const dateResult = Moment(this.state.attendanceDate, 'YYYY/MM/DD').toDate();
            const currDateVal = Moment(dateResult).format('DD/MM/YYYY');

            this.setState({ formattedDateForDisplay: currDateVal }, () => {
                this.checkForHoliday();
            });
        } else {
            // this.getSectionList();
            this.getClassList();
            console.info("sectionID", this.state.selectedSectionID);
            console.info("studentList", this.state.studentList);
            console.info("date from props", this.state.attendanceDate);
            const dateResult = Moment(this.state.attendanceDate, 'YYYY/MM/DD').toDate();
            const currDateVal = Moment(dateResult).format('DD/MM/YYYY');
            this.setState({ formattedDateForDisplay: currDateVal }, () => {
                this.checkForHoliday();
            });
        }
    }

    changeLoadingStatus(isShow, msg) {
        this.setState({ loading: isShow, loadingMsg: msg });
    }

    getClassList() {
        // this.changeLoadingStatus(true);
        const obj = new HTTPRequestMng('', 'GetClassList', this)
        console.log(this.props.instituteId);
        obj.executeRequest("InstituteId=" + this.props.instituteId);
    }

    getSectionList(classId) {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                const obj = new HTTPRequestMng('', 'GetSectionList', this)
                //obj.executeRequest("InstituteId="+ this.props.instituteId +"&date="+this.state.attendanceDate);
                obj.executeRequest("InstituteId=" + this.props.instituteId + "&AutoClassId=" + classId);
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
        });
    }

    getStudentList() {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                const obj = new HTTPRequestMng('', 'GetStudentList', this)
                obj.executeRequest("InstituteId=" + this.props.instituteId + "&AutoSectionId=" + this.state.selectedSectionID);
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
        });
    }

    checkForHoliday() {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                const obj = new HTTPRequestMng('', 'GetHolidayList', this)
                obj.executeRequest("InstituteId=" + this.props.instituteId + "&date=" + this.state.attendanceDate);
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
        });
    }


    async onHTTPReponseClassList(respData) {
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
                    let that = this;
                    let recordExist = await recordCurrentList.find(function (item, index) {
                        return item.ClassName == that.props.sectionName.split('-')[0]
                    })
                    this.setState({
                        classList: recordCurrentList,
                        subjectList: [],
                        selectedClass: recordExist ? recordExist.AutoClassId : 0,
                        classObject: recordExist
                    });

                    this.getSectionList(this.state.selectedClass);
                }
            }
            else {
                Alert.alert('Message', 'There is no Class found for given Institute.');
                this.setState({ isClassListLoaded: false });
            }
        }
        catch (error) {
            console.error("error", error);
            Alert.alert('SectionList', JSON.stringify(error));
            this.setState({ isClassListLoaded: false });
        }
    }
    onHTTPResponseSectionList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];
            let recordCurrentList = [];
            if (status == 'Success') {
                const listData = jsonRec['Data'];
                console.info("SectionListData", listData);
                let SectionObject = '';

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'SectionName': singleObj['SectionName'],
                            'AutoSectionId': singleObj['AutoSectionId'],
                            'AutoClassId': singleObj['AutoClassId'],
                            'IsAttendanceTaken': singleObj['IsAttendanceTaken']
                        }
                        recordCurrentList.push(arrayObj);
                        if (this.props.sectionID == singleObj['AutoSectionId'])
                            SectionObject = arrayObj;
                    });
                    if (this.state.isEditDetails) {
                        this.setState({
                            AllSectionList: recordCurrentList,
                            SectionList: recordCurrentList,
                            sectionObject: SectionObject,
                            selectedSectionID: this.props.selectedSectionID ? this.props.selectedSectionID : 0,
                        });
                    }
                    else {
                        this.setState({
                            AllSectionList: recordCurrentList,
                            SectionList: recordCurrentList,
                            selectedSectionID: this.props.selectedSectionID ? this.props.selectedSectionID : 0,
                            studentList: []
                        });
                    }
                }
            }
            else {
                Alert.alert('Message', 'Section is not created for given Class.');
                this.setState({
                    AllSectionList: recordCurrentList,
                    SectionList: recordCurrentList,
                    studentList: [],
                    selectedSectionID: this.props.selectedSectionID ? this.props.selectedSectionID : 0
                });
            }

        }
        catch (error) {
            console.error("error", error);
        }
        finally {
            this.changeLoadingStatus(false);
        }
    }

    onHTTPResponseHolidayList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {
                const listData = jsonRec['Data'];
                console.info("HolidayListData", listData);
                let recordCurrentList = [];
                //let msg="It's holiday on selected date "
                let msg = "";

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'AutoHolidayId': singleObj['AutoHolidayId'],
                            'Remark': singleObj['Remark'],
                            'FromDate': singleObj['FromDate'],
                            'ToDate': singleObj['ToDate']
                        }
                        recordCurrentList.push(arrayObj);

                        if (singleObj['FromDate'] == singleObj['ToDate'])
                            msg = '\n' + "[" + singleObj['Remark'] + "]";
                        else
                            msg = '\n' + "[" + singleObj['Remark'] + " from " + singleObj['FromDate'] + " to " + singleObj['ToDate'] + "]";
                    });

                    this.setState({ strHolidayMsg: msg });
                }
                else {
                    // no holiday on selected date
                    this.setState({ strHolidayMsg: '' });
                }
            }
            else {
                // no holiday on selected date
                this.setState({ strHolidayMsg: '' });
            }

        }
        catch (error) {
            console.error("error", error);
        }
        finally {
            this.changeLoadingStatus(false);
        }
    }



    onHTTPResponseStudentList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {
                const listData = jsonRec['Data'];
                console.info("StudentList", listData);
                let recordCurrentList = [];

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'AutoStudId': singleObj['AutoStudId'],
                            'StudentName': singleObj['StudentName'],
                            'RegistrationNumber': singleObj['RegistrationNumber'],
                            'RollNo': singleObj['RollNo'],
                            'AutoParentId': singleObj['AutoParentId'],
                            'IsPresent': true
                        }
                        recordCurrentList.push(arrayObj);
                    });
                    this.setState({ studentList: recordCurrentList });
                }
            }
            else {
                Alert.alert('Message', 'There is no student found for given Section.');

            }

        }
        catch (error) {
            console.error("error", error);
        }
        finally {
            this.changeLoadingStatus(false);
        }
    }

    onHTTPError() {
        this.changeLoadingStatus(false);
        Alert.alert('Message', 'Unable to connect with server, Please try again after some time');
    }

    onSectionCheckBoxValueChange() {
        this.setState({ sectionWithNoAttendance: !this.state.sectionWithNoAttendance }, () => {
            if (this.state.sectionWithNoAttendance) {
                this.getSectionWithNoAttendanceTaken();
            }
            else {
                this.setState({
                    SectionList: this.state.AllSectionList, selectedSectionID: 0,
                    studentList: []
                });
            }
        });
    }

    onSectionValueChange(value) {
        this.setState({
            selectedSectionID: value.AutoSectionId,
            isAttendanceTaken: value.IsAttendanceTaken, sectionName: value.SectionName,
            sectionObject: value
        }, () => {
            if (value != 0) {
                if (value.AutoSectionId != 0) {
                    if (this.state.isEditDetails) {
                        if (this.state.selectedSectionID == this.props.sectionID &&
                            this.state.attendanceDate == this.props.attDate) {
                            this.setState({ studentList: this.props.studentList });
                        }
                        else {
                            this.changeLoadingStatus(true, "getting student list...");
                            this.getStudentList();
                        }
                    }
                    else {
                        this.changeLoadingStatus(true, "getting student list...");
                        this.getStudentList();
                    }
                }
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
        console.log(this.state.classObject)
    }

    getSectionWithNoAttendanceTaken() {
        let listData = this.state.AllSectionList;
        let recordCurrentList = [];
        listData.forEach((singleObj) => {
            if (singleObj['IsAttendanceTaken'] == 0) {
                const arrayObj = {
                    'SectionName': singleObj['SectionName'],
                    'AutoSectionId': singleObj['AutoSectionId'],
                    'AutoClassId': singleObj['AutoClassId'],
                    'IsAttendanceTaken': singleObj['IsAttendanceTaken']
                }
                recordCurrentList.push(arrayObj);
            }
        });
        this.setState({
            SectionList: recordCurrentList, selectedSectionID: 0,
            studentList: []
        });
    }

    performSelectDate(type, date) {
        const dateResult = Moment(date, 'dddd DD/MM/YYYY').toDate();
        const currDateVal = Moment(dateResult).format('YYYY/MM/DD');

        this.setState({ attendanceDate: currDateVal });
        this.setState({ formattedDateForDisplay: date });
        // this.getSectionList();
        this.checkForHoliday();

        if (this.state.sectionWithNoAttendance) {
            this.getSectionWithNoAttendanceTaken();
        }
    }


    performClear() {
        if (this.state.isEditDetails) {
            Alert.alert('Are you sure?', "You want to delete this attendance?",
                [
                    { text: 'No' },
                    {
                        text: 'Yes', onPress: () => {
                            this.deleteAttendanceDetails();
                        }
                    },
                ])
        } else {
            this.setState({
                selectedSectionID: 0, strHolidayMsg: '', studentList: [],
                sectionWithNoAttendance: false
            });
        }
    }

    checkForValidation() {
        if (this.state.classObject == 0) {
            Alert.alert('Message', 'Select class for taking attendance');
        } else if (this.state.sectionObject != 0) {
            if (this.state.isAttendanceTaken == 1) {
                if (this.state.isEditDetails) {
                    if (this.state.selectedSectionID == this.props.sectionID &&
                        this.state.attendanceDate == this.props.attDate) // check for not sync record
                    {
                        this.performSaveUpdateAttendance()
                    }
                    else {
                        const dateResult = Moment(this.state.formattedDateForDisplay, 'dddd DD/MM/YYYY').toDate();
                        const strDate = Moment(dateResult).format('DD/MM/YYYY');

                        let msg = "Attendance for section (" + this.state.sectionName + ") is already taken for date " + String(strDate) + "."

                        Alert.alert('Warning', msg, [
                            { text: 'ok' }]);
                    }
                }
                else {
                    const dateResult = Moment(this.state.formattedDateForDisplay, 'dddd DD/MM/YYYY').toDate();
                    const strDate = Moment(dateResult).format('DD/MM/YYYY');

                    let msg = "Attendance for section (" + this.state.sectionName + ") is already taken for date " + String(strDate) + "."

                    Alert.alert('Warning', msg, [
                        { text: 'ok' }]);
                }
            }
            else if (this.state.strHolidayMsg != "") {
                Alert.alert('Warning', this.state.strHolidayMsg +
                    '\nDo you want to continue?',
                    [
                        { text: 'No' },
                        { text: 'Yes', onPress: () => this.performSaveUpdateAttendance() }
                    ]);
            }
            else {
                this.performSaveUpdateAttendance()
            }
        }
        else {
            Alert.alert('Message', 'Select section for taking attendance');
        }
    }


    performSaveUpdateAttendance() {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                if (this.props.isEditDetails) {
                    //delete attendance first then add new record
                    const obj = new HTTPRequestMng('', 'DeleteAttendanceInBackground', this)
                    obj.executeRequest("InstituteId=" + this.props.instituteId + "&AutoAttendId=" + this.props.attendanceID);
                }
                else {
                    this.saveAttendanceDetailsOnServer("saving details...");
                }
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
        });
    }

    saveAttendanceDetailsOnServer(msg) {
        // this.changeLoadingStatus(true, msg)

        let jsonArrayStudent = [];
        let sectionId;
        let recordList = this.state.studentList;
        recordList.forEach(singleObj => {
            jsonArrayStudent.push({
                "AutoStudId": singleObj['AutoStudId'],
                "IsPresent": singleObj['IsPresent']
            });
        });



        //create sending json
        if (this.props.sectionID > 0) {
            sectionId = this.props.sectionID
        }
        else if (this.state.selectedSectionID) {
            sectionId = this.state.selectedSectionID
        }
        const requestJson = {
            'InstituteId': this.props.instituteId,
            'AutoSectionId': sectionId,
            'Date': this.state.attendanceDate,
            'StudentList': jsonArrayStudent
        };
        // console.log(this.props)
        // console.log(this.state)
        const obj = new HTTPRequestMng('', 'SaveAttendance', this);
        obj.executeRequest(requestJson);
    }



    onHTTPResponseAttendanceSaved(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Status'];
            const msg = jsonRec['Message'];

            if (status == 1) {
                Alert.alert('Message', msg, [
                    {
                        'text': 'OK', onPress: () => {
                            this.props.navigation.state.params.onScreenRefresh();
                            this.props.navigation.goBack();
                        }
                    }
                ]);
            }
            else {
                Alert.alert('Success', msg, [{ 'text': 'OK' }]);
            }
        }
        catch (error) {
            console.error("error", error);
        }
        finally {
            this.changeLoadingStatus(false);
        }
    }



    deleteAttendanceDetails() {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                this.changeLoadingStatus(true, "Deleting  details...")
                const obj = new HTTPRequestMng('', 'DeleteAttendance', this)
                obj.executeRequest("InstituteId=" + this.props.instituteId + "&AutoAttendId=" + this.props.attendanceID);
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
        });
    }

    onHTTPResponseAttendanceDelete(respData) {
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
                Alert.alert('Success', msg, [{ 'text': 'OK' }]);
            }
        }
        catch (error) {
            console.error("error", error);
        }
        finally {
            this.changeLoadingStatus(false);
        }
    }

    onHTTPResponseAttendanceBackgroundDelete(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Status'];
            const msg = jsonRec['Message'];

            if (status == 1) {
                this.saveAttendanceDetailsOnServer("updating details...");
            }
            else {
                Alert.alert('Success', "Unable to update details. Please try again.", [{ 'text': 'OK' }]);
            }
        }
        catch (error) {
            console.error("error", error);
        }
    }

    onStudentRecordClick(val, index) {
        let recordList = this.state.studentList;
        recordList[index].IsPresent = !recordList[index].IsPresent;
        this.setState({ studentList: recordList });
    }

    onRenderStudentListData(item, index) {
        // return <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-evenly',backgroundColor:'white',marginTop:5,paddingTop:3,paddingBottom:3,paddingLeft:5,paddingRight:5}}>

        //            {/* <View style={{marginLeft:-20}}>
        //             <Switch
        //                 value={item.IsPresent}
        //                 onValueChange={(val) => {this.onStudentRecordClick(val,index)}}
        //                 trackColor={{true: appColor.googleGreen, false:appColor.googleRed}}
        //                 thumbColor={'white'}
        //             />
        //             </View>
        //             <TouchableOpacity onPress = {()=>{
        //                 let message = 'Not given';
        //                 if(item.RegistrationNumber!=''){
        //                     message = item.RegistrationNumber;
        //                 }
        //                 Alert.alert('Registration Number',message)}
        //                 }>
        //             <Text style={[{width:120,numberOfLines:2,textAlign:'center',ellipsizeMode:'end'}]}>{item.StudentName}</Text>
        //             </TouchableOpacity>
        //             <View >
        //            <Text style={[layoutDesign.item]}> {item.RollNo==''?'-':(item.RollNo)}</Text>


        //             </View> */}

        //         <View>
        //             <Switch
        //                 value={item.IsPresent}
        //                 onValueChange={(val) => {this.onStudentRecordClick(val,index)}}
        //                 trackColor={{true: appColor.googleGreen, false:appColor.googleRed}}
        //                 thumbColor={'white'}
        //             />
        //             </View>

        //             <TouchableOpacity onPress = {()=>{
        //                 let message = 'Not given';
        //                 if(item.RegistrationNumber!=''){
        //                     message = item.RegistrationNumber;
        //                 }
        //                 Alert.alert('Registration Number',message)}
        //                 }>
        //             <Text style={[{width:120,numberOfLines:2,textAlign:'left',ellipsizeMode:'end'}]}>{item.StudentName}</Text>
        //             </TouchableOpacity>
        //            <Text style={{textAlign:'left'}}> {item.RollNo==''?'-':(item.RollNo)}</Text>
        //         </View>
        return <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white'
        }}>
            <View style={{ width: 120, justifyContent: 'center', marginTop: 3 }}>
                <Switch
                    value={item.IsPresent}
                    onValueChange={(val) => { this.onStudentRecordClick(val, index) }}
                    trackColor={{ true: appColor.googleGreen, false: appColor.googleRed }}
                    thumbColor={'white'}
                    style={[{ fontSize: 11, textAlign: 'center', alignSelf: 'center' }]}
                />
            </View>
            <View style={{ width: 120, padding: 1, justifyContent: 'center', marginTop: 3 }}>

                <TouchableOpacity onPress={() => {
                    let message = 'Not given';
                    if (item.RegistrationNumber != '') {
                        message = item.RegistrationNumber;
                    }
                    Alert.alert('Registration Number', message)
                }

                } style={{ alignSelf: 'center', flexWrap: 'wrap' }}>
                    {/* <Text style={[{fontSize:14,width:120,textAlign:'left',ellipsizeMode:'end'}]}>{item.StudentName}</Text> */}
                    <Text style={[{ fontSize: 14, flexWrap: 'wrap', textAlign: 'left', ellipsizeMode: 'end', paddingLeft: 5 }]}>{item.StudentName}</Text>
                </TouchableOpacity>
            </View>
            <View style={{ width: 120, justifyContent: 'center', marginTop: 3 }}>
                <Text style={[{ fontSize: 13, textAlign: 'center', alignSelf: 'center' }]}> {item.RollNo == '' ? '-' : (item.RollNo)}</Text>
                {/* <Text  style={[{fontSize:11,textAlign:'center',alignSelf:'center'}]}>123456879</Text> */}
            </View>
        </View>
    }

    render() {
        let title;
        if (this.state.isEditDetails)
            title = "Update Attendance"
        else
            title = "Student Attendance"
        // validate attendance date should start and end between session year
        // default date format of date picker (mm/dd/yyyy)
        let strSessionStartDate = this.props.SessionStartMonth + "/1/" + (this.props.SessionYear);

        const today = new Date();
        const sessionStartDate = new Date(strSessionStartDate);
        const sessionEndDate = new Date((sessionStartDate.getFullYear() + 1), (sessionStartDate.getMonth()), 0)

        let bool = (sessionEndDate.getTime() > today.getTime())

        if (!bool)
            Alert.alert('Message', "Your academic session is expired.Please login again to get updated session.", [{ 'text': 'OK' }]);
        const classPickerItems = [];
        const classList = this.state.classList;
        classPickerItems.push(<Picker.Item label="Select" value={0} />);
        classList.forEach(singleObj => {
            classPickerItems.push(<Picker.Item label={singleObj.ClassName} value={singleObj} />);
        });

        const sectionPickerItems = [];
        const tempSectionList = this.state.SectionList;
        sectionPickerItems.push(<Picker.Item label="Select" value={0} />);

        tempSectionList.forEach(singleObj => {
            sectionPickerItems.push(<Picker.Item label={singleObj.SectionName} value={singleObj} />);
        });

        let sectionNameLayout = <Picker
            mode="dropdown"
            iosIcon={<Icon name="ios-arrow-down" />}
            placeholder="Select"
            iosHeader="Select"
            textStyle={{ paddingLeft: 5, paddingRight: 0 }}
            selectedValue={this.state.sectionObject}
            onValueChange={this.onSectionValueChange.bind(this)}>
            {sectionPickerItems}
        </Picker>

        // Added  by Nitin B on 17-01-2020
        let classNameLayout = <Picker
            mode="dropdown"
            iosIcon={<Icon name="ios-arrow-down" />}
            placeholder="Select"
            iosHeader="Select"
            textStyle={{ paddingLeft: 5, paddingRight: 0 }}
            selectedValue={this.state.classObject}
            onValueChange={this.onClassValueChange.bind(this)}>
            {classPickerItems}

        </Picker>
        let checkLayout
        if (!this.state.sectionWithNoAttendance) {
            checkLayout = <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Icon name='square-outline' style={{ fontSize: 24 }} />
                <Text style={{ marginLeft: 5, fontSize: 14 }}>Show section for which attendance is not taken </Text>
            </View>
        }
        else {
            checkLayout = <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Icon name='checkbox' style={{ fontSize: 24 }} />
                <Text style={{ marginLeft: 5, fontSize: 14 }}>Show section for which attendance is not taken </Text>
            </View>
        }

        let btnClearText;
        if (this.props.isEditDetails)
            btnClearText = "Delete";
        else
            btnClearText = "Clear";

        let btnSaveText;
        if (this.props.isEditDetails)
            btnSaveText = "Update";
        else
            btnSaveText = "Save";
        let footerLayout;

        if (this.state.isAttendanceTaken == 1) {
            footerLayout = <View></View>
        }
        else {
            if (this.state.studentList.length > 0) {
                clearButtonLayout = <Button transparent onPress={() => this.performClear()}>
                    <Icon name="close" style={{ color: 'white' }} />
                    <Text style={{ color: 'white', fontSize: 18, marginLeft: -20, alignItems: 'center' }}>{btnClearText}</Text>
                </Button>
            } else {
                clearButtonLayout = <View></View>
            }

            footerLayout = <View style={{ flexDirection: 'row', height: 50, backgroundColor: appColor.colorPrimaryDark }}>
                {/* <Button transparent onPress={() => this.performClear()}>
                            <Icon name="close" style={{ color: 'white' }} />
                            <Text style={{color: 'white', fontSize: 18, marginLeft: -20 ,  alignItems: 'center'}}>{btnClearText}</Text>
                        </Button> */}
                {clearButtonLayout}
                <View style={{ flex: 1, flexDirection: 'row' }}></View>
                <Button transparent onPress={() => this.checkForValidation()}>
                    <Text style={{ color: 'white', fontSize: 18, marginRight: -20, alignItems: 'center' }}>{btnSaveText}</Text>
                    <Icon name="md-checkmark" style={{ color: 'white' }} />
                </Button>
            </View>
        }


        let dateFontStyle = { dateInput: { marginLeft: 8, color: appColor.font_gray, alignItems: 'flex-start', borderWidth: 0, fontSize: 20, width: '80%' } }

        let holidayMsgView
        if (this.state.strHolidayMsg == "") {
            holidayMsgView = <View></View>
        }
        else {
            const dateResult = Moment(this.state.formattedDateForDisplay, 'dddd DD/MM/YYYY').toDate();
            const strDate = Moment(dateResult).format('DD/MM/YYYY');

            holidayMsgView = <Text style={layoutDesign.holidayTextStyle}>{strDate} is a holiday. {this.state.strHolidayMsg}</Text>
        }

        let presentCount, absentCount;
        let recordList = this.state.studentList;

        if (recordList.length > 0) {
            presentCount = 0, absentCount = 0;
            recordList.forEach(singleObj => {
                if (singleObj['IsPresent'])
                    presentCount++;
                else
                    absentCount++;
            });
        }
        else {
            presentCount = '', absentCount = '';
        }

        let listHeader;
        if (this.state.studentList.length > 0) {

            //    listHeader= <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-evenly',backgroundColor:appColor.lighten_gray,marginTop:5,paddingTop:3,paddingBottom:3,alignItems:'center'}}>
            //                     {/* <Text style={[{flexGrow: 1,fontSize:11}]}></Text>
            //                     <Text style={[{flexGrow: 1,fontSize:11}]}>Student Name</Text>
            //                     <Text style={[{flexGrow: 1,fontSize:11,
            //                    textAlign: 'right',marginRight: 15}]}>Roll No.</Text> */}
            //                     <Text style={[{fontSize:11,textAlign:'center',paddingLeft:10,paddingRight:10}]}></Text>
            //                     <Text style={[{fontSize:11,textAlign:'center',paddingLeft:10,paddingRight:10}]}>Student Name</Text>
            //                     <Text style={[{fontSize:11,textAlign:'right',marginLeft:0,paddingLeft:10,paddingRight:0,marginRight:0}]}>Roll No.</Text>
            //                 </View>



            // listHeader= <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-evenly',backgroundColor:appColor.lighten_gray,marginTop:5,paddingTop:3,paddingBottom:3,paddingLeft:5,paddingRight:5}}>
            // <Text style={[{fontSize:11,color:appColor.lighten_gray}]}> Student Name  </Text>
            // <Text style={[{fontSize:11,textAlign:'left'}]}> Student Name </Text>
            // <Text style={[{fontSize:11,textAlign:'left'}]}> Roll No. </Text>

            // {/* <Text style={[{fontSize:11,
            //     textAlign:'center',paddingLeft:10,paddingRight:10}]}></Text> */}
            // </View>

            listHeader = <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: appColor.lighten_gray,
            }}>
                <View style={{ width: 120, height: 50, justifyContent: 'center' }}>
                    <Text style={[{ fontSize: 11, textAlign: 'center', }]}>   </Text>
                </View>
                <View style={{ width: 120, height: 50, justifyContent: 'center', padding: 1 }}>
                    <Text style={[{ fontSize: 11, textAlign: 'left', }]}> Student Name </Text>
                </View>
                <View style={{ width: 120, height: 50, justifyContent: 'center', }}>
                    <Text style={[{ fontSize: 11, textAlign: 'center', }]}> Roll No. </Text>
                </View>
            </View>
        }
        else {
            listHeader = <View></View>;
        }

        let StudentListLayout = <Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 5 }}>
            <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                <View style={{ flex: 1, flexDirection: 'column', marginLeft: -15, marginRight: -15, }}>
                    <View style={{
                        width: '100%', flex: 1, flexDirection: 'row',
                        paddingLeft: 5, paddingRight: 5
                    }}>

                        <Text style={[layoutDesign.headerText, { flex: 1, marginLeft: 5 }]}>Total {this.state.studentList.length} Students</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <View style={[layoutDesign.view_bg_present]}>
                                <Text style={layoutDesign.viewText}>{presentCount} P</Text></View>
                            <View style={[layoutDesign.view_bg_absent, { marginLeft: 10, }]}>
                                <Text style={layoutDesign.viewText}>{absentCount} A</Text></View>
                        </View>

                    </View>
                    {listHeader}
                    <FlatList
                        data={this.state.studentList}
                        renderItem={({ item, index }) => this.onRenderStudentListData(item, index)}
                        enableEmptySections={true}
                        keyExtractor={(item, index) => index.toString()}
                        extraData={this.state}
                    />
                </View>
            </CardItem>
        </Card>

        let attendanceTakenMsg
        if (this.state.isAttendanceTaken == 1) {
            if (this.state.selectedSectionID == this.props.sectionID &&
                this.state.attendanceDate == this.props.attDate) {
                attendanceTakenMsg = <View></View>
            }
            else {
                attendanceTakenMsg = <Text style={layoutDesign.msgAlertStyle}>Attendance for section ({this.state.sectionName}) is already taken.</Text>
                StudentListLayout = <View></View>;
            }
        }
        else {
            attendanceTakenMsg = <View></View>
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
                        <Title>{title}</Title>
                    </Body>
                </Header>

                <View style={{ flex: 1, backgroundColor: appColor.backgroundColor }}>
                    <InternetConn />
                    <Content style={{ padding: 10 }}>
                        <Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 10 }}>
                            <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 0.5, flexDirection: 'column', paddingRight: 1.5 }}>
                                                <Text style={layoutDesign.headingText}>Class </Text>
                                                <View style={[layoutDesign.pickerLayout, { paddingRight: 5 }]}>
                                                    {classNameLayout}
                                                </View>
                                            </View>
                                            <View style={{ flex: 0.5, flexDirection: 'column', paddingLeft: 1.5 }}>
                                                <Text style={layoutDesign.headingText}>Section </Text>
                                                <View style={[layoutDesign.pickerLayout, { paddingRight: 5 }]}>
                                                    {sectionNameLayout}
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, flexDirection: 'column' }}>
                                            <Text style={layoutDesign.headingText}>Date </Text>
                                            <View style={[layoutDesign.pickerLayout, { marginRight: 10, flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
                                                <Icon name="calendar" style={{ color: appColor.black, fontSize: 30, marginLeft: 5, }} />
                                                <DatePicker
                                                    date={this.state.formattedDateForDisplay}
                                                    mode="date"
                                                    androidMode="calendar"
                                                    locale={"en"}
                                                    confirmBtnText='Select'
                                                    cancelBtnText='Cancel'
                                                    iconComponent={<Icon name="md-calendar" style={{ fontSize: 0, color: appColor.black }} />}
                                                    format='dddd      DD/MM/YYYY'
                                                    onDateChange={(date) => this.performSelectDate('start', date)}
                                                    customStyles={dateFontStyle}
                                                    maxDate={today}
                                                    minDate={sessionStartDate}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    {holidayMsgView}
                                    <TouchableHighlight underlayColor='#00000010' style={layoutDesign.rowLayout}
                                        onPress={() => this.onSectionCheckBoxValueChange()}>
                                        {checkLayout}
                                    </TouchableHighlight>
                                    {attendanceTakenMsg}
                                </View>
                            </CardItem>
                        </Card>
                        {StudentListLayout}

                    </Content>

                    {footerLayout}
                    {/* <View style={{ flexDirection: 'row', height: 50, backgroundColor:appColor.colorPrimaryDark }}>
                            {footerClearBtn}
                            <View style={{flex: 1, flexDirection: 'row'}}></View>                   
                            {footerSaveBtn}
                </View> */}
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
                    showCancelButton={false}
                    showConfirmButton={false}
                />}
            </Container>);
    }
}

const layoutDesign = StyleSheet.create({
    headingText: {
        fontSize: 12, color: appColor.gray_title
    },

    pickerLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD', height: 50
    },
    headerText: {
        fontSize: 18, color: appColor.colorPrimary,
    },
    rowLayout:
    {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        marginTop: 5,
    },
    item:
    {
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 7,
        paddingBottom: 7,
        alignItems: 'center'
    },
    view_bg_present:
    {
        height: 30,
        width: 30,
        backgroundColor: appColor.googleGreen,
        alignItems: 'center',
        justifyContent: 'center'
    },
    view_bg_absent:
    {
        height: 30,
        width: 30,
        backgroundColor: appColor.googleRed,
        alignItems: 'center',
        justifyContent: 'center'
    },
    viewText:
    {
        fontSize: 14, color: appColor.white
    },
    holidayTextStyle:
    {
        fontSize: 12, marginTop: 2,
        color: appColor.holiday
    },
    msgAlertStyle:
    {
        fontSize: 14, marginTop: 2,
        color: appColor.holiday
    }

});

//export default AddEditAttendanceWnd;
const mapStateToProps = state => {
    return {
        instituteId: state.teacherInfo.InstituteId,
        SessionStartMonth: state.teacherInfo.SessionStartMonth,
        SessionYear: state.teacherInfo.SessionYear,
        attendanceID: state.attendanceInfo.attendanceID,
        sectionID: state.attendanceInfo.sectionID,
        sectionName: state.attendanceInfo.sectionName,
        isEditDetails: state.attendanceInfo.isEditDetails,
        totalStud: state.attendanceInfo.totalStud,
        totalPresent: state.attendanceInfo.totalPresent,
        totalAbsent: state.attendanceInfo.totalAbsent,
        attDate: state.attendanceInfo.attDate,
        studentList: state.attendanceInfo.studentList,
        isOfflineRecord: state.attendanceInfo.isOfflineRecord
    };
};
export default connect(mapStateToProps, { ActionAddAttendance, ActionAddTeacher })
    (AddEditAttendanceWnd);

