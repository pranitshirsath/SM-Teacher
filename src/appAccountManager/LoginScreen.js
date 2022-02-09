import React from 'react'
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
  StatusBar,
  Keyboard,
  FlatList,Linking,Modal as RNModal,
} from 'react-native'

import {
  Container,
  Header,
  Title, View,
  Content,
  Button,
  Icon,
  Thumbnail,
  Text,
  Body,
  Right,
  Item,
  Input,
  Form,
  Subtitle,
  Toast,
  ActionSheet,
  Left,
  Picker
} from 'native-base'


import appColor from '../config/color.json'
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import HTTPRequestMng from "./HTTPRequestMng";
import AwesomeAlert from 'react-native-awesome-alerts';
import Dialog from "react-native-dialog";
import RNFS from 'react-native-fs'
const logoStartURL = 'https://schoolmagica.com/osm'
import { requestStoragePermission } from '../utils/PermissionRequest'
import { Webservice_URL, GET_SCHOOL_LOGO } from '../config/AppConst'

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      loading: false,
      hidePassword: true,
      showToast: false,
      selected: undefined,
      institute_list: [],
      instituteDialog_visible: false,
      dashboardObj: null,logourl: 'dummy',
      instituteShortCode: '',emailID:'',firstName:'',middleName :'',lastName :'',DOJ :'',DOB :'',EmployeeNo :'',BarcodePath :'',PhotoPath :'',SessionYear :'',SessionStartMonth :'',isExitConfirmationAvailable: false,
    }
  }

  componentDidMount() {
    StatusBar.setBackgroundColor(appColor.colorPrimaryDark);
    this.checkIfEnvelopeApp()
  }

  onValueChange(value) {
    this.setState({ selected: value })
  }

  toggleShowPassword() {
    this.setState({ hidePassword: !this.state.hidePassword })
  }

  changeLoadingStatus(isShow) {
    this.setState({ loading: isShow })
  }


  onHTTPError() {
    this.changeLoadingStatus(false);
    Alert.alert('Message', 'Unable to connect with server, Please try again after some time');

  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#E0E0E0',
        }}
      />
    );
  };

  goToInstituteListWnd() {
    //open InstituteList screen
    this.props.navigation.navigate('InstituteListWnd');
  }

  onDirectLoginPerform(contactNo, password, instituteId) {


    if (contactNo != '' && password != '' && instituteId != undefined) {
      // this.props.navigation.navigate('DashboardWnd');

      this.changeLoadingStatus(true)
      // const obj = new HTTPRequestMng('', 'Login', this);

      // obj.executeRequest("contactno="+ String(this.state.username).trim()+"&password="+ String(this.state.password).trim());
      // this.changeLoadingStatus(true)
      const obj = new HTTPRequestMng('', 'teacher_direct_login', this);

      obj.executeRequest("contactno=" + String(contactNo).trim() + "&password=" + String(password).trim() + "&InstituteId=" + instituteId);
    }
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
    requestStoragePermission().then(granted => {
      if (granted) {
        RNFS.readFile(filePath, 'utf8')
          .then(content => {
            if (content) {
              let _instituteShortCode = content.replace(
                'Do not delete this file, we will read short code as ',
                ''
              )
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
              return this.setState({
                isInstituteModalOpen: true
              })
            }
            // Do what you need if the file exists
          })
          .catch(err => {
            this.setState({
                logourl: "show sm_logo",
                loading: false,
                isInstituteModalOpen: true

              })
            console.log(err.message, err.code)
          })
      }
    })
  }

  getInstituteLogoFromServer = async AssignmentId => {
    console.log('ID', this.state.instituteShortCode)
    try {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (isConnected) {
          this.changeLoadingStatus(true)
          var myHeaders = new Headers()
          myHeaders.append('Content-Type', 'application/json')
          var raw = ''
          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          }

          fetch(GET_SCHOOL_LOGO + this.state.instituteShortCode, requestOptions)
            .then(response => response.text())
            .then(result => {
              console.log("RESULT",result)
              let path = result.replace(/<[^>]+>/g, '')
              let sss = path.split(':')
              let actualpath = sss[1].replace('}', '')
              let logopath = actualpath.replace(/['"]+/g, '')
              let actualLogoUrl = logoStartURL + logopath
              let logo = actualLogoUrl.replace(/\s/g, '')
              var RandomNumber = Math.floor(Math.random() * 10000) + 1
              let avilablcheck = logopath.replace(/ /g, '')
              var stringva = "_"+avilablcheck;
              let generatedURL = logo + '?v=' + RandomNumber
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
            })
            .catch(error => console.log('error', error))
        } else {
          this.setState({ loading: false, listLoadAttempted: true })
          Alert.alert('Oops', 'No internet connection')
        }
      })
    } catch (error) {}
  }


  onLoginPerform() {

    if (this.state.username == '') {
      Toast.show({
        text: "Please Enter Username!",
        type: "warning"
      })
    }
    else if (this.state.password == '') {
      Toast.show({
        text: "Please Enter Password!",
        buttonText: "",
        type: "warning"
      })
    }
    else {

      NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) {
          this.changeLoadingStatus(true);
          const obj = new HTTPRequestMng('', 'Login', this);
          obj.executeRequest("contactno=" + String(this.state.username).trim() + "&password=" + String(this.state.password).trim());
        }
        else {
          Alert.alert('Message', 'No internet Connection, Please try again after some time.');
        }
      });
      // this.props.navigation.navigate('DashboardWnd');
      // this.changeLoadingStatus(true)
    }
    this.changeLoadingStatus(false);
  }

  // manage dialog 
  setDilaog = () => {
    this.setState({ instituteDialog_visible: !this.state.instituteDialog_visible });
  }

  //  school selection dialog added by Nitin Bhoyar on 18/02/2020
  selectSchool = (data) => {
    console.log("DATAAAAAAA",data)
    return (
      <Dialog.Container visible={this.state.instituteDialog_visible}>
        <View style={{ alignItems: 'center', height: 100 }}>
          <Text style={{ position: 'absolute', top: 0, alignSelf: 'center', fontWeight: '900', fontSize: 15 }}>Select Institute</Text>
          <FlatList
            style={{ marginTop: 10 }}
            data={data}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{ backgroundColor: 'white' }}
                onPress={() => {
                  // this.onDirectLoginPerform(this.state.username,this.state.password,this.state.institute_list[index].InstituteId);
                  this.onLoginPerform(this.state.username, this.state.password);
                  // this.setDilaog();
                }
                }>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 15 }}>{data[index].institutename}</Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={this.renderSeparator}
          />
          <TouchableOpacity onPress={() => { this.setDilaog }} style={{ position: 'absolute', bottom: 0, alignSelf: 'flex-end', marginRight: 10 }}>
            <Text style={{ fontWeight: '800', fontSize: 15 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Dialog.Container>
    );
  }

  onHTTPReponseDirectLogin(respData) {
    try {
      console.log(respData)
      const jsonRec = respData[0];
      const status = jsonRec['Message'];
      if (status == 'Success') {
        const data = jsonRec['Data'][0];
        let emailID = data['Email'] == "" ? "" : data['Email'];
        let firstName = data['F_Name'] == "" ? "" : data['F_Name'];
        let middleName = data['M_Name'] == "" ? "" : data['M_Name'];
        let lastName = data['L_Name'] == "" ? "" : data['L_Name'];
        let DOJ = data['DOJ'] == "" ? "" : data['DOJ'];
        let DOB = data['DOB'] == "" ? "" : data['DOB'];
        let EmployeeNo = data['EmployeeNo'] == "" ? "" : data['EmployeeNo'];
        let BarcodePath = data['BarcodePath'] == "" ? "" : data['BarcodePath'];
        let PhotoPath = data['PhotoPath'] == "" ? "" : data['PhotoPath'];
        let SessionYear = data['SessionYear'] == "" ? 0 : data['SessionYear'];
        let SessionStartMonth = data['AS_StartMonth'] == "" ? 1 : data['AS_StartMonth'];
        let roleID = data['roleid'];
        let loginID = data['loginid']
        console.log("DIRECTLOGINNNN",roleID,loginID)
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
        AsyncStorage.setItem('RoleID', String(roleID));
        AsyncStorage.setItem('LoginID',loginID );
        //open splash screen again
        this.props.navigation.state.params.onScreenRefresh();
        this.props.navigation.goBack();

      } else {
        this.changeLoadingStatus(false)
        Alert.alert('Message', 'Invalid Username or Password');
      }
    } catch (error) { }
  }

  async onHTTPResponseLogin(respData) {
    try {
      console.log(respData)
      const jsonRec = respData[0];
      const status = jsonRec['Message'];

      if (status == 'Success') {
        const data = jsonRec['Data'];
        console.log("DATATAT",data)
        if(data.length > 1){
          
            this.setState({
              isExitConfirmationAvailable : true,
              data : data
            })
        }else{
          const data = jsonRec['Data'][0];
          console.log("IDIDIID",data['InstituteId'], String(data['InstituteId']))
          let emailID = data['Email'] == "" ? "" : data['Email'];
          let firstName = data['F_Name'] == "" ? "" : data['F_Name'];
          let middleName = data['M_Name'] == "" ? "" : data['M_Name'];
          let lastName = data['L_Name'] == "" ? "" : data['L_Name'];
          let DOJ = data['DOJ'] == "" ? "" : data['DOJ'];
          let DOB = data['DOB'] == "" ? "" : data['DOB'];
          let EmployeeNo = data['EmployeeNo'] == "" ? "" : data['EmployeeNo'];
          let BarcodePath = data['BarcodePath'] == "" ? "" : data['BarcodePath'];
          let PhotoPath = data['PhotoPath'] == "" ? "" : data['PhotoPath'];
          let SessionYear = data['SessionYear'] == "" ? 0 : data['SessionYear'];
          let SessionStartMonth = data['AS_StartMonth'] == "" ? 1 : data['AS_StartMonth'];
          let roleID = data['roleid'];
          let loginID = data['loginid']
          console.log("NORMALLOFIN",roleID,loginID)
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
          AsyncStorage.setItem('RoleID', String(roleID));
          AsyncStorage.setItem('LoginID',loginID );
          //open splash screen again
          this.props.navigation.state.params.onScreenRefresh();
          this.props.navigation.goBack();
        }
        

      } else {
        // this.changeLoadingStatus(false)
        Alert.alert('Message', 'Invalid Username or Password');
      }
    } catch (error) {
      //this.changeLoadingStatus(false);
    }
    this.changeLoadingStatus(false);
  }

  render() {
    this.state.dashboardObj = this.props.navigation.getParam('Object', null);

    return (
      <Container>
        <ImageBackground
          source={require('../../assets/bg_login.png')}
          style={{ flex: 1 }} >
          <View style={{height:45,backgroundColor:appColor.colorPrimary}}>
          <Text style={{color:appColor.white,margin:10,fontSize:20}}>SM Teacher</Text>
          </View>
          <View style={layoutDesign.container}>
            {this.state.logourl == 'dummy' ? (
              <View></View>
            ) : this.state.logourl == 'show sm_logo' ?
             <Thumbnail
                square
                large
                source={require('../../assets/sm_logo_login.png')}
                style={{
                  alignSelf: 'center',

                  resizeMode: 'contain',
                  width: 250
                }}
               /> : (
              
              <Thumbnail
                square
                large
                source={{ uri: this.state.logourl }}
                style={{
                  alignSelf: 'center',

                  resizeMode: 'contain',
                  width: 250
                }}
              />
            )}

            <Text
              style={{
                marginTop: 5,
                marginBottom: 20,
                color: appColor.white,
                justifyContent: 'center',
                alignSelf: 'center'
              }}
            >
              | Login your Account |
            </Text>

            {/* <TouchableHighlight
              underlayColor='#00000010'
              onPress={() => this.goToInstituteListWnd()}
              style={[layoutDesign.inputBoxLayout, { marginTop: 10 , height: 50}]} >
              <View   style={[layoutDesign.dropdownLayout]}>
                <Text style={[layoutDesign.inputBoxFontStyle,{marginLeft: 5} ]}>Select School</Text>
                <Icon
                  name='arrow-dropdown'
                  style={{
                    color: appColor.white,
                    backgroundColor: '#00000000',
                    marginRight: 5
                  }}
                />
              </View>
            </TouchableHighlight> */}

            <Item
              regular
              style={[layoutDesign.inputBoxLayout, { marginTop: 10 }]} >
              <Input
                placeholder='Mobile no.'
                placeholderTextColor='white'
                returnKeyType="next"
                keyboardType='phone-pad'
                style={[layoutDesign.inputBoxFontStyle]}
                onChangeText={(text) => this.setState({ username: text })}
              />
              <Icon
                name='contact'
                style={{
                  color: appColor.white,
                  backgroundColor: '#00000000'
                }}
              />
            </Item>
            <Item
              regular
              style={[layoutDesign.inputBoxLayout, { marginTop: 10 }]} >
              <Input
                secureTextEntry={this.state.hidePassword}
                ref='passwordInput'
                placeholder='Password'
                placeholderTextColor='white'
                returnKeyType='done'
                style={[layoutDesign.inputBoxFontStyle]}
                onChangeText={(text) => this.setState({ password: text })}
              />

              <TouchableHighlight
                underlayColor='#00000010'
                style={{ alignItems: 'flex-end' }}
                onPress={() => this.toggleShowPassword()}>
                <Icon
                  name={this.state.hidePassword ? 'eye-off' : 'eye'}
                  style={{
                    color: appColor.white,
                    backgroundColor: '#00000000'
                  }} />
              </TouchableHighlight>
            </Item>
            <TouchableOpacity onPress={() => this.onLoginPerform()}>
              <Text
                style={{
                  marginTop: 10,
                  color: appColor.white,
                  height: 40,
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  backgroundColor: appColor.colorPrimary
                }}
              >
                LOGIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ForgotPassword')}>
              <Text
                style={{
                  marginTop: 15,
                  marginBottom: 20,
                  color: appColor.white,
                  justifyContent: 'center',
                  alignSelf: 'flex-end',
                  fontSize:18
                }}
              >
                Forgot password 
              </Text>
            </TouchableOpacity>
            
            {/* forget pass */}
            {/* <TouchableHighlight
              underlayColor='#00000010'
              style={{ flex: 1, alignItems: 'center' }}
              onPress={() => this.props.navigation.navigate('Login_ForgotPass')}
            >
              <Text style={{ marginTop: 5, color: appColor.white }}>
                Forgot Password?
              </Text>
            </TouchableHighlight> */}
            {/* {this.selectSchool()} */}

          </View>
            <RNModal
                    animationType='slide'
                    transparent={true}
                    // visible={true}
                    visible={this.state.isExitConfirmationAvailable}
                    onRequestClose={() => {
                        this.setState({ isModalVisible: false })
                    }}>
                <View
                    style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(52, 52, 52, 0.8)',
                    
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center'
                    }}
                >
                    <View
                    style={{
                        backgroundColor: appColor.white,
                        borderRadius: 15,
                        marginHorizontal: 10
                    }}
                    >
                    <View
                        style={{
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        height: 50,
                        backgroundColor:appColor.colorPrimary
                        }}
                    >
                        <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            height: 35,
                            fontSize: 20,
                            alignSelf: 'center',
                            color: appColor.white,
                            justifyContent: 'center',
                            marginTop: 15,
                            textDecorationStyle: 'dashed'
                        }}
                        >
                        Select Institute
                        </Text>
                        <View style={{backgroundColor:appColor.colorPrimaryDark,height:1}}></View>
                    </View>
                    {/* head of card is over started the card body */}
                    
                    <View style={{marginTop:20,height:150,width:320}}>
                    <FlatList
                        style={{ marginTop: 10 }}
                        data={this.state.data}
                        renderItem={({ item, index }) => (
                          <View>
                            <TouchableOpacity
                            style={{ backgroundColor: 'white' }}
                            onPress={() => {
                              this.setState({
                                isExitConfirmationAvailable: false
                              },() => this.onDirectLoginPerform(this.state.username,this.state.password,this.state.data[index].instituteid))
                            }
                            }>
                            <View style={{ alignItems: 'center',flexDirection:'row' }}>
                            <Thumbnail
                                square
                                small
                                source={require('../../assets/institute.jpg')}
                                style={{
                                  alignSelf: 'center',

                                  resizeMode: 'contain',
                                  width: 45,
                                }}
                              />
                              <Text style={{ fontWeight: '300', fontSize: 18 ,margin:10}}>{this.state.data[index].institutename}</Text>
                            </View>
                            
                          </TouchableOpacity>
                          <View style={{backgroundColor:appColor.colorPrimary,height:1,marginTop:5}}></View>
                          </View>
                        )}
                      />
                    </View>
                    </View>
                </View>
                </RNModal>
        </ImageBackground>
          
       {this.state.loading && <AwesomeAlert
          show={this.state.loading}
          overlayStyle={{ width: '100%', height: '100%' }}
          messageStyle={{ textAlign: 'center' }}
          showProgress={true}
          progressSize="large"
          message="Logging, Please wait..."
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={false}
        />}
      </Container>
    )
  }
}

const layoutDesign = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 60
  },
  formLayout: {
    alignSelf: 'stretch',
    padding: 10,
    paddingTop: 25,
    paddingBottom: 25,
    borderRadius: 10,
    backgroundColor: appColor.backgroundLayoutTrans
  },
  inputBoxLayout: {
    borderRadius: 0,
    borderColor: 'white',
    borderWidth: 1
  },
  inputBoxFontStyle: {
    color: 'white'
  },

  dropdownLayout: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})
