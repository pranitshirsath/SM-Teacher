import React from 'react';
import {
    Dimensions, Alert,StyleSheet,FlatList,
    ScrollView, TouchableHighlight,StatusBar,Switch
} from 'react-native';

import {
    Container, Header, Title, Button, Icon,
    Text, Body, Right, Left, View, Subtitle, Toast,Card, CardItem,Content
} from "native-base";

import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';

import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';

import Moment from 'moment';
import HTTPRequestMng from "./HTTPRequestMng";
import InternetConn from '../networkConn/OfflineNotice';
import NetInfo from "@react-native-community/netinfo";

import { connect } from 'react-redux';
import { ActionAddTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTestResultStudentList } from '../redux_reducers/TestResultsReducer';
import { ActionUpdateTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionDeleteTestResult } from '../redux_reducers/TestResultsReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

const { width } = Dimensions.get('window');

class OfflineTestDetailsWnd extends React.Component  {
    
   constructor(props) {
        super(props);

        this.state = {
        testTypeID:this.props.testTypeID,testTypeName:this.props.testTypeID,
        maxMarks:this.props.maxMarks, minMarks:this.props.minMarks,testDate:this.props.testDate,
        IsGradeSubject:this.props.IsGradeSubject,formatedDateToDisplay:'',
        studentList:this.props.studentList,
        }
    }

    componentDidMount() 
    {
        const dateResult = Moment(this.state.testDate, 'YYYY/MM/DD').toDate();
        const currDateVal = Moment(dateResult).format('DD/MM/YYYY');

        this.setState({formatedDateToDisplay: currDateVal});

         NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) 
            {
                this.getTestTypeList();
            }
            else
            {
               // this.changeLoadingStatus(false);
                Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
            }
            });   
    }

    getTestTypeList () 
    {
       const obj = new HTTPRequestMng('', 'GetTestType', this)
       obj.executeRequest();
    }

    onHTTPResponseTestTypeList(respData) 
    {
        try 
        {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];
        
            if (status == 'Success') 
            {
        
            const listData = jsonRec['Data'];
            console.info("TestTypeData", listData);
            let recordCurrentList = [];
            
            if (listData != undefined) {
                listData.forEach((singleObj) => {
                    if(singleObj['Key']==this.props.testTypeID)
                                this.setState({testTypeName: singleObj['Value']});
                });
              
            }
            } 
            else {
                Alert.alert('Message', 'No Test type is given for selected Test.');
            }         
        } 
        catch (error) {
            console.error("error", error);
        }
    }

    onHTTPError() 
    {
        
        Alert.alert('Message', 'Unable to connect with server, Please try after some time');
    }

    onRenderStudentListData(item,index) 
    {

        let attendanceLay;

        if(item.IsAbsent)
        {
            attendanceLay= <View style={{width: 25, height: 25,
            backgroundColor: appColor.googleRed, borderRadius: 10 , alignItems: 'center',
            justifyContent:'center'}} >
                <Text style={{color: appColor.white}}>A</Text>
            </View>
        }
        else
        {
           attendanceLay=<View style={{ width: 25, height: 25,
            backgroundColor: appColor.googleGreen, borderRadius: 10 , alignItems: 'center',
            justifyContent:'center'}} >
                <Text style={{color: appColor.white}}>P</Text>
            </View>
        }

        let marks;
        if(this.props.IsGradeSubject==1)
            marks=item.Grade;
        else
            marks=item.MarksObtained;

        return <View style={{ width: '100%',flex: 1,flexDirection: 'row',justifyContent :'space-between',paddingTop:3,paddingBottom:3,paddingLeft:5,paddingRight:5, alignItems:'center'}}>
                {attendanceLay}
                   <Text style={[layoutDesign.item ,{flex: 1}]}> {item.StudentName} </Text>
                   <Text style={[layoutDesign.item]}> {marks} </Text>
                </View>
    }

    render()
    {
        let presentCount,absentCount;
        let recordList = this.state.studentList;

        if(recordList.length>0)
        {
            presentCount=0,absentCount=0;
            recordList.forEach(singleObj => 
            {
                if(singleObj['IsAbsent'])
                     absentCount++;
                else
                    presentCount++;
                   
            }); 
        }
        else{
            presentCount='',absentCount='';
        }

        let listHeader,txtmarks;

        if(this.props.IsGradeSubject==1)
            txtmarks="Grade";
        else
            txtmarks="Marks";

        if(this.state.studentList.length>0)
        {
           listHeader= <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-between',backgroundColor:appColor.lighten_gray,marginTop:5,paddingTop:3,paddingBottom:3}}>
                            <Text style={[{flexGrow: 1,fontSize:11}]}>  </Text>
                            <Text style={[{flexGrow: 1,fontSize:11}]}> Student Name </Text>
                            <Text style={[{flexGrow: 1,fontSize:11,
                                textAlign: 'right',marginRight: 10}]}>{txtmarks}</Text>
                    </View>
        }
        else
        {
            listHeader=<View></View>;
        }

        return(
           
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
                    <Title>Test Result Details</Title>
                </Body>
               </Header>

            <View style={{ flex: 1, backgroundColor: appColor.backgroundColor }}>
                <InternetConn />
                 <View style={{position: 'absolute', zIndex: 1000, top: 0, height: 30}} >
                    <View style={layoutDesign.offlineContainer}>
                        <Text style={layoutDesign.offlineText}>offline details can not be modified</Text>
                    </View>
                </View>

                <Content style={{ padding: 10 }}>
                    <Card style={{ borderRadius: 10, marginTop: 30, marginBottom:5 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: -5, marginRight: -5, }}> 

                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View  style={{ flex: 1, flexDirection: 'column'}}>
                                        <Text style={layoutDesign.headingText}>Section </Text>
                                        <Text style={layoutDesign.dataText}>{this.props.sectionName} </Text>
                                    </View>
                                     <View  style={{ flex: 1, flexDirection: 'column'}}>
                                        <Text style={layoutDesign.headingText}>Exam </Text>
                                        <Text style={layoutDesign.dataText}>{this.props.examName} </Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row'}}>
                                    <View  style={{ flex: 1, flexDirection: 'column'}}>
                                        <Text style={layoutDesign.headingText}>Subject </Text>
                                        <Text style={layoutDesign.dataText}>{this.props.subjectName}
                                        {this.props.gradingTitle} </Text>
                                    </View>
                                    <View  style={{ flex: 1, flexDirection: 'column'}}>
                                        <Text style={layoutDesign.headingText}>Test Type </Text>
                                        <Text style={layoutDesign.dataText}>{this.state.testTypeName} </Text>
                                    </View>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row'}}>
                                 <View  style={{ flex: 1, flexDirection: 'column'}}>
                                        <Text style={layoutDesign.headingText}>Test Date </Text>
                                        <Text style={layoutDesign.dataText}>{this.state.formatedDateToDisplay} </Text>
                                    </View>
                                    <View  style={{ flex: 1, flexDirection: 'column'}}>
                                        <Text style={layoutDesign.headingText}>Max. marks </Text>
                                        <Text style={layoutDesign.dataText}>{this.props.maxMarks} </Text>
                                    </View>
                                     <View  style={{ flex: 1, flexDirection: 'column'}}>
                                        <Text style={layoutDesign.headingText}>Min. marks</Text>
                                        <Text style={layoutDesign.dataText}>{this.props.minMarks} </Text>
                                    </View>
                                </View>
                            </View>
                        </CardItem>
                    </Card> 
                    <Card style={{ borderRadius: 10, marginTop: 5, marginBottom: 10 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: -15, marginRight:-15, }}> 
                               <View style={{width: '100%',flex: 1, flexDirection: 'row',paddingLeft:5,paddingRight:5}}>
                                    <Text style={[layoutDesign.headerText, {flex: 1}]}>Total {this.state.studentList.length} Students</Text>
                                    <View style={{ flexDirection: 'row',alignItems: 'flex-end' }}>
                                        <View style={[layoutDesign.view_bg_present]}>
                                        <Text style={layoutDesign.viewText}>{presentCount} P</Text></View>
                                        <View style={[layoutDesign.view_bg_absent,{marginLeft:10}]}>
                                        <Text style={layoutDesign.viewText}>{absentCount} A</Text></View>
                                    </View>
                                </View>

                    
                                {listHeader}
                                <FlatList
                                    data={this.state.studentList}
                                    renderItem={({item, index}) => this.onRenderStudentListData(item, index )}
                                    enableEmptySections={true}
                                    keyExtractor={(item, index) => index.toString()}
                                    extraData={this.state}
                                />
                            </View>
                        </CardItem>
                    </Card>  
                </Content> 
            </View> 
            </Container>  
           
        );
    }
  
}

const layoutDesign = StyleSheet.create({
  
    headingText: {
        fontSize: 11, color: appColor.gray_title, marginTop: 5,
    },
    dataText: {
        fontSize: 16, color: appColor.black
    },
    pickerLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD',height:40
    },
    item: {
        paddingLeft:5,
        paddingRight:2,
        paddingTop:7,
        paddingBottom:7,
        alignItems: 'center'
    },
     view_bg_present:{
        height:30,
        width:30,
        backgroundColor: appColor.googleGreen,
        alignItems: 'center',
        justifyContent:'center'
    },
    view_bg_absent:{
        height:30,
        width:30,
        backgroundColor: appColor.googleRed,
        alignItems: 'center',
        justifyContent:'center'
    },
    viewText:{
        fontSize: 14, color: appColor.white
    },
     holidayTextStyle:{
        fontSize: 14, marginTop:2,
        color: appColor.holiday
    },
     headerText: {
        fontSize: 18, color: appColor.colorPrimary,
    },
    offlineContainer: {
        backgroundColor: '#FFE56C',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'relative',
        width:width
    },
    offlineText: { color: '#000000' }
});


const mapStateToProps = state => {
    return { 
        instituteId: state.teacherInfo.InstituteId,
        SessionStartMonth:state.teacherInfo.SessionStartMonth,
        SessionYear:state.teacherInfo.SessionYear,
        
        maxMarks:state.testResultInfo.maxMarks, 
        minMarks:state.testResultInfo.minMarks,
        testTypeID:state.testResultInfo.testTypeID,   
        testDate:state.testResultInfo.testDate,
       
        sectionName:state.testResultInfo.sectionName,
        examName:state.testResultInfo.examName,
        subjectName:state.testResultInfo.subjectName,
        AutoTestId:state.testResultInfo.AutoTestId,
        IsGradeSubject: state.testResultInfo.IsGradeSubject,
        gradingTitle:state.testResultInfo.gradingTitle,
        studentList:state.testResultInfo.studentDetails, 
    };
};
export default connect(mapStateToProps, { ActionAddTestResult,ActionAddTestResultStudentList, ActionAddTeacher, ActionUpdateTestResult}) (OfflineTestDetailsWnd);