import React from 'react';
import {
    StyleSheet, Alert, FlatList, TouchableHighlight, Switch
} from 'react-native';
import {
    View, Text, Card, CardItem,
    Icon, Content, Picker, Toast, Input
} from "native-base";

import InternetConn from '../networkConn/OfflineNotice';
import NetInfo from "@react-native-community/netinfo";
import appColor from '../config/color.json'
import AwesomeAlert from 'react-native-awesome-alerts';
import HTTPRequestMng from "./HTTPRequestMng";
import Moment from 'moment';

import { connect } from 'react-redux';
import { ActionAddTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTestResultStudentList } from '../redux_reducers/TestResultsReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';
import { TouchableOpacity } from 'react-native-gesture-handler';

class StepAddStudentMarks extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            loading: false, loadingMsg: '',
            maxMarks: this.props.maxMarks,
            minMarks: this.props.minMarks,
            studentList: this.props.studentList,
            gradeList: [],
            isStudentListLoaded: this.props.isStudentListLoaded,
        }

    }

    componentDidMount() {
        this.props.onRef(this)
        console.log('ListData', JSON.stringify(this.props.studentList));
        if (!this.props.isEdit) {
            if (!this.props.isStudentListLoaded) {
                NetInfo.isConnected.fetch().then((isConnected) => {
                    if (isConnected) {
                        this.getStudentList();
                    }
                    else {
                        this.changeLoadingStatus(false);
                        Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
                    }
                });
            }
        }

        if (this.props.IsGradeSubject == 1) {
            this.getGradeList();
        }
    }

    getGradeList() {
        const obj = new HTTPRequestMng('', 'GetGradeList', this)
        obj.executeRequest("InstituteId=" + this.props.instituteId);
    }

    getStudentList() {
        const obj = new HTTPRequestMng('', 'GetStudentList', this)
        obj.executeRequest("InstituteId=" + this.props.instituteId +
            "&AutoSectionId=" + this.props.selectedSectionID +
            "&AutoSubjectId=" + this.props.selectedSubjectID);
    }

    onHTTPResponseGradeList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {
                const listData = jsonRec['Data'];
                console.info("gradeList", listData);
                let recordCurrentList = [];

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'AutoGradeId': singleObj['AutoGradeId'],
                            'GradeName': singleObj['GradeName'],
                            'PercentFrom': singleObj['PercentFrom'],
                            'PercentTo': singleObj['PercentTo'],
                            'Sequence': singleObj['Sequence']
                        }

                        recordCurrentList.push(arrayObj);
                    });
                    this.setState({ gradeList: recordCurrentList });
                }
            }
            else {
                Alert.alert('Message', 'No Grade is assigned  to given Test.');
            }
        }
        catch (error) {
            console.error("error", error);
        }
    }

    onHTTPResponseStudentList(respData) {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') {
                this.setState({ isStudentListLoaded: true });
                const listData = jsonRec['Data'];
                console.info("StudentListData", listData);
                let recordCurrentList = [];

                if (listData != undefined) {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                            'AutoStudId': singleObj['AutoStudId'],
                            'StudentName': singleObj['StudentName'],
                            'RegistrationNumber': singleObj['RegistrationNumber'],
                            'RollNo': singleObj['RollNo'],
                            'AutoParentId': singleObj['AutoParentId'],
                            'MarksObtained': 0,
                            'IsAbsent': false,
                            'Grade': ""
                        }

                        recordCurrentList.push(arrayObj);
                    });
                    this.setState({ studentList: recordCurrentList });
                }
            }
            else {
                this.setState({ isStudentListLoaded: false });
                Alert.alert('Message', 'There is no student found for selected Test.');
            }

        }
        catch (error) {
            console.error("error", error);
            this.setState({ isStudentListLoaded: false });
        }
    }

    saveStudentMarksList() {
        this.props.ActionAddTestResultStudentList({
            studentDetails: this.state.studentList,
            isStudentListLoaded: this.state.isStudentListLoaded,
        });
    }

    performSubmitTestResult() {
        this.saveStudentMarksList();

        let summeryMsg;

        if (this.props.isEdit)
            summeryMsg = "Are you sure you want to update this test result?";
        else
            summeryMsg = "Are you sure you want to submit this test result?";


        Alert.alert('Confirmation', summeryMsg, [
            { text: 'No' },
            { text: 'Yes', onPress: () => { this.uploadTestResultOnServer(); } },
        ]);
    }

    uploadTestResultOnServer() {

        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                this.changeLoadingStatus(true)

                let jsonArrayStudent = [];
                let recordList = this.state.studentList;
                recordList.forEach(singleObj => {
                    jsonArrayStudent.push({
                        "AutoStudId": singleObj['AutoStudId'],
                        "MarksObtained": singleObj['MarksObtained'] == '' ? 0 : parseFloat(singleObj['MarksObtained']),
                        "IsAbsent": singleObj['IsAbsent'],
                        "Grade": singleObj['Grade']
                    });

                });

                let formatedDate;
                if (this.props.testDate != "") {
                    formatedDate = Moment(this.props.testDate).format('YYYY/MM/DD');
                }
                else
                    formatedDate = "";

                //create sending json            
                const requestJson = {
                    'InstituteId': parseInt(this.props.instituteId),
                    'AutoSectionId': parseInt(this.props.selectedSectionID),
                    'AutoExamId': parseInt(this.props.selectedExamID),
                    'AutoSubjectId': parseInt(this.props.selectedSubjectID),
                    'TestType': this.props.testTypeID,
                    'MaxMarks': parseFloat(this.props.maxMarks),
                    'MinMarks': this.props.minMarks == '' ? 0 : parseFloat(this.props.minMarks),
                    'TestDate': formatedDate,
                    'StudentDetails': jsonArrayStudent
                };

                console.info("requestJSON", requestJson);
                const obj = new HTTPRequestMng('', 'PostTestResultDetails', this);
                obj.executeRequest(requestJson);
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
        });
    }

    onHTTPResponseTestResultSave(respData) {
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
    onHTTPError() {
        this.changeLoadingStatus(false);
        Alert.alert('Message', 'Unable to connect with server, Please try after some time');
    }

    changeLoadingStatus(isShow, msg) {
        this.setState({ loading: isShow, loadingMsg: msg });
    }


    onStudentRecordClick(val, index) {
        let recordList = this.state.studentList;
        recordList[index].IsAbsent = !recordList[index].IsAbsent;

        if (recordList[index].IsAbsent) {
            recordList[index].MarksObtained = 0;
            recordList[index].Grade = "";
        }

        this.setState({ studentList: recordList });
    }

    onStudentMarksChange(val, index) {
        if (parseFloat(val) > parseFloat(this.props.maxMarks)) {
            Alert.alert('Message', 'Marks can not be greater than maximum  marks');
        }
        else {
            let recordList = this.state.studentList;
            recordList[index].MarksObtained = val;
            this.setState({ studentList: recordList });
        }
    }

    onStudentGradeChange(val, index) {
        let recordList = this.state.studentList;
        recordList[index].Grade = val;

        this.setState({ studentList: recordList });
    }

    onRenderStudentListData(item, index) {
        const gradePickerItems = [];
        const gradeList = this.state.gradeList;
        gradePickerItems.push(<Picker.Item label="" value={0} />);
        gradeList.forEach(singleObj => {
            gradePickerItems.push(<Picker.Item label={singleObj.GradeName} value={singleObj.GradeName}
            />);
        });

        let gradeNameLayout = <Picker
            mode="dropdown"
            iosIcon={<Icon name="ios-arrow-down" />}
            placeholder="Select"
            iosHeader="Select"
            style={{ width: 90, height: 35 }}
            textStyle={{ maxWidth: '90%', paddingLeft: 0, paddingRight: 0 }}
            selectedValue={item.Grade}
            onValueChange={(text) => { this.onStudentGradeChange(text, index) }}
            enabled={!item.IsAbsent}>
            {gradePickerItems}
        </Picker>

        let marksLayout = <Input
            textAlign={'center'}
            style={[{ height: 35, width: 40, fontSize: 16, padding: 0 }]}
            onChangeText={(text) => { this.onStudentMarksChange(text, index) }}
            value={String(item.MarksObtained)}
            keyboardType='decimal-pad'
            returnKeyType="next"
            maxLength={6}
            disabled={item.IsAbsent}
        />

        let inputType;
        if (this.props.IsGradeSubject == 1)
            inputType = gradeNameLayout;
        else
            inputType = marksLayout;

        let inputBoxLayout;
        if (!item.IsAbsent) {
            inputBoxLayout = <View style={layoutDesign.enableInputTextLayout}>
                {inputType}
            </View>
        }
        else {
            inputBoxLayout = <View style={layoutDesign.disableInputTextLayout}>
                {inputType}
            </View>
        }

        // return <View style={{ width: '100%',flex: 1,flexDirection: 'row',flexWrap:'wrap',justifyContent :'space-evenly',paddingTop:3,paddingBottom:3,paddingLeft:5,paddingRight:5,alignItems:'center'}}>
        //            <View>
        //             <Switch
        //                 style={{marginLeft:-10,textAlign:'center'}}
        //                 value={!item.IsAbsent}
        //                 onValueChange={(val) => {this.onStudentRecordClick(val,index)}}
        //                 trackColor={{true: appColor.googleGreen, false:appColor.googleRed}}
        //                 thumbColor={'white'}
        //             />
        //             </View>
        //             <TouchableOpacity 
        //             onPress = {()=>{
        //                 let message = 'Not given';
        //                 if(item.RegistrationNumber!=''){
        //                     message = item.RegistrationNumber;
        //                 }
        //                 Alert.alert('Registration Number',message)}
        //                 }
        //             style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center',}}><Text style={[layoutDesign.item,{width:80,textAlign:'center',}]}>{item.StudentName}</Text>
        //             </TouchableOpacity>
        //             <Text style={[layoutDesign.item ,{width:80,textAlign:'center'}]}>{item.RollNo==''?'-':(item.RollNo)}</Text>
        //             {/* <Text style={[layoutDesign.item ,{width:80,textAlign:'center'}]}>(002135)</Text> */}



        //             {/* <Text style={[layoutDesign.item ,{flex: 1,marginLeft:5}]}>(002135)</Text> */}
        //             {inputBoxLayout}
        //         </View>

        return <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            backgroundColor: 'white'
        }}>
            <View style={{ width: 120, justifyContent: 'center', marginTop: 3 }}>
                <Switch
                    style={[{ fontSize: 13, textAlign: 'center', alignSelf: 'center' }]}
                    value={!item.IsAbsent}
                    onValueChange={(val) => { this.onStudentRecordClick(val, index) }}
                    trackColor={{ true: appColor.googleGreen, false: appColor.googleRed }}
                    thumbColor={'white'}
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
                    <Text style={[{ fontSize: 14, flexWrap: 'wrap', textAlign: 'left', ellipsizeMode: 'end', paddingLeft: 5 }]}>{item.StudentName}</Text>
                    {/* <Text style={[{fontSize:14,flexWrap:'wrap',textAlign:'left',ellipsizeMode:'end'}]}>Kartik Narayank Damodar Shridhar Satpute </Text> */}

                </TouchableOpacity>
            </View>

            <View style={{ width: 120, justifyContent: 'center', marginTop: 3, marginLeft: 10, marginRight: 5 }}>
                <Text style={[{ fontSize: 13, textAlign: 'center', alignSelf: 'center', paddingLeft: 5, paddingRight: 5 }]}> {item.RollNo == '' ? '-' : (item.RollNo)}</Text>
                {/* <Text  style={[{fontSize:13,textAlign:'center',alignSelf:'center'}]}>123456879</Text> */}
            </View>

            <View style={{ width: 120, justifyContent: 'center', marginTop: 3 }}>
                {inputBoxLayout}
            </View>
        </View>
    }


    render() {
        let presentCount, absentCount;
        let recordList = this.state.studentList;

        if (recordList.length > 0) {
            presentCount = 0, absentCount = 0;
            recordList.forEach(singleObj => {
                if (singleObj['IsAbsent'])
                    absentCount++;
                else
                    presentCount++;
            });
        }
        else {
            presentCount = '', absentCount = '';
        }

        let listHeader, txtmarks;

        if (this.props.IsGradeSubject == 1)
            txtmarks = "Grade";
        else
            txtmarks = "Marks";

        if (this.state.studentList.length > 0) {
            //    listHeader= <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-evenly',backgroundColor:appColor.lighten_gray,marginTop:5,paddingTop:3,paddingBottom:3,paddingLeft:5,paddingRight:5}}>
            //                     <Text style={[{fontSize:11,textAlign:'center',paddingLeft:10,paddingRight:10}]}>  </Text>
            //                     <Text style={[{fontSize:11,textAlign:'center',paddingLeft:10,paddingRight:10}]}> Student Name </Text>
            //                     <Text style={[{fontSize:11,textAlign: 'center',paddingLeft:10,paddingRight:10}]}> Roll No. </Text>

            //                     <Text style={[{fontSize:11,
            //                         textAlign:'center',paddingLeft:10,paddingRight:10}]}>{txtmarks}</Text>
            //             </View>

            listHeader = <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                backgroundColor: appColor.lighten_gray,
            }}>
                <View style={{ width: 120, height: 50, justifyContent: 'center' }}>
                    <Text style={[{ fontSize: 11, textAlign: 'center', }]}> </Text>
                </View>
                <View style={{ width: 120, height: 50, justifyContent: 'center' }}>
                    <Text style={[{ fontSize: 11, textAlign: 'left', }]}>Student Name</Text>
                </View>
                <View style={{ width: 120, height: 50, justifyContent: 'center', padding: 1 }}>
                    <Text style={[{ fontSize: 11, textAlign: 'center', }]}> Roll No. </Text>
                </View>
                <View style={{ width: 120, height: 50, justifyContent: 'center', }}>
                    <Text style={[{ fontSize: 11, textAlign: 'center', }]}> {txtmarks} </Text>
                </View>
            </View>
        }
        else {
            listHeader = <View></View>;
        }

        return (
            <View style={{ flex: 1, backgroundColor: appColor.backgroundColor, marginBottom: 10 }}>
                <InternetConn />

                <Content style={{ padding: 10 }}>
                    <Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 10 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: -15, marginRight: -15, }}>
                                <View style={{ width: '100%', flex: 1, flexDirection: 'row', paddingLeft: 5, paddingRight: 5 }}>
                                    <Text style={[layoutDesign.headerText, { flex: 1 }]}>Total {this.state.studentList.length} Students</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                        <View style={[layoutDesign.view_bg_present]}>
                                            <Text style={layoutDesign.viewText}>{presentCount} P</Text></View>
                                        <View style={[layoutDesign.view_bg_absent, { marginLeft: 10 }]}>
                                            <Text style={layoutDesign.viewText}>{absentCount} A</Text></View>
                                    </View>
                                </View>

                                {/* <View style={{ marginLeft: -10, marginRight: -10, marginTop: 5, marginBottom: 5, height: 1, backgroundColor: appColor.light_gray }} /> */}
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

    rowLayout:
    {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        marginTop: 5,
    },
    item:
    {
        // paddingLeft:7,
        paddingRight: 2,
        paddingTop: 7,
        paddingBottom: 7,
        alignItems: 'flex-start'
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

    enableInputTextLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        height: 40,
        width: 40,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD',
        textAlign: 'center',
        alignSelf: 'center'
    },
    disableInputTextLayout: {
        backgroundColor: '#00000335', borderRadius: 5,
        height: 40,
        width: 40,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD',
        textAlign: 'center',
        alignSelf: 'center'
    },
    headerText: {
        fontSize: 18, color: appColor.colorPrimary,
    },
});

const mapStateToProps = state => {
    return {
        instituteId: state.teacherInfo.InstituteId,
        selectedClassID: state.testResultInfo.selectedClassID,
        selectedSectionID: state.testResultInfo.autoSectionId,
        selectedExamID: state.testResultInfo.autoExamId,
        selectedSubjectID: state.testResultInfo.autoSubjectId,
        testTypeID: state.testResultInfo.testTypeID,
        testDate: state.testResultInfo.testDate,

        IsGradeSubject: state.testResultInfo.IsGradeSubject,
        maxMarks: state.testResultInfo.maxMarks,
        minMarks: state.testResultInfo.minMarks,
        studentList: state.testResultInfo.studentDetails,
        isStudentListLoaded: state.testResultInfo.isStudentListLoaded,
        isEdit: state.testResultInfo.isEdit,
    };
};
export default connect(mapStateToProps, { ActionAddTestResult, ActionAddTestResultStudentList, ActionAddTeacher })(StepAddStudentMarks);