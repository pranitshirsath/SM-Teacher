import React, {
    Component
} from 'react';
import {
    Dimensions, StyleSheet, Image, Alert,
    TouchableHighlight, Platform, ActivityIndicator,
    SafeAreaView, InteractionManager
} from 'react-native';

import {
    Container, Header, Title, Content, Body, Right,
    View, Text, Card, CardItem, Icon, Left,
    Button, Toast
} from "native-base";
import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';
import {
    Attachment_Msg_Path
} from '../config/AppConst';

import AwesomeAlert from 'react-native-awesome-alerts';
import NetInfo from "@react-native-community/netinfo";
import HTTPRequestMng from './HTTPRequestMng';
import InternetConn from '../networkConn/OfflineNotice';
import appColor from '../config/color.json';

import { connect } from 'react-redux';
import { ActionDeleteMessage } from '../redux_reducers/MessageInfoReducer';

import RNFetchBlob from 'rn-fetch-blob';
import FileViewer from 'react-native-file-viewer';

class MessageDetailsWnd extends Component {

    constructor(props) {
        super(props);
        this.state = {
            msgID: this.props.msgID,
            AutoTrainerId: this.props.AutoTrainerId,
            loading: false, fileLocalPath: '', fileExtension: '', fileName: ''
        }
        this._onOrientationChange = this._onOrientationChange.bind(this)
    }

    componentDidMount() {
        this._isMounted = true;
        Dimensions.addEventListener('change', this._onOrientationChange);

        InteractionManager.runAfterInteractions(() => {
            if (this.props.messageObj.attachment != '') {
                this.showAttachmentFile();
            }
            if (this.props.isRead == 0) {
                this.updateMessageReadStatusOnServer();
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        Dimensions.removeEventListener('change', this._onOrientationChange);

        //clear redux data of message
        this.props.ActionDeleteMessage();
    }

    _onOrientationChange(newDimensions) {
        onChangeScreenSize(newDimensions, this, true)
    }

    changeLoadingStatus(isShow) {
        if (!this._isMounted) return;
        this.setState({ loading: isShow })
    }

    //request to get student message details from server
    updateMessageReadStatusOnServer = async () => {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    // const requestJson = { 
                    //     'AutoStudId': this.props.childID,
                    //     'StudentMessageIds': this.props.msgID 
                    // };
                    const obj = new HTTPRequestMng('', 'UpdateMessageStatus', this);
                    obj.executeRequest('AutoTrainerId=' + parseInt(this.state.AutoTrainerId) + '&TrainerMessageIds=' + String(this.state.msgID));
                    //obj.executeRequest('AutoTrainerId='+337+'&TrainerMessageIds='+this.state.msgID+'');                    
                }
            });
        } catch (error) { }
    }
    onHTTPError() {
        if (!this._isMounted) return;
        this.setState({ loading: false });
        InteractionManager.runAfterInteractions(() => {
            Alert.alert('Oops', 'Unable to connect with server, Please try after some time');
        });
    }

    showAttachmentFile = async () => {
        let imageName = this.props.messageObj.attachment;
        const fileExtension = String(imageName).substring(String(imageName).lastIndexOf('.'));
        const fileName = String(imageName).substring(String(imageName).lastIndexOf('/') + 1);

        imageName = String(imageName).split(' ').join('%20');
        const downloadFilePath = RNFetchBlob.fs.dirs.DocumentDir + '/' + fileName;

        RNFetchBlob.fs.exists(downloadFilePath)
            .then((exist) => {
                if (exist) {
                    this.setState({ fileLocalPath: downloadFilePath, fileExtension: fileExtension, fileName: fileName })
                } else {
                    this.getAttachmentObjFrmServer(imageName, downloadFilePath, fileExtension, fileName); //call for download file  
                }
            }).catch(() => {
                this.getAttachmentObjFrmServer(imageName, downloadFilePath, fileExtension, fileName); //call for download file  
            })
    }

    getAttachmentObjFrmServer(imageName, downloadFilePath, fileExtension, fileName) {
        try {
            RNFetchBlob.config({ path: downloadFilePath })
                .fetch('GET', Attachment_Msg_Path + imageName, {})
                .then((res) => {
                    const status = res.info().status;
                    if (status == 200) {
                        this.setState({ fileLocalPath: downloadFilePath, fileExtension: fileExtension, fileName: fileName })
                        res.session(String(this.props.parentID)); //set current user session                            
                    } else {
                        res.flush();
                        this.setState({ isShowAttach: false, downloadFail: true });

                        InteractionManager.runAfterInteractions(() => {
                            Toast.show({ 'text': 'Failed to download attachment', 'duration': 2000, 'type': 'danger' });
                        });
                    }
                })
                .catch(() => {
                    this.setState({ isShowAttach: false, downloadFail: true });

                    InteractionManager.runAfterInteractions(() => {
                        Toast.show({ 'text': 'Failed to download attachment', 'duration': 2000, 'type': 'danger' });
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }

    openAttachmentFile() {
        if (this.state.fileLocalPath != '') {
            FileViewer.open(this.state.fileLocalPath,
                { showOpenWithDialog: true, displayName: this.state.fileName, showAppsSuggestions: true }
            ).then(() => { })
                .catch(error => {
                    console.error(error);
                });
        }
    }


    performDeleteMessage() {
        // if (this.props.isTrailLogin) {
        //     Toast.show({ text: 'This facility is not available for TRIAL user', duration: 2000, type: 'danger' });
        //     return;
        // }

        Alert.alert('', 'Are you sure, you want to delete message permanently?', [
            { text: 'No' },
            {
                text: 'Yes', onPress: () => {
                    NetInfo.isConnected.fetch().then((isConnected) => {
                        if (isConnected) {
                            this.changeLoadingStatus(true)

                            //create sending json            
                            // const requestJson = { 
                            //     'AutoStudId': this.props.childID,
                            //     'StudentMessageIds': this.props.msgID 
                            // };                        
                            const obj = new HTTPRequestMng('', 'DeleteMessage', this);
                            //obj.executeRequest({"jsonstring": JSON.stringify(requestJson)});
                            obj.executeRequest('AutoTrainerId=' + parseInt(this.state.AutoTrainerId) + '&TrainerMessageIds=' + String(this.state.msgID));
                            //obj.executeRequest('AutoTrainerId='+337+'&TrainerMessageIds='+String(this.state.msgID));                    

                        } else {
                            Alert.alert('Oops', 'No internet connection');
                        }
                    });
                }
            }
        ]);
    }

    onHTTPResponseDeleteMessage(respData) {
        try {
            if (!this._isMounted) return;

            const jsonRec = respData[0];
            const status = jsonRec['Status'];
            const message = jsonRec['Message'];
            if (status == 1) {
                Alert.alert('Success', 'Message deleted successfully', [
                    {
                        text: 'OK', onPress: () => {
                            this.props.navigation.goBack()
                            // this.props.navigation.state.params.onScreenReturn();
                        }
                    }
                ], { cancelable: false });
            } else {
                this.setState({ loading: false, listLoadAttempted: true });
                InteractionManager.runAfterInteractions(() => {
                    Alert.alert('Oops', message);
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        let childWidth = (screenWidth /
            (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : (isTablet ? 2 : 1.5))) - 20;
        let sliderHeight = (childWidth / 2.2) < 250 ? 250 : (childWidth / 2.2);

        let notiLayout;
        if (this.props.messageObj != '') {
            const messageObj = this.props.messageObj;

            let attachmentLayout;
            if (messageObj.attachment != '' && !this.state.downloadFail) {
                let attachment;

                if (this.state.fileLocalPath != '') {
                    const fileExt = this.state.fileExtension.toUpperCase();
                    let imageLay, typeName, imageRes;
                    if (fileExt == '.PNG' || fileExt == '.JPEG' || fileExt == '.JPG' || fileExt == '.BMP' || fileExt == '.GIF') {
                        imageLay = <Image source={{ uri: Platform.OS === 'android' ? 'file://' + this.state.fileLocalPath : '' + this.state.fileLocalPath }}
                            style={{ resizeMode: 'stretch', width: '100%', height: sliderHeight }} />

                        typeName = 'Image';
                        imageRes = <Image resizeMode={'stretch'} source={require('../../assets/icon_img.png')}
                            style={{ width: 38, height: 38, marginLeft: 5, tintColor: 'black', marginRight: 10 }} />
                    } else if (fileExt == '.DOC' || fileExt == '.DOCX') {
                        typeName = 'DOC';
                        imageRes = <Image resizeMode={'stretch'} source={require('../../assets/icon_file_doc.png')}
                            style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }} />
                    } else if (fileExt == '.PDF') {
                        typeName = 'PDF';
                        imageRes = <Image resizeMode={'stretch'} source={require('../../assets/icon_file_pdf.png')}
                            style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }} />
                    } else if (fileExt == '.XLS' || fileExt == '.XLSX') {
                        typeName = 'Excel';
                        imageRes = <Image resizeMode={'stretch'} source={require('../../assets/icon_file_xls.png')}
                            style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }} />
                    } else if (fileExt == '.PPT' || fileExt == '.PPTX') {
                        typeName = 'PPT';
                        imageRes = <Image resizeMode={'stretch'} source={require('../../assets/icon_file_ppt.png')}
                            style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }} />
                    } else {
                        typeName = 'File';
                        imageRes = <Image resizeMode={'stretch'} source={require('../../assets/icon_file_unknown.png')}
                            style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }} />
                    }

                    attachment = <TouchableHighlight underlayColor='#00000010'
                        onPress={() => this.openAttachmentFile()}>
                        <View style={{ flex: 1, minHeight: 60 }} >
                            {imageLay}

                            <View style={{
                                width: '100%', flexDirection: 'row', backgroundColor: '#ffffffEA', height: 60,
                                position: 'absolute', alignItems: 'center', bottom: 0
                            }}>
                                {imageRes}
                                <View style={{ flex: 1, flexDirection: 'column' }} >
                                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: 17, color: appColor.black }}>{this.state.fileName}</Text>
                                    <Text style={{ fontSize: 14, color: appColor.darkgray, marginTop: 5 }}>{typeName}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableHighlight>
                } else {
                    attachment = <ActivityIndicator style={{ marginTop: 10, marginBottom: 10 }} size='large' />
                }

                attachmentLayout = <Card style={{ borderRadius: 10, marginTop: 20 }}>
                    <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                        <View style={{ flex: 1, flexDirection: 'column', marginLeft: -5, marginRight: -5, marginBottom: -5 }}>
                            <Text style={[layoutDesign.headingText, { fontSize: 14, marginBottom: 10 }]}>Attachment</Text>
                            {attachment}
                        </View>
                    </CardItem>
                </Card>
            }

            notiLayout = <View style={{ flex: 1, flexDirection: 'column', width: childWidth, alignSelf: 'center', marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                <Card style={{ borderRadius: 10 }}>
                    <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <Text style={layoutDesign.titleHeadingText}>{messageObj.subject}</Text>
                            <Text style={[layoutDesign.dateText, { marginTop: 5 }]}>{messageObj.dateFull}</Text>
                            <View style={{
                                marginTop: 15, marginBottom: 15, height: 1, flex: 1, marginLeft: -15,
                                marginRight: -15, backgroundColor: appColor.light_gray
                            }} />
                            <Text style={[layoutDesign.dataText, { marginBottom: 5 }]}>{messageObj.message}</Text>
                        </View>
                    </CardItem>
                </Card>
                {attachmentLayout}
            </View>
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
                        <Title>Message Details</Title>
                    </Body>
                    <Right>
                        <Button transparent onPress={() => this.performDeleteMessage()}>
                            <Icon name="md-trash" />
                        </Button>
                    </Right>
                </Header>

                <SafeAreaView style={{ flex: 1, flexDirection: 'column', width: '100%', alignSelf: 'center' }}>
                    <Content>
                        <InternetConn />

                        {notiLayout}
                    </Content>
                </SafeAreaView>

                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%', textAlign: 'center' }}
                    messageStyle={{ textAlign: 'center' }}
                    showProgress={true}
                    progressSize="large"
                    message="Deleting message, Please wait..."
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
        fontSize: 11, color: appColor.font_gray
    },
    dateText: {
        fontSize: 15, color: appColor.googleBlue
    },
    titleHeadingText: {
        fontSize: 18, color: appColor.darkgray, fontWeight: '600'
    },
    dataText: {
        fontSize: 15, color: appColor.darkgray
    },
});

const mapStateToProps = state => {
    return {
        instituteID: state.teacherInfo.instituteID,
        AutoTrainerId: state.teacherInfo.AutoTrainerId,
        sessionYear: state.teacherInfo.SessionYear,
        childID: state.childInfo.childID,
        childName: state.childInfo.studentName,
        msgID: state.messageInfo.msgID, subjectName: state.messageInfo.subjectName,
        messageObj: state.messageInfo.messageObj, isRead: state.messageInfo.isRead
    };
};
export default connect(mapStateToProps, { ActionDeleteMessage })(MessageDetailsWnd);