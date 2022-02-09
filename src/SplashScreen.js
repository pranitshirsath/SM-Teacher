/**
    * @description      : 
    * @author           : Administrator
    * @group            : 
    * @created          : 12/01/2022 - 17:58:21
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 12/01/2022
    * - Author          : Administrator
    * - Modification    : 
**/
import React from 'react';
import { StyleSheet, Text, View, Button, StatusBar,Linking,ActivityIndicator,Platform } from 'react-native';
import appColor from './config/color.json';
import {ImageBackground} from 'react-native'
import {Container,Thumbnail} from 'native-base'
import AsyncStorage from '@react-native-community/async-storage';
import { requestStoragePermission } from './utils/PermissionRequest'

import { connect } from 'react-redux';
import { ActionAddTeacher } from './redux_reducers/TeacherInfoReducer'
import {initializeZoomSDK,createAccessToken} from '../src/zoom/config';
import {checkUser,fetchUserId} from '../src/zoom/apis';
import {zoom_admin_user,GET_SCHOOL_LOGO} from '../src/config/AppConst'
import RNFS from 'react-native-fs'
const logoStartURL = 'https://schoolmagica.com/osm'
import NetInfo from '@react-native-community/netinfo'

class SplashScreen extends React.Component 
{
  constructor(props){
    super(props);
    this.state = {
      logourl: 'dummy',
      instituteShortCode:''
    }
  }

  async componentDidMount() {
      StatusBar.setBackgroundColor(appColor.colorPrimaryDark);
      // try
      // {
      //   let status =  await initializeZoomSDK();
      //   console.log('Initialized',status);
      //   if(status!='' && status!='error' && status!='caughtError')
      //   await AsyncStorage.setItem('zoomInitialized','1');
      //   else
      //   await AsyncStorage.setItem('zoomInitialized','0');
      //   await createAccessToken();
      //   this.manageZoomAccount();
      // }catch(error){
      //   console.log(error);
      // }
      this.checkIfEnvelopeApp();
  }

  async  manageZoomAccount(){
    let accessToken = await AsyncStorage.getItem('zoomAccessToken');
    console.log('TokenforZoom',accessToken);
    if(accessToken!='null' && accessToken!=undefined){
       console.log('TokenforZoom2');
        let status = await checkUser(zoom_admin_user,accessToken);
        console.log('zoomUserExists',status);
        if(status!='' &&  status!='error' && status!='Network error' && status!=undefined){
           if(status){
               //console.log('TokenforZoom3');
              var userId = await fetchUserId('avinash.moharil@techior.com',accessToken);
           console.log('zoomxzAccessId',userId);
           if(userId!=0){
             await AsyncStorage.setItem('ZoomUserId',userId);
           }
          }
        }
    }
}

 checkForLogin = async () => 
 {
     let AutoTrainerId = await AsyncStorage.getItem("AutoTrainerId");
     let InstituteId = await AsyncStorage.getItem("InstituteId");
     let EmailID = await AsyncStorage.getItem("EmailID");
     let FirstName = await AsyncStorage.getItem("FirstName");
     let MiddleName = await AsyncStorage.getItem("MiddleName");
     let LastName = await AsyncStorage.getItem("LastName");
     let DOJ = await AsyncStorage.getItem("DOJ");
     let DOB = await AsyncStorage.getItem("DOB");
     let EmployeeNo = await AsyncStorage.getItem("EmployeeNo");
     let BarcodePath = await AsyncStorage.getItem("BarcodePath");
     let PhotoPath = await AsyncStorage.getItem("PhotoPath");
     let IsLogin = await AsyncStorage.getItem("IsLogin");
     let SessionYear=await AsyncStorage.getItem("SessionYear");
     let SessionStartMonth=await AsyncStorage.getItem("SessionStartMonth");

      AutoTrainerId=AutoTrainerId==null?"":AutoTrainerId;
      InstituteId=InstituteId==null?"":InstituteId;
      EmailID=EmailID==null?"":EmailID;
      FirstName=FirstName==null?"":FirstName;
      MiddleName=MiddleName==null?"":MiddleName;
      LastName=LastName==null?"":LastName;
      DOJ=DOJ==null?"":DOJ;
      DOB=DOB==null?"":DOB;
      EmployeeNo=EmployeeNo==null?"":EmployeeNo;
      BarcodePath=BarcodePath==null?"":BarcodePath;
      PhotoPath=PhotoPath==null?"":PhotoPath;
      IsLogin=IsLogin==null?"":IsLogin;
      SessionYear=SessionYear==null?0:SessionYear;
      SessionStartMonth=SessionStartMonth==null?"1":SessionStartMonth;

      
     //Update teacher info into global status
      this.props.ActionAddTeacher({
         AutoTrainerId: AutoTrainerId, InstituteId: InstituteId, EmailID: EmailID, FirstName: FirstName,
         MiddleName: MiddleName, MiddleName: MiddleName, LastName: LastName,
         DOJ: DOJ, DOB: DOB, EmployeeNo: EmployeeNo,
         BarcodePath: BarcodePath, PhotoPath: PhotoPath, 
         IsLogin: IsLogin, SessionYear:SessionYear,SessionStartMonth:SessionStartMonth
        });

      //console.info("isLogin", IsLogin);
      if(IsLogin ==null)
          IsLogin=false;

      try{
          if(IsLogin){
              this.props.navigation.navigate('DashboardWnd', {
                'onScreenRefresh': this.onScreenRefresh.bind(this)
              }); 
          }
           else
            {
               this.props.navigation.navigate('LoginScreen', {
                'onScreenRefresh': this.onScreenRefresh.bind(this),
                'Object':this,
              });
            }
      }catch(error)
      {
        
      }
  }


  onScreenRefresh() {
        setTimeout(() => {
               this.checkForLogin();
        }, 100);
  }

  checkIfEnvelopeApp () {
    setTimeout(() => {
      Linking.getInitialURL()
        .then(url => {
          if (url) {
            console.log("URL",url)
            var shortCode = url.replace('com.schoolmagica://app?shortCode=', '')
            this.setState(
              {
                instituteShortCode: shortCode
              },
              () => {
                this.getInstituteLogoFromServer()
              }
            )
          } else {
            this.readLocalFile()
          }
        })
        .catch(err => console.error('An error occurred', err))
    }, 100)
  }

  readLocalFile () {
    const filePath = RNFS.DownloadDirectoryPath + '/SchoolShortCode.txt'
    console.log("rrrr",filePath)
    requestStoragePermission().then(granted => {
      if (granted) {
        RNFS.readFile(filePath, 'utf8')
          .then(content => {
            if (content) {
              console.log("contentte",content)
              let _instituteShortCode = content.replace(
                'Do not delete this file, we will read short code as ',
                ''
              )
              console.log("contentte23",_instituteShortCode)
              this.setState(
                {
                  isInstituteModalOpen: false,
                  instituteShortCode: _instituteShortCode
                },
                () => {
                  this.getInstituteLogoFromServer()
                }
              )
            } else {
                            console.log("ppppppppppppp")

              return this.setState({
                isInstituteModalOpen: true
              })
            }

            // Do what you need if the file exists
          })
          .catch(err => {
          console.log("ppppppppppppp555555555555")

            this.setState({
                logourl: "show sm_logo",
                loading: false,
                isInstituteModalOpen: true

              })

              setTimeout(
                () => {
                    if (Platform.OS == 'android') {
                    this.checkForLogin()
                    } else {
                    this.checkForLogin()
                    }
                },
                5000
              )

            console.log(err.message, err.code)
          })
      }
    })
  }

  getInstituteLogoFromServer = async AssignmentId => {
    try {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (isConnected) {
          //this.changeLoadingStatus(true)
          var myHeaders = new Headers()
          myHeaders.append('Content-Type', 'application/json')

          var raw = ''

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          }
          console.log("dddd",GET_SCHOOL_LOGO + this.state.instituteShortCode)
          fetch(GET_SCHOOL_LOGO + this.state.instituteShortCode, requestOptions)
            .then(response => response.text())
            .then(result => {
              console.log('RESPONSS', JSON.stringify(result))
              let path = result.replace(/<[^>]+>/g, '')
              console.log('resulttssssss', path)
              let sss = path.split(':')
              console.log('first')
              let actualpath = sss[1].replace('}', '')
              let logopath = actualpath.replace(/['"]+/g, '')
              let actualLogoUrl = logoStartURL + logopath
               let avilablcheck = logopath.replace(/ /g, '')
              var stringva = "_"+avilablcheck;
              let logo = actualLogoUrl.replace(/\s/g, '')
              var RandomNumber = Math.floor(Math.random() * 10000) + 1 ;
              let generatedURL = logo+'?varyy='+RandomNumber
              console.log('finalPath', logo)
              if(stringva.includes('LogoAvailable')){
                console.log("WORRRJRJR")
                 this.setState({
                logourl: "show sm_logo",
                loading: false
              })
              }else{
                 this.setState({
                logourl: logo+"?v="+RandomNumber,
                loading: false
              })
              }
              setTimeout(
                () => { this.checkForLogin()},
                5000
              )
              
            })
            .catch(error => console.log('error', error))
        } else {
          this.setState({ loading: false, listLoadAttempted: true })
          Alert.alert('Oops', 'No internet connection')
        }
      })
    } catch (error) {}
  }


  render() 
  {
    return (
         <Container style={{backgroundColor:'#04bcc1'}}>
        {this.state.logourl == 'dummy' ? 
        <View style={{alignItems:'center',justifyContent:'center',flex:1}}>
        <ActivityIndicator
            style={{ marginTop: 50 }}
            size='small'
            color={appColor.colorAccent}
          />
        </View> :  this.state.logourl == 'show sm_logo' ? 
        <ImageBackground
          source={require('../assets/splash.jpg')}
          style={{ flex: 1 }}
        ></ImageBackground> :
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignSelf: 'center'
          }}
        >
            {this.state.logourl == 'dummy' ? (
                 <View></View>
                  
                ) : this.state.logourl == 'show sm_logo' ? 
                 <Thumbnail
                    square
                    large
                    source={require('../assets/app_logo_login.png')}
                    style={{
                      alignSelf: 'center',
                      resizeMode: 'contain',
                      width: 150,
                      height: 150
                    }}
                  /> : (
                  <Thumbnail
                    square
                    large
                    source={{ uri: this.state.logourl }}
                    style={{
                      alignSelf: 'center',
                      resizeMode: 'contain',
                      width: 150,
                      height: 150
                    }}
                  />
                )}
          <ActivityIndicator
            style={{ marginTop: 50 }}
            size='small'
            color={appColor.colorAccent}
          />
        </View> }
        
       
      </Container>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});

const mapStateToProps = state => ({
    instituteID: state.teacherInfo.InstituteId
});
export default connect(mapStateToProps, { ActionAddTeacher})(SplashScreen);