import React, { Component } from 'react';
import {
    View, Alert, RefreshControl, Platform,
    StyleSheet, Dimensions,
    Image,
    CheckBox,
    NativeEventEmitter,
    Linking
} from 'react-native';

import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Thumbnail, Subtitle, Toast, Card, CardItem, Item, Input,
    Footer, Textarea,
} from "native-base";
// import { ActionAddAttendance } from '../redux_reducers/AttendanceReducer';
// import { ActionAddRegEnqData } from '../redux_reducers/RegisterAddEditReducer';
import { ActionAddVirtualClass, ActionDeleteVirtualClass } from '../redux_reducers/VirtualClassReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

import AsyncStorage from '@react-native-community/async-storage';
import InternetConn from '../networkConn/OfflineNotice';
import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';
import HTTPRequestMng from './HTTPRequestMng';
import DBOperation from '../db/DBOperation';
import RNFetchBlob from 'rn-fetch-blob';
import ZoomUs from 'react-native-zoom-us';
import Moment from 'moment';
import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';
import appJson from '../../app.json';

import NetInfo from "@react-native-community/netinfo";
import { connect } from 'react-redux';
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';
import { FAB } from 'react-native-paper';
import { getUserID, createUserZAK } from '../zoom/apis';

class ScheduleClassList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false, todayCollection: 0, todayRefund: 0,
            dashboardContainList: [], actionFabButton: [],
            attachmentLimit: 10,
            MeetingList: [],
            MeetingList2: [],
            searchText: '',
            isSearchVisible: false,
            accessToken: '',
            currentColor: appColor.faintRed,
            previousColor: appColor.trialGreen,
            redColor: appColor.faintRed,
            blueColor: appColor.trialBlue,
            greenColor: appColor.trialGreen,
            meetingStatusId: 0,
            onRefresh: false,
            instituteId: null,
            isPastClassList: false,
            isLiveClassList: true,
            presenterId: '',
            refreshing: false
        }
    }

    async componentDidMount() {

    }


    parseServerResponse(respData) {
        try {
            //if(!this._isMounted) return;
            const jsonRec = respData[0];
            const status = jsonRec['TransactionStatus'];
            const message = jsonRec['Msg'];
            if (status == 'Success') {
                Alert.alert('Message', 'Meeting has ended successfully');
                this.setState({ meetingStatusId: 0 });
            } else {
                InteractionManager.runAfterInteractions(() => {
                    Alert.alert(StringConstants.batchTitle, message);
                })
            }
        } catch (error) {
            console.error(error);
        }
    }

    async updateMeeting(meetingId) {
        const requestJson = {
            'MeetingId': parseInt(meetingId),
            'StatusFlag': 0,
        };
        await updateMeetingStatus(requestJson, this);
    }

    startMeeting = async (VCMeetingData) => {
        let emailId = VCMeetingData.PresenterName
        await ZoomUs.initialize({
            clientKey: VCMeetingData.SDKKey,
            clientSecret: VCMeetingData.SDKSecret,
            domain: 'zoom.us'
        }, {
            disableShowVideoPreviewWhenJoinMeeting: true,
        }).then(async (isInitialized) => {
            if (isInitialized.includes("success")) {
                var accessToken = await ZoomUs.createJWT({
                    apiKey: VCMeetingData.JWTKey,
                    apiSecret: VCMeetingData.JWTSecret
                })
                const userId = await getUserID( VCMeetingData.EmailId, accessToken);
                const userZak = await createUserZAK(userId, accessToken);

                await ZoomUs.startMeeting({
                    userName: VCMeetingData.PresenterName,
                    meetingNumber: VCMeetingData.Id,
                    userId: userId,
                    zoomAccessToken: userZak,
                    userType: 2,
                })


            }
        })
    }


    async componentWillMount() {
        let instituteID = await AsyncStorage.getItem("InstituteId");
        let presenterId = await AsyncStorage.getItem("AutoTrainerId");
        this.setState({
            instituteId: JSON.parse(instituteID),
            presenterId: JSON.parse(presenterId)
        }, () => {
            this.getMeetingListFromServer("isLive")
        })
    }

    componentWillUnmount() {
    }

    onScreenRefresh() {
        if (this.state.isLiveClassList) {
            this.getMeetingListFromServer("isLive");
        }
        else {
            this.getMeetingListFromServer("isPast");
        }
    }

    async changeLoadingStatus(isShow) {
        return this.setState({ loading: isShow })
    }


    onDrawerClose() {
        this.props.navigation.closeDrawer();
    }

    async getMeetingListFromServer(liveOrPast = "past") {
        try {
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    let IsTodayOnly, AutoClassId, AutoSectionId, InstituteId, TimeZoneId, requestString;
                    if (liveOrPast.includes("isLive")) {
                        requestString = "GetVirtualClassDataLive"
                        IsTodayOnly = true
                        this.setState({ isLiveClassList: true, isPastClassList: false })
                    }
                    else {
                        requestString = "GetVirtualClassDataPast"
                        IsTodayOnly = false
                        this.setState({ isLiveClassList: false, isPastClassList: true })
                    }
                    console.log("Calling again",liveOrPast)
                    this.changeLoadingStatus(true);
                    AutoClassId = 0
                    AutoSectionId = 0
                    InstituteId = this.state.instituteId
                    TimeZoneId = "India Standard Time"
                    const obj = new HTTPRequestMng('', requestString, this);
                    obj.executeRequest("IsTodayOnly=" + IsTodayOnly + "&AutoClassId=" + AutoClassId + "&AutoSectionId=" + AutoSectionId + "&InstituteId=" + this.state.instituteId + "&TimeZoneId=" + TimeZoneId);

                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    onHTTPResponseLiveMeetingList(respData) {
        console.log("COMINGRESPONSELIVE",respData)
        this.changeLoadingStatus(false).then(() => {
            this.changeLoadingStatus(false)
            try {
                let code = respData[0].Status;
                let Data = respData[0].Data;
                const that = this;
                let filteredData
                if(Data != ""){
                    filteredData = Data.filter(function (item, index) {
                    return item.PresenterId == that.state.presenterId
                });
                }else{
                    filteredData = []
                }
                console.log("COMINGRESPONSELIVE",code,Data)
                if (code == 1) {
                    console.log("RESPONSEEEE",filteredData)
                    this.setState({
                        MeetingList: filteredData
                    })
                    this.setState({ isLiveClassList: true, isPastClassList: false })
                }else{
                    console.log("RESPONSEEEE",filteredData)
                    this.setState({
                        MeetingList: []
                    })
                    this.setState({ isLiveClassList: true, isPastClassList: false })
                }
            } catch (error) { }
        })
    }

    onHTTPResponsePastMeetingList(respData) {
        this.changeLoadingStatus(false);
        try {
            let code = respData[0].Status;
            let Data = respData[0].Data;
            const that = this;
            console.log("COMINGRESPONSEPAST",code,Data)
            let filteredData = Data.filter(function (item, index) {
                return item.PresenterId == that.state.presenterId
            });
            if (code == 1) {
                this.setState({
                    MeetingList2: filteredData
                })
            }


        } catch (error) {

        }
    }
    async deleteMeetingFromServer(meetingId) {
        console.log("MEETINGIDDDD",meetingId)
        try {
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {
                    this.changeLoadingStatus(true)
                    let requestData = {"MeetingId" : Number(meetingId)};
                    const url = "https://schoolmagica.com/osm/WebServices/VirtualClass_App.asmx/DeleteMeetingDetails?jsonString="+ JSON.stringify(requestData)
                    fetch(url).then( resp => resp.text() ).
                        then(responseJson => {
                            console.log("rrprprprprpr", responseJson)
                            this.onHTTPResponseDeleteMeeting(responseJson)

                        }
                        )
                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    onHTTPResponseDeleteMeeting(respData) {
        this.changeLoadingStatus(false)
        try {
            this.getMeetingListFromServer("isLive");
            console.log(respData)
        } catch (error) {

        }
    }

    onHTTPError() {
        this.changeLoadingStatus(false)
        Alert.alert('Manage Dashboard', 'Unable to connect with server, Please try after some time')
    }

    reloadList(status) {
        this.getMeetingListFromServer();
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

    //restart app
    static restartApp(navigation) {
        navigation.navigate('Launcher');
    }

    async updateDetails(data) {
        let obj = {
            branchId: data.BranchId,
            instituteId: data.InstituteId,
            topic: data.TopicName,
            meetingDate: Moment(data.StartDateTime).toDate(),
            meetingTime: Moment(data.StartDateTime).toDate(),
            PresenterName: data.PresenterName,
            meetingId: parseInt(data.MeetingId),
            VCMeetingId: Number(data.Id),
            MeetingProviderId: parseInt(data.MeetingProviderId),
            password: data.Password,
            duration: data.MeetingDuration,
            isActive: data.IsActive,
            StatusFlag: data.StatusFlag,
            isMute: data.IsSoundMute,
            isEdit: true,
            EnableApprovalonInviteLink: data.EnableApprovelOnInviteLink == 1 ? 'ON' : 'OFF',
            IsHostVideo: data.IsHostVideo == 1 ? 'ON' : 'OFF',
            IsVideoParticipant: data.IsVideoParticipant == 1 ? 'ON' : 'OFF',
            MuteParticipantOnEntry: data.MuteParticipantonEntry == 1 ? 'ON' : 'OFF',
            EnableWaitingRoom: data.EnableWaitingRoom == 1 ? 'ON' : 'OFF',
            IsVideoRecording: data.IsVideoRecording == 1 ? 'ON' : 'OFF',
            ExtendDuration: data.ExtendDuration == 1 ? 'ON' : 'OFF',
            DefaultAttendeeAudio: data.DefaultAttendeeAudio == 1 ? 'ON' : 'OFF',
            DefaultAttendeeWritting: data.DefaultAttendeeWritting == 1 ? 'ON' : 'OFF',
            VirtualSettingId: data.VirtualSettingId,
            autoClassId: data.AutoClassId,
            autoSectionId: data.AutoSectionId,
            presenterId: data.PresenterId,
            sectionName: data.SectionName,
            isParentMeeting: data.IsParentMeeting,
            meetingIDatTimeofEdit:data.Id
        }
        this.props.ActionAddVirtualClass(obj);
        console.log(data)
        try {
            this.props.navigation.state.params.onScreenRefresh();
            this.props.navigation.push('AddEditClass', { 'onScreenRefresh': this.onScreenRefresh.bind(this),"meetingIDatTimeofEdit":data.Id });
        } catch (error) {
            this.props.navigation.push('AddEditClass', { 'onScreenRefresh': this.onScreenRefresh.bind(this),"meetingIDatTimeofEdit":data.Id  });
        }
    }

    playOldClasses(vcData) {
        console.log(vcData)
        try {
            NetInfo.isConnected.fetch().then(async (isConnected) => {
                if (isConnected) {               
                    let MeetingId = Number(vcData.Id);
                    let VirtualSettingId = Number(vcData.VirtualSettingId);
                    const obj = new HTTPRequestMng('', "getrecordingurl", this);
                    "VirtualSettingId=25&InstituteId=143"
                    obj.executeRequest("MeetingId=" + MeetingId + "&VirtualSettingId=" + VirtualSettingId + "&InstituteId=" + this.state.instituteId);

                } else {
                    Alert.alert(StringConstants.batchTitle, StringConstants.NoInternet);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    
    onHttpResponseUrlToPlay(respData){
        try {
            console.log(respData)
            
        } catch (error) {
            
        }
        // this.props.navigation.navigate('RecordingPlayer', { 'videoUrl': joiningUrl });
    }

    renderLiveMeetingRow = (item, index) => {
        if (this.state.MeetingList.length > 0) {
            let current = '', previous = '';

            return (
                <Card style={[layoutDesign.cardMenu, { backgroundColor: appColor.white, borderRadius: 20, borderWidth: 10, borderColor: appColor.colorPrimary, elevation: 5, marginBottom: 20, paddingHorizontal: 4 }]}>
                    <View style={[layoutDesign.cardMenuItem, { backgroundColor: appColor.white }]}>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <View style={layoutDesign.dateTime}>
                                    <Text style={{ fontSize: 14, fontWeight: '400', color: 'white', margin: 1, flexWrap: 'wrap', marginLeft: 5, marginRight: 5, opacity: 1 }}>
                                        {item.StartDateTime.replace("T", " ")}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <View style={{ flexDirection: 'column', marginTop: 0 }}>
                                    <View style={{ marginTop: 0 }}>
                                        <Text style={layoutDesign.fontHeading}>{item.TopicName}</Text>
                                        <Text style={layoutDesign.fontSubHeading}>Topic</Text>
                                    </View>
                                    <View style={{ flexDirection: "column", marginTop: 10, marginBottom: 10 }}>
                                        <Text style={layoutDesign.fontHeading}>{item.IsParentMeeting == 1 ? "Parent Teacher Meeting" : "Virtual Class"}</Text>
                                        <Text style={[layoutDesign.fontSubHeading, { textAlign: "left" }]}>Type</Text>
                                    </View>
                                </View>

                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 0 }}>
                                <View style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: "center", alignContent: "center" }}>
                                    <Text style={{ fontSize: 16, color: appColor.font_gray, display: "flex", flex: 1, textTransform: "capitalize" }}>{item.PresenterName} </Text>
                                    <View style={{ flex: 1, flexDirection: 'row', right: 0, position: "absolute" }}>
                                        <TouchableOpacity onPress={() => {
                                            Alert.alert('Message', 'Do you want to start virtual class?', [
                                                {
                                                    text: 'Yes',
                                                    onPress: () => this.startMeeting(item)
                                                },
                                                {
                                                    text: 'No',
                                                    style: 'cancel'
                                                }
                                            ]);
                                        }}>
                                            <View style={layoutDesign.iconholder}>
                                                <Image source={require('../../assets/play.png')} style={[layoutDesign.iconsImages, { borderRadius: 25 }]}></Image>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            { this.updateDetails(item); }
                                        }
                                        }>
                                            <View style={layoutDesign.iconholder}>
                                                <Image source={require('../../assets/edit.png')} style={layoutDesign.iconsImages}></Image>
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => {
                                            try {
                                                Alert.alert('Message', 'Do you really want to delete class?', [
                                                    {
                                                        text: 'Yes',
                                                        onPress: () => this.deleteMeetingFromServer(item.MeetingId)
                                                    },

                                                    {
                                                        text: 'No',
                                                        style: 'cancel'
                                                    }
                                                ]);
                                            } catch (error) {
                                            }
                                        }
                                        }>
                                            <View style={layoutDesign.iconholder}>
                                                <Image source={require('../../assets/delete.png')} style={{
                                                    width: 20,
                                                    height: 20,
                                                    // margin: 3,
                                                    // marginLeft: 8,
                                                    marginTop: 8,
                                                    // marginBottom: 8,
                                                    // borderRadius: 30
                                                }}></Image>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Card>


            )
        } else {

            return <View>

            </View>
        }
    }

    listEmptyComponent(liveOrPast) {
        if (!this.state.loading) {
            if (liveOrPast.includes("Live")) {
                return <View style={{
                    alignItems: "center",
                    display: "flex",
                    flex: 1, marginTop: "61%"
                }}>
                    <Text>There are no classes scheduled today.</Text>
                </View>
            }
            else {
                return <View style={{
                    alignItems: "center",
                    display: "flex",
                    flex: 1, marginTop: "61%"
                }}>
                    <Text>There are no classes conducted earlier today.</Text>
                </View>
            }
        }
        else {
            return <View style={{
                alignItems: "center",
                display: "flex",
                flex: 1, marginTop: "61%"
            }}>
                <Text>Please wait, Fetching data from server.</Text>
            </View>
        }
    }

    renderPastMeetingRow = (item, index) => {
        if (this.state.MeetingList2.length > 0) {
            let current = '', previous = '';
            if (this.state.previousColor == this.state.greenColor) {
                this.state.currentColor = this.state.redColor;
                this.state.previousColor = this.state.redColor;
            } else if (this.state.previousColor == this.state.redColor) {
                this.state.currentColor = this.state.blueColor;
                this.state.previousColor = this.state.blueColor;
            } else if (this.state.previousColor == this.state.blueColor) {
                this.state.currentColor = this.state.greenColor;
                this.state.previousColor = this.state.greenColor;
            }
            return (

                <Card style={[layoutDesign.cardMenu, { backgroundColor: appColor.white, borderRadius: 20, borderWidth: 10, borderColor: appColor.colorPrimary, elevation: 5, marginBottom: 20, paddingHorizontal: 4 }]}>
                    <View style={[layoutDesign.cardMenuItem, { backgroundColor: appColor.white }]}>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <View style={layoutDesign.dateTime}>
                                    <Text style={{ fontSize: 14, fontWeight: '400', color: 'white', margin: 1, flexWrap: 'wrap', marginLeft: 5, marginRight: 5, opacity: 1 }}>
                                        {item.StartDateTime.replace("T", " ")}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <View style={{ flexDirection: 'column', marginTop: 0 }}>
                                    <View style={{ marginTop: 0 }}>
                                        <Text style={layoutDesign.fontHeading}>{item.TopicName}</Text>
                                        <Text style={layoutDesign.fontSubHeading}>Topic</Text>
                                    </View>
                                    <View style={{ flexDirection: "column", marginTop: 10, marginBottom: 10 }}>
                                        <Text style={layoutDesign.fontHeading}>{item.IsParentMeeting == 1 ? "Parent Teacher Meeting" : "Virtual Class"}</Text>
                                        <Text style={[layoutDesign.fontSubHeading, { textAlign: "left" }]}>Type</Text>
                                    </View>
                                </View>

                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 0 }}>
                                <View style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: "center", alignContent: "center" }}>
                                    <Text style={{ fontSize: 16, color: appColor.font_gray, display: "flex", flex: 1, textTransform: "capitalize" }}>{item.PresenterName} </Text>
                                    {item.IsRecording == 1 && <View style={{ flex: 1, flexDirection: 'row', right: 0, position: "absolute" }}>
                                        <TouchableOpacity onPress={() => this.playOldClasses(item)}>
                                            <View style={layoutDesign.iconholder}>
                                                <Image source={require('../../assets/play.png')} style={layoutDesign.iconsImages}></Image>
                                            </View>
                                        </TouchableOpacity>
                                    </View>}
                                    {/* <View style={{ flex: 1, flexDirection: 'row', right: 0, position: "absolute", display: item.IsRecording == 1 ? "flex" : "none" }}>
                                        <TouchableOpacity onPress={() => {
                                            Alert.alert('Message', 'Do you want to start virtual class?', [
                                                {
                                                    text: 'Yes',
                                                    onPress: () => this.playOldClasses(item)
                                                },
                                                {
                                                    text: 'No',
                                                    style: 'cancel'
                                                }
                                            ]);
                                        }}>
                                            <View style={layoutDesign.iconholder}>
                                                <Image source={require('../../assets/play.png')} style={[layoutDesign.iconsImages, { borderRadius: 25 }]}></Image>
                                            </View>
                                        </TouchableOpacity>
                                    </View> */}
                                </View>
                            </View>
                        </View>
                    </View>
                </Card>


                // <Card style={[layoutDesign.cardMenu, { backgroundColor: appColor.white, borderRadius: 20, borderWidth: 10, borderColor: appColor.colorPrimary, elevation: 5, marginBottom: 20, paddingHorizontal: 4 }]}>
                //     <View style={[layoutDesign.cardMenuItem, { backgroundColor: appColor.white }]}>
                //         <View style={{ flex: 1, flexDirection: 'column' }}>
                //             <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                //                 <View style={layoutDesign.dateTime}>
                //                     <Text style={{ fontSize: 14, fontWeight: '400', color: 'white', margin: 1, flexWrap: 'wrap', marginLeft: 5, marginRight: 5, opacity: 1 }}>
                //                         {item.StartDateTime.replace("T", " ")}
                //                     </Text>
                //                 </View>
                //             </View>
                //             <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>

                //                 <View style={{ flex: 1, flexDirection: 'column', marginTop: -5 }}>
                //                     <View style={{ flex: 1, flexDirection: 'row', marginTop: 0 }}>
                //                         <View style={{ flexDirection: 'column', marginTop: 0 }}>
                //                             <View style={{ marginTop: 0 }}>
                //                                 <Text style={layoutDesign.fontHeading}>{item.TopicName}</Text>
                //                                 <Text style={layoutDesign.fontSubHeading}>Topic</Text>
                //                             </View>
                //                             <View style={{ flexDirection: "row", marginTop: 10, marginBottom: 10 }}>
                //                                 <View style={{ width: '50%', maxWidth: "50%", borderRightWidth: 1, borderRightColor: appColor.font_gray }}>
                //                                     <Text style={[layoutDesign.fontSubHeading, { textAlign: "left" }]}>Batch</Text>
                //                                 </View>
                //                                 <View style={{ marginTop: 0, width: '50%', maxWidth: "50%", marginHorizontal: 10 }}>
                //                                     <Text style={[layoutDesign.fontSubHeading, { textAlign: "left" }]}>Subject</Text>
                //                                 </View>
                //                             </View>
                //                         </View>
                //                     </View>
                //                 </View>
                //             </View>
                //             <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 0 }}>
                //                 <View style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: "center", alignContent: "center", }}>
                //                     <Text style={{ fontSize: 20, color: appColor.font_gray, display: "flex", flex: 1, textTransform: "capitalize" }}>{item.PresenterName}</Text>
                //                     {item.IsRecording == 1 && <View style={{ flex: 1, flexDirection: 'row', right: 0, position: "absolute" }}>
                //                         <TouchableOpacity onPress={() => this.playOldClasses(item)}>
                //                             <View style={layoutDesign.iconholder}>
                //                                 <Image source={require('../../assets/play.png')} style={layoutDesign.iconsImages}></Image>
                //                             </View>
                //                         </TouchableOpacity>
                //                     </View>}
                //                     <TouchableOpacity onPress={() => {
                //                         { this.updateDetails(item); }
                //                     }
                //                     }>
                //                         <View style={layoutDesign.iconholder}>
                //                             <Image source={require('../../assets/edit.png')} style={layoutDesign.iconsImages}></Image>
                //                         </View>
                //                     </TouchableOpacity>
                //                     {/* <TouchableOpacity onPress={() => {
                //                         Alert.alert('Message', 'Do you want to start virtual class?', [
                //                             {
                //                                 text: 'Yes',
                //                                 onPress: () => this.startMeeting(item)
                //                             },
                //                             {
                //                                 text: 'No',
                //                                 style: 'cancel'
                //                             }
                //                         ]);
                //                     }}>
                //                         <View style={layoutDesign.iconholder}>
                //                             <Image source={require('../../assets/play.png')} style={[layoutDesign.iconsImages, { borderRadius: 25 }]}></Image>
                //                         </View>
                //                     </TouchableOpacity> */}
                //                 </View>
                //             </View>
                //         </View>
                //     </View>
                // </Card>


            )
        } else {

            return <View>

            </View>
        }
    }

    render() {
        const childWidth = (screenWidth / (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : (isTablet ? 2 : 1.5)));
        const menuCard = childWidth - 20;
        let counterPanel;
        let listHeader;
        let searchLayout;

        searchLayout = this.state.isSearchVisible ?
            <View style={{ flex: 1 }}>
                <Item regular style={{ flex: 1, width: '100%', borderWidth: 1, borderRadius: 4, marginTop: 2, marginLeft: -10, marginRight: -10, height: 40, width: 250, marginBottom: 2, backgroundColor: 'white' }}>
                    <Input
                        placeholder='Search here..'
                        returnKeyType='next'
                        keyboardType='default'
                        autoCapitalize='words' />
                </Item>
            </View>
            :
            <View></View>

        listHeader = this.state.MeetingList.length > 0 ?
            <View style={{ flex: 1, marginTop: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderColor: appColor.light_gray }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderColor: appColor.light_gray, width: '20%' }}>
                    <CheckBox style={{ marginLeft: 2, marginTop: 5, marginBottom: 5 }} />
                    <Text style={{ marginLeft: 5, marginTop: 5, marginBottom: 5 }}>All</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: appColor.light_gray, width: '40%' }}>
                    <Text style={{ marginLeft: 5, marginTop: 5, marginBottom: 5 }}>Name</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', borderLeftWidth: 1, borderColor: appColor.light_gray, height: '100%' }}>
                    <Text style={layoutDesign.globelMargin}>Registration No.</Text>
                </View>

            </View>
            :
            <View>
            </View>

        let mainContentLayout = <View style={layoutDesign.mainContent}>
            {this.state.isLiveClassList ? <FlatList
                style={{ marginTop: 10 }}
                data={this.state.MeetingList}
                renderItem={({ item, index }) => this.renderLiveMeetingRow(item, index)}
                enableEmptySections={true}
                keyExtractor={(item, index) => String(index)}
                onRefresh={() => this.reloadList(false)}
                refreshing={this.state.onRefresh}
                ListEmptyComponent={this.listEmptyComponent("Live")}
            />
                :
                <FlatList
                    style={{ marginTop: 10 }}
                    data={this.state.MeetingList2}
                    renderItem={({ item, index }) => this.renderPastMeetingRow(item, index)}
                    enableEmptySections={true}
                    keyExtractor={(item, index) => String(index)}
                    onRefresh={() => this.reloadList(false)}
                    refreshing={this.state.onRefresh}
                    ListEmptyComponent={this.listEmptyComponent("Past")}
                />}
        </View>
        return (
            <Container style={{ backgroundColor: appColor.lightest_gray }}>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.navigate('DashboardWnd')}>
                            <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        {/* {searchLayout} */}
                        <Title>Virtual Classes</Title>
                    </Body>
                    {/* <Right>
                        <Button transparent onPress={() => this.setState({isSearchVisible:!this.state.isSearchVisible})}>
                            <Icon name= {this.state.isSearchVisible ? 'close':'search'}/>
                        </Button>
                    </Right> */}
                </Header>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ flexDirection: 'row', flex: 1, position: "absolute", top: 0, zIndex: 9, backgroundColor: "white", width: "100%", paddingStart: 15, paddingTop: 10 }}>
                        <TouchableOpacity onPress={() => this.setState({ isLiveClassList: true, isPastClassList: false }, () => {
                            this.getMeetingListFromServer('isLive');
                        })}>
                            <View style={(this.state.isLiveClassList) ? layoutDesign.viewHighlight : layoutDesign.viewPlain}>
                                <Text style={(this.state.isLiveClassList) ? layoutDesign.Texthighlight : layoutDesign.TextPlain}>Live {'&'} Upcoming</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={layoutDesign.Texthighlight}>|</Text>
                        <TouchableOpacity onPress={() => this.setState({ isLiveClassList: false, isPastClassList: true }, () => {
                            this.getMeetingListFromServer('isPast');
                        })} style={{ marginLeft: 4 }}>
                            <View style={(this.state.isPastClassList) ? layoutDesign.viewHighlight : layoutDesign.viewPlain}>
                                <Text style={(this.state.isPastClassList) ? layoutDesign.Texthighlight : layoutDesign.TextPlain}>Past</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <InternetConn />
                    {/* <NotificationRibbon /> */}
                    <Content
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.onScreenRefresh.bind(this)}
                            />
                        }
                    >
                        {mainContentLayout}

                    </Content>

                </View>
                <FAB
                    onPress={() => {
                        try {
                            this.props.ActionDeleteVirtualClass()
                            this.props.navigation.state.params.onScreenRefresh();
                            this.props.navigation.push('AddEditClass', { 'onScreenRefresh': this.onScreenRefresh.bind(this) });
                        } catch (error) {
                            this.props.navigation.push('AddEditClass', { 'onScreenRefresh': this.onScreenRefresh.bind(this) });
                        }
                    }
                    }
                    style={{
                        position: 'absolute',
                        margin: 16,
                        right: 0,
                        bottom: 0,
                        backgroundColor: appColor.colorPrimary
                    }}
                    icon="plus"
                />
                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%' }}
                    showProgress={true}
                    progressSize="large"
                    message="Loading, Please wait..."
                    closeOnTouchOutside={true}
                    closeOnHardwareBackPress={true}
                    showCancelButton={false}
                    showConfirmButton={false}
                />}
            </Container>
        );

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
    iconholder: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColor.white,
        borderRadius: 5,
        margin: 5,
        borderRadius: 35,
        width: 30,
        height: 30,
        // display:"none"
    },
    iconsImages: {
        width: 30,
        height: 30,
        // margin: 3,
        // marginLeft: 8,
        marginTop: 8,
        marginBottom: 8,
        // borderRadius:30
    },
    cardMenu: {
        // backgroundColor: appColor.faintRed,
    },

    cardMenuItem: {
        // backgroundColor: appColor.faintRed,
        flex: 1, justifyContent: 'flex-start',
        margin: 10,

    },

    cardMenuItemContent: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -7,
        marginRight: -7
    },

    footerLayout: {
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#ddd',
        backgroundColor: 'white',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 9,
        marginLeft: 11,
        marginRight: 15
    },

    floatingMenuContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColor.colorPrimary,
        borderRadius: 2
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
        backgroundColor: 'white',
        marginLeft: 12,
        marginRight: 15,
        marginTop: 35
    },

    globelMargin: {
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 5
    },

    componentMargin: {
        marginTop: 15
    },

    fontHeading: {
        fontSize: 18,
        fontWeight: '400',
        color: appColor.colorPrimary
    },

    fontSubHeading: {
        fontSize: 14,
        fontWeight: 'bold',
        color: appColor.colorPrimary,
    },
    dateTime: {
        borderRadius: 5,
        backgroundColor: appColor.colorPrimary,
        justifyContent: 'center',
        flexDirection: 'row-reverse', justifyContent: 'flex-start'
    },
    Texthighlight: {
        color: appColor.colorPrimaryDark,
        marginLeft: 2
    },
    TextPlain: {
        fontWeight: 'bold',
        color: appColor.font_gray,
        marginLeft: 2
    },
    viewPlain: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },
    viewHighlight: {
        borderLeftColor: appColor.colorPrimaryDark,
        // borderLeftWidth: 2
    },
    dateTimePast: {
        borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.31)', justifyContent: 'center',
        flexDirection: 'row-reverse', justifyContent: 'flex-start'
    },
    pickerLayout: {
        flexDirection: 'row',
        flex: 1, backgroundColor: 'white', borderRadius: 5,
        alignItems: 'center',
        // height: 44,
        borderWidth: 2, borderColor: '#DDDDDD',
        // marginTop: -5
    },
    dailogContent: {
        height: '100%',
        flex: 1,
        width: '100%'
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    iconsImages: {
        width: 45,
        height: 45,
        marginTop: 8,
        marginBottom: 8,
    },
});

const mapStateToProps = state => {
    return {
        batchID: state.vcInfo.batchID,
        subjectID: state.vcInfo.subjectID,
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
        IsVideoRecording: state.vcInfo.IsVideoRecording,
        EnableApprovalonInviteLink: state.vcInfo.EnableApprovalonInviteLink,
    };
};

// export default ScheduleClassList;
export default connect(mapStateToProps, { ActionAddVirtualClass, ActionDeleteVirtualClass })(ScheduleClassList);