import React from 'react';
import {
    View, Alert, Image,  Platform,
    StyleSheet, Dimensions,StatusBar,FlatList,
    ScrollView,
    TouchableOpacity,
    PermissionsAndroid
} from 'react-native';

import NetInfo from "@react-native-community/netinfo";
import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right,ActionSheet,
    Card,CardItem,Footer
} from "native-base";

import appJson from '../../app.json';
import InternetConn from '../networkConn/OfflineNotice';
import appColor from '../config/color.json';
import AwesomeAlert from 'react-native-awesome-alerts';
import MenuActionCard from './MenuActionCard';
import AsyncStorage from '@react-native-community/async-storage';
import HTTPRequestMng from "./HTTPRequestMng";
import CardView from 'react-native-cardview'
import Moment from 'moment';
import MainMenu from './MainMenu';

import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';

// import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

import { ActionAddTeacher, ActionDeleteTeacher } from '../redux_reducers/TeacherInfoReducer';
import RNFS from 'react-native-fs'

import { connect } from 'react-redux';
const data = {'Name':'name1','Desc':''};

class DashboardWnd extends React.Component 
{
  constructor(props) 
  {
        super(props)
        this.state = {
            loading: false,instituteId:this.props.instituteId,fname:this.props.fname,lname:this.props.lname,mobileNumber:this.props.mobileNumber,emailID:this.props.emailID,
            teacherImageData:this.props.teacherImageData,
            holidayListLoadAttempted: false, 
            holidaysList: [], tempHolidaysList: [], 
            totalHolidays: 0, currMonthHolidays: 0, isMoreHolidayShow: false,
            yearList:[],
            dayList:[],
            single_yearList:[],
            single_dayList:[],
            screen:false,
            expanded_title:'Other Months',
            refreshing:false,
            minDate:'',
            maxDate:'',
        }
        this._onOrientationChange = this._onOrientationChange.bind(this)
    }

    endDateRow = (date)=>{
        if(date!=null){
          return(
           <View>
              <View style={{width:1,height:25,alignSelf:'center', backgroundColor:'black'}}><Text>   </Text></View>
                <Text style={{marginLeft:5,padding:5,fontSize:16}}>{date}</Text>
             </View>
          );
        }
      }

    holidayChildLayout = (parentIndex)=>{
        return(
        <View style={{flex:1,marginBottom:10,marginTop:5}}>
      <Text style = {{marginLeft:5,fontSize:18,color:appColor.blue_color_parent,}}>{this.state.yearList[parentIndex].year}</Text>
            <FlatList
             data={this.state.single_yearList[parentIndex].childDate}
            renderItem={({item,index}) => (
              <View style={{flex:1,marginTop:10,marginLeft:5}}>
                <View style={{flexDirection:'row',justifyContent:'flex-start',}}>
                  <View style={{alignItems:'center',marginLeft:10,marginRight:2}}>
    
                  <View style={{width:1,height:85, backgroundColor:'black'}}><Text>   </Text></View>
                  <View style={{width:20,height:20, marginTop:8 ,borderRadius:20,backgroundColor:'#FFE56C',position:'absolute'}}><Text> </Text></View>
                  </View>
    
                  <View  style={{flexDirection:'column',justifyContent:'flex-start',marginLeft:2,marginTop:3}}>
                 
                  <Text style={{padding:5,fontSize:15,marginLeft:5,}}>{this.state.single_yearList[parentIndex].childDate[index].date}</Text> 

                  {this.endDateRow(this.state.single_yearList[parentIndex].childDate[index].end_date)}

                  </View>
                  
                    <View style={{paddingRight:5,marginLeft:5,width:'72%',marginRight:15}}>
                    <CardView
              cardElevation={4}
              cardMaxElevation={4}
              cornerRadius={2}>
            <Text style={{padding:4,fontSize:15,marginTop:0,width:200}}>{this.state.single_yearList[parentIndex].childDate[index].holiday_remark}</Text>
                </CardView>
                </View>         
               </View>
              </View>
            )}
            ItemSeparatorComponent={this.renderSeparator}
          />
        </View>);
      }
    
      expandHolidayList = ()=>{
        var temp_isexpaned = !this.state.list_expanded;
        var  temp_singleY= [];
        temp_singleY = [];
        temp_singleY.push(this.state.single_yearList[0]);
        if(this.state.list_expanded){
            this.setState({list_expanded:temp_isexpaned,single_yearList:this.state.yearList,expanded_title:'Other Months'});
            console.log('new list',JSON.stringify(this.state.single_yearList));
        }else{
          this.setState({list_expanded:temp_isexpaned,single_yearList:temp_singleY,expanded_title:'Other Months'});
          console.log('new list',JSON.stringify(this.state.single_yearList));
        }
      }
    
     holidayListParentLayout = async ()=>{
      if(this.state.yearList.length>0){
        return(
          <ScrollView style={{margin:0}}>
          <View style={{margin:8,}}>
           <CardView
              cardElevation={2}
              cardMaxElevation={2}
              cornerRadius={2}>
                <View style={{flex:1,margin:5,flexDirection:'column',justifyContent:'flex-start',alignItems:'flex-start'}}>
                <View style={{backgroundColor:appColor.colorPrimary,flexDirection:'row'}}>
               <Text style={{color:'white',flex:1,fontSize:16,padding:8}}>{Moment(await AsyncStorage.getItem("minDate")).format('YYYY')} - {Moment(await AsyncStorage.getItem("maxDate")).format('YYYY')} Holiday Calendar</Text>
                </View>
                <TouchableOpacity  style = {{alignSelf:'flex-end',flex:1}}onPress={()=>{
                 this.expandHolidayList();
                }}><Text style={{fontWeight:'100',fontSize:15,textDecorationLine:'underline',padding:5,color:appColor.blue_color_link}}>{this.state.expanded_title}</Text></TouchableOpacity>
                <FlatList
                style={{flex:1,backgroundColor:'#f5f5f5'}}
             data={this.state.single_yearList}
            renderItem={({item,index}) => (
              <View style={{flex:1}}>
                  {this.holidayChildLayout(index)}
              </View>
            )}
            ItemSeparatorComponent={this.renderSeparator}
          />
           </View>
         </CardView>
      </View>
      </ScrollView>
        );
     }
    }


   async componentDidMount() 
  {
      StatusBar.setBackgroundColor(appColor.colorPrimaryDark);
      AsyncStorage.setItem('lastTimeHolidayListSync', String(0));
      let min_date = await AsyncStorage.getItem("minDate");
      let max_date = await AsyncStorage.getItem("maxDate");

      this.setState({minDate:min_date,maxDate:max_date});
      //this.loadHolidayListFrmDB(true);
      this.loadHolidayListFrmAttendance(true);
      var granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      this.checkFileExistsandDeleteIt() 
  }

  checkFileExistsandDeleteIt(){
    console.log("Callingng")
    const filePath = RNFS.DownloadDirectoryPath + '/SchoolShortCode.txt'
    console.log("Callingng",filePath)
      RNFS.exists(filePath)
      .then((res) => {
        console.log("RESSS",res)
        if (res) {
          console.log("RESULTTT",res)
          RNFS.unlink(filePath)
            .then(() => console.log('FILE DELETED'))
        }
      }) 
  }

  _onOrientationChange(newDimensions) {
        onChangeScreenSize(newDimensions, this, true)
    }

 
 _loadHolidayFromServer = async (instituteId)=>{
    var shoolHolidayResponse = null;
       shoolHolidayResponse = await fetchHolidayList(instituteId);
      try {
        if(shoolHolidayResponse!=null && shoolHolidayResponse!='error'){
        if (shoolHolidayResponse[0].Status == 1) {
          var list_array = {};
          var year_list =[];
          var day_list =[];
          var temp_array= [];
          var temp_month_array = [];
          var temo_object_array =[];
          
  
          for (var i = 0; i < shoolHolidayResponse[0].Data.length; i++) {
            var remark=  shoolHolidayResponse[0].Data[i].Remark; 
            let startObj = Moment(
              shoolHolidayResponse[0].Data[i].FromDate,
              'DD/MM/YYYY',
            );
            
            var start_day = Moment(startObj).format('Do');
            var start_date = Moment(startObj).format('YYYY-MM-');
            var final_start_date = '';
            if (start_day.replace(/[^0-9\.]+/g, '') < 10) {
              final_start_date = '0' + start_day.replace(/[^0-9\.]+/g, '');
            } else {
              final_start_date = start_day.replace(/[^0-9\.]+/g, '');
            }
  
            let endObj = Moment(
              shoolHolidayResponse[0].Data[i].ToDate,
              'DD/MM/YYYY',
            );
            
            var end_day = Moment(endObj).format('Do');
            var end_date = Moment(endObj).format('YYYY-MM-');
            var final_end_date = '';
            if (end_day.replace(/[^0-9\.]+/g, '') < 10) {
              final_end_date = '0' + end_day.replace(/[^0-9\.]+/g, '');
            } else {
              final_end_date = end_day.replace(/[^0-9\.]+/g, '');
            }
  
            var startDay_key = '' + (start_date + final_start_date);
            var endDay_key = '' + (end_date + final_end_date);
            temp_array.push(Moment(startObj).format('MMMM YYYY'));
  
            var t_list = [];
            var temp_endD = null;
            if(startDay_key===endDay_key){
              temp_endD = null;
            }else{
              temp_endD = Moment(endDay_key).format('DD MMM');
            }
            var t ={
              date:Moment(startDay_key).format('DD MMM'),
              holiday_remark : remark,
              end_date:temp_endD
            };
  
           
            var current_dayProperty = {
              selected: true,
              marked: true, selectedColor: appColor.yello_color
            };


            var tempT =0;
            var temp_list = this.state.yearList;
              for(var i=0;i<year_list.length;i++){
                if(new Date(startObj)==new Date(year_list[i].year)){
                  if( year_list[i].childDate[0].holiday_remark==remark){
                    year_list[i].childDate[0].end_date = Moment(endObj).format('DD MMM');
                    tempT = tempT+1;
                  }else{
                    var t ={
                      date:Moment(startDay_key).format('DD MMM'),
                      holiday_remark : remark,
                      end_date:temp_endD
                    };
                    tempT = tempT+1;
                    year_list[i].childDate.push(t);
                  }
              }
            }
           
            if(tempT==0){
              t_list.push(t);
              temp_month_array.push(parseInt(Moment(startObj).format('MM')));
              temo_object_array.push({year:Moment(startObj).format('MMMM YYYY'),month:parseInt(Moment(startObj).format('MM')),childDate:t_list});
              year_list.push({month:parseInt(Moment(startObj).format('MM')),year:Moment(startObj).format('MMMM YYYY'),childDate:t_list});
            }
           
          }
  
          var tg = Moment().format('MM');
          for(var h=0;h<year_list.length;h++){
              if((year_list[h].month) < tg){
                year_list.splice(h,1)
              }
          }

        year_list.sort(function(a, b) {
            return ((a.month < b.month) ? -1 : ((a.month == b.month) ? 0 : 1));
        });
  
          var temp_singleYear = [] ;
          var temp_singleDay = [] ;
          console.log('sorted array',temo_object_array);
          temp_singleYear.push(year_list[0]);
          temp_singleDay.push(year_list[0].childDate);
          this.setState({refreshing:false,yearList: year_list,single_yearList:temp_singleYear,single_dayList:temp_singleDay});  
        } else if (shoolHolidayResponse[0].Status == 0) {
          var current_dayProperty = {
            selected: true,
            marked: true, selectedColor: appColor.yello_munsell
          };
          // Alert.alert('Message', 'No result found for School Holidays.', [
          //   {
          //     text: 'Ok',
          //     style: 'cancel',
          //   },
          // ]);
          var list_array = {};
          list_array[Moment().format('YYYY-MM-DD')] = current_dayProperty
          this.setState({refreshing:false,yearList: [],single_yearList:[],single_dayList:[]});  
        } 
      }else{
        Alert.alert('Message', 'Error Occured While Getting School Holidays.', [
          {
            text: 'Ok',
            style: 'cancel',
          },
        ]);
        var list_array = {};
        list_array[Moment().format('YYYY-MM-DD')] = current_dayProperty
        this.setState({refreshing:false,yearList: [],single_yearList:[],single_dayList:[]});  
      }
        
      } catch (error) {
        console.log(error);
        var current_dayProperty = {
          selected: true,
          marked: true, selectedColor: appColor.yello_munsell
        };
        Alert.alert('Message', 'Something Went Wrong While Getting School Holidays.', [
          {
            text: 'Ok',
            style: 'cancel',
          },
        ]);
         var list_array = {};
          list_array[Moment().format('YYYY-MM-DD')] = current_dayProperty
          this.setState({refreshing:false,yearList: [],single_yearList:[],single_dayList:[]});  
      }
 }   
 


 loadHolidayListFrmDB = async (isInitial) => {
        try {
            const lastTimeHolidayListSync = await AsyncStorage.getItem("lastTimeHolidayListSync")
            if (lastTimeHolidayListSync != null) {
                try {
                    let timeDiff = new Date().valueOf() - parseFloat(lastTimeHolidayListSync);
                    timeDiff /= (1000 * 60); //in minute
                    if (timeDiff >= 10) {
                        if (isInitial) {
                            NetInfo.isConnected.fetch().then((isConnected) => {
                                if (isConnected) {
                                    this.loadHolidayListFrmServer(true);
                                } else {
                                    this.loadHolidayListFrmDB(false);
                                }                                
                            });
                            return;
                        }
                    }
                } catch (error) { }
            }

            let currentMonthDate = Moment(new Date()).startOf('month').format('DD/MM/YYYY');
            currentMonthDate = Moment(currentMonthDate, 'DD/MM/YYYY').valueOf();
            const currMonthStr = Moment(parseInt(currentMonthDate)).format('MMMM, YYYY');

            const database = new DBOperation();
            database.openDB(true, () => {
                let recordsArr = [], totalHolidays = 0, currMonthHolidays = 0;
                database.dbObj().transaction((databaseTX) => {
                    const sql = "SELECT * FROM HolidayList_tbl "
                        + " WHERE CAST( StartDateLong AS INTEGER ) > " + currentMonthDate;
                    databaseTX.executeSql(sql, [], (tx, results) => {
                        const len = results.rows.length;
                        
                        let prevMonth = '', index = 0;
                        for (let i = 0; i < len; i++) {
                            const row = results.rows.item(i);
                            try {
                                const recMonth = Moment(parseInt(row.StartDateLong)).format('MMMM, YYYY');
                                if (recMonth != prevMonth) {
                                    recordsArr.push({ 'index': index++,
                                        'layoutType': 3,
                                        'title': recMonth,
                                    });
                                    prevMonth = recMonth;
                                }

                                recordsArr.push({ 'index': index++, 'layoutType': 1, 
                                    'holidayName': row.HolidayName, 
                                    'date': Moment(parseInt(row.StartDateLong)).format('DD'),
                                    'day': Moment(parseInt(row.StartDateLong)).format('ddd'),
                                    'startDate': Moment(parseInt(row.StartDateLong)).format('DD MMM, YYYY'),
                                    'endDate': Moment(parseInt(row.EndDateLong)).format('DD MMM, YYYY'),
                                });
                                totalHolidays++; 
                                if (prevMonth == currMonthStr) currMonthHolidays++;
                            } catch (error) { console.error(error) }
                        }
                    });
                }, database.dbObj().error, () => {
                    //on transaction end
                    database.closeDatabase();

                    //check for data available, if not download it
                    if (recordsArr.length == 0) {
                        if (isInitial) {
                            this.loadHolidayListFrmServer(true);
                        } else {
                            this.setState({ loading: false, holidayListLoadAttempted: true });
                        }
                    } else if (this._isMounted) {
                        this.setState({ holidaysList: recordsArr.slice(0, currMonthHolidays + 1), 
                            totalHolidays: totalHolidays, currMonthHolidays: currMonthHolidays, tempHolidaysList: recordsArr.slice(), 
                            loading: false, holidayListLoadAttempted: true });
                    }
                });
            }, () => {
                //on error occur
                database.closeDatabase()
            });
        } catch (error) {
            console.log(error)
        }
    }
    
    loadHolidayListFrmServer = async (isInitial) => {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    
                    const obj = new HTTPRequestMng('', 'GetHolidayList', this);
                    obj.executeRequest("InstituteId="+ this.props.instituteId);

                } else if(!isInitial) {
                    this.setState({ loading: false, holidayListLoadAttempted: true, });
                    Alert.alert('Oops', 'No internet connection');
                } else {
                    this.setState({ loading: false, holidayListLoadAttempted: true, });
                }
            });
        } catch (error) {}
    }

    loadHolidayListFrmAttendance = async (isInitial) => {
        try {
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) {
                    
                    const obj = new HTTPRequestMng('', 'GetHolidayList2', this);
                    obj.executeRequest("InstituteId="+ this.props.instituteId);
                } else if(!isInitial) {
                    this.setState({ loading: false, holidayListLoadAttempted: true, });
                    Alert.alert('Oops', 'No internet connection');
                } else {
                    this.setState({ loading: false, holidayListLoadAttempted: true, });
                }
            });
        } catch (error) {}
    }

    onHTTPResponseHolidayList(respData) {
        try {
            if(!this._isMounted) return;

            const jsonRec = respData[0];
            const status = jsonRec['TransactionStatus'];
            if (status == 'Success') {
                setTimeout(() => {
                    this.loadHolidayListFrmDB(false);
                }, 100);
            }
        } catch (error) {}
    }

    onHTTPResponseHolidayList2(respData) {
        // try {
        //     if(!this._isMounted) return;

        //     const jsonRec = respData[0];
        //     const status = jsonRec['TransactionStatus'];
        //     if (status == 'Success') {
        //         setTimeout(() => {
        //             this.loadHolidayListFrmDB(false);
        //         }, 100);
        //     }
        // } catch (error) {}
        var shoolHolidayResponse = null;
       shoolHolidayResponse = respData;
       console.log('Holiday list',JSON.stringify(shoolHolidayResponse));
      try {
        if(shoolHolidayResponse!=null && shoolHolidayResponse!='error'){
        if (shoolHolidayResponse[0].Status == 1) {
          var list_array = {};
          var year_list =[];
          var day_list =[];
          var temp_array= [];
          var temp_month_array = [];
          var temo_object_array =[];
          
  
          for (var i = 0; i < shoolHolidayResponse[0].Data.length; i++) {
            var remark=  shoolHolidayResponse[0].Data[i].Remark; 
            let startObj = Moment(
              shoolHolidayResponse[0].Data[i].FromDate,
              'DD/MM/YYYY',
            );
  
            var start_day = Moment(startObj).format('Do');
            var start_date = Moment(startObj).format('YYYY-MM-');
            var final_start_date = '';
            if (start_day.replace(/[^0-9\.]+/g, '') < 10) {
              final_start_date = '0' + start_day.replace(/[^0-9\.]+/g, '');
            } else {
              final_start_date = start_day.replace(/[^0-9\.]+/g, '');
            }
  
            let endObj = Moment(
              shoolHolidayResponse[0].Data[i].ToDate,
              'DD/MM/YYYY',
            );

            var end_day = Moment(endObj).format('Do');
            var end_date = Moment(endObj).format('YYYY-MM-');
            var final_end_date = '';
            if (end_day.replace(/[^0-9\.]+/g, '') < 10) {
              final_end_date = '0' + end_day.replace(/[^0-9\.]+/g, '');
            } else {
              final_end_date = end_day.replace(/[^0-9\.]+/g, '');
            }
  
            var startDay_key = '' + (start_date + final_start_date);
            var endDay_key = '' + (end_date + final_end_date);
            temp_array.push(Moment(startObj).format('MMMM YYYY'));
  
            var t_list = [];
            var temp_endD = null;
            if(startDay_key===endDay_key){
              temp_endD = null;
            }else{
              temp_endD = Moment(endDay_key).format('DD MMM');
            }
            var t ={
              date:Moment(startDay_key).format('DD MMM'),
              holiday_remark : remark,
              end_date:temp_endD
            };
  
            var start_dayProperty = {
              selected: true,
              marked: true, selectedColor: appColor.colorPrimary
            };
            var current_dayProperty = {
              selected: true,
              marked: true, selectedColor: appColor.yello_color
            };


            var tempT =0;
            var temp_list = this.state.yearList;
              for(var i=0;i<year_list.length;i++){
                if(new Date(startObj)==new Date(year_list[i].year)){
                  if( year_list[i].childDate[0].holiday_remark==remark){
                    year_list[i].childDate[0].end_date = Moment(endObj).format('DD MMM');
                    tempT = tempT+1;
                  }else{
                    var t ={
                      date:Moment(startDay_key).format('DD MMM'),
                      holiday_remark : remark,
                      end_date:temp_endD
                    };
                    tempT = tempT+1;
                    year_list[i].childDate.push(t);
                  }
              }
            }
           
            if(tempT==0){
              t_list.push(t);
              temp_month_array.push(parseInt(Moment(startObj).format('MM')));
              temo_object_array.push({year:Moment(startObj).format('MMMM YYYY'),month:parseInt(Moment(startObj).format('MM')),childDate:t_list});
              year_list.push({month:parseInt(Moment(startObj).format('MM')),year:Moment(startObj).format('MMMM YYYY'),childDate:t_list});
            }
           
          }
  
          var tg = Moment().format('MM');
          for(var h=0;h<year_list.length;h++){
              if((year_list[h].month) < tg){
                year_list.splice(h,1)
              }
          }

        year_list.sort(function(a, b) {
            return ((a.month < b.month) ? -1 : ((a.month == b.month) ? 0 : 1));
        });
  
          var temp_singleYear = [] ;
          var temp_singleDay = [] ;
          console.log('sorted array',temo_object_array);
          temp_singleYear.push(year_list[0]);
          temp_singleDay.push(year_list[0].childDate);
          this.setState({refreshing:false,yearList: year_list,single_yearList:temp_singleYear,single_dayList:temp_singleDay});  
        } else if (shoolHolidayResponse[0].Status == 0) {
          var current_dayProperty = {
            selected: true,
            marked: true, selectedColor: appColor.yello_munsell
          };
          // Alert.alert('Message', 'No result found for School Holidays.', [
          //   {
          //     text: 'Ok',
          //     style: 'cancel',
          //   },
          // ]);
          var list_array = {};
          list_array[Moment().format('YYYY-MM-DD')] = current_dayProperty
          this.setState({refreshing:false,yearList: [],single_yearList:[],single_dayList:[]});  
        } 
      }else{
        Alert.alert('Message', 'Error Occured While Getting School Holidays.', [
          {
            text: 'Ok',
            style: 'cancel',
          },
        ]);
        var list_array = {};
        list_array[Moment().format('YYYY-MM-DD')] = current_dayProperty
        this.setState({refreshing:false,yearList: [],single_yearList:[],single_dayList:[]});  
      }
        
      } catch (error) {
        console.log(error);
        var current_dayProperty = {
          selected: true,
          marked: true, selectedColor: appColor.yello_munsell
        };
        Alert.alert('Message', 'Something Went Wrong While Getting School Holidays.', [
          {
            text: 'Ok',
            style: 'cancel',
          },
        ]);
         var list_array = {};
          list_array[Moment().format('YYYY-MM-DD')] = current_dayProperty
          this.setState({refreshing:false,yearList: [],single_yearList:[],single_dayList:[]});  
      }
    }
    onHTTPError() {
        if(!this._isMounted) return;
        this.changeLoadingStatus(false);
        InteractionManager.runAfterInteractions(() => {
            Alert.alert('Oops', 'Unable to connect with server, Please try after some time');
        });
    }

    // renderHolidayList(index, data) {

    //     if (data.layoutType == 1) {
    //         return (<View style={{ flex: 1, paddingLeft: 20, paddingRight: 10 }}>
    //             <View style={{ width: 1, height: 10, marginLeft: 20, backgroundColor: appColor.colorPrimaryDark }} />

    //             <View style={{ flex: 1, flexDirection: 'row' }}>
    //                 <View style={{ width: 1, height: '100%', marginLeft: 20, backgroundColor: appColor.colorPrimaryDark }} />
    //                 <View style={{ position: 'absolute', width: 50, height: 50, marginLeft: -5, backgroundColor: appColor.background_gray, justifyContent: 'center', alignItems: 'center' }}>
    //                     <Text style={{ color: 'black', fontSize: 22, fontWeight: '500' }}>{data.date}</Text>
    //                     <Text style={{ color: 'black', fontSize: 14 }}>{data.day}</Text>
    //                 </View>
                    
    //                 <Card style={{ borderTopEndRadius: 10, borderBottomStartRadius: 10, borderBottomEndRadius: 10,  marginLeft: 30 }}>
    //                     <CardItem bordered style={{ borderTopEndRadius: 10, borderBottomStartRadius: 10, borderBottomEndRadius: 10, borderColor: 'white' }}>
    //                         <View style={{ flex: 1, flexDirection: 'column' }}>
    //                             <Text style={{ fontSize: 18, fontWeight: '400', color: appColor.black,  }}>{data.holidayName}</Text>

    //                             { data.startDate != data.endDate && <View style={{ flexDirection: 'row', marginTop: 10 }}> 
    //                                 <View style={{flex: 1, flexDirection: 'column' }}>
    //                                     <Text style={layoutDesign.headingText}>From Date</Text>
    //                                     <Text style={layoutDesign.dataText}>{data.startDate}</Text>
    //                                 </View>
    //                                 <View style={{flex: 1, flexDirection: 'column' }}>
    //                                     <Text style={layoutDesign.headingText}>To Date</Text>
    //                                     <Text style={layoutDesign.dataText}>{data.endDate}</Text>
    //                                 </View>                                    
    //                             </View> }
    //                         </View>
    //                     </CardItem>
    //                 </Card>
    //             </View>
    //             <View style={{ width: 1, height: 10, marginLeft: 20, backgroundColor: appColor.colorPrimaryDark }} />
    //         </View>);

    //     } else if(data.layoutType == 3) {
    //         return <View style={{ flex: 1, paddingLeft: 20, paddingRight: 10 }}>
    //             <View style={{ width: 1, height: 20, marginLeft: 20, backgroundColor: appColor.colorPrimaryDark }} />
    //             <View style={{ flex: 1, flexDirection: 'row' }}>
    //                 <View style={{ flexDirection: 'row', backgroundColor: appColor.flashcardColor, padding: 5 }}>
    //                     <Image resizeMode={'center'} source={require('../../assets/outline_calendar_today_black_48dp.png')}
    //                         style={{ width: 20, height: 20, tintColor: 'white', marginLeft: 5 }} />
    //                     <Text style={{ color: 'white', fontSize: 18, marginLeft: 10, marginRight: 10 }}>{data.title}</Text>
    //                 </View>
    //             </View>
    //             <View style={{ width: 1, height: 10, marginLeft: 20, backgroundColor: appColor.colorPrimaryDark }} />
    //         </View>
    //     }
    // }

    renderHolidayList(index,data){
        return(
            <View style={{ flex: 1, paddingLeft: 20, paddingRight: 10 }}>
                    <CardView style={{ borderTopEndRadius: 10, borderBottomStartRadius: 10, borderBottomEndRadius: 10,  marginLeft: 30 }}>
                       <View style={{flex:1,flexDirection:'column',alignItems:'stretch'}}>
                           <View style = {{flex:1,backgroundColor: appColor.colorPrimaryDark}}>
                                <Text>jbvjjjbjb</Text>
                           </View>
                       </View>
                    </CardView>
            </View>
        );
    }
    

     render() 
    {
        const childWidth = (screenWidth / (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : (isTablet ? 2 : 1.5)));
        const menuCard = childWidth - 40;
        let emailLayout, mobileLayout,holidayLayout;
        if(this.state.emailID != '') {
            emailLayout = <View style={{ flexDirection: 'row', alignItems: 'center',marginTop:10}}>
                <Icon name="mail" style={{ color: 'white', fontSize: 18, marginRight: 10 }} />
                <Text style={layoutDesign.parentEmail}>
                    {this.props.emailID}
                </Text>
            </View>
    }

        if(this.state.mobileNumber != '') {
            mobileLayout = <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                <Icon name="call" style={{ color: 'white', fontSize: 18, marginRight: 10 }} />
                <Text style={layoutDesign.parentEmail}>
                    {this.props.mobileNumber}
                </Text>
            </View>
        }

        if(this.state.yearList.length>0){
            holidayLayout = <ScrollView style={{margin:0}}>
            <View style={{margin:8,}}>
             <CardView
                cardElevation={2}
                cardMaxElevation={2}
                cornerRadius={2}>
                  <View style={{flex:1,margin:5,flexDirection:'column',justifyContent:'flex-start',alignItems:'flex-start'}}>
                  <View style={{backgroundColor:appColor.colorPrimary,flexDirection:'row'}}>
                 <Text style={{color:'white',fontWeight:'800',flex:1,fontSize:16,padding:8}}>{Moment(this.state.minDate).format('YYYY')=='Invalid date'?'':Moment(this.state.minDate).format('YYYY')} - {Moment(this.state.maxDate).format('YYYY')=='Invalid date'?'':Moment(this.state.maxDate).format('YYYY')} Holiday Calendar</Text>
                  </View>
                  <TouchableOpacity  style = {{alignSelf:'flex-end',flex:1}}onPress={()=>{
                   this.expandHolidayList();
                  }}><Text style={{fontWeight:'500',fontSize:15,textDecorationLine:'underline',padding:5,color:appColor.blue_color_link}}>{this.state.expanded_title}</Text></TouchableOpacity>
                  <FlatList
                  style={{flex:1,backgroundColor:'#f5f5f5'}}
               data={this.state.single_yearList}
              renderItem={({item,index}) => (
                <View style={{flex:1}}>
                    {this.holidayChildLayout(index)}
                </View>
              )}
              ItemSeparatorComponent={this.renderSeparator}
            />
             </View>
           </CardView>
        </View>
        </ScrollView>
        }


        let dashboardLayout =  <View style={{flex:1,flexDirection:'column',alignItems:'center'}}>
        <View style={{flex:0.5,flexDirection:'row',marginLeft:10,marginRight:10}}>
           <MainMenu cardName ='Attendance'
             nativation={this.props.navigation}
             
           /> 
           <MainMenu cardName ='Test Results' 
             nativation={this.props.navigation}
           /> 
        </View>

        <View style={{flex:0.5,flexDirection:'row',marginLeft:10,marginRight:10,marginTop:15}}>
          <MainMenu cardName ='School Diary'
            nativation={this.props.navigation}
          /> 
           <MainMenu cardName ='Assignments' 
            nativation={this.props.navigation}
           /> 
        </View>

        <View style={{flexDirection:'row',marginLeft:10,marginRight:10,marginTop:15}}>
          <MainMenu cardName ='Virtual Class'
          style={{alignSelf:'center'}}
            nativation={this.props.navigation}
          /> 
        </View>
   </View>


let floatingMenu = 
<View style={layoutDesign.floatingMenuContainer}>
    <TouchableOpacity onPress = {()=>{
        this.props.navigation.navigate('AddEditAssignment');
    }}>
      <View style={layoutDesign.floatingMenuItem}>
           <Image source = {require('../../assets/New.png')} style={layoutDesign.footerImage}/>
 <Text style={layoutDesign.footerText}>New{'\n'}Assignments</Text>
      </View>
      </TouchableOpacity>
      <TouchableOpacity onPress = {()=>{
        this.props.navigation.navigate('AssignmentList');
    }}>
      <View style={layoutDesign.floatingMenuItem}>
           <Image source = {require('../../assets/List.png')} style={layoutDesign.footerImage}/>
           <Text style={layoutDesign.footerText}>Assignments{'\n'}List</Text>
      </View>
     </TouchableOpacity> 
     
     <TouchableOpacity onPress = {()=>{
        this.props.navigation.navigate('AssignmentEvaluatedList');
    }}>
      <View style={layoutDesign.floatingMenuItem}>
           <Image source = {require('../../assets/Results.png')} style={layoutDesign.footerImage}/>
           <Text style={layoutDesign.footerText}>Assignments{'\n'}Result</Text>
      </View>
      </TouchableOpacity> 
    </View>


        return (
        <Container style={{ backgroundColor: appColor.lightest_gray }}>
                    <Header>
                     <Left>
                        <Button transparent onPress={() => this.props.navigation.openDrawer() }>
                            <Icon name='menu'  />
                        </Button>
                    </Left>
                    <Body>
                        <Title>{appJson.displayName}</Title>
                    </Body>
                </Header>

                <View style={{ flex: 1 }} >
                    <InternetConn />
                    <View style={{ flexDirection: 'column', backgroundColor: appColor.colorPrimary, alignItems: 'center',marginBottom:10}}>
                        <View style={layoutDesign.parentPhotoFrame}>
                            <Image source={this.props.teacherImageData == '' ? require("../../assets/outline_perm_identity_black_48dp.png")
                                : { uri:this.props.teacherImageData }} style={layoutDesign.parentPhoto} />
                        </View>
                        
                        <View style={{flexDirection: 'column', marginLeft: 20, marginRight: 10,marginBottom:15}}>
                            <Text numberOfLines={1} ellipsizeMode={'tail'}
                                style={layoutDesign.parentName}>{this.props.fname + ' ' + this.props.lname}</Text>
                            {mobileLayout}
                            {emailLayout}                               
                        </View>
                   </View>
                    <Content>
                
                      {dashboardLayout}
                        {/* <View style={{ width: childWidth, alignSelf: 'center', marginBottom: 50 }}>
                           <MenuActionCard childWidth={menuCard}
                                cardName='Attendance'
                                cardColor='#00bcd4'                                    
                                nativation={this.props.navigation} />  
                            <MenuActionCard childWidth={menuCard}
                                cardName='Test Results'
                                cardColor='#41a5bd'                              
                                nativation={this.props.navigation} />
                            <MenuActionCard childWidth={menuCard}
                                cardName='School Diary'
                                cardColor='#abb6f1'                                    
                                nativation={this.props.navigation} />   
                        </View> */}
                        
                    {/* {holidayLayout} */}
                    </Content>
                    {/* <Footer style={layoutDesign.footerLayout}>
                        {floatingMenu}
                   </Footer> */}
                </View>
              {this.state.loading &&   <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%' }}
                    showProgress={true}
                    progressSize="large"
                    message="Loading, Please wait..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={false} />}
            </Container>            
    );
  }
}

  const layoutDesign = StyleSheet.create({
    parentPhoto: {
        alignSelf: 'center', resizeMode: 'stretch',
        width: 74, height: 74, borderRadius: Platform.OS == 'android' ? 74 : 37
    },
    parentPhotoFrame: {
        alignSelf: 'center', backgroundColor: 'white',
        width: 80, height: 80, borderRadius: 40, marginLeft: 10,
        borderWidth: 2, borderColor: appColor.light_gray,
        padding: 1
    },
    parentName: {
        fontSize: 18, fontWeight: '500', color: 'white', 
        textAlign:'center'
    },
    parentEmail: {
        fontSize: 15, color: 'white', fontStyle: 'normal'
    },

    cardMenuItemContent:{
      flex:1,
      alignItems:'center',
      },
  
      cardMenuBranch:{
          width:150,
          height:150,
          borderRadius:20,
          marginTop: 10, 
          marginLeft: 7, 
          marginRight: 10,
          flex:0.5,
          backgroundColor:'#ef6a3a'
      },
  
      cardMenuItemBrach:{
          flex:1,
          borderRadius: 20, 
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'#ef6a3a'
      },
  
      cardMenuAttandance:{
          width:150,
          height:150,
          borderRadius:20,
          marginTop: 10, 
          marginLeft: 7, 
          marginRight: 10,
          flex:0.5,
          backgroundColor:'#1ebcc1'
      },
  
      cardMenuItemAttandance:{
          flex:1,
          borderRadius: 20, 
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'#1ebcc1'
      },
  
      cardMenuTest:{
          width:150,
          height:150,
          borderRadius:20,
          marginTop: 10, 
          marginLeft: 7, 
          marginRight: 10,
          flex:0.5,
          backgroundColor:'#493c91'
      },
  
  
      cardMenuItemTest:{
          flex:1,
          borderRadius: 20, 
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'#493c91'
  
      },
  
      cardMenuActivity:{
          width:150,
          height:150,
          borderRadius:20,
          marginTop: 10, 
          marginLeft: 7, 
          marginRight: 10,
          flex:0.5,
          backgroundColor:'#24c26e'
  
      },
  
      cardMenuItemActivity:{
          flex:1,
          borderRadius: 20,
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'#24c26e'
      },
  
      cardMenuAssignment:{
          width:150,
          height:150,
          borderRadius:20,
          marginTop: 10, 
          marginLeft: 7, 
          marginRight: 10,
          flex:0.5,
          backgroundColor:'#3190f7'
      },
  
      cardMenuItemAssignment:{
          flex:1,
          borderRadius: 20,
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'#3190f7'
      },
  
      footerLayout:{
          borderWidth: 1,
          borderRadius: 2,
          height:100,
          borderColor: '#ddd',
          borderBottomWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 5,
          elevation: 9,
      },
  
      floatingMenuContainer:{
          shadowColor: "#000",
          shadowOffset: {
              width: 0,
              height: 2,
          },  
  
          flex:1,
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          flexDirection:'row',
          justifyContent:'space-evenly',
          alignItems:'center',
          marginTop:20,
          marginBottom:20,
          elevation: 9,
      },
  
      floatingMenuItem:{
          alignItems:'center',
          marginTop:5,
          marginBottom:5,
          paddingTop:10,
          paddingBottom:10
      },
  
      circleLayout:{
          width:86,height:86,
          borderRadius:43,
      },
  
      footerImage:{
          width:40,
          height:40,
          marginTop:10
      },
  
      footerText:{
          textAlign:'center',
          flexWrap:'wrap',
          fontSize:14,
          marginLeft:5,
          marginRight:5,
          marginBottom:10
      },
  
      imageLayout:{
          width:60,height:60
      },
  
      titleStyle:{
          color:'white',
          fontSize:16,
          flexWrap:'wrap',
          textAlign:'center'
      }
});


const mapStateToProps = state => {
    return { instituteId: state.teacherInfo.InstituteId, 
            fname: state.teacherInfo.FirstName,
            lname: state.teacherInfo.LastName,
            mobileNumber: '', 
            emailID: state.teacherInfo.EmailID, 
            teacherImageData: state.teacherInfo.PhotoPath, 
    };
};

export default connect(mapStateToProps, { ActionAddTeacher , ActionDeleteTeacher}) (DashboardWnd);

