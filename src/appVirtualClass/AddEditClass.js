import React, { Component } from 'react';
import {
    View, Alert, RefreshControl, Platform,
    StyleSheet, Dimensions,
    Image,
    FlatList,
    PermissionsAndroid,
    CheckBox,
    Switch,
    InteractionManager,
    LayoutAnimation,
    UIManager,
} from 'react-native';

import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Thumbnail, Subtitle, Toast, Card, CardItem, Item, Input,
    Footer, Textarea,
    Picker, ActionSheet
} from "native-base";
import AsyncStorage from '@react-native-community/async-storage';
import InternetConn from '../networkConn/OfflineNotice';
import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';
import HTTPRequestMng from './HTTPRequestMng';
import ImagePicker from 'react-native-image-crop-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import RNFS, { stat } from 'react-native-fs';
import NetInfo from "@react-native-community/netinfo";
import { RadioButton } from 'react-native-paper';
import DatePicker from 'react-native-datepicker';
import DBOperation from '../db/DBOperation';
import RNFetchBlob from 'rn-fetch-blob';
import Moment from 'moment';
import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';
import appJson from '../../app.json';

import { ActionAddVirtualClass, ActionDeleteVirtualClass } from '../redux_reducers/VirtualClassReducer';
import { connect } from 'react-redux';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';

class AddEditClass extends Component {
    constructor(props) {
        super(props)
        this.state = {
            classRef: this,
            loading: false,
            instituteID: null,
            display:true,
            branchID: this.props.branchID,
            isSelected: false,
            isMute: this.props.isMute,
            subjectName: this.props.subjectName,
            batchName: this.props.batchName,
            dateResult: this.props.meetingDate,
            timeResult: this.props.meetingTime,
            duration: this.props.duration || 30,
            topic: this.props.topic,
            isEdit: this.props.isEdit,
            meetingIDatTimeofEdit:"",
            zoomUserId: 0,
            dateformat: new Date(),
            meetingId: this.props.meetingId,
            MeetingProviderId: this.props.MeetingProviderId,
            password: this.props.password,
            isActive: this.props.isActive,
            StatusFlag: this.props.StatusFlag,
            VCMeetingId: this.props.VCMeetingId,
            MeetingData: {},
            newDate: new Moment().format('YYYY-MM-DD'),
            screenRefresh: false,
            virtualTitle: 'New Virtual Class',
            buttonTitle: 'Save',
            hostChecked: this.props.IsHostVideo || 'OFF',
            participantChecked: this.props.IsVideoParticipant || 'OFF',
            muteChecked: this.props.MuteParticipantOnEntry || 'OFF',
            waitingChecked: this.props.EnableWaitingRoom || 'OFF',
            approvalChecked: this.props.EnableApprovalonInviteLink || 'OFF',
            recordingChecked: this.props.IsVideoRecording || 'OFF',
            isSectionExpanded: false,
            onRefresh: false,
            classProviderList: [
                {
                    'providerName': 'Zoom',
                    'providerId': 2
                },
            ],
            SendNotificationChecked: "ON",
            accountName: [],
            selectedAccountId: this.props.VirtualSettingId ? this.props.VirtualSettingId : 0,
            className: [],
            selectedClassId: this.props.autoClassId ? this.props.autoClassId : 0,
            selectedClassName: '',
            sectionName: [],
            selectedSectionId: this.props.autoSectionId ? this.props.autoSectionId : 0,
            selectedSectionName: '',

            presenterName: [],
            selectedPresenterId: 0,
            selectedPresenterName: '',

            notificationType: 'push_notification',
            sendNotificationsTostudent: true,
            sendNotificationsTomother: false,
            sendNotificationsTofather: false,
            sessionYear: '',
            presenterEmailId: "",
            presenterId: this.props.presenterId != 0 ? this.props.presenterId : 0,
            smsSettingIds: [],
            selectedSmsId: null,
            selectedSmsIdName: null,
            meetingTypeName: [
                {
                    'meetingType': 1,
                    'TypeName': "Virtual Class"
                }, {
                    'meetingType': 2,
                    'TypeName': "Parent Teacher Meeting"
                }
            ],
            selectedMeetingType: this.props.isParentMeeting == 0 ? 1 : this.props.isParentMeeting == 1 ? 2 : 0,
        }
    }


    componentDidMount() {
        
        if(this.props.duration != undefined){
            this.setState({
                meetingIDatTimeofEdit : this.props.navigation.state.params.meetingIDatTimeofEdit,
                duration : this.props.duration
            })
        }else{
            this.setState({
                duration :30,
                timeResult : Moment(new Date()).add(1, "hours").toDate(),
                dateResult : Moment(new Date()).add(1, "hours").toDate()
            })
        }
        console.log("All props", this.props, Moment(new Date()).add(1, "hours").toDate(),)
    }


    componentWillUnmount() {

    }

    componentWillMount() {
        this.getAccountNamefromServer()
    }

    changeLoadingStatus(isShow) {
        this.setState({ loading: isShow })
    }

    onDrawerClose() {
        this.props.navigation.closeDrawer();
    }

    onScreenRefresh() {
        setTimeout(async () => {
            this.setState({ screenRefresh: true });
        }, 100);
    }


    checkValidation() {
        if (this.state.selectedAccountId == 0) {
            Alert.alert('Message', 'Please select Account !');
        }
        else if (this.state.selectedClassId == 0) {
            Alert.alert('Message', 'Please select Class !');
        }
        else if (this.state.selectedSectionId == 0) {
            Alert.alert('Message', 'Please select Section !');
        }
        else if (this.state.topic == '') {
            Alert.alert('Message', 'Please enter Title !');
        }
        else if (this.state.duration == 0 || this.state.duration < 30 || this.state.duration > 300) {
            Alert.alert('Message', 'Duration should not be between 30 to 300 mins');
        }
        else if (this.state.selectedPresenterName == "") {
            Alert.alert('Message', 'Presenter name should not be empty !');
        } else if (this.state.selectedMeetingType == 0) {
            Alert.alert('Message', 'Presenter name should not be empty !');
        }
        else if (this.state.SendNotificationChecked) {
            if (this.state.sendNotificationsTofather == false && this.state.sendNotificationsTomother == false && this.state.sendNotificationsTostudent == false) {
                Alert.alert('Message', 'Please Select at least student/mother/father to send notifications.');
            }
            else {
                this.createMeeting();
            }
        }
        else
            this.createMeeting();


        // if (this.state.isEdit)
        //     this.updateMeeting();
        // else
    }

    async getAccountNamefromServer() {
        try {
            let instituteID = await AsyncStorage.getItem("InstituteId");
            this.setState({
                instituteID: JSON.parse(instituteID)
            })
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    // this.changeLoadingStatus(true);
                    const obj = new HTTPRequestMng('', 'GetAccountInfo', this);
                    obj.executeRequest("InstituteId=" + instituteID);

                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) { }
    }

    onHTTPResponseAccountInfo(respData) {
        try {
            if (respData[0].Status == 1) {
                this.setState({
                    accountName: respData[0].Data
                }, () => {
                    this.getClassListFromServer()
                    this.getSmsSettingIDfromServer();
                })
            }
            else {
                // alert("Data unavailable at the moment. Please try again later !")
            }
        } catch (error) {

        }
    }

    async getSmsSettingIDfromServer() {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    // this.changeLoadingStatus(true);
                    const obj = new HTTPRequestMng('', 'GetSmsSettingID', this);
                    obj.executeRequest("InstituteId=" + this.state.instituteID);

                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) { }
    }

    onHTTPResponseSmsSettingIDInfo(respData) {
        try {
            if (respData[0].Status == 1) {
                this.setState({
                    smsSettingIds: respData[0].Data
                })
            }
            else {
                // alert("Data unavailable at the moment. Please try again later !")
            }
        } catch (error) {

        }
    }
    async getPresenterNamefromServer() {
        try {
            let instituteID = await AsyncStorage.getItem("InstituteId");
            this.setState({
                instituteID: JSON.parse(instituteID)
            })
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    const obj = new HTTPRequestMng('', 'GetPresenterInfo', this);
                    obj.executeRequest("InstituteId=" + instituteID);

                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) { }
    }


    async onHTTPResponsePresenterInfo(respData) {
        let presenterId = await AsyncStorage.getItem("AutoTrainerId");
        let selectedPresenterName = null;

        try {
            if (respData[0].Status == 1) {
                this.setState({
                    presenterName: respData[0].Data
                }, () => {
                    selectedPresenterName = this.state.presenterName.find((item) => item.AutoTrainerId === JSON.parse(presenterId));
                    console.log(selectedPresenterName, this.state.presenterName)
                    this.setState({
                        selectedPresenterId: selectedPresenterName.AutoTrainerId,
                        selectedPresenterName: selectedPresenterName ? selectedPresenterName.Username : null
                    })
                })
            }
            else {
                // alert("Data unavailable at the moment. Please try again later !")
            }
        } catch (error) {

        }
    }

    onPresenterIdChange = (value) => {
        let selectedPresenterName = null;
        if (this.state.presenterName) {
            selectedPresenterName = this.state.presenterName.find((item) => item.AutoTrainerId === value);
        }
        this.setState({
            selectedPresenterId: value,
            selectedPresenterName: selectedPresenterName ? selectedPresenterName.Username : null
        });
    }

    onMeetingTypeChange = (value) => {
        this.setState({
            selectedMeetingType: value,
        });
    }

    onHTTPError() {
        this.setState({ loading: false });
    }

    onHTTPError() {
        if (!this._isMounted) return;
        this.changeLoadingStatus(false)
        Alert.alert('Manage Dashboard', 'Unable to connect with server, Please try after some time')
    }

    static performLogout = async (userID, navigation) => {
        try {
            //flush all preference
            let fcmDeviceToken = await AsyncStorage.getItem("fcmDeviceToken")
            let apnDeviceToken = await AsyncStorage.getItem("apnDeviceToken")
            let platformOS = await AsyncStorage.getItem("platformOS")
            if (fcmDeviceToken == null || fcmDeviceToken == "") fcmDeviceToken = '';
            if (apnDeviceToken == null || apnDeviceToken == "") apnDeviceToken = '';
            if (platformOS == null || platformOS == "") platformOS = '';

            await AsyncStorage.clear();

            //store values in pref
            AsyncStorage.setItem('apnDeviceToken', apnDeviceToken);
            AsyncStorage.setItem('fcmDeviceToken', fcmDeviceToken);
            AsyncStorage.setItem('platformOS', platformOS);
            AsyncStorage.setItem('isPushNotiRegOnServer', "0");

            // remove all files in a session
            RNFetchBlob.session(String(userID)).dispose().then(() => { })

            //make badge icon unread 0
            if (Platform.OS === 'ios') {
                PushNotificationIOS.setApplicationIconBadgeNumber(0);
            }

            //flush all database
            let database = new DBOperation();
            database.openDB(false, () => {
                database.dbObj().transaction((rx) => database.upgradeDatabase(rx),
                    () => {
                        database.closeDatabase();
                        DashboardWnd.restartApp(navigation)
                    },
                    () => {
                        database.closeDatabase();
                        DashboardWnd.restartApp(navigation)
                    });
            }, () => {
                database.closeDatabase();
                DashboardWnd.restartApp(navigation)
            });
        } catch (error) {
            console.error(error);
        }
    }

    performSelectResultDate(date) {
        console.log("DDDDDD",date)
        const dateResult = Moment(date, 'DD MMM, YYYY').toDate();
        var b = Moment(date).format('YYYY-MM-DD, h:mm:ss a');
        var a = Date.parse('June 30, 2020 1:08:36');
        console.log("SELECTEDDATE",dateResult)
        this.setState({ dateResult: dateResult, newDate: date });
    }
    performSelectResultTime(date) {
        const dateResult = Moment(date, "hh:mm p").toDate();
        console.log("TIMEMEMEME",dateResult)
        this.setState({ timeResult: dateResult });
    }

    selectBranch = (index) => {
        let temp_status = !this.state.batchList[index].isSelected;
        this.state.batchList[index].isSelected = temp_status;
        let temp_list = this.state.batchList;
        //     let temp_list =  this.state.batchList;
        this.setState({ batchList: temp_list });
    }

    //restart app
    static restartApp(navigation) {
        navigation.navigate('Launcher');
    }


    getFullDate(dateTimeStr) {
        
        console.log("TIMESSS",dateTimeStr,this.state.timeResult)
        let date = new Date(Date.parse(dateTimeStr)).getDate();
        let month = new Date(Date.parse(dateTimeStr)).getMonth() + 1;
        let year = new Date(Date.parse(dateTimeStr)).getFullYear();
        let hours = new Date(Date.parse(this.state.timeResult)).getHours();
        let minutes = new Date(Date.parse(this.state.timeResult)).getMinutes();
        let seconds = new Date(Date.parse(this.state.timeResult)).getSeconds();

        let finalStr = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
         console.log("finalStr",finalStr)
        // let finalStr = date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds
        if (finalStr.includes('NaN')) {
            return new Moment().format('YYYY-MM-DD hh:mm:ss a')
        }
        else return finalStr;
    }
    createMeeting = async () => {
        let messageTo, _LStartDateTime;
        let presenterId = await AsyncStorage.getItem("AutoTrainerId");
        let zoomId = await AsyncStorage.getItem('ZoomUserId');
        let sessionYear = await AsyncStorage.getItem('SessionYear');
        let emailID = await AsyncStorage.getItem('EmailID');
        _LStartDateTime = await this.getFullDate(this.state.dateResult);
        let request
        if (this.state.sendNotificationsTostudent) {
            messageTo = "1,"
        }
        if (this.state.sendNotificationsTomother) {
            messageTo += "2,"
        }
        if (this.state.sendNotificationsTofather) {
            messageTo += "3,"
        }

        if(this.props.isEdit){
             request = {
            "VirtualClassId": this.props.meetingId,
            "VirtualSettingId": this.state.selectedAccountId,
            "AutoClassId": this.state.selectedClassId,
            "AutoSectionId": this.state.selectedSectionId,
            "ClassName": this.state.selectedClassName,
            "SectionName": this.state.selectedSectionName,
            "Title": this.state.topic,
            "ScheduleDate": Moment(this.state.timeResult, "DD/MM/YYYY").format("DD/MM/YYYY"),
            "PresenterName": this.state.selectedPresenterName,
            "Duration": parseInt(this.state.duration),
            "IsHost": this.state.hostChecked.includes("OFF") ? 0 : 1,
            "IsParticipant": this.state.participantChecked.includes("OFF") ? 0 : 1,
            "MuteParticipantUptonEntry": this.state.muteChecked.includes("OFF") ? 0 : 1,
            "EnableWaitingRoom": this.state.waitingChecked.includes("OFF") ? 0 : 1,
            "ApprovalonInviteLink": this.state.approvalChecked.includes("OFF") ? 0 : 1,
            "IsRecording": this.state.recordingChecked.includes("OFF") ? 0 : 1,
            'TimeZoneId': 'India Standard Time',
            "MeetingId": this.props.meetingId,
            "VCMeetingId": this.state.meetingIDatTimeofEdit,
            "LStartDateTime": _LStartDateTime, // this.state.timeResult.toString(),
            "IsNotify": this.state.SendNotificationChecked.includes("OFF") ? 0 : 1,
            "MessageType": this.state.notificationType.includes("sms") ? 1 :
                this.state.notificationType.includes("email") ? 2 :
                    this.state.notificationType.includes("push") && 3,
            "MessageTo": messageTo.slice(0, -1),
            "InstituteId": this.state.instituteID,
            "SessionYear": sessionYear,
            "PresenterEmailId": emailID ? emailID : "avinash.moharil@techior.com",
            "PresenterId": presenterId,
            "SMSSettingId": this.state.selectedSmsId ? this.state.selectedSmsId : 0,
            "IsParentMeeting": this.state.selectedMeetingType === 1 ? 0 : 1,
            "SMSMessage":"psps",
            "EmailSubject":"aoaoa",
            "EmailMessage":"papap"


            //below data is working properly
            // "VirtualClassId":0,
            // "VirtualSettingId":40,
            // "AutoClassId":1622,
            // "AutoSectionId":4067,
            // "ClassName":"XII",
            // "SectionName":"XII-A",
            // "Title":"Gggg",
            // "ScheduleDate":"Invalid date",
            // "PresenterName":"Anita Sachin Wankhede",
            // "Duration":60,
            // "IsHost":0,
            // "IsParticipant":0,
            // "MuteParticipantUptonEntry":0,
            // "EnableWaitingRoom":0,
            // "ApprovalonInviteLink":0,
            // "IsRecording":0,
            // "TimeZoneId":"India Standard Time",
            // "MeetingId":0,
            // "VCMeetingId":0,
            // "LStartDateTime":"2021-12-14 07:27:22",
            // "IsNotify":1,
            // "MessageType":3,
            // "MessageTo":"1",
            // "InstituteId":143,
            // "SessionYear":"2021",
            // "PresenterEmailId":"anita@gmail.com",
            // "PresenterId":"61428",
            // "SMSSettingId":0,
            // "IsParentMeeting":0,
            // "SMSMessage":"psps",
            // "EmailSubject":"aoaoa",
            // "EmailMessage":"papap"
        }
        }else{
             request = {
            "VirtualClassId": 0,
            "VirtualSettingId": this.state.selectedAccountId,
            "AutoClassId": this.state.selectedClassId,
            "AutoSectionId": this.state.selectedSectionId,
            "ClassName": this.state.selectedClassName,
            "SectionName": this.state.selectedSectionName,
            "Title": this.state.topic,
            "ScheduleDate": Moment(this.state.timeResult, "DD/MM/YYYY").format("DD/MM/YYYY"),
            "PresenterName": this.state.selectedPresenterName,
            "Duration": parseInt(this.state.duration),
            "IsHost": this.state.hostChecked.includes("OFF") ? 0 : 1,
            "IsParticipant": this.state.participantChecked.includes("OFF") ? 0 : 1,
            "MuteParticipantUptonEntry": this.state.muteChecked.includes("OFF") ? 0 : 1,
            "EnableWaitingRoom": this.state.waitingChecked.includes("OFF") ? 0 : 1,
            "ApprovalonInviteLink": this.state.approvalChecked.includes("OFF") ? 0 : 1,
            "IsRecording": this.state.recordingChecked.includes("OFF") ? 0 : 1,
            'TimeZoneId': 'India Standard Time',
            "MeetingId": 0,
            "VCMeetingId": 0,
            "LStartDateTime": _LStartDateTime, // this.state.timeResult.toString(),
            "IsNotify": this.state.SendNotificationChecked.includes("OFF") ? 0 : 1,
            "MessageType": this.state.notificationType.includes("sms") ? 1 :
                this.state.notificationType.includes("email") ? 2 :
                    this.state.notificationType.includes("push") && 3,
            "MessageTo": messageTo.slice(0, -1),
            "InstituteId": this.state.instituteID,
            "SessionYear": sessionYear,
            "PresenterEmailId": emailID ? emailID : "avinash.moharil@techior.com",
            "PresenterId": presenterId,
            "SMSSettingId": this.state.selectedSmsId ? this.state.selectedSmsId : 0,
            "IsParentMeeting": this.state.selectedMeetingType === 1 ? 0 : 1,
            "SMSMessage":"psps",
            "EmailSubject":"aoaoa",
            "EmailMessage":"papap"
        }
        }
        try {
            // console.log(request)
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    this.changeLoadingStatus(true);

                    console.log("REQUESTST",request)
                    console.log("REQUESTST",JSON.stringify(request))

                    // fetch("https://www.schoolmagica.com/osm/WebServices/virtualclass_app.asmx/CreateVirtualMeeting_App", {
                    //     "headers": {
                    //         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    //         "accept-language": "en-US,en;q=0.9",
                    //         "cache-control": "max-age=0",
                    //         "content-type": "application/x-www-form-urlencoded",
                    //         "sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
                    //         "sec-ch-ua-mobile": "?0",
                    //         "sec-fetch-dest": "document",
                    //         "sec-fetch-mode": "navigate",
                    //         "sec-fetch-site": "same-origin",
                    //         "sec-fetch-user": "?1",
                    //         "upgrade-insecure-requests": "1"
                    //     },
                    //     "referrer": "https://www.schoolmagica.com/osm/WebServices/virtualclass_app.asmx?op=CreateVirtualMeeting_App",
                    //     "referrerPolicy": "strict-origin-when-cross-origin",
                    //     "body": "jsonstring=" + request,
                    //     "method": "POST",
                        
                    //     "credentials": "include"
                    // })

                    const url = "https://www.schoolmagica.com/osm/WebServices/virtualclass_app.asmx/CreateVirtualMeeting_App?jsonString="+ JSON.stringify(request)
                    console.log("irrr",url)
                    fetch(url).then( resp => resp.text() ).
                        then(responseJson => {
                            console.log("rrprprprprpr", responseJson)
                            this.onHTTPResponseMeetingGenerated(responseJson)

                        }
                        )
                    // const obj = new HTTPRequestMng('', 'GenerateMeeting', this);
                    // obj.executeRequest(request);
                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) {

        }

        if (zoomId != 'null') {
        }
    }

    showAlert(respData) {
        return Toast.show({
			textStyle: { color: appColor.black},
            text: "Class created successfully",
            buttonText: "Ok",
            buttonTextStyle: { color: appColor.black },
            style:{
                backgroundColor:appColor.googleGreen
            },
            onClose: (reason) => {
                setTimeout(() => {
                    this.props.navigation.state.params.onScreenRefresh();
                    this.props.navigation.navigate('ScheduleClassList', { 'onScreenRefresh': this.onScreenRefresh.bind(this) });
                }, 1000);
            },
            duration: 2000
        })
    }

    onHTTPResponseMeetingGenerated(respData) {
        
        var parseString = require('react-native-xml2js').parseString;
        
        parseString(respData,{trim: true}, function (err, result) {
            //console.dir(result);
            console.log("REPEPEPEEPEP",result.string)
        });
        this.changeLoadingStatus(false);
        try {
            this.showAlert(respData)
        } catch (error) {

        }
    }

    saveMeetingDetailsOnServer() {
        try {
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    if (this.props.isEdit) {
                        const requestJson = {
                            'UserId': parseInt(this.props.userID),
                            //  'VcMeetingId':parseInt(meetingId),
                            'MeetingProviderId': parseInt(this.state.selectedClassProviderId),
                            'MeetingId': parseInt(this.props.meetingId),
                            //  'Password':pwd,    
                            'MeetingDuration': parseInt(this.state.duration),
                            'MeetingTime': String(Moment(this.state.timeResult).format('HH:MM A')),
                            'BatchId': parseInt(this.state.selectedBatchId),
                            //  'BatchName':this.state.batchName,
                            'SubjectId': parseInt(this.state.selecteSubjectId),
                            //  'SubjectName':this.state.subjectName,
                            'TopicName': this.state.topic,
                            'StartDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            'LStartDateTime': String(Moment(this.state.dateResult).format('DD-MM-YYYY')) + ' ' + String(Moment(this.state.timeResult).format('HH:MM A')),

                            'EndDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            'TimeZoneId': 'India Standard Time',
                            'PresenterName': this.state.PresenterName,
                            'IsSoundMute': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableApprovalonInviteLink': this.state.approvalChecked == 'ON' ? 1 : 0,
                            'IsHostVideo': this.state.hostChecked == 'ON' ? 1 : 0,
                            'IsVideoParticipant': this.state.participantChecked == 'ON' ? 1 : 0,
                            'MuteParticipantOnEntry': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableWaitingRoom': this.state.waitingChecked == 'ON' ? 1 : 0,
                            'IsVideoRecording': this.state.recordingChecked == 'ON' ? 1 : 0,
                            'ExtendDuration': 0,
                            'DefaultAttendeeAudio': 0,
                            'DefaultAttendeeWritting': 0,
                            'InstituteId': parseInt(this.props.instituteID), 'BranchId': parseInt(this.props.branchID),
                            'IsActive': 1,
                            'StatusFlag': 1,
                        };
                        this.changeLoadingStatus(true);
                        await addMeetingDetails(requestJson, this);
                    } else {
                        var a = Moment(this.state.dateResult).format('YYYY-MM-DD')
                        const requestJson = {
                            'UserId': parseInt(this.props.userID),
                            'MeetingProviderId': parseInt(this.state.selectedClassProviderId),
                            'MeetingId': 0,
                            'TimeZoneId': 'India Standard Time',
                            'MeetingDuration': parseInt(this.state.duration),
                            'MeetingTime': String(Moment(this.state.timeResult).format('HH:MM A')),
                            'BatchId': parseInt(this.state.selectedBatchId),
                            'SubjectId': parseInt(this.state.selecteSubjectId),
                            'TopicName': this.state.topic,
                            'StartDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            'LStartDateTime': String(Moment(this.state.dateResult).format('DD-MM-YYYY')) + ' ' + String(Moment(this.state.timeResult).format('HH:MM A')),
                            'EndDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            'PresenterName': this.state.presenterName,
                            'PresenterEmailId': this.props.EmailId,
                            'IsSoundMute': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableApprovalonInviteLink': this.state.approvalChecked == 'ON' ? 1 : 0,
                            'IsHostVideo': this.state.hostChecked == 'ON' ? 1 : 0,
                            'IsVideoParticipant': this.state.participantChecked == 'ON' ? 1 : 0,
                            'MuteParticipantOnEntry': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableWaitingRoom': this.state.waitingChecked == 'ON' ? 1 : 0,
                            'IsVideoRecording': this.state.recordingChecked == 'ON' ? 1 : 0,
                            'ExtendDuration': 0,
                            'DefaultAttendeeAudio': 0,
                            'DefaultAttendeeWritting': 0,
                            'InstituteId': parseInt(this.props.instituteID), 'BranchId': parseInt(this.props.branchID),
                            'IsActive': 1,
                            'StatusFlag': 1,
                        };
                        this.changeLoadingStatus(true);
                        await addMeetingDetails(requestJson, this);

                    }
                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) { }
    }


    parseServerResponse(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['TransactionStatus'];
            const message = jsonRec['Msg'];
            if (status == 'Success') {
                try {
                    // this.props.ActionDeleteVirtualClass();
                } catch (error) {
                }
                this.setState({ loading: false });
                this.props.navigation.state.params.onScreenRefresh();
                this.props.navigation.navigate('ScheduleClassList', { 'onScreenRefresh': this.onScreenRefresh.bind(this) });
            } else {
                this.changeLoadingStatus(false);
                InteractionManager.runAfterInteractions(() => {
                    // Alert.alert(StringConstants.batchTitle, message);
                })
            }
            this.setState({ loading: false, listLoadAttempted: true });
        } catch (error) {
            this.changeLoadingStatus(false);
            console.error(error);
        }
    }
    onSectionChange = (value) => {
        let selectedSectionName = null;
        if (this.state.sectionName) {
            selectedSectionName = this.state.sectionName.find((item) => item.autosectionid === value);
        }
        this.setState({
            selectedSectionId: value,
            selectedSectionName: selectedSectionName ? selectedSectionName.sectionname : null
        });
    }

    onSmsIdChange = (value) => {
        let selectedSmsIdName = null;
        if (this.state.smsSettingIds) {
            selectedSmsIdName = this.state.smsSettingIds.find((item) => item.smssettingid === value);
        }
        this.setState({
            selectedSmsId: value,
            selectedSmsIdName: selectedSmsIdName ? selectedSmsIdName.smstypename : null
        });
    }

    onAccountUserChange = (value) => {
        this.setState({ selectedAccountId: value },
            () => this.getClassListFromServer());
    }

    getClassListFromServer() {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    const obj = new HTTPRequestMng('', 'GetClassInfo', this);
                    obj.executeRequest("InstituteId=" + this.state.instituteID);

                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) {

        }
    }
    onHTTPResponseClassInfo(respData) {
        try {
            if (respData[0].Status == 1) {
                this.setState({
                    className: respData[0].Data
                }, () => { this.getPresenterNamefromServer() })
            }
            else {
                // alert("Data unavailable at the moment. Please try again later !")
            }
        } catch (error) {

        }
        this.getSectionListFromServer()
    }

    onClassChange = (value) => {
        let selectedClassName = null;
        if (this.state.className) {
            selectedClassName = this.state.className.find((item) => item.autoclassid === value);
        }
        this.setState({
            selectedClassId: value,
            selectedClassName: selectedClassName ? selectedClassName.classname : null
        }, () => {
            this.getSectionListFromServer()
        });
    }

    getSectionListFromServer() {
        try {
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    let d = await AsyncStorage.getItem("SessionYear");
                    let queryString = "SessionYear=" + d + "&AutoClassId=" + this.state.selectedClassId;
                    const obj = new HTTPRequestMng('', 'GetSectionInfo', this);
                    obj.executeRequest(queryString);
                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) {

        }
    }
    onHTTPResponseSectionInfo(respData) {
        console.log(JSON.stringify(respData))
        try {
            if (respData[0].Status == 1) {
                this.setState({
                    sectionName: respData[0].Data
                }, () => {
                    this.setState({
                        selectedSectionId: this.props.autoSectionId ? this.props.autoSectionId : 0
                    })
                })
            }
            else {
                if (this.state.selectedClassId != 0) {
                    // alert("Data unavailable at the moment. Please try again later !")
                }
            }
        } catch (error) {

        }
    }

    setMute = (val) => {
        this.setState({ isMute: !this.state.isMute });
    }

    render() {
        const AccountPickerItems = [];
        let duratun = ""+this.state.duration
        AccountPickerItems.push(<Picker.Item id={0} label='Select' value={0} />);
        for (var i = 0; i < this.state.accountName.length; i++) {
            const item = this.state.accountName[i];
            AccountPickerItems.push(<Picker.Item id={item.VirtualSettingId} label={item.AccountName} value={item.VirtualSettingId} />);
        }

        const classPickerItems = [];
        classPickerItems.push(<Picker.Item id={0} label='Select' value={0} />);
        for (var i = 0; i < this.state.className.length; i++) {
            const item = this.state.className[i];
            classPickerItems.push(<Picker.Item id={item.autoclassid} label={item.classname} value={item.autoclassid} />);
        }

        const sectionNamePickerItems = [];
        sectionNamePickerItems.push(<Picker.Item id={0} label='Select' value={0} />);
        for (var i = 0; i < this.state.sectionName.length; i++) {
            const item = this.state.sectionName[i];
            sectionNamePickerItems.push(<Picker.Item id={item.autosectionid} label={item.sectionname} value={item.autosectionid} />);
        }

        const smsSettingIdPickerItems = [];
        smsSettingIdPickerItems.push(<Picker.Item id={0} label='Select' value={0} />);
        for (var i = 0; i < this.state.smsSettingIds.length; i++) {
            const item = this.state.smsSettingIds[i];
            smsSettingIdPickerItems.push(<Picker.Item id={item.smssettingid} label={item.smstypename} value={item.smssettingid} />);
        }

        const presenterIdPickerItems = [];
        presenterIdPickerItems.push(<Picker.Item id={0} label='Select' value={0} />);
        for (var i = 0; i < this.state.presenterName.length; i++) {
            const item = this.state.presenterName[i];
            presenterIdPickerItems.push(<Picker.Item id={item.AutoTrainerId} label={item.Username} value={item.AutoTrainerId} />);
        }

        const meetingTypeIdPickerItems = [];
        meetingTypeIdPickerItems.push(<Picker.Item id={0} label='Select' value={0} />);
        for (var i = 0; i < this.state.meetingTypeName.length; i++) {
            const item = this.state.meetingTypeName[i];
            meetingTypeIdPickerItems.push(<Picker.Item id={item.meetingType} label={item.TypeName} value={item.meetingType} />);
        }


        let mainContentLayout = <View style={[layoutDesign.mainContent, { backgroundColor: 'white', borderColor: 'white' }]}>
            <View style={{ marginTop: 20 }}>
                <Text style={layoutDesign.contentHeading}>Account Name: </Text>
                <View style={layoutDesign.pickerLayout}>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        placeholder="Payment Mode"
                        iosHeader="Select payment mode"
                        style={{ height: 35, padding: 2 }}
                        textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                        selectedValue={this.state.selectedAccountId}
                        onValueChange={this.onAccountUserChange.bind(this)}>
                        {AccountPickerItems}
                    </Picker>
                </View>
            </View>
            <View style={{ flexDirection: "row", }}>
                <View style={{ marginTop: 20, maxWidth: "50%", width: "50%", paddingHorizontal: 5 }}>
                    <Text style={layoutDesign.contentHeading}>Class Name: </Text>
                    <View style={layoutDesign.pickerLayout}>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="ios-arrow-down" />}
                            placeholder="Payment Mode"
                            iosHeader="Select payment mode"
                            style={{ height: 35, padding: 2 }}
                            textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                            selectedValue={this.state.selectedClassId}
                            onValueChange={this.onClassChange.bind(this)}>
                            {classPickerItems}
                        </Picker>
                    </View>
                </View>
                <View style={{ marginTop: 20, maxWidth: "50%", width: "50%", paddingHorizontal: 5 }}>
                    <Text style={layoutDesign.contentHeading}>Section Name: </Text>
                    <View style={layoutDesign.pickerLayout}>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="ios-arrow-down" />}
                            placeholder="Payment Mode"
                            iosHeader="Select payment mode"
                            style={{ height: 35, padding: 2 }}
                            textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                            selectedValue={this.state.selectedSectionId}
                            onValueChange={this.onSectionChange.bind(this)}>
                            {sectionNamePickerItems}
                        </Picker>
                    </View>
                </View>
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={layoutDesign.contentHeading}>Presenter Name : </Text>
                <View style={layoutDesign.pickerLayout}>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        placeholder="Payment Mode"
                        iosHeader="Select payment mode"
                        style={{ height: 35, padding: 2 }}
                        textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                        selectedValue={this.state.selectedPresenterId}
                        onValueChange={this.onPresenterIdChange.bind(this)}>
                        {presenterIdPickerItems}
                    </Picker>
                </View>
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={layoutDesign.contentHeading}>Meeting Type : </Text>
                <View style={layoutDesign.pickerLayout}>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        placeholder="Payment Mode"
                        iosHeader="Select payment mode"
                        style={{ height: 35, padding: 2 }}
                        textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                        selectedValue={this.state.selectedMeetingType}
                        onValueChange={this.onMeetingTypeChange.bind(this)}>
                        {meetingTypeIdPickerItems}
                    </Picker>
                </View>
            </View>
            <View style={[layoutDesign.parentViewMargin]}>
                <Text style={layoutDesign.contentHeading}>Title : </Text>
                <View style={layoutDesign.inputStyle}>
                    <Item>
                        <Input
                            keyboardType='default'
                            value={this.state.topic}
                            onChangeText={(value) => this.setState({ topic: value })}
                        />
                    </Item>
                </View>
            </View>
            <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'stretch', backgroundColor: 'white', borderColor: 'white', marginTop: 0, },]}>
                <View style={[layoutDesign.parentViewMargin, { flex: 0.5, marginRight: 3, alignSelf: 'flex-start' }]}>
                    <Text style={layoutDesign.contentHeading}>Date</Text>
                    <View style={layoutDesign.dateLayout}>
                        <DatePicker
                            style={{ width: '95%' }}
                            date={this.state.dateResult}
                            disabled={false}

                            mode="date"
                            androidMode="calendar"
                            locale={"en"}
                            confirmBtnText='Select'
                            cancelBtnText='Cancel'
                            iconComponent={<Image source={require('../../assets/cal.png')} style={{ width: 24, height: 24, margin: 2, marginRight: 4 }}></Image>}
                            format='DD MMM, YYYY'
                            minDate={new Date().getDate()}
                            onDateChange={(date) => this.performSelectResultDate(date)}
                            customStyles={{ dateInput: { marginLeft: 10, color: 'black', alignItems: 'flex-start', borderWidth: 0 } }}
                        />
                    </View>
                </View>

                <View style={[layoutDesign.parentViewMargin, { flex: 0.5, marginLeft: 3 }]}>
                    <Text style={layoutDesign.contentHeading}>Start Time</Text>
                    <View style={layoutDesign.dateLayout}>
                        <DatePicker
                            style={{ width: '95%' }}
                            date={this.state.timeResult}
                            disabled={false}
                            mode="time"
                            androidMode="default"
                            locale={"en"}
                            confirmBtnText='Select'
                            cancelBtnText='Cancel'
                            iconComponent={<Image source={require('../../assets/timer.png')} style={{ width: 24, height: 24, marginRight: 4 }}></Image>}
                            format='HH:mm a'
                            onDateChange={(date) => this.performSelectResultTime(date)}
                            customStyles={{ dateInput: { marginLeft: 10, color: 'black', alignItems: 'flex-start', borderWidth: 0 } }}
                        />
                    </View>
                </View>
            </View>

            {/** duration layout starts */}

            <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderColor: 'white', marginTop: 0, marginBottom: 0 },]}>
                <View style={[layoutDesign.parentViewMargin, { flex: 0.5, marginRight: 3, alignSelf: 'flex-start' }]}>
                    <Text style={layoutDesign.contentHeading}>Duration : </Text>
                    <View style={layoutDesign.inputStyle}>
                       <TouchableOpacity onPress={() => this.setState({
                                display : false
                            })}> 
                            <Item>
                            {this.state.display == true ? 
                             
                            <Text style={{ fontSize: 16, fontWeight: '400', color: appColor.font_gray, margin: 2, marginRight: 4,width:120 }}>{this.state.duration}</Text> :
                             <Input
                                keyboardType='number-pad'
                                // defaultValue={30}
                                maxLength={3}
                                multiline={false}
                                onChangeText={(value) => {
                                    this.setState({ duration: value })
                                   
                                }}
                            />}
                            
                                <Text style={{ fontSize: 14, fontWeight: '400', color: appColor.silverGrey, margin: 2, marginRight: 4 }}>Min</Text>
                        </Item>
                    </TouchableOpacity>

                    </View>
                </View>
            </View>
            <View style={[layoutDesign.parentViewMargin]}>
                <Text style={layoutDesign.contentHeading}>Video : </Text>
                <View style={layoutDesign.radioButtonParent}>
                    <View style={layoutDesign.radioWrapper}>
                        <TouchableOpacity style={layoutDesign.clickableSwitch}
                            activeOpacity={1}
                            onPress={() => { this.handleHostVideoChange() }} >
                            <Text style={{ marginTop: 5, width: '75%' }}>Host</Text>
                            <Switch
                                trackColor={{
                                    false: appColor.inActiveSwitchThreadColor,
                                    true: appColor.activeSwitchThreadColor
                                }}
                                thumbColor={this.state.hostChecked === "ON" ?
                                    appColor.activeSwitchBallColor : appColor.inActiveSwitchBallColor}
                                value={this.state.hostChecked === "ON" ? true : false} onValueChange={() => {
                                    this.handleHostVideoChange();
                                }} />
                        </TouchableOpacity>
                    </View>
                    <View style={layoutDesign.radioWrapper}>
                        <TouchableOpacity style={layoutDesign.clickableSwitch}
                            activeOpacity={1}
                            onPress={() => { this.handleParticipantVideoChange() }} >
                            <Text style={{ marginTop: 5, width: '75%' }}>Participants</Text>
                            <Switch
                                trackColor={{
                                    false: appColor.inActiveSwitchThreadColor,
                                    true: appColor.activeSwitchThreadColor
                                }}
                                thumbColor={this.state.participantChecked === "ON" ?
                                    appColor.activeSwitchBallColor : appColor.inActiveSwitchBallColor}
                                value={this.state.participantChecked === "ON" ? true : false} onValueChange={() => {
                                    this.handleParticipantVideoChange();
                                }} />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <View style={[layoutDesign.parentViewMargin]}>
                <Text style={layoutDesign.contentHeading}>Other : </Text>
                <View style={[layoutDesign.radioButtonParent]}>

                    <View style={layoutDesign.radioWrapper}>
                        <TouchableOpacity style={layoutDesign.clickableSwitch}
                            activeOpacity={1}
                            onPress={() => { this.handleMutechange() }} >
                            <Text style={{ marginTop: 5, width: '75%' }}>Mute participants upon entry</Text>
                            <Switch
                                trackColor={{
                                    false: appColor.inActiveSwitchThreadColor,
                                    true: appColor.activeSwitchThreadColor
                                }}
                                thumbColor={this.state.muteChecked === "ON" ?
                                    appColor.activeSwitchBallColor : appColor.inActiveSwitchBallColor}
                                value={this.state.muteChecked === "ON" ? true : false} onValueChange={() => {
                                    this.handleMutechange();
                                }} />
                        </TouchableOpacity>
                    </View>

                    <View style={layoutDesign.radioWrapper}>
                        <TouchableOpacity style={layoutDesign.clickableSwitch}
                            activeOpacity={1}
                            onPress={() => { this.handlewaitingChange() }} >
                            <Text style={{ marginTop: 5, width: '75%' }}>Waiting Room</Text>
                            <Switch
                                trackColor={{
                                    false: appColor.inActiveSwitchThreadColor,
                                    true: appColor.activeSwitchThreadColor
                                }}
                                thumbColor={this.state.waitingChecked === "ON" ?
                                    appColor.activeSwitchBallColor : appColor.inActiveSwitchBallColor}
                                value={this.state.waitingChecked === "ON" ? true : false} onValueChange={() => {
                                    this.handlewaitingChange();
                                }} />
                        </TouchableOpacity>
                    </View>

                    <View style={layoutDesign.radioWrapper}>
                        <TouchableOpacity style={layoutDesign.clickableSwitch}
                            activeOpacity={1}
                            onPress={() => { this.handleApprovalChange() }} >
                            <Text style={{ marginTop: 5, width: '75%' }}>Allow joining from Invite Link</Text>
                            <Switch
                                trackColor={{
                                    false: appColor.inActiveSwitchThreadColor,
                                    true: appColor.activeSwitchThreadColor
                                }}
                                thumbColor={this.state.approvalChecked === "ON" ?
                                    appColor.activeSwitchBallColor : appColor.inActiveSwitchBallColor}
                                value={this.state.approvalChecked === "ON" ? true : false} onValueChange={() => {
                                    this.handleApprovalChange();
                                }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={layoutDesign.radioWrapper}>
                <TouchableOpacity style={layoutDesign.clickableSwitch}
                    activeOpacity={1}
                    onPress={() => { this.handleRecordingChange() }} >
                    <Text style={[
                        layoutDesign.contentHeading,
                        { marginTop: 5, width: '75%' }]}>Recording</Text>
                    <Switch
                        trackColor={{
                            false: appColor.inActiveSwitchThreadColor,
                            true: appColor.activeSwitchThreadColor
                        }}
                        thumbColor={this.state.recordingChecked === "ON" ?
                            appColor.activeSwitchBallColor : appColor.inActiveSwitchBallColor}
                        value={this.state.recordingChecked === "ON" ? true : false} onValueChange={() => {
                            this.handleRecordingChange();
                        }} />
                </TouchableOpacity>
            </View>
            <View style={{ display: "flex" }}>
                <View style={layoutDesign.radioWrapper}>
                    <TouchableOpacity style={layoutDesign.clickableSwitch}
                        activeOpacity={1}
                        onPress={() => { this.handleSendNotificationChange() }} >
                        <Text style={[
                            layoutDesign.contentHeading,
                            { marginTop: 5, width: '75%' }]}>Send Notification</Text>
                        <Switch
                            trackColor={{
                                false: appColor.inActiveSwitchThreadColor,
                                true: appColor.activeSwitchThreadColor
                            }}
                            thumbColor={this.state.SendNotificationChecked === "ON" ?
                                appColor.activeSwitchBallColor : appColor.inActiveSwitchBallColor}
                            value={this.state.SendNotificationChecked === "ON" ? true : false} onValueChange={() => {
                                this.handleSendNotificationChange();
                            }} />
                    </TouchableOpacity>
                </View>
            </View>

            {this.state.SendNotificationChecked === "ON" &&
                <View style={{
                    // height: '13%',
                    width: '100%',
                    backgroundColor: appColor.white,
                    display: "flex",
                    marginTop: 5,
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                    borderColor: appColor.light_gray,
                    borderWidth: 1,
                    borderRadius: 2
                }}>
                    <View>
                        <Text>Select Message Details : </Text>
                    </View>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignItems: "center",
                        alignContent: "center",
                        marginVertical: 10
                    }}>
                        <RadioButton.Group onValueChange={value => this.setNotificationType(value)} value={this.state.notificationType}>
                            <View style={layoutDesign.notificationContainer}>
                                <RadioButton value="sms_notification" />
                                <Text onPress={() => this.setNotificationType("sms_notification")}>SMS</Text>
                            </View>
                            <View style={layoutDesign.notificationContainer}>
                                <RadioButton value="email_notification" />
                                <Text onPress={() => this.setNotificationType("email_notification")}>Email</Text>
                            </View>
                            <View style={layoutDesign.notificationContainer}>
                                <RadioButton value="push_notification" />
                                <Text onPress={() => this.setNotificationType("push_notification")}>Android/iOS</Text>
                            </View>
                        </RadioButton.Group>
                    </View>
                    <View>
                        <Text>Send Notifications to :   </Text>
                    </View>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignItems: "center",
                        alignContent: "center",
                        marginVertical: 10
                    }}>
                        <View style={layoutDesign.notificationContainer}>
                            <CheckBox
                                onChange={() => this.updateSendTo("student")}
                                value={this.state.sendNotificationsTostudent}
                            />
                            <Text onPress={() => this.updateSendTo("student")}>Student</Text>
                        </View>
                        <View style={layoutDesign.notificationContainer}>
                            <CheckBox
                                onChange={() => this.updateSendTo("mother")}
                                value={this.state.sendNotificationsTomother}
                            />
                            <Text onPress={() => this.updateSendTo("mother")}>Mother</Text>
                        </View>
                        <View style={layoutDesign.notificationContainer}>
                            <CheckBox
                                onChange={() => this.updateSendTo("father")}
                                value={this.state.sendNotificationsTofather}
                            />
                            <Text onPress={() => this.updateSendTo("father")}>Father</Text>
                        </View>
                    </View>
                    {this.state.notificationType.includes("sms_notification") && <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text>SMS Setting : </Text>
                        <View style={{
                            width: "60%", backgroundColor: 'white', borderRadius: 5,
                            height: 44,
                            borderWidth: 2, borderColor: '#DDDDDD'
                        }}>
                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="ios-arrow-down" />}
                                placeholder="Payment Mode"
                                iosHeader="Select payment mode"
                                // modalStyle={{ width: '60%', maxWidth: '60%' }}
                                style={{ height: 35, padding: 2 }}
                                textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                                selectedValue={this.state.selectedSmsId}
                                onValueChange={this.onSmsIdChange.bind(this)}
                            >
                                {smsSettingIdPickerItems}
                            </Picker>
                        </View>
                    </View>}
                </View>
            }
        </View>

        let footerLayout =
            <View style={layoutDesign.floatingMenuContainer}>
                <TouchableOpacity onPress={() => { this.checkValidation() }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', textAlign: 'center', width: 60 }}>{this.state.isEdit ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
            </View>
        return (
            <Container style={{ backgroundColor: appColor.lightest_gray }}>
                <Header>
                    <Left>
                        <Button transparent onPress={() => {
                            //this.props.ActionDeleteVirtualClass();
                            this.props.navigation.state.params.onScreenRefresh();
                            this.props.navigation.navigate('ScheduleClassList', { 'onScreenRefresh': this.onScreenRefresh.bind(this) });
                        }}>
                            <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>{this.state.virtualTitle}</Title>
                    </Body>
                    <Right />
                </Header>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <InternetConn />
                    {/* <NotificationRibbon /> */}
                    <Content
                        style={{ marginBottom: 10 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={false}
                            />
                        }
                        ref={content => (this.mainComponent = content)}>
                        {mainContentLayout}
                    </Content>
                    <Footer style={layoutDesign.footerLayout}>
                        {footerLayout}
                    </Footer>
                </View>

                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%' }}
                    showProgress={true}
                    progressSize="large"
                    message="Loading, Please wait..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={false}
                />}
            </Container>
        );
    }


    setNotificationType(value) {
        this.setState({
            notificationType: value
        }, () => {
            if (value.includes("sms")) {
                this.mainComponent._root.scrollToPosition(0, 2000);
            }
        })
    }

    handleHostVideoChange() {
        if (this.state.hostChecked === "ON") {
            this.setState({ hostChecked: 'OFF' })
        }
        else if (this.state.hostChecked === "OFF") {
            this.setState({ hostChecked: 'ON' })
        }
    }

    handleParticipantVideoChange() {
        if (this.state.participantChecked === "ON") {
            this.setState({ participantChecked: 'OFF' })
        }
        else if (this.state.participantChecked === "OFF") {
            this.setState({ participantChecked: 'ON' })
        }
    }

    handleMutechange() {
        if (this.state.muteChecked === "ON") {
            this.setState({ muteChecked: 'OFF' });
        }
        else if (this.state.muteChecked === "OFF") {
            this.setState({ muteChecked: 'ON' })
        }
    }


    handlewaitingChange() {
        if (this.state.waitingChecked === "ON") {
            this.setState({ waitingChecked: 'OFF' });
        }
        else if (this.state.waitingChecked === "OFF") {
            this.setState({ waitingChecked: 'ON' })
        }
    }

    handleRecordingChange() {
        if (this.state.recordingChecked === "ON") {
            this.setState({ recordingChecked: 'OFF' });
        }
        else if (this.state.recordingChecked === "OFF") {
            this.setState({ recordingChecked: 'ON' })
        }
    }
    handleApprovalChange() {
        if (this.state.approvalChecked === "ON") {
            this.setState({ approvalChecked: 'OFF' });
        }
        else if (this.state.approvalChecked === "OFF") {
            this.setState({ approvalChecked: 'ON' })
        }
    }
    handleSendNotificationChange() {
        if (this.state.SendNotificationChecked === "ON") {
            this.setState({ SendNotificationChecked: 'OFF' });
        }
        else if (this.state.SendNotificationChecked === "OFF") {
            this.setState({ SendNotificationChecked: 'ON' })
            setTimeout(() => {
                this.mainComponent._root.scrollToPosition(50, 1000)
            }, 5);
        }
    }

    updateSendTo(sendTo) {
        switch (sendTo) {
            case "student":
                this.setState({
                    sendNotificationsTostudent: !this.state.sendNotificationsTostudent
                })
                break;
            case "mother":
                this.setState({
                    sendNotificationsTomother: !this.state.sendNotificationsTomother
                })
                break;
            case "father":
                this.setState({
                    sendNotificationsTofather: !this.state.sendNotificationsTofather
                })
                break;

            default:
                break;
        }

    }

}


const layoutDesign = StyleSheet.create({
    parentPhoto: {
        alignSelf: 'center', resizeMode: 'stretch',
        width: 74, height: 74, borderRadius: 37
    },

    parentPhotoFrame: {
        alignSelf: 'center', backgroundColor: 'white',
        width: 80, height: 80, borderRadius: 40, marginLeft: 10,
        borderWidth: 2, borderColor: appColor.light_gray,
        padding: 1
    },
    parentName: {
        fontSize: 18, fontWeight: '500', color: 'white',
    },
    parentEmail: {
        fontSize: 15, color: 'white', fontStyle: 'normal'
    },
    actionButtonIcon: {
        alignSelf: 'center', resizeMode: 'contain',
        width: 30, height: 30
    },
    cardMenu: {
        borderRadius: 20,
        marginTop: 10,
        marginLeft: 7,
        marginRight: 10,
        flex: 0.5,
    },

    cardMenuItem: {
        flex: 1,
        borderRadius: 20, borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },

    cardMenuItemContent: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -5,
        marginRight: -5
    },

    footerLayout: {
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#ddd',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 9,
    },

    floatingMenuContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColor.colorPrimary
    },

    floatingMenuItem: {
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 5,
        paddingTop: 10,
        paddingBottom: 10
    },
    mainContent: {
        flex: 1, flexDirection: 'column',
        marginLeft: 10,
        marginRight: 15,
    },

    componentMargin: {
        marginTop: 15
    },

    inputStyle: {
        borderRadius: 5,
        borderWidth: 2,
        height: 44,
        borderColor: '#DDDDDD',
        marginLeft: -1,
        marginRight: -1,
        flex: 1,
        justifyContent: 'center',

    },

    radioButtonParent: {
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#DDDDDD',
        marginLeft: -1,
        marginRight: -1,
        flex: 1,
        justifyContent: 'center',
    },
    pickerLayout: {
        flex: 1, backgroundColor: 'white', borderRadius: 5,
        height: 44,
        borderWidth: 2, borderColor: '#DDDDDD'
    },

    classLayout: {
        flex: 1, backgroundColor: 'white', borderRadius: 5,
        borderWidth: 2, borderColor: '#DDDDDD'
    },

    contentHeading:
    {
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 5,
    },
    parentViewMargin: {
        marginTop: 16
    },
    dateLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        flexDirection: 'row', paddingTop: 5, paddingBottom: 5,
        justifyContent: 'flex-start', alignItems: 'center',
        borderWidth: 1, borderColor: '#DDDDDD'
    },
    classListItemParentLayout: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderRadius: 4,
        backgroundColor: appColor.grey_background,
        marginTop: 5,
        marginBottom: 5,
    },

    sectionListItemParentLayout: {
        backgroundColor: appColor.white,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginLeft: 18
    },

    notificationContainer: {
        flexDirection: "row", justifyContent: "center",
        alignItems: "center",
        alignContent: "center"
    },
    radioWrapper: {
        margin: 5,
        flexDirection: 'row',
        justifyContent: "space-between",
        // paddingRight:100,
        // width: '75%',
        // maxWidth: '100%'
    },
    clickableSwitch: {
        margin: 5,
        flexDirection: 'row',
        justifyContent: "space-between"
    },
});


const mapStateToProps = state => {
    return {
        subjectID: state.vcInfo.subjectID,
        duration: state.vcInfo.duration,
        isEdit: state.vcInfo.isEdit,
        topic: state.vcInfo.topic,
        meetingDate: state.vcInfo.meetingDate,
        meetingTime: state.vcInfo.meetingTime,
        PresenterName: state.vcInfo.PresenterName,
        meetingId: state.vcInfo.meetingId,
        MeetingProviderId: state.vcInfo.MeetingProviderId,
        password: state.vcInfo.password,
        duration: state.vcInfo.duration,
        isActive: state.vcInfo.isActive,
        StatusFlag: state.vcInfo.StatusFlag,
        isMute: state.vcInfo.isMute,
        classProviderId: state.vcInfo.classProviderId,
        IsHostVideo: state.vcInfo.IsHostVideo,
        IsVideoParticipant: state.vcInfo.IsVideoParticipant,
        MuteParticipantOnEntry: state.vcInfo.MuteParticipantOnEntry,
        EnableWaitingRoom: state.vcInfo.EnableWaitingRoom,
        IsVideoRecording: state.vcInfo.IsVideoRecording,
        EnableApprovalonInviteLink: state.vcInfo.EnableApprovalonInviteLink,
        VirtualSettingId: state.vcInfo.VirtualSettingId,
        meetingIDatTimeofEdit: state.vcInfo.meetingIDatTimeofEdit,
        autoClassId: state.vcInfo.autoClassId,
        autoSectionId: state.vcInfo.autoSectionId,
        presenterId: state.vcInfo.presenterId,
        sectionName: state.vcInfo.sectionName,
        isParentMeeting: state.vcInfo.isParentMeeting,

    };
};
// export default AddEditClass;
export default connect(mapStateToProps, { ActionDeleteVirtualClass })(AddEditClass);