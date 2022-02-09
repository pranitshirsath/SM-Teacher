import React, { Component } from 'react';
import {
    View, Alert, RefreshControl, Platform,
    StyleSheet, Dimensions,
    Image,
    FlatList,
    PermissionsAndroid,
    CheckBox,
    Switch,
    InteractionManager
} from 'react-native';
import * as StringConstants from '../config/StringConstants';
import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Thumbnail, Subtitle, Toast, Card, CardItem, Item, Input,
    Footer, Textarea,
    Picker, ActionSheet
} from "native-base";


import AsyncStorage from '@react-native-community/async-storage';
// import NetInfo from "@react-native-community/netinfo";
import InternetConn from '../networkConn/OfflineNotice';
import NotificationRibbon from '../../src/appDashboard/NotificationRibbon';
import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';
import CounterPanel from '../utils/CounterView';
import HTTPRequestMng from './HTTPRequestMng';
import ImagePicker from 'react-native-image-crop-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import RNFS, { stat } from 'react-native-fs';
import NetInfo from "@react-native-community/netinfo";
import { List, RadioButton } from 'react-native-paper';
import DatePicker from 'react-native-datepicker';
import DBOperation from '../db/DBOperation';
import RNFetchBlob from 'rn-fetch-blob';
import Moment from 'moment';
import { createZoomMeeting, updateZoomMeeting } from '../zoom/apis'
import { addMeetingDetails } from '../appVertualClass/API'

import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';
import appJson from '../../app.json';


import { ActionDeleteVirtualClass } from '../redux_reducers/VirtualClassReducer';
import { ActionAddRegEnqData } from '../redux_reducers/RegisterAddEditReducer';
import { connect } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';

class AddEditClass extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false, todayCollection: 0, todayRefund: 0,
            dashboardContainList: [], actionFabButton: [],
            attachmentLimit: 10,
            attachmentList: [],
            courseList: [],
            subjectList: [],
            batchList: [],
            selectedCourseId: 0,
            selectedBatchId: this.props.batchID,
            selecteSubjectId: this.props.subjectID,
            selectedClassProviderId: this.props.classProviderId,
            sd_ImageData: '',
            fileName: '',
            savedFileName: '',
            fileExtension: '',
            isAttachModify: false,
            instituteID: this.props.instituteID,
            branchID: this.props.branchID,
            isSelected: false,
            isMute: this.props.isMute,
            subjectName: this.props.subjectName,
            batchName: this.props.batchName,
            dateResult: this.props.meetingDate,
            timeResult: this.props.meetingTime,
            duration: String(this.props.duration),
            topic: this.props.topic,
            isEdit: this.props.isEdit,
            zoomUserId: 0,
            dateformat: new Date(),
            PresenterName: this.props.userName,
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
            hostChecked: this.props.IsHostVideo,
            participantChecked: this.props.IsVideoParticipant,
            muteChecked: this.props.MuteParticipantOnEntry,
            waitingChecked: this.props.EnableWaitingRoom,
            SendNotificationChecked: this.props.isSendNotification,
            approvalChecked: this.props.EnableApprovalonInviteLink,
            recordingChecked: this.props.IsVideoRecording, oldTimeofClass: null,
            classProviderList: [
                // {
                //     'providerName': 'WizIQ',
                //     'providerId': 1
                // },
                {
                    'providerName': 'Zoom',
                    'providerId': 2
                },
                // {
                //     'providerName': 'BlueJeans',
                //     'providerId': 3
                // }
            ],
            notificationType: 'sms_notification',
            sendNotificationsTostudent: true,
            sendNotificationsTomother: false,
            sendNotificationsTofather: false
        }

        console.log("Props values", this.props)
        console.log('BtachId', this.props.batchID);
        console.log('SubjectIdPassed', this.props.subjectID);
        console.log('SubjectName', this.props.subjectName);
    }

    onLoad = () => {
        this.props.navigation.addListener('didFocus', () => console.log('scrren focused'))
    }

    async componentDidMount() {
        // console.log('selected date', this.props.navigation.state.params.meetingData.StartDateTime);
        // console.log("Parsed Date", this.props.navigation.state.params.meetingData)

        this.getTimeOfOldClass()
        // console.log("Proooops",this.props)

        this.onLoad();
        //  let obj = await AsyncStorage.getItem("MeetingDetail")
        //  this.state.MeetingData = await JSON.parse(obj);
        //  console.log('JsonStruu',JSON.stringify(this.state.MeetingData));
        // this.setState({instituteID:instituteID,branchID:branchID});
        // this.getBatchListFromServer(instituteID,branchID);

        // if(this.state.MeetingData!='null' || this.state.MeetingData!='' || this.state.MeetingData!=undefined){
        //     if(this.state.MeetingData.isEdit){
        //         this.state.selectedBatchId = this.state.MeetingData.batchID;
        //         this.state.selecteSubjectId = this.state.MeetingData.subjectID
        //         this.getBatchListFromServer(instituteID,branchID);
        //         this.getSubjectListFromServer(this.state.selectedBatchId);
        //     }
        // }else{
        //     this.getBatchListFromServer(instituteID,branchID);
        // }
        // const instituteID = await AsyncStorage.getItem("InstituteID")
        //     const branchID = await AsyncStorage.getItem("BranchID")
        this.state.zoomUserId = await AsyncStorage.getItem("ZoomUserId")
        if (this.props.isEdit) {
            this.state.virtualTitle = 'Update Virtual Class';
            this.state.selectedClassProviderId = this.props.MeetingProviderId
            await this.getBatchListFromServer(this.props.instituteID, this.props.branchID);
            await this.getSubjectListFromServer(this.props.batchID);
        } else {
            this.getBatchListFromServer(this.props.instituteID, this.props.branchID);
        }
        // InteractionManager.runAfterInteractions(async () => {
        //     const instituteID = await AsyncStorage.getItem("InstituteID")
        //     const branchID = await AsyncStorage.getItem("BranchID")
        //     this.state.zoomUserId = await AsyncStorage.getItem("ZoomUserId")
        //     if(this.props.isEdit){
        //         this.getBatchListFromServer(instituteID,branchID);
        //         this.getSubjectListFromServer(this.props.batchID);
        //     }else{
        //         this.getBatchListFromServer(instituteID,branchID);
        //     }
        //   });

    }

    removeEmojis = (string) => {
        // emoji regex from the emoji-regex library
        const regex = /\uD83C\uDFF4(?:\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74)\uDB40\uDC7F|\u200D\u2620\uFE0F)|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3]))|\uD83D\uDC69\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83D\uDC69\u200D[\u2695\u2696\u2708])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC68(?:\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])|(?:[#*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDD1-\uDDDD])/g
        const regex2 = ['\ud83c[\udf00-\udfff]', '\ud83d[\udc00-\ude4f]', '\ud83d[\ude80-\udeff]'];
        const regex3 = /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g;

        // console.log("Emojiiiiiiiss",string)
        string = string.replace(regex, '')
        string = string.replace(regex3, '')
        return string.replace(regex2, '')
    }

    getTimeOfOldClass() {
        var oldData = null;
        oldData = this.props.navigation.state.params.meetingData;
        if (oldData) {
            console.log("oldData", oldData)
            this.setState({
                PresenterName: oldData.PresenterName
            })
        }

        //Verify the old time
        console.log("Past time", this.props.navigation.state.params.meetingData.MeetingTime, Moment(this.props.navigation.state.params.meetingData.MeetingTime))
        this.setState({
            oldTimeofClass: this.props.navigation.state.params.meetingData.MeetingTime || null,
        }, () => {
            if (this.state.oldTimeofClass.length > 0) {
                this.setState({
                    timeResult: this.props.navigation.state.params.meetingData.MeetingTime
                })
            }
        }
        )
    }

    componentWillUnmount() {
        this.setState({
            PresenterName: this.props.userName
        })
        this.props.ActionDeleteVirtualClass();

    }

    componentWillMount() {
        console.log('consileUmcmount', this.props.navigation);
        // InteractionManager.runAfterInteractions(async () => {
        //     const instituteID = await AsyncStorage.getItem("InstituteID")
        //     const branchID = await AsyncStorage.getItem("BranchID")
        //   this.state.zoomUserId = await AsyncStorage.getItem("ZoomUserId")
        //         if(this.props.isEdit){
        //             this.getBatchListFromServer(this.props.instituteID,this.props.branchID);
        //             this.getSubjectListFromServer(this.props.batchID);
        //         }else{
        //             this.getBatchListFromServer(this.props.instituteID,this.props.branchID);
        //         }
        //   });
    }

    changeLoadingStatus(isShow) {
        this.setState({ loading: isShow })
    }

    onDrawerClose() {
        this.props.navigation.closeDrawer();
    }

    onScreenRefresh() {
        setTimeout(async () => {
            // this.state.zoomUserId = await AsyncStorage.getItem("ZoomUserId")
            // if(this.props.isEdit){
            //     this.getBatchListFromServer(this.props.instituteID,this.props.branchID);
            //     this.getSubjectListFromServer(this.props.batchID);
            // }else{
            //     this.getBatchListFromServer(this.props.instituteID,this.props.branchID);
            // }       
            this.setState({ screenRefresh: true });
        }, 100);
    }


    checkValidation() {
        if (this.state.selectedClassProviderId == 0)
            Alert.alert('Message', 'Please select class Provider');
        else if (this.state.selectedBatchId == 0)
            Alert.alert('Message', 'Please select Batch');
        else if (this.state.selecteSubjectId == 0)
            Alert.alert('Message', 'Please select Subject');
        else if (this.state.topic == '')
            Alert.alert('Message', 'Please enter Subject Topic');
        // else if(Date.parse(String(this.state.dateResult))< Date.parse(String(Moment(new Date()).toDate())))
        //   Alert.alert('Message','Passed Date is not allowed');  
        else if (this.state.duration == 0)
            Alert.alert('Message', 'Duration should not be zero');
        else if (this.state.duration > 300)
            Alert.alert('Message', 'Duration should be less than 300');
        else if (this.state.duration < 30)
            Alert.alert('Message', 'Duration should be greater than 30');
        else if (this.state.SendNotificationChecked === true) {
            if (this.state.notificationType.length === 0) {
                Alert.alert('Message', 'Please select at least one of ');
            }
            if (this.state.sendNotificationsTostudent === false && this.state.sendNotificationsTomother === false && this.state.sendNotificationsTofather === false) {
                Alert.alert('Message', 'Please select Send To Option');
            }
        }
        else
            this.saveMeetingDetailsOnServer();
        //   Alert.alert('Message','Validation succeded');
        // if(this.state.isEdit)
        //   this.updateMeeting();
        // else
        //   this.createMeeting();
    }

    getBatchListFromServer(instituteID, branchID) {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    // this.changeLoadingStatus(true);

                    const requestJson = {
                        'InstituteId': instituteID, 'BranchId': branchID,
                    };
                    const obj = new HTTPRequestMng('', 'GetBatchList', this);
                    obj.executeRequest(requestJson);

                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) { }
    }


    getSubjectListFromServer(batchId) {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    // this.changeLoadingStatus(true);
                    const requestJson = {
                        'BatchId': batchId,
                    };
                    const obj = new HTTPRequestMng('', 'GetSubjectDetails', this);
                    obj.executeRequest(requestJson);
                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) { }
    }


    onHTTPResponseBatchList(respData) {
        //this.changeLoadingStatus(false);
        try {
            //if(!this._isMounted) return;

            const jsonRec = respData[0];
            const status = jsonRec['TransactionStatus'];
            const message = jsonRec['Msg'];
            console.log(JSON.stringify(jsonRec));

            if (status == 'Success') {
                const recordList = [];
                const dataListArray = jsonRec['BatchLists'];
                if (dataListArray != undefined) {
                    dataListArray.forEach((singleObj, index) => {
                        recordList.push({
                            'batchId': singleObj['BatchId'], 'batchName': singleObj['BatchName'],
                        });
                    });

                    if (this.state.MeetingData.isEdit) {
                        var temp_count = 0;
                        var temp_batchList = [];
                        for (var i = 0; i < recordList.length; i++) {

                            if (recordList[i].batchId == this.state.selectedBatchId) {
                                temp_count = temp_count + 1;
                                temp_batchList.push({
                                    'batchName': recordList[i].batchName,
                                    'batchId': recordList[i].batchId
                                });
                                break;
                            }
                        }
                        if (temp_count > 0) {
                            this.setState({ batchList: temp_batchList, loading: false });
                        }
                    } else {
                        // var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                        // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.ClassName, b.ClassName))
                        this.setState({ batchList: recordList, loading: false });
                    }
                }
            } else {
                this.changeLoadingStatus(false);
                InteractionManager.runAfterInteractions(() => {
                    Alert.alert(StringConstants.batchTitle, message);
                })
            }
            //this.setState({loading: false, listLoadAttempted: true });

        } catch (error) {
            this.changeLoadingStatus(false);
            console.error(error);
        }
    }

    onHTTPResponseSubjectDetails(respData) {
        try {
            //if(!this._isMounted) return;
            const jsonRec = respData[0];
            const status = jsonRec['TransactionStatus'];
            const message = jsonRec['Msg'];
            console.log(JSON.stringify(jsonRec));

            if (status == 'Success') {
                const recordList = [];
                const dataListArray = jsonRec['BatchSubjects'];
                if (dataListArray != undefined) {
                    dataListArray.forEach((singleObj, index) => {
                        recordList.push({
                            'subjectId': singleObj['SubjectId'], 'subjectName': singleObj['SubjectName'],
                        });
                    });

                    if (this.state.MeetingData.isEdit) {
                        var temp_count = 0;
                        var temp_subjectList = [];
                        for (var i = 0; i < recordList.length; i++) {
                            if (recordList[i].subjectId == this.state.selecteSubjectId) {
                                temp_count = temp_count + 1;
                                temp_subjectList.push({
                                    'subjectName': recordList[i].subjectName,
                                    'subjectId': recordList[i].subjectId
                                });
                                break;
                            }
                        }
                        if (temp_count > 0) {
                            this.setState({ subjectList: temp_subjectList, loading: false });
                        }
                    } else {
                        // var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                        // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.ClassName, b.ClassName))
                        this.setState({ subjectList: recordList, loading: false });
                    }
                }
            } else {
                this.changeLoadingStatus(false);
                InteractionManager.runAfterInteractions(() => {
                    Alert.alert(StringConstants.batchTitle, message);
                })
            }
            //this.setState({loading: false, listLoadAttempted: true });

        } catch (error) {
            this.changeLoadingStatus(false);
            console.error(error);
        }
    }

    onHTTPResponseMeetingDetails(respData) {
        try {
            //if(!this._isMounted) return;

            const jsonRec = respData[0];
            const status = jsonRec['TransactionStatus'];
            const message = jsonRec['Msg'];
            console.log(JSON.stringify(jsonRec));

            // if (status == 'Success') {
            //     const recordList = [];
            //     const dataListArray = jsonRec['BatchLists'];
            //     if (dataListArray != undefined) {
            //         dataListArray.forEach((singleObj, index) => {
            //             recordList.push({
            //                 'batchId': singleObj['BatchId'], 'batchName': singleObj['BatchName'],
            //             });
            //         });
            //     }
            //     this.setState({ batchList: recordList, loading: false});
            // } else {
            //     this.changeLoadingStatus(false);
            //     InteractionManager.runAfterInteractions(() => {
            //         Alert.alert(StringConstants.batchTitle, message);
            //     })
            // }
            //this.setState({loading: false, listLoadAttempted: true });

        } catch (error) {
            this.changeLoadingStatus(false);
            console.error(error);
        }
    }

    onHTTPError() {
        this.setState({ loading: false });
        // InteractionManager.runAfterInteractions(() => {
        //     Alert.alert(StringConstants.batchTitle,StringConstants.UnableToConnect);
        // });
    }



    checkUserLoginStatusOnServer() {

    }


    checkAppPermission = async () => {
        try {
            if (Platform.OS == 'android') {
                let permissionList = [];
                let granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
                if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.CAMERA)
                granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
                if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)

                if (permissionList.length > 0) {
                    //ask permission required
                    const granted = await PermissionsAndroid.requestMultiple(permissionList)
                    let isGranted = true;
                    for (let i = 0; i < permissionList.length; i++) {
                        if (granted[permissionList[i]] != PermissionsAndroid.RESULTS.GRANTED) {
                            isGranted = false; break;
                        }
                    }
                    if (isGranted) {
                        this.performAttachmentSelection()
                    } else {
                        Alert.alert('Message', 'You need to enable app permission before adding attachment')
                    }
                } else {
                    //all granted
                    this.performAttachmentSelection()
                }
            } else {
                this.performAttachmentSelection()
            }
        } catch (err) {
            console.error(err)
        }
    }
    getExtention = (filename) => {
        return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) :
            undefined;
    }

    performAttachmentSelection() {
        ActionSheet.show(
            // {
            //     options: ["Take Photo...", "Choose photo from Gallery...", "Choose file from Storage",
            //         "Remove Attachment", "Cancel"],
            //     cancelButtonIndex: 4,
            //     destructiveButtonIndex: 3, 
            // },
            {
                options: ["Take Photo...", "Choose photo from Gallery...", "Choose file from Storage",
                    "Record Video", "Choose Video from Storage", "Record Audio", "Cancel"],
                cancelButtonIndex: 6,
            },

            buttonIndex => {
                let attachmentList = this.state.attachmentList;
                const fileName = String(new Date().valueOf()) + ".jpeg";
                if (buttonIndex == 0) {
                    ImagePicker.openCamera({
                        width: 600, height: 600, cropping: true,
                        compressImageMaxHeight: 600, compressImageMaxWidth: 600,
                        includeBase64: true, mediaType: 'photo', enableRotationGesture: true
                    }).then(data => {
                        console.log('filesize', String(data['data'].fileSize));
                        if (data['data'].fileSize > 2048 * 1024) {
                            Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
                        }
                        else {
                            let fileData = data['data'];
                            if (fileData.length > 0) {

                                let object = {
                                    fileName: String(fileName),
                                    ImageData: fileData,
                                    isAttachModify: true,
                                    savedFileName: fileName,
                                    fileExtension: '.jpeg'
                                }
                                attachmentList.push(object);

                                this.setState({
                                    sd_ImageData: fileData, isAttachModify: true,
                                    fileName: String(data['path']), savedFileName: fileName, fileExtension: '.jpeg',
                                    attachmentList: attachmentList
                                })
                            }
                        }
                        setTimeout(() => {
                            ImagePicker.clean();
                        }, 0);

                    });
                } else if (buttonIndex == 1) {
                    ImagePicker.openPicker({
                        width: 600, height: 600, cropping: true,
                        compressImageMaxHeight: 600, compressImageMaxWidth: 600,
                        includeBase64: true, mediaType: 'photo', enableRotationGesture: true
                    }).then(data => {

                        console.log('filesize', String(data['data']));
                        console.log('filename', String(data['path']));

                        if (data['data'].fileSize > 2048 * 1024) {
                            Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
                        }
                        else {
                            let fileData = data['data'];

                            let object = {
                                fileName: String(fileName),
                                ImageData: fileData,
                                isAttachModify: true,
                                savedFileName: fileName,
                                fileExtension: '.jpeg'
                            }

                            attachmentList.push(object);
                            if (fileData.length > 0) {
                                this.setState({
                                    sd_ImageData: fileData, isAttachModify: true,
                                    fileName: String(data['path']), savedFileName: fileName, fileExtension: '.jpeg', attachmentList: attachmentList
                                })
                            }
                        }

                        setTimeout(() => {
                            ImagePicker.clean();
                        }, 0);
                    });
                } else if (buttonIndex == 2) {
                    //file picker
                    DocumentPicker.show({
                        filetype: [DocumentPickerUtil.allFiles()],
                        // filetype: [DocumentPickerUtil.pdf],
                        //readFile:true
                    }, (error, res) => {
                        if (res != null && res != undefined) {
                            if (parseInt(res.fileSize) > 2048 * 1024) {
                                Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
                            } else {
                                var temp_fileExtension = this.getExtention(res.fileName);
                                fileExtension = "." + temp_fileExtension[0];
                                // const fileExtension = fileName.substring(fileName.lastIndexOf('.')).trim();
                                console.log(fileExtension);
                                console.log('fileName', res.fileName);

                                if (fileExtension == '.png' || fileExtension == '.jpeg' || fileExtension == '.jpg' || fileExtension == '.bmp' || fileExtension == '.gif') {
                                    Alert.alert('Message', 'Please select valid document file.');
                                    //Toast.show({ text: 'Please select document file.', type: 'danger' });
                                } else {

                                    let fileName = String(res.fileName);
                                    // this.setState({ isAttachModify: true,
                                    //     fileName: fileName, fileExtension: fileExtension });
                                    RNFS.readFile(res.uri, 'base64').then(res2 => {
                                        console.log('base 64', res2);
                                        let object = {
                                            fileName: String(res.fileName),
                                            ImageData: res2,
                                            isAttachModify: true,
                                            savedFileName: fileName,
                                            fileExtension: fileExtension
                                        }
                                        attachmentList.push(object);
                                        this.setState({
                                            sd_ImageData: res2, isAttachModify: true,
                                            fileName: fileName, savedFileName: fileName, fileExtension: fileExtension,
                                            attachmentList: attachmentList
                                        });
                                    }).catch((err) => {

                                    });
                                }

                            }
                        }
                    });
                } else if (buttonIndex == 3) {
                    ImagePicker.openCamera({
                        mediaType: 'video',
                    }).then(data => {

                        console.log('filesize', JSON.stringify(data));
                        if (data['size'] > 25600 * 1024) {
                            Toast.show({ text: 'File should be less than 25 MB', type: 'danger' });
                        }
                        else {
                            let fileData = data['path'];
                            let fileExtension = this.getExtention(data['path']);
                            let object = {
                                fileName: String(data['path']),
                                ImageData: fileData,
                                isAttachModify: true,
                                savedFileName: String(data['path']),
                                fileExtension: fileExtension
                            }

                            attachmentList.push(object);
                            if (data['size'] > 0) {
                                this.setState({
                                    sd_ImageData: fileData, isAttachModify: true,
                                    fileName: String(data['path']), savedFileName: String(data['path']), fileExtension: fileExtension
                                })
                            }

                        }

                        setTimeout(() => {
                            ImagePicker.clean();
                        }, 0);

                    });
                } else if (buttonIndex == 4) {
                    ImagePicker.openPicker({
                        mediaType: 'video'
                    }).then(data => {

                        console.log('Video filesize', JSON.stringify(data));
                        // console.log( 'filename',  String(data['path']));

                        if (data['size'] > 25600 * 1024) {
                            Toast.show({ text: 'File should be less than 25 MB', type: 'danger' });
                        }

                        else {
                            let fileData = data['path'];
                            let fileExtension = this.getExtention(data['path']);
                            let object = {
                                fileName: String(data['path']),
                                ImageData: fileData,
                                isAttachModify: true,
                                savedFileName: String(data['path']),
                                fileExtension: '.mp4'
                            }

                            attachmentList.push(object);
                            if (data['size'] > 0) {
                                this.setState({
                                    sd_ImageData: fileData, isAttachModify: true,
                                    fileName: String(data['path']), savedFileName: String(data['path']), fileExtension: fileExtension
                                })
                            }

                        }
                        setTimeout(() => {
                            ImagePicker.clean();
                        }, 0);
                    });
                }
            }
        )
    }


    onHTTPResponseCheckUserLogin(respData) {

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

        const dateResult = Moment(date, 'DD MMM, YYYY').toDate();
        var b = Moment(date).format('YYYY-MM-DD, h:mm:ss a');
        var a = Date.parse('June 30, 2020 1:08:36');


        console.log('newConvertedDate', Moment(date).format('YYYY-MM-DD, h:mm:ss a'));
        console.log('newConvertedDate2', Moment(this.state.dateResult).format('MMMM Do YYYY, h:mm:ss a'));
        console.log('newConvertedDate4', a);
        console.log('NwDaterttt', new Date(a).getDate());
        var b = Moment(new Date(a), 'DD MMM, YYYY').toDate();
        console.log('NwDaterttt2', Moment(b).format('YYYY-MM-DD hh:mm:ss'));

        // let startDateVal = Moment(dateResult).format('YYYY-MM-DD');
        // let endDateVal = Moment(this.state.dateMax).format('YYYY-MM-DD');
        // let diff = Moment(endDateVal).diff(startDateVal, 'days');
        // if (diff < 0) {
        //     Toast.show({ text: "Result date not greater than todays date!",  buttonText: "", type: "warning" });
        // } else {
        //     this.setState({ dateResult: dateResult });
        // }
        this.setState({ dateResult: dateResult, newDate: date });
        console.log('newConvertedDate3', new Moment(date).toDate());
    }

    performSelectResultTime(date) {
        const dateResult = Moment(date, 'hh:mm a').toDate();
        console.log('selected date', dateResult);
        this.setState({
            timeResult: dateResult,
            oldTimeofClass: dateResult
        });
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

    renderAssignmentListRow = (index, item) => {
        if (this.state.attachmentList.length > 0)
            return (
                <View style={{ flex: 1, marginTop: 0, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderStyle: 'dotted', borderColor: appColor.light_gray, marginLeft: 10, marginRight: 10 }}>
                    <Text style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>{item.fileName}</Text>
                    <TouchableOpacity>
                        <Image style={{ width: 35, height: 35, marginTop: 3, marginBottom: 2 }} source={require('../../assets/cross.png')} />
                    </TouchableOpacity>
                </View>
            )
        else
            return <View>

            </View>
    }

    renderBatchListRow = (index, item) => {
        console.log(item.BatchName);
        if (this.state.batchList.length > 0)
            return (
                <View style={{ flex: 1, marginTop: 0, flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginRight: 10 }}>
                    <CheckBox
                        value={item.isSelected}
                        onValueChange={() => {

                        }}
                    />
                    <Text style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 15, color: 'black' }}>{item.batchName}</Text>
                </View>
            )
        else
            return <View>
            </View>
    }


    onCourseChange = (value) => {

        let subjectList = [], batchList = [];

        if (value != 0) {

            for (let i = 0; i < this.state.courseList.length; i++) {
                if (this.state.courseList[i].courseId == value) {
                    subjectList = this.state.courseList[i].subjectList;
                    break;
                }
            }
            this.setState({ selectedCourseId: value, subjectList: subjectList, });
        } else {
            this.setState({ selectedCourseId: value, subjectList });
        }
    }

    createMeeting = async () => {
        let accessToken = await AsyncStorage.getItem('zoomAccessToken');
        let zoomId = await AsyncStorage.getItem('ZoomUserId');
        let request = {
            "topic": this.state.topic,
            "type": 2,
            "start_time": String(Moment(this.state.dateResult).format('YYYY-MM-DD')) + 'T' + String(Moment(this.state.timeResult).format('HH-MM-SS')),
            "duration": parseInt(this.state.duration),
            "timezone": "Asia/Calcutta",
            "password": "admin123",
            "agenda": "",
            "recurrence": {
                "type": 2,
            },
            "settings": {
                "host_video": true,
                "participant_video": true,
                "cn_meeting": false,
                "in_meeting": true,
                "mute_upon_entry": this.state.isMute,
                "audio": "both",
                "join_before_host": false,
                "approval_type": 2,
                "waiting_room": false,
                "registrants_email_notification": false,
                "auto_recording": "cloud",
                "enforce_login": false,
                "registrants_email_notification": false
            }
        }

        if (zoomId != 'null') {
            let response = await createZoomMeeting(zoomId, request, accessToken);
            if (response != '' && response != 'Network error' && response != 'error') {
                this.saveMeetingDetailsOnServer(response)
            }
        }

    }

    updateMeeting = async () => {
        let accessToken = await AsyncStorage.getItem('zoomAccessToken');
        let zoomId = await AsyncStorage.getItem('ZoomUserId');
        let request = {
            "topic": this.state.topic,
            "type": 2,
            "start_time": String(Moment(this.state.dateResult).format('YYYY-MM-DD')) + 'T' + String(Moment(this.state.timeResult).format('HH-MM-SS')),
            "duration": parseInt(this.state.duration),
            "timezone": "Asia/Calcutta",
            "password": "admin123",
            "agenda": "",
            "settings": {
                "host_video": true,
                "in_meeting": true,
                "join_before_host": false,
                "mute_upon_entry": this.state.isMute,
                "participant_video": true,
                "registrants_confirmation_email": false,
                "approval_type": 2,
                "auto_recording": "cloud",
                "use_pmi": false,
                "waiting_room": false,
                "watermark": false,
            }
        }

        if (zoomId != 'null') {
            let response = await updateZoomMeeting(parseInt(this.state.VCMeetingId), request, accessToken);
            if (response == 204)
                this.saveMeetingDetailsOnServer(response);
            else
                return;
        }
    }



    saveMeetingDetailsOnServer() {
        try {
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    var sendMessageTo = '';
                    if (this.state.sendNotificationsTostudent) {
                        sendMessageTo += '1'
                    } else if (this.state.sendNotificationsTomother) {
                        sendMessageTo += ',2'
                    } else if (this.state.sendNotificationsTofather) {
                        sendMessageTo += ',3'
                    }
                    if (this.props.isEdit) {
                        const requestJson = {
                            'UserId': parseInt(this.props.userID),
                            'VirtualClassId': parseInt(this.props.meetingId),
                            'MeetingProviderId': parseInt(this.state.selectedClassProviderId),
                            'MeetingId': parseInt(this.props.navigation.state.params.meetingData.VCMeetingId),
                            //  'Password':pwd,    
                            'MeetingDuration': parseInt(this.state.duration),
                            // 'MeetingTime': String(Moment(this.state.timeResult).format('hh:mm a').toUpperCase()), //adding it in below 
                            'BatchId': parseInt(this.state.selectedBatchId),
                            //  'BatchName':this.state.batchName,
                            'SubjectId': parseInt(this.state.selecteSubjectId),
                            //  'SubjectName':this.state.subjectName,
                            'TopicName': this.state.topic,
                            'StartDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            // 'LStartDateTime': String(Moment(this.state.dateResult).format('DD-MM-YYYY')) + ' ' + String(Moment(this.state.timeResult).format('hh:mm a').toUpperCase()),
                            'EndDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            'TimeZoneId': 'India Standard Time',
                            'PresenterName': this.state.PresenterName,
                            'IsSoundMute': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableApprovalonInviteLink': this.state.approvalChecked == 'ON' ? 0 : 1,
                            'IsHostVideo': this.state.hostChecked == 'ON' ? 1 : 0,
                            'IsVideoParticipant': this.state.participantChecked == 'ON' ? 1 : 0,
                            'MuteParticipantOnEntry': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableWaitingRoom': this.state.waitingChecked == 'ON' ? 1 : 0,
                            'IsVideoRecording': this.state.recordingChecked == 'ON' ? 1 : 0,
                            // 'isNotificationEnabled': this.state.SendNotificationChecked == 'ON' ? 1 : 0,  
                            'ExtendDuration': 0,
                            'DefaultAttendeeAudio': 0,
                            'DefaultAttendeeWritting': 0,
                            'InstituteId': parseInt(this.props.instituteID), 'BranchId': parseInt(this.props.branchID),
                            'IsActive': 1,
                            'StatusFlag': 1,
                            "IsNotify": this.state.SendNotificationChecked === 'ON' ? 1 : 0,
                            "MessageType": this.state.notificationType === "sms_notification" ? 1 : this.state.notificationType === "email_notification" ? 2 : this.state.notificationType === "push_notification" ? 3 : null,
                            "MessageTo": sendMessageTo,
                            "BatchName": this.state.batchName,
                            "SubjectName": this.state.subjectName
                        };
                        if (this.state.timeResult.toString().includes("am") || this.state.timeResult.toString().includes("AM") || this.state.timeResult.toString().includes("pm") || this.state.timeResult.toString().includes("PM")) {
                            requestJson.MeetingTime = String(this.state.timeResult)
                            requestJson.LStartDateTime = String(Moment(this.state.dateResult).format('DD-MM-YYYY')) + ' ' + String(this.state.timeResult).toUpperCase()
                        }
                        else {
                            requestJson.MeetingTime = String(Moment(this.state.timeResult).format('hh:mm a').toUpperCase())
                            requestJson.LStartDateTime = String(Moment(this.state.dateResult).format('DD-MM-YYYY')) + ' ' + String(Moment(this.state.timeResult).format('hh:mm a').toUpperCase())
                        }
                        this.changeLoadingStatus(true);
                        console.log("aaaa", requestJson)
                        await addMeetingDetails(requestJson, this);
                    } else {
                        var a = Moment(this.state.dateResult).format('YYYY-MM-DD')
                        console.log('qwdqddqdd', Date.parse(a));
                        const requestJson = {
                            'UserId': parseInt(this.props.userID),
                            //  'VcMeetingId':parseInt(meetingId),
                            'MeetingProviderId': parseInt(this.state.selectedClassProviderId),
                            'MeetingId': 0,
                            'TimeZoneId': 'India Standard Time',
                            //  'Password':pwd,    
                            'MeetingDuration': parseInt(this.state.duration),
                            'MeetingTime': String(Moment(this.state.timeResult).format('hh:mm a').toUpperCase()),
                            'BatchId': parseInt(this.state.selectedBatchId),
                            //  'BatchName':this.state.batchName,
                            'SubjectId': parseInt(this.state.selecteSubjectId),
                            //  'SubjectName':this.state.subjectName,
                            'TopicName': this.state.topic,
                            'StartDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            'LStartDateTime': String(Moment(this.state.dateResult).format('DD-MM-YYYY')) + ' ' + String(Moment(this.state.timeResult).format('hh:mm a').toUpperCase()),
                            'EndDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                            'PresenterName': this.state.PresenterName,
                            'PresenterEmailId': this.props.EmailId,
                            'IsSoundMute': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableApprovalonInviteLink': this.state.approvalChecked == 'ON' ? 0 : 1,
                            'IsHostVideo': this.state.hostChecked == 'ON' ? 1 : 0,
                            'IsVideoParticipant': this.state.participantChecked == 'ON' ? 1 : 0,
                            'MuteParticipantOnEntry': this.state.muteChecked == 'ON' ? 1 : 0,
                            'EnableWaitingRoom': this.state.waitingChecked == 'ON' ? 1 : 0,
                            'IsVideoRecording': this.state.recordingChecked == 'ON' ? 1 : 0,
                            // 'IsVideoRecording': this.state.SendNotificationChecked == 'ON' ? 1 : 0,  
                            'ExtendDuration': 0,
                            'DefaultAttendeeAudio': 0,
                            'DefaultAttendeeWritting': 0,
                            'InstituteId': parseInt(this.props.instituteID),
                            'BranchId': parseInt(this.props.branchID),
                            'IsActive': 1,
                            'StatusFlag': 1,
                            "IsNotify": this.state.SendNotificationChecked === 'ON' ? 1 : 0,
                            "MessageType": this.state.notificationType === "sms_notification" ? 1 : this.state.notificationType === "email_notification" ? 2 : this.state.notificationType === "push_notification" ? 3 : null,
                            "MessageTo": sendMessageTo,
                            "BatchName": this.state.batchName,
                            "SubjectName": this.state.subjectName

                        };
                        console.log('In create Classroom', JSON.stringify(requestJson));
                        this.changeLoadingStatus(true);
                        await addMeetingDetails(requestJson, this);

                    }

                    //     let meetingId = details['id'];
                    //        let hostId = details['host_id'];
                    //        let pwd = details['password'];
                    //        let duration = details['duration']
                    //     const requestJson = {
                    //         'VcMeetingId':parseInt(meetingId),
                    //         'MeetingProviderId':2,
                    //         'MeetingId':0,
                    //         'Password':pwd,
                    //         'Duration':duration,
                    //         'MeetingTime':String(Moment(this.state.timeResult).format('HH:MM')),
                    //         'BatchId':parseInt(this.state.selectedBatchId),
                    //         'BatchName':this.state.batchName,
                    //         'SubjectId':parseInt(this.state.selecteSubjectId),
                    //         'SubjectName':this.state.subjectName,
                    //         'TopicName':this.state.topic,
                    //         'StartDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                    //         'EndDateTime': Moment(this.state.dateResult).format('YYYY-MM-DD'),
                    //         'PresenterName':this.props.userName,
                    //         'IsSoundMute':0,
                    //        'InstituteId': parseInt(this.props.instituteID), 'BranchId': parseInt(this.props.branchID),
                    //        'IsActive':1,
                    //        'StatusFlag':0,
                    //    };
                    //    this.changeLoadingStatus(true);
                    //    await addMeetingDetails(requestJson,this);
                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) { }
    }


    parseServerResponse(respData) {
        try {
            //if(!this._isMounted) return;
            const jsonRec = respData[0];
            const status = jsonRec['TransactionStatus'];
            const message = jsonRec['Msg'];
            console.log(JSON.stringify(jsonRec));
            if (status == 'Success') {
                try {
                    // this.props.ActionDeleteVirtualClass();
                } catch (error) {
                    console.log(error);
                }
                Alert.alert(
                    "Message",
                    message,
                    [
                        {
                            text: "OK", onPress: () => {
                                this.setState({ loading: false });
                                this.props.navigation.state.params.onScreenRefresh();
                                this.props.navigation.navigate('ScheduleClassList', { 'onScreenRefresh': this.onScreenRefresh.bind(this) });
                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                // console.log(respData[0].Msg)
                this.changeLoadingStatus(true);
                InteractionManager.runAfterInteractions(() => {
                    if (message.includes("The string was not recognized as a valid DateTime")) {
                        Alert.alert(StringConstants.batchTitle, "\nPlease check time");
                    }
                    else {
                        Alert.alert(StringConstants.batchTitle, message + "\nPlease Try again Later");
                    }

                })
            }
            this.setState({ loading: false, listLoadAttempted: true });
        } catch (error) {
            this.changeLoadingStatus(false);
            console.error(error);
        }
    }

    onBatchChange = (value) => {
        let temp = '';
        for (let i = 0; i < this.state.batchList.length; i++) {
            if (value == this.state.batchList[i].batchId) {
                temp = this.state.batchList[i].batchName;
                break;
            }
        }
        console.log('Batch', temp);

        this.setState({ selectedBatchId: value, batchName: temp }, () => {
            if (value != 0)
                this.getSubjectListFromServer(value);
        });
        // this.setState({selectedBatchId:value});
    }

    onProviderChange = async (value) => {
        console.log('Batch', value);
        this.setState({ selectedClassProviderId: value });
        await this.getBatchListFromServer(this.props.instituteID, this.props.branchID);
    }

    onSubjectChange = (value) => {
        let temp = '';
        for (let i = 0; i < this.state.subjectList.length; i++) {
            if (value == this.state.subjectList[i].subjectId) {
                temp = this.state.subjectList[i].subjectName;
                break;
            }
        }
        console.log('Subject', temp);

        this.setState({ selecteSubjectId: value, subjectName: temp });
    }



    setMute = (val) => {
        this.setState({ isMute: !this.state.isMute });
    }

    handleDurationChange(value) {
        this.setState({ duration: value })
        // if (value > 300) {
        //     this.setState({ duration: 300 })
        // }
        // else if (value < 30 && value.toString().length > 1) {
        //     alert("Minimum duration is 30mins")
        // }
    }
    handleSendOption() {

    }

    render() {

        const CoursePickerItems = [];

        CoursePickerItems.push(<Picker.Item id={0} label='Select' value={0} />);

        for (var i = 0; i < this.state.courseList.length; i++) {
            const item = this.state.courseList[i];
            CoursePickerItems.push(<Picker.Item id={item.courseId} label={item.courseName} value={item.courseId} />);
        }

        const batchPickerItems = [];
        batchPickerItems.push(<Picker.Item id={0} label='Select' value={0} />);

        for (var i = 0; i < this.state.batchList.length; i++) {
            const item = this.state.batchList[i];
            batchPickerItems.push(<Picker.Item id={item.batchId} label={item.batchName} value={item.batchId} />);
        }

        const subjectPickerItems = [];
        subjectPickerItems.push(<Picker.Item id={0} label='Select' value={0} />);

        for (var i = 0; i < this.state.subjectList.length; i++) {
            const item = this.state.subjectList[i];
            subjectPickerItems.push(<Picker.Item id={item.subjectId} label={item.subjectName} value={item.subjectId} />);
        }

        const classProviderPickerItems = [];
        classProviderPickerItems.push(<Picker.Item id={2} label='Select' value={2} />);

        for (var i = 0; i < this.state.classProviderList.length; i++) {
            const item = this.state.classProviderList[i];
            classProviderPickerItems.push(<Picker.Item id={item.providerId} label={item.providerName} value={item.providerId} />);
        }

        let mainContentLayout = <View style={[layoutDesign.mainContent, { backgroundColor: 'white', borderColor: 'white' }]}>
            <View style={{ marginTop: 20 }}>
                <Text style={layoutDesign.contentHeading}>Class Provider :</Text>
                <View style={layoutDesign.pickerLayout}>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        placeholder="Payment Mode"
                        iosHeader="Select payment mode"
                        style={{ height: 35, padding: 2 }}
                        textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                        selectedValue={this.state.selectedClassProviderId}
                        onValueChange={this.onProviderChange.bind(this)}
                    >
                        {classProviderPickerItems}
                    </Picker>
                </View>
            </View>

            <View style={{ marginTop: 10 }}>
                <Text style={layoutDesign.contentHeading}>Batch :</Text>
                <View style={layoutDesign.pickerLayout}>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        placeholder="Payment Mode"
                        iosHeader="Select payment mode"
                        style={{ height: 35, padding: 2 }}
                        textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                        selectedValue={this.state.selectedBatchId}
                        onValueChange={this.onBatchChange.bind(this)}
                    >
                        {batchPickerItems}

                    </Picker>
                </View>
            </View>

            <View style={{ marginTop: 10 }}>
                <Text style={layoutDesign.contentHeading}>Subject :</Text>
                <View style={layoutDesign.pickerLayout}>
                    <Picker
                        mode="dropdown"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        placeholder="Payment Mode"
                        iosHeader="Select payment mode"
                        style={{ height: 35, padding: 2 }}
                        textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
                        selectedValue={this.state.selecteSubjectId}
                        onValueChange={this.onSubjectChange.bind(this)}
                    >
                        {subjectPickerItems}

                    </Picker>
                </View>
            </View>

            <View style={[layoutDesign.parentViewMargin]}>
                <Text style={layoutDesign.contentHeading}>Topic :</Text>
                <View style={layoutDesign.inputStyle}>
                    <Item>
                        <Input
                            //  keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                            keyboardType='default'
                            value={this.removeEmojis(this.state.topic)}
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
                            minDate={new Moment()}
                            onDateChange={(date) => this.performSelectResultDate(date)}
                            customStyles={{ dateInput: { marginLeft: 10, color: 'black', alignItems: 'flex-start', borderWidth: 0 } }}
                        />
                    </View>
                </View>

                <View style={[layoutDesign.parentViewMargin, { flex: 0.5, marginLeft: 3 }]}>
                    <Text style={layoutDesign.contentHeading}>Start Time</Text>
                    <View style={layoutDesign.dateLayout}>
                        {console.log("Time Format----------", this.state.dateResult)}
                        <DatePicker
                            style={{ width: '95%' }}
                            date={this.state.oldTimeofClass || this.state.timeResult}
                            disabled={false}
                            mode="time"
                            androidMode="default"
                            locale={"en"}
                            confirmBtnText='Select'
                            cancelBtnText='Cancel'
                            iconComponent={<Image source={require('../../assets/timer.png')} style={{ width: 24, height: 24, marginRight: 4 }}></Image>}
                            format='hh:mm a'
                            onDateChange={(date) => this.performSelectResultTime(date)}
                            customStyles={{ dateInput: { marginLeft: 10, color: 'black', alignItems: 'flex-start', borderWidth: 0 } }}
                        />
                    </View>
                </View>
            </View>
            <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderColor: 'white', marginTop: 0, marginBottom: 0 },]}>
                <View style={[layoutDesign.parentViewMargin, { flex: 1, marginRight: 3, alignSelf: 'flex-start' }]}>
                    <Text style={layoutDesign.contentHeading}>Presenter Name :</Text>
                    <View style={layoutDesign.inputStyle}>
                        <Item>
                            <Input
                                //  keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                                value={this.removeEmojis(this.state.PresenterName)}
                                placeholder={this.state.PresenterName}
                                onChangeText={(value) => this.setState({ PresenterName: value })}
                            />
                        </Item>
                    </View>
                </View>
            </View>

            {/** duration layout starts */}

            <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderColor: 'white', marginTop: 0, marginBottom: 0 },]}>
                <View style={[layoutDesign.parentViewMargin, { flex: 0.5, marginRight: 3, alignSelf: 'flex-start' }]}>
                    <Text style={layoutDesign.contentHeading}>Duration :</Text>
                    <View style={layoutDesign.inputStyle}>
                        <Item style={{
                            // justifyContent:"center",
                            borderBottomWidth: 0,
                            alignContent: "center"
                        }}>
                            <Input
                                maxLength={3}
                                keyboardType='number-pad'
                                value={this.state.duration}
                                multiline={false}
                                onChangeText={(value) => this.handleDurationChange(value)}
                            />
                            <View>
                                <Text style={{ fontSize: 14, fontWeight: '400', color: appColor.silverGrey, margin: 2, marginRight: 4 }}>Min</Text>
                            </View>
                            <Text style={{
                                fontSize: 14, fontWeight: '400',
                                color: appColor.font_gray,
                                marginTop: 2,
                                marginLeft: Dimensions.get("screen").width / 2,
                                left: 0, position: "relative",
                                alignSelf: "center",
                                // bottom: '1.1%',
                                position: "absolute",
                                // justifyContent: "space-between"
                            }}>{`(Min 30 & Max 300 mins)`}</Text>
                        </Item>
                    </View>
                </View>
            </View>
            <View style={[layoutDesign.parentViewMargin]}>
                <Text style={layoutDesign.contentHeading}>Video :</Text>
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
                                value={this.state.hostChecked === "ON" ? true : false}
                                onValueChange={() => {
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
            {/* meeting other setting starts*/}
            <View style={[layoutDesign.parentViewMargin]}>
                <Text style={layoutDesign.contentHeading}>Other :</Text>
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
            {/* meeting other setting starts*/}

            {/* meeting  video recording starts*/}
            <View style={[]}>
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
            </View>
            {/* meeting video recording ends*/}
            {/* meeting sendNotification 
            
            
             IsNotify  1-Yes,0-No
             MessageType 1-SMS,2-Email,3-Notifications
             MessageTo 1-Student,2-Father,3-Mother
            
            
            Starts*/}

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
                // this._root.scrollToPosition(0, 0)
                <View style={{
                    height: '13%',
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
                        <Text>Select Message Details :</Text>
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
                        <Text>Send Notifications to</Text>
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
                </View>
            }
        </View>
        let footerLayout =

            <TouchableOpacity style={layoutDesign.floatingMenuContainer} onPress={() => { this.checkValidation() }}>
                <View>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', textAlign: 'center', width: 60 }}>{this.state.isEdit ? 'Update' : 'Save'}</Text>
                </View>
            </TouchableOpacity>
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
                    <NotificationRibbon />
                    <Content
                        style={{ marginBottom: 10 }}
                        ref={content => (this.mainComponent = content)}
                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={false}
                    //     />
                    // }
                    >
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
        })
    }

    handleHostVideoChange() {
        if (this.state.hostChecked === "ON") {
            this.setState({ hostChecked: 'OFF' })
            console.log(this.state.hostChecked)
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


    handleApprovalChange() {
        if (this.state.approvalChecked === "ON") {
            this.setState({ approvalChecked: 'OFF' });
        }
        else if (this.state.approvalChecked === "OFF") {
            this.setState({ approvalChecked: 'ON' })
        }
    }


    handleRecordingChange() {
        // console.log("",this.state.recordingChecked)
        if (this.state.recordingChecked === "ON") {
            this.setState({ recordingChecked: 'OFF' });
        }
        else if (this.state.recordingChecked === "OFF") {
            this.setState({ recordingChecked: 'ON' })
        }
    }


    handleSendNotificationChange() {

        if (this.state.SendNotificationChecked === "ON") {
            this.setState({ SendNotificationChecked: 'OFF' });
        }
        else if (this.state.SendNotificationChecked === "OFF") {
            // console.log(this.mainComponent._root)
            this.setState({ SendNotificationChecked: 'ON' })
            console.log(this.state.SendNotificationChecked)
            setTimeout(() => {
                this.mainComponent._root.scrollToPosition(50, 1000, true)
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
        width: Dimensions.get("screen").width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColor.colorPrimary
    },
    clickableSwitch: {
        margin: 5,
        flexDirection: 'row',
        justifyContent: "space-between",
        // width: '75%'
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
    }
});



const mapStateToProps = state => {
    return {
        instituteID: state.userInfo.instituteID, branchID: state.userInfo.branchID,
        userID: state.userInfo.userID, roleID: state.userInfo.roleID,
        EmailId: state.userInfo.EmailId,
        userRole: state.userInfo.userRole, branchName: state.userInfo.branchName,
        userName: state.userInfo.userName,
        dateFormat: state.userInfo.dateFormat, userFeatures: state.userInfo.userFeatures,
        batchID: state.vcInfo.batchID, subjectID: state.vcInfo.subjectID,
        duration: state.vcInfo.duration,
        isEdit: state.vcInfo.isEdit,
        batchName: state.vcInfo.batchName,
        subjectName: state.vcInfo.subjectName,
        topic: state.vcInfo.topic,
        meetingDate: state.vcInfo.meetingDate,
        meetingTime: state.vcInfo.meetingTime,
        PresenterName: state.vcInfo.PresenterName,
        meetingId: state.vcInfo.meetingId,
        VCMeetingId: state.vcInfo.VCMeetingId,
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
        isSendNotification: state.vcInfo.isSendNotification,
        IsVideoRecording: state.vcInfo.IsVideoRecording,
        EnableApprovalonInviteLink: state.vcInfo.EnableApprovalonInviteLink,
    };
};

export default connect(mapStateToProps, { ActionDeleteVirtualClass })(AddEditClass);