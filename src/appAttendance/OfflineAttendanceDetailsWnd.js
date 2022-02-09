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
import { ActionAddAttendance } from '../redux_reducers/AttendanceReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

const { width } = Dimensions.get('window');

class OfflineAttendanceDetailsWnd extends React.Component  {
    
    constructor(props) 
    {
        super(props)
        this.state = 
        { 
            loading: false,  loadingMsg: '',
            attendanceDate:this.props.attDate,
            formattedDateForDisplay:'',
            selectedSectionID:this.props.sectionID,
            sectionObject:'',
            sectionName:this.props.sectionName,
            studentList:this.props.studentList,
            AllSectionList:[],SectionList:[],
            sectionWithNoAttendance:false,
            strHolidayMsg:'',isEditDetails:this.props.isEditDetails,
            isAttendanceTaken:0
        }

    }

    componentDidMount() 
    {
        const dateResult = Moment(this.state.attendanceDate, 'YYYY/MM/DD').toDate();
        const currDateVal = Moment(dateResult).format('DD/MM/YYYY');
        this.setState({formattedDateForDisplay: currDateVal}, () => {
        });    

        this.checkForHoliday();
    }

    checkForHoliday()
    {
        NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) 
        {
            const obj = new HTTPRequestMng('', 'GetHolidayList', this)
            obj.executeRequest("InstituteId="+ this.props.instituteId +"&date="+this.state.attendanceDate);
        }
        else
        {
            this.changeLoadingStatus(false);
            Alert.alert('Message', 'No internet connection.Please try after some time.');
        }
       });
    }

    onHTTPResponseHolidayList(respData)
    {
        try 
        {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];

            if (status == 'Success') 
            {
                const listData = jsonRec['Data'];
                console.info("HolidayListData", listData);
                let recordCurrentList = [];
                //let msg="It's a holiday "
                let msg="";
                
                if (listData != undefined) 
                {
                    listData.forEach((singleObj) => {
                        const arrayObj = {
                                    'AutoHolidayId':singleObj['AutoHolidayId'],
                                    'Remark': singleObj['Remark'],
                                    'FromDate': singleObj['FromDate'],
                                    'ToDate': singleObj['ToDate']
                                }
                        recordCurrentList.push(arrayObj);
                        if(singleObj['FromDate']==singleObj['ToDate'])
                            msg='\n'+"["+singleObj['Remark']+"]";
                        else
                            msg='\n'+"["+singleObj['Remark']+" from "+singleObj['FromDate']+" to "+singleObj['ToDate']+"]";
                    });
                    this.setState({strHolidayMsg: msg});
                }
                else
                {
                   // no holiday on selected date
                    this.setState({strHolidayMsg: ''});
                }
            } 
            else 
            {
               // no holiday on selected date
                this.setState({strHolidayMsg: ''});
            }   
              
        } 
        catch (error) {
        console.error("error", error);
        }
        finally
        {
            this.changeLoadingStatus(false);
        }
    }

    onHTTPError() 
    {
        this.changeLoadingStatus(false);
        Alert.alert('Message', 'Unable to connect with server, Please try again after some time');
    }

    onRenderStudentListData(item,index) 
    {
        let attendanceLay;
        if(item.IsPresent)
        {
            attendanceLay=<View style={{ width: 25, height: 25,
            backgroundColor: appColor.googleGreen, borderRadius: 10 , alignItems: 'center',
        justifyContent:'center'}} >
                <Text style={{color: appColor.white}}>P</Text>
            </View>
        }
        else
        {
            attendanceLay= <View style={{width: 25, height: 25,
            backgroundColor: appColor.googleRed, borderRadius: 10 , alignItems: 'center',
            justifyContent:'center'}} >
                <Text style={{color: appColor.white}}>A</Text>
            </View>
        }

        return <View style={{ width: '100%',flex: 1,flexDirection: 'row',justifyContent :'space-between',paddingLeft:5, paddingRight:5, alignItems:'center'}}> 
                {attendanceLay}
                <Text style={[layoutDesign.item ,{flex: 1, numberOfLines:2,ellipsizeMode:'end',marginLeft:5}]}>{item.StudentName}</Text>
                <Text style={[layoutDesign.item]}> ({item.RegistrationNumber})</Text>
            </View>
    }
    
    render()
    {
        
        let strSessionStartDate=this.props.SessionStartMonth+"/1/"+(this.props.SessionYear); 
      
        const today = new Date();
        const sessionStartDate=  new Date(strSessionStartDate);
        const sessionEndDate = new Date((sessionStartDate.getFullYear() + 1), (sessionStartDate.getMonth()), 0)

        let bool=(sessionEndDate.getTime() > today.getTime())
        if(!bool)
                Alert.alert('Oops', "Your academic session is expired.Please login again to get updated session.", [{ 'text': 'OK'}]);

        
        let presentCount,absentCount;
        let recordList = this.state.studentList;

        if(recordList.length>0)
        {
            presentCount=0,absentCount=0;
            recordList.forEach(singleObj => 
            {
                if(singleObj['IsPresent'])
                    presentCount++;
                else
                    absentCount++;
            }); 
        }
        else{
            presentCount='',absentCount='';
        }

        let listHeader;


        if(this.state.studentList.length>0)
        {
           listHeader= <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-between',backgroundColor:appColor.lighten_gray,marginTop:5,paddingTop:3,paddingBottom:3}}>
                            <Text style={[{flexGrow: 1,fontSize:11}]}></Text>
                            <Text style={[{flexGrow: 1,fontSize:11}]}>Student Name</Text>
                            <Text style={[{flexGrow: 1,fontSize:11,
                           textAlign: 'right',marginRight: 15}]}>Reg No.</Text>
                        </View>
        }


        else
        {
            listHeader=<View></View>;
        }


        let  StudentListLayout=<Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 5 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: -15, marginRight: -15, }}>
                               <View style={{width: '100%',flex: 1, flexDirection: 'row',
                               paddingLeft:5,paddingRight:5}}>

                                    <Text style={[layoutDesign.headerText, {flex: 1,marginLeft:5}]}>Total {this.state.studentList.length} Students</Text>

                                    <View style={{ flexDirection: 'row',alignItems: 'flex-end' }}>
                                        <View style={[layoutDesign.view_bg_present]}>
                                        <Text style={layoutDesign.viewText}>{presentCount} P</Text></View>
                                        <View style={[layoutDesign.view_bg_absent,{marginLeft:10,}]}>
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
                    <Title>Attendance Details</Title>
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
                    <Card style={{ borderRadius: 10, marginTop: 30, marginBottom: 10 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                        <View style={{ flex: 1}}>
                         

                            <View style={{ flex: 1, flexDirection: 'row',marginTop:5 }}>
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text style={layoutDesign.headingText}>Date </Text>
                                        <Text style={layoutDesign.dataText}>{this.state.formattedDateForDisplay} </Text>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text style={layoutDesign.headingText}>Section </Text>
                                        <Text style={layoutDesign.dataText}>{this.props.sectionName }</Text>
                                    </View>
                            </View>
                            <Text style={layoutDesign.holidayTextStyle}>
                            {this.state.formattedDateForDisplay} is a holiday.  {this.state.strHolidayMsg}</Text>
                        </View>
                        </CardItem>
                    </Card> 
                    {StudentListLayout}
                </Content>
            </View>
        </Container>);
    }
}

const layoutDesign = StyleSheet.create({
  
    headingText: {
        fontSize: 12, color: appColor.gray_title
    },
    dataText: {
        fontSize: 16, color: appColor.black
    },
    
    pickerLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD', height:50
    },
    headerText: {
        fontSize: 18, color: appColor.colorPrimary,
    },
    rowLayout:
    {
        flex: 1, flexDirection: 'row',alignItems: 'center',
        marginTop:5,
       
    },
    item: 
    {
        paddingLeft:5,
        paddingRight:2,
        paddingTop:7,
        paddingBottom:7,
        alignItems: 'center'
    },
    view_bg_present:
    {
        height:30,
        width:30,
        backgroundColor: appColor.googleGreen,
        alignItems: 'center',
        justifyContent:'center'
    },
    view_bg_absent:
    {
        height:30,
        width:30,
        backgroundColor: appColor.googleRed,
        alignItems: 'center',
        justifyContent:'center'
    },
    viewText:
    {
        fontSize: 14, color: appColor.white
    },
    holidayTextStyle:
    {
        fontSize: 14, marginTop:2,
        color: appColor.holiday
    },
    msgAlertStyle:
    {
        fontSize: 14, marginTop:2,
        color: appColor.holiday
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
    return {instituteId: state.teacherInfo.InstituteId,
            SessionStartMonth:state.teacherInfo.SessionStartMonth,
            SessionYear:state.teacherInfo.SessionYear,

            attendanceID:state.attendanceInfo.attendanceID,
            sectionID: state.attendanceInfo.sectionID,
            sectionName: state.attendanceInfo.sectionName, 
            isEditDetails: state.attendanceInfo.isEditDetails,
            totalStud: state.attendanceInfo.totalStud, 
            totalPresent: state.attendanceInfo.totalPresent,
            totalAbsent: state.attendanceInfo.totalAbsent, 
            attDate: state.attendanceInfo.attDate,
            studentList:state.attendanceInfo.studentList,
            isOfflineRecord:state.attendanceInfo.isOfflineRecord
        };
};
export default connect(mapStateToProps, { ActionAddAttendance, ActionAddTeacher }) 
(OfflineAttendanceDetailsWnd);

