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
import { ActionAddAttendance } from '../redux_reducers/AttendanceReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

class AttendanceCell extends PureComponent {

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

        const dateResult = Moment(data.attDate, 'dddd DD/MM/YYYY').toDate();
        const dateOfAttendance = String(Moment(dateResult).format('dddd DD/MM/YYYY'));

        let str = String(Moment(dateResult).format('MMM')).toUpperCase();
        let strArray = []

        strArray = str.split('');

        let monthVerticalText = "";
        strArray.forEach(singleObj => {
            monthVerticalText = monthVerticalText + String(singleObj) + "\n"
        })

        return (<View style={{ flex: 1, paddingLeft: 10, paddingRight: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableHighlight underlayColor='#00000010' style={{ flex: 1 }}
                    onPress={() => this.props.onAttendanceSelection(this.props.index, data)}>
                    <Card style={{ borderTopStartRadius: 15, borderTopEndRadius: 15, borderBottomStartRadius: 15, borderBottomEndRadius: 15 }}>
                        <CardItem bordered style={{ borderTopStartRadius: 15, borderTopEndRadius: 15, borderBottomStartRadius: 15, borderBottomEndRadius: 15, borderColor: 'white' }}>

                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={{
                                    backgroundColor: '#abb6f1', width: 38,
                                    justifyContent: 'center', alignItems: 'center'
                                }}>
                                    <Text style={layoutDesign.verticalText}>{monthVerticalText}</Text>
                                </View>

                                <View style={{ flex: 1, flexDirection: 'column', marginLeft: 5 }}>

                                    <Text numberOfLines={1} ellipsizeMode={'tail'}>{dateOfAttendance}</Text>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                        <Text style={[layoutDesign.headingText]}>Section : </Text>
                                        <Text numberOfLines={1} ellipsizeMode={'tail'}
                                            style={{ color: appColor.black }}>{data.SectionName}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', marginTop: 10, alignContent: 'space-between' }}>
                                        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                                            <Text style={layoutDesign.headingText}>Students</Text>
                                            <Text style={layoutDesign.dataText}>{data.totalStud}</Text>
                                        </View>
                                        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                                            <Text style={layoutDesign.headingText}>Present</Text>
                                            <Text style={layoutDesign.dataText}>{data.presentStud}</Text>
                                        </View>
                                        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                                            <Text style={layoutDesign.headingText}>Absent</Text>
                                            <Text style={layoutDesign.dataText}>{data.absentStud}</Text>
                                        </View>
                                    </View>

                                    <Text style={[layoutDesign.headingText, { marginTop: 10, alignSelf: 'flex-end' }]}>{percentStr}% present</Text>
                                    <ProgressBar unfilledColor={appColor.googleRed} color={appColor.googleGreen} progress={percent} borderWidth={0}
                                        height={2} width={this.props.progressBarWidth} style={{ marginTop: 5, marginLeft: 5, marginRight: 5 }} />
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Image resizeMode={'stretch'} source={require('../../assets/ic_next.png')}
                                        style={{ width: 15, height: 30, marginLeft: 10 }} />
                                </View>
                            </View>
                        </CardItem>
                    </Card>
                </TouchableHighlight>
            </View>

        </View>);
    }
}

class TabSyncAttendanceList extends React.Component {

    constructor(props) {
        super(props)
        this.state =
        {
            loading: false, loadingMsg: '', instituteId: this.props.instituteId,
            attendanceDetailsList: [], pageNo: 1
        }

        this.loadMoreAttendance = this.getSyncAttendanceListFromServer.bind(this)
        this._PageIndex = 1;
    }

    componentDidMount() {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                this.getSyncAttendanceListFromServer();
            }
        });
    }


    changeLoadingStatus(isShow, msg) {
        this.setState({ loading: isShow, loadingMsg: msg });
    }

    getSyncAttendanceListFromServer() {
        this.changeLoadingStatus(true);
        const obj = new HTTPRequestMng('', 'GetSyncAttendanceList', this)
        obj.executeRequest("InstituteId=" + this.state.instituteId + "&PageNo=" + this._PageIndex);
    }

    onHTTPResponseSyncAttendanceList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];
            let tmpAttendanceList = [];

            if (this._PageIndex > 1) {
                tmpAttendanceList.push.apply(tmpAttendanceList, this.state.attendanceDetailsList);
            }

            if (status == 'Success') {
                const listData = jsonRec['Data'];
                console.info("AttendanceList", listData);

                let tmpStudList = [];
                let totalCount = 0, presentCount = 0, absentCount = 0;
                let i = 0;


                if (listData != undefined) {
                    listData.forEach((singleObj) => {

                        totalCount = 0, presentCount = 0, absentCount = 0, tmpStudList = []
                        let studListData = singleObj['StudentDetails'];

                        studListData.forEach((singleStudObj) => {
                            const arrayObj = {
                                'StudentName': singleStudObj['StudentName'],
                                'IsPresent': singleStudObj['IsPresent'],
                                'AutoStudId': singleStudObj['AutoStudId'],
                                'AutoStudAttendId': singleStudObj['AutoStudAttendId'],
                                'RegistrationNumber': singleStudObj['RegistrationNumber']
                            }
                            if (singleStudObj['IsPresent'])
                                presentCount++;
                            else
                                absentCount++;
                            tmpStudList.push(arrayObj);
                        });

                        totalCount = presentCount + absentCount;
                        let AttJsonObj = singleObj['AttendanceDetails'];

                        const arrayObj = {
                            'AutoAttendId': AttJsonObj['AutoAttendId'],
                            'AutoSectionId': AttJsonObj['AutoSectionId'],
                            'SectionName': AttJsonObj['SectionName'],
                            'attDate': AttJsonObj['Date'],
                            'totalStud': totalCount,
                            'presentStud': presentCount,
                            'absentStud': absentCount,
                            'StudentList': tmpStudList
                        }
                        tmpAttendanceList.push(arrayObj);

                        this.setState({ attendanceDetailsList: tmpAttendanceList });
                    });
                }
            }
            else if (status == 'failure') {
                if (this._PageIndex == 1) {
                    this.setState({ attendanceDetailsList: [] });
                }
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
        Alert.alert('Oops', 'Unable to connect with server, Please try after some time');
    }

    onAttendanceSelection = (index, data) => {

        console.info("Selected", index, data);
        try {

            const dateResult = Moment(data.attDate, 'DD/MM/YYYY').toDate();
            const formatedDateVal = Moment(dateResult).format('YYYY/MM/DD');

            //Add attendance info into global status
            this.props.ActionAddAttendance({
                attendanceID: data.AutoAttendId, sectionID: data.AutoSectionId,
                sectionName: data.SectionName,
                isEditDetails: false,
                totalStud: data.totalStud, totalPresent: data.presentStud,
                totalAbsent: data.absentStud, attDate: formatedDateVal,
                studentList: data.StudentList,
            });

            this.props.navigation.navigate('OfflineAttendanceDetailsWnd', {
                'onScreenRefresh': this.onScreenRefresh.bind(this)
            });

        } catch (error) { }
    }

    onScreenRefresh() {
        setTimeout(() => {
            this.getSyncAttendanceListFromServer();
        }, 100);
    }

    render() {
        const childWidth = (screenWidth / (getOrientation() == 'portrait' ? 1 : 1.5));
        const progressBarWidth = childWidth / 1.5;

        //no data available panel
        let noDataLayout;
        if (this.state.attendanceDetailsList == 0) {
            noDataLayout = <NoDataFound
                orientation={getOrientation()}
                imageName='blank_attendance'
                title='No details found'
                body='Attendance record which are sync to the offline will be shown here. Click on + icon to add new attendance' />
        }

        return (
            <Container style={{ backgroundColor: appColor.background_gray }}>
                <View style={{ flex: 1 }}>
                    <InternetConn />
                    {noDataLayout}
                    <FlatList
                        style={{ alignSelf: 'center', width: childWidth, marginTop: 10 }}
                        data={this.state.attendanceDetailsList}
                        renderItem={({ item, index }) => <AttendanceCell data={item} index={index}
                            onAttendanceSelection={this.onAttendanceSelection} progressBarWidth={progressBarWidth} />}
                        enableEmptySections={true}
                        keyExtractor={(item, index) => String(item.index)}
                        onRefresh={() => { this._PageIndex = 1; this.getSyncAttendanceListFromServer() }}
                        refreshing={false}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => { if (this.state.attendanceDetailsList.length >= 10) { this._PageIndex += 1; this.loadMoreAttendance(); } }}
                    />

                </View>

                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%', textAlign: 'center' }}
                    messageStyle={{ textAlign: 'center' }}
                    showProgress={true}
                    progressSize="large"
                    message="Getting batch attendance, please wait..."
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
        fontSize: 17, color: appColor.darkgray, fontWeight: '400'
    },

    verticalText: {
        fontSize: 20, color: appColor.white, fontWeight: '200',
        width: 20, textAlign: 'center',
        textAlignVertical: 'center',
    },
    titleDateText: {
        fontSize: 17, color: appColor.black, fontWeight: '300',
        marginBottom: 5
    },

});

const mapStateToProps = state => {
    return { instituteId: state.teacherInfo.InstituteId };
};
export default connect(mapStateToProps, { ActionAddAttendance, ActionAddTeacher })(TabSyncAttendanceList);
