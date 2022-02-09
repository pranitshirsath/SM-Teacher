import React from 'react';
import {View, StyleSheet,  StatusBar, FlatList, Alert, ActivityIndicator,Platform} from 'react-native';
import { SearchBar } from 'react-native-elements';

import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Item, Input, Form,
} from "native-base";

import {AsyncStorage} from 'react-native'
import appColor from '../config/color.json'
import NetInfo from "@react-native-community/netinfo";
import HTTPRequestMng from "./HTTPRequestMng";
import { TouchableOpacity } from 'react-native-gesture-handler';
import SplashScreen from '../SplashScreen.js';
import { connect } from 'react-redux';
import { ActionAddTeacher, ActionDeleteTeacher } from '../redux_reducers/TeacherInfoReducer';
import Moment from 'moment';

 class InstituteListWnd2 extends React.Component 
{
  constructor (props) 
  {
    super(props)
    this.state = {
      loading: false,
      searchName:'',
      recordInstituteList:[],
      searchInstituteList:[],
      listAvailable: false,
      username: '',
      password: '',
      dashboardObj:null,
      search:'Search Here...'
    }
    this.searchFilterFunction = this.searchFilterFunction.bind(this);
  }

  componentDidMount() 
  {
      StatusBar.setBackgroundColor(appColor.colorPrimaryDark);
  }

  async componentWillMount(){
    this.state.recordInstituteList = this.props.navigation.getParam('InstituteList',null);
    this.state.searchInstituteList =  this.props.navigation.getParam('InstituteList',null);;
    console.log('RecordListss',JSON.stringify(this.state.recordInstituteList));
    this.state.username = this.props.navigation.getParam('Username','');
    this.state.password = this.props.navigation.getParam('Password','');
    //this.onDirectLoginPerform( this.state.username,this.state.password,6);
  }

 getSchoolList () 
  {
     this.changeLoadingStatus(true);
     const obj = new HTTPRequestMng('', 'InstituteList', this)
     obj.executeRequest('');
  }
  
 GetItem(item) {
   // Alert.alert(item);
  }

  renderHeader = () => {    
    return (      
      <SearchBar   
        lightTheme        
        round     
        autoFocus={false}   
        onChangeText={text => this.searchFilterFunction(text,this.state.recordInstituteList)}
        autoCorrect={true}   
        placeholderTextColor={"#FFFFFF"}    
        value = {this.state.search}      
      />    
    );  
  };

  searchFilterFunction = (text,arrayData)=> {    
    
    const newData = arrayData.filter(item => {      
      const itemData = `${item.InstituteName.toUpperCase()}   
      ${item.InstituteName.toUpperCase()} ${item.InstituteName.toUpperCase()}`;
      
       const textData = text.toUpperCase();
        
       return itemData.indexOf(textData) > -1;    
    });
    console.log('searched array',JSON.stringify(newData));
  this.setState({searchInstituteList: newData,search:text});  
  };

   onHTTPError() 
  {
      this.changeLoadingStatus(false);
      Alert.alert('Oops', 'Unable to connect with server, Please try after some time');
  }

  async onHTTPReponseDirectLogin(respData)
  {
        try {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];
            console.log(JSON.stringify(jsonRec));
            if (status == 'Success') 
            {
                const data = jsonRec['Data'][0];
                let emailID = data['Email']== ""?"": data['Email'];
                let firstName = data['F_Name']== ""?"": data['F_Name'];
                let middleName = data['M_Name']== ""?"": data['M_Name'];
                let lastName = data['L_Name']== ""?"": data['L_Name'];
                let DOJ = data['DOJ']== ""?"": data['DOJ'];
                let DOB = data['DOB']== ""?"": data['DOB'];
                let EmployeeNo = data['EmployeeNo']== ""?"": data['EmployeeNo'];
                let BarcodePath = data['BarcodePath']== ""?"": data['BarcodePath'];
                let PhotoPath = data['PhotoPath']== ""?"": data['PhotoPath'];
                let SessionYear = data['SessionYear']== ""?0: data['SessionYear'];
                let SessionStartMonth = data['AS_StartMonth']== ""?1: data['AS_StartMonth'];
                let temp_month = String(SessionStartMonth);
                let temp_year = String(SessionYear);
                if(SessionStartMonth<10){
                  temp_month = '0'+temp_month;
                }
                
                var startD = temp_year+'-'+temp_month +'-'+'01';
                console.log('start date',startD);
                var minDate = Moment(startD, 'YYYY-MM-DD');
                var maxdate = Moment(minDate)
                .add(12, 'months')
                .format('YYYY-MM-DD');
                var day = Moment(maxdate).format('DD');
                var month = Moment(maxdate).format('YYYY-MM-');
                var final_date = month + day;

                AsyncStorage.setItem('AutoTrainerId', String(data['AutoTrainerId']));
                AsyncStorage.setItem('InstituteId', String(data['InstituteId']));
                AsyncStorage.setItem('EmailID', emailID);
                AsyncStorage.setItem('FirstName', firstName);
                AsyncStorage.setItem('MiddleName', middleName);
                AsyncStorage.setItem('LastName', lastName);
                AsyncStorage.setItem('DOJ', DOJ);
                AsyncStorage.setItem('DOB', DOB);
                AsyncStorage.setItem('EmployeeNo', EmployeeNo);
                AsyncStorage.setItem('BarcodePath', BarcodePath);
                AsyncStorage.setItem('PhotoPath', PhotoPath);
                AsyncStorage.setItem('IsLogin', "true");
                AsyncStorage.setItem('SessionYear', String(SessionYear));
                AsyncStorage.setItem('SessionStartMonth', String(SessionStartMonth));
                AsyncStorage.setItem('minDate', String(minDate));
                AsyncStorage.setItem('maxDate', String(maxdate));




     let AutoTrainerId = await AsyncStorage.getItem("AutoTrainerId");
     let InstituteId = await AsyncStorage.getItem("InstituteId");
     let EmailID = await AsyncStorage.getItem("EmailID");
     let FirstName = await AsyncStorage.getItem("FirstName");
     let MiddleName = await AsyncStorage.getItem("MiddleName");
     let LastName = await AsyncStorage.getItem("LastName");
     let doj = await AsyncStorage.getItem("DOJ");
     let dob = await AsyncStorage.getItem("DOB");
     let Employeeno = await AsyncStorage.getItem("EmployeeNo");
     let Barcodepath = await AsyncStorage.getItem("BarcodePath");
     let Photopath = await AsyncStorage.getItem("PhotoPath");
     let IsLogin = await AsyncStorage.getItem("IsLogin");
     let Sessionyear=await AsyncStorage.getItem("SessionYear");
     let SessionstartMonth=await AsyncStorage.getItem("SessionStartMonth");

      AutoTrainerId=AutoTrainerId==null?"":AutoTrainerId;
      InstituteId=InstituteId==null?"":InstituteId;
      EmailID=EmailID==null?"":EmailID;
      FirstName=FirstName==null?"":FirstName;
      MiddleName=MiddleName==null?"":MiddleName;
      LastName=LastName==null?"":LastName;
      doj=doj==null?"":doj;
      dob=dob==null?"":dob;
      Employeeno=Employeeno==null?"":Employeeno;
      Barcodepath=Barcodepath==null?"":Barcodepath;
      Photopath=Photopath==null?"":Photopath;
      IsLogin=IsLogin==null?"":IsLogin;
      Sessionyear=Sessionyear==null?0:Sessionyear;
      SessionstartMonth=SessionstartMonth==null?"1":SessionstartMonth;


     //Update teacher info into global status
      this.props.ActionAddTeacher({
         AutoTrainerId: AutoTrainerId, InstituteId: InstituteId, EmailID: EmailID, FirstName: FirstName,
         MiddleName: MiddleName, MiddleName: MiddleName, LastName: LastName,
         DOJ: doj, DOB: dob, EmployeeNo: Employeeno,
         BarcodePath: Barcodepath, PhotoPath: Photopath, 
         IsLogin: IsLogin, SessionYear:Sessionyear,SessionStartMonth:SessionstartMonth
        });

                //open splash screen again
                // this.state.dashboardObj.onScreenRefresh();
                
                // this.props.navigation.goBack();
                this.props.navigation.navigate('DashboardWnd'); 

            } else {
                this.changeLoadingStatus(false)
                Alert.alert('Oops', 'Invalid Username or Password',
                [
                  {
                    text: 'Ok',
                    onPress: () => {
                      this.props.navigation.navigate('LoginScreen');
                    },
                  },
                ],
                );
            }        
        } catch (error) { 
          this.changeLoadingStatus(false)
        // console.log(error);
          Alert.alert('Oops', 'Failed to login. Please try again.',
          [
            {
              text: 'Ok',
              onPress: () => {
                this.props.navigation.navigate('LoginScreen');
              },
            },
          ],
          );
        }
    }


    onDirectLoginPerform(contactNo,password,instituteId)
  {


    

    
      if(contactNo!='' && password!='' && instituteId!=undefined) 
      {
        

        NetInfo.isConnected.fetch().then((isConnected) => {
          if (isConnected) 
          {
            this.changeLoadingStatus(true)
                // const obj = new HTTPRequestMng('', 'Login', this);
              
                // obj.executeRequest("contactno="+ String(this.state.username).trim()+"&password="+ String(this.state.password).trim());
               // this.changeLoadingStatus(true)
                const obj = new HTTPRequestMng('', 'teacher_direct_login', this);
              
                obj.executeRequest("contactno="+ String(contactNo).trim()+"&password="+ String(password).trim()+"&InstituteId="+instituteId);
          }
          else
          {
              this.changeLoadingStatus(false);
              Alert.alert('Message', 'No internet Connection, Please try again after some time.');
          }
         });

        }else{
          Alert.alert('Message', 'Something went wrong, Please try again after some time.');
        }
  }


   

  changeLoadingStatus(isShow) {this.setState({ loading: isShow })}

  
  render() 
  {
 
   // this.state.dashboardObj = this.props.navigation.getParam('Object',null);
    console.log('Searched text',this.state.search);
      return (
      <Container>
                <Header  style={{backgroundColor: appColor.colorPrimary}} >
                    <Left>
                        <Button transparent
                            onPress={() => this.props.navigation.goBack()}>
                            <Icon name="close" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Select Institute</Title>
                    </Body>  
                </Header>
                <View style={layoutDesign.container}>
                  {/* <Item
                    regular
                    style={[layoutDesign.inputBoxLayout]} >
                    <Icon name='search'/>
                    <Input
                      placeholderTextColor='black'
                      returnKeyType='done'
                      onChangeText={(text) => this.setState({ searchName: text })}/>
                  </Item> */}
                   <SearchBar
                      placeholder=   {this.state.search}   
                      platform = {Platform.OS=='android'?'android':'ios'}     
                      round  
                      containerStyle = {layoutDesign.inputBoxLayout2}
                      onChangeText={text => this.searchFilterFunction(text,this.state.recordInstituteList)}
                      onClear = {()=>{
                        this.setState({searchInstituteList:this.state.recordInstituteList,search:'Search Here...'});
                        }}
                      autoCorrect={false}   
                      placeholderTextColor={"#000000"}    
                    />  
                  <FlatList
                      data={this.state.searchInstituteList}
                      renderItem={({item, index}) => <TouchableOpacity onPress={()=>{this.onDirectLoginPerform(this.state.username,this.state.password,item.InstituteID)}}><Text style={layoutDesign.item} onPress={this.GetItem.bind(this, item.InstituteID)} > {item.InstituteName} </Text></TouchableOpacity>}
                      keyExtractor={(item, index) => index.toString()}
                    />
                     <ActivityIndicator animating={this.state.loading} />
                </View>
      </Container>
    ); 
  }
}



const layoutDesign = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColor.grey_background
  },
  formLayout: {
    alignSelf: 'stretch',
    padding: 10,
    paddingTop: 25,
    paddingBottom: 25,
    borderRadius: 10,
    backgroundColor: appColor.backgroundLayoutTrans
  },
  inputBoxLayout:
   {
    borderRadius: 0,
    backgroundColor: appColor.white,
    padding: 5,
    marginLeft: 10,
    marginRight: 10,
    marginTop:10,
    marginBottom:10
  },
  inputBoxLayout2:
   {
    
    marginLeft: 6,
    marginRight: 6,
    marginTop:6,
    marginBottom:6,
    height:50
  },
   item: {
    paddingLeft: 10,
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10,
    marginBottom:1,
    backgroundColor: appColor.white,
    alignItems: 'center'
  }
 
})

const mapStateToProps = state => ({
  instituteID: state.teacherInfo.InstituteId
});

export default connect(mapStateToProps, { ActionAddTeacher})(InstituteListWnd2);
