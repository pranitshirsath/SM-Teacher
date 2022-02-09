import React from 'react';
import {
    StyleSheet, Alert, TouchableHighlight,
    PermissionsAndroid, Platform, Image,
    AsyncStorage,
    InteractionManager, SafeAreaView,
    PixelRatio,
    FlatList,
} from 'react-native';
import {
    View, Text, Card, CardItem, Textarea,
    Icon, Content, Picker, Toast, Input, ActionSheet,
    Container, Header, Left, Body, Title, Button
} from "native-base";

import InternetConn from '../networkConn/OfflineNotice';
import appColor from '../config/color.json'
import AwesomeAlert from 'react-native-awesome-alerts';
import HTTPRequestMng from "./HTTPRequestMng";
import Moment from 'moment';
import DatePicker from 'react-native-datepicker';
import ImagePicker from 'react-native-image-crop-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import NoDataFound from '../utils/NoDataView';

import NetInfo from "@react-native-community/netinfo";
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { ShowDateTime } from '../utils/DateTimeCasting';
import LinearGradient from 'react-native-linear-gradient';

import { ActionAddDiaryDetailsStep2 } from '../redux_reducers/SchoolDiaryReducer';
import { ActionAddDiaryDetailsStep1, ActionUpdateDiaryDetailsStep1 } from '../redux_reducers/SchoolDiaryReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

import { ActionAddMessage } from '../redux_reducers/MessageInfoReducer';
import { ActionUpdateUnreadMsgCount } from '../redux_reducers/ChildInfoReducer';

import { connect } from 'react-redux';

import {
    getOrientation, screenWidth, isTablet,
    hasNotch, onChangeScreenSize
} from '../utils/ScreenSize';

class MessageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false, loadingMsg: '',
            loading: false, listLoadAttempted: false,
            messageList: [],
            message_date: null,
            showPickerDialog: false,
            datePickerStatus: false,
            display_messageList: [],
            setFilter: false,
            AutoTrainerId: this.props.AutoTrainerId,
            InstituteId: this.props.instituteID
        }
    }

    componentDidMount() {
        //this.props.onRef(this);
        InteractionManager.runAfterInteractions(() => {
            this.getMessageListFromServer(false);
        });
    }

    changeLoadingStatus(isShow) {
        if (!this._isMounted) return;
        this.setState({ loading: isShow })
    }

    componentWillUnmount() {

    }

    getMessageListFromServer = async (isInitial) => {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    this.changeLoadingStatus(true);
                    // const requestJson = { 
                    //     'InstituteId': this.props.instituteID,
                    //     'AutoStudId': this.props.childID 
                    // };
                    const obj = new HTTPRequestMng('', 'GetMessageList', this)
                    obj.executeRequest('AutoTrainerId=' + parseInt(this.state.AutoTrainerId) + '&InstituteId=' + parseInt(this.state.InstituteId));
                } else if (!isInitial) {
                    this.setState({ loading: false, listLoadAttempted: true });
                    InteractionManager.runAfterInteractions(() => {
                        Alert.alert('Oops', 'No internet connection');
                    });
                } else {
                    this.setState({ loading: false, listLoadAttempted: true });
                }
            });
        } catch (error) { }
    }


    onMessageSelection(index, data) {
        try {
            //  if (!this._isMounted) return;
            //Add message info into global status
            this.props.ActionAddMessage({
                msgID: data.msgID,
                subjectName: data.subject, messageObj: data, isRead: data.isRead,
            });
            this.props.navigation.navigate('Child_MessageDetails');

            //check for is read msg
            setTimeout(() => {
                if (data.isRead == 0) {
                    let recordList = this.state.messageList;
                    recordList[index].isRead = 1;
                    this.setState({ messageList: recordList });

                    //update into global child redux
                    this.props.ActionUpdateUnreadMsgCount({ unreadMsg: this.props.unreadMsg - 1 });
                    AsyncStorage.setItem('lastTimeChildListSync', "0");
                }
            }, 500);
        } catch (error) { }
    }

    // message list response 
    onHTTPResponseMessageList(respData) {
        try {
            const jsonRec = respData[0];
            console.log('response Message', JSON.stringify(jsonRec));
            const status = jsonRec['Status'];
            const message = jsonRec['Message'];
            if (message == 'Success') {
                let recordList = [];
                const dataListArray = jsonRec['Data'];
                if (dataListArray != undefined) {
                    dataListArray.forEach(singleObj => {
                        recordList.push({
                            'layoutType': 1,
                            'msgID': singleObj['trainermessageid'],
                            'message': singleObj['messagetext'],
                            'msgDate': ShowDateTime(Moment(singleObj['messagetime'], 'DD/MM/YYYY kk:mm a')),
                            'dateFull': Moment(singleObj['messagetime'], 'DD/MM/YYYY kk:mm a').format('DD MMM, YYYY  hh:mm a'),
                            'oriDateTime': Moment(singleObj['messagetime'], 'DD/MM/YYYY kk:mm a'),
                            'subject': singleObj['subjecttext'],
                            'isRead': singleObj['isread'],
                            'attachment': singleObj['AttachmentPath'],
                            'checked_date': Moment(singleObj['messagetime'], 'DD/MM/YYYY kk:mm a').format('YYYY-MM-DD'),
                        });
                    });

                    //sort list as per recent first
                    recordList.sort(function (obj1, obj2) {
                        return obj2.msgID - obj1.msgID;
                    });
                }

                this.setState({ loading: false, listLoadAttempted: true, messageList: recordList, display_messageList: recordList });

            } else {
                this.setState({ loading: false, listLoadAttempted: true });
                InteractionManager.runAfterInteractions(() => {
                    Alert.alert('Messasge', message);
                });
            }
        } catch (error) {
            console.error(error);
        }
    }


    renderListViewRow(index, data, childWidth) {
        let attachLayout;
        if (data.attachment != '') {
            // attachLayout = <Icon name="attach" style={{ fontSize: 26, color: appColor.black, marginRight: 5 }} />
            attachLayout = <Image source={require('../../assets/icon_attach_48.png')} style={{ width: 30, height: 30 }} />
        }

        let newMsgLayout;

        if (data.isRead == 0) {
            newMsgLayout = <LinearGradient colors={['#EA4335', '#e7811b']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ padding: 2, paddingLeft: 5, paddingRight: 5, marginLeft: 5, borderRadius: 10 }}
            >
                <Text style={{ fontSize: 11, color: 'white' }}>New</Text>
            </LinearGradient>
        }

        return <View style={{ width: childWidth, marginTop: 5 }}>
            <TouchableHighlight underlayColor='#00000010' onPress={() => this.onMessageSelection(index, data)}>
                <Card style={{ borderRadius: 10, marginLeft: 10, marginRight: 10 }}>
                    <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginLeft: -5, marginRight: -5 }}>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={[layoutDesign.titleHeadingText, { flex: 1 }]}>{data.subject}</Text>
                                    {attachLayout}
                                    {newMsgLayout}
                                </View>
                                <Text numberOfLines={2} ellipsizeMode={'tail'} style={[layoutDesign.dataText, { marginTop: 5 }]}>{data.message}</Text>
                                <Text style={[layoutDesign.dateText,
                                { alignSelf: 'flex-end', marginTop: 5, color: appColor.darkgray }]}>{data.msgDate}</Text>
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
    }



    render() {

        const childWidth = (screenWidth / (getOrientation() == 'portrait' ? 1 : 2));

        let noLayImageName = '';

        if (isTablet || (getOrientation() == 'portrait' && !isTablet)) {
            noLayImageName = 'blank_anouncement';
        }

        if (PixelRatio.get() <= 1.5) {
            noLayImageName = '';
        }
        //no data available panel
        let noDataLayout;
        if (this.state.messageList.length == 0 && this.state.listLoadAttempted) {
            noDataLayout = <NoDataFound
                orientation={getOrientation()}
                imageName={noLayImageName}
                title='No record found'
                body='All messages will appear here' />
        } else if (this.state.display_messageList.length == 0) {
            var selected_date = null;
            var msg = '';
            if (this.state.message_date != null) {
                selected_date = Moment(this.state.message_date).format('Do MMMM YYYY');
                msg = 'No Result Found for Message on ' + selected_date + '.';
            } else {
                msg = 'No Result Found for Message.';
            }
            noDataLayout = <NoDataFound
                orientation={getOrientation()}
                imageName={noLayImageName}
                title={msg}
                body='All messages will appear here' />
        }

        if (this.state.setFilter) {
            resetFilter = <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: appColor.colorAccentDark }}>
                <TouchableHighlight underlayColor='#00000010' onPress={() => this.setState({ display_messageList: this.state.messageList, setFilter: false })}>
                    <Text style={{ color: 'black', margin: 10 }}>Reset Filter</Text>
                </TouchableHighlight>
            </View>
        } else {
            resetFilter = <View />
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
                        <Title>Messages</Title>
                    </Body>
                </Header>

                <SafeAreaView style={{ flex: 1 }}>
                    <FlatList
                        style={{ alignSelf: 'center' }}
                        data={this.state.display_messageList}
                        renderItem={({ item, index }) => this.renderListViewRow(index, item, childWidth)}
                        enableEmptySections={true}
                        key={(getOrientation())}
                        numColumns={getOrientation() == 'portrait' ? 1 : 2}
                        keyExtractor={(item, index) => String(index)}
                        onRefresh={() => this.getMessageListFromServer()}
                        refreshing={false}
                        onEndReachedThreshold={0.5}
                    />
                    {noDataLayout}
                    {resetFilter}
                </SafeAreaView>

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
            </Container>
        );
    }
}


const layoutDesign = StyleSheet.create({

    headingText: {
        fontSize: 11, color: appColor.gray_title, marginTop: 5,
    },
    pickerLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD'
    },
    headerText: {
        fontSize: 18, color: appColor.colorPrimary,
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

//export default StepAddDiaryDetails;
const mapStateToProps = state => {
    return {
        sessionYear: state.teacherInfo.SessionYear,
        AutoTrainerId: state.teacherInfo.AutoTrainerId,
        childID: state.childInfo.childID,
        childName: state.childInfo.studentName,
        unreadMsg: state.childInfo.unreadMsg,
        instituteID: state.teacherInfo.InstituteId,
    };
};


export default connect(mapStateToProps, { ActionAddMessage, ActionUpdateUnreadMsgCount, ActionAddTeacher })(MessageList);

