import React,{Component} from 'react';
import {
    View, Alert, Keyboard,
    StyleSheet, Dimensions,Platform,Image,TouchableOpacity
} from 'react-native';

import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Item, Input, Form,
    Label, Toast, Thumbnail
} from "native-base";
import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';
import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';
import AsyncStorage from '@react-native-community/async-storage';

import NetInfo from "@react-native-community/netinfo";
import HTTPRequestMng from './HTTPRequestMng'

export default class ProfileScreen extends Component{
    constructor(props){
        super(props)
        this.state = {name:'',firstname:'',lastname:'',schoolname:'',loading:false,teacherImageData:'',usernmae :'',address :'',countryname :'',statename :'',cityname :'',Address2 :'',CountryC :'',StateC :'',CityC :'',PincodeC :'',Photo :'',Email :'',Contact :'',Mobile :'',userid :'',contactperson :'',Pincode:'',PhotoURL:''
        }
    }

    componentDidMount(){
        this.getTeacherProfileDetails()
    }

    changeLoadingStatus(isShow) {
        this.setState({ loading: isShow })
    }

    getTeacherProfileDetails = async() => {
        let RoleID = await AsyncStorage.getItem("RoleID");
        let LoginID = await AsyncStorage.getItem("LoginID");
        let InstituteId = await AsyncStorage.getItem("InstituteId");
        console.log(RoleID,LoginID)
        NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) {
         this.changeLoadingStatus(true);
          const obj = new HTTPRequestMng('', 'GetProfile', this);
          obj.executeRequest("LoginId=" + LoginID + "&RoleId=" + RoleID+"&InstituteId="+InstituteId);
        }
        else {
            this.changeLoadingStatus(false);
          Alert.alert('Message', 'No internet Connection, Please try again after some time.');
        }
      });
    }

    onHTTPResponseProfile(respData){
        try{
            console.log("COMINGRESPONSES",respData[0].Status) 
            let status = respData[0].Status
            let data = respData[0].Data
             console.log("COMINGRESPONSES",data) 
         
              const respJSON = respData;
            //   const status = jsonRec['Message'];
            if (status == 1) {
                let usernmae  = data[0].Username
                let address = data[0].Address
                let countryname = data[0].countryname
                let statename = data[0].statename
                let cityname = data[0].cityname
                let Address2 = data[0].Address2
                let CountryC = data[0].CountryC
                let StateC = data[0].StateC
                let CityC = data[0].CityC
                let PincodeC = data[0].PincodeC
                let Photo = data[0].Photo
                let PhotoURL = data[0].PhotoPath
                let Email = data[0].Email
                let Contact = data[0].Contact
                let Mobile = data[0].Mobile
                let userid = data[0].userid
                let Pincode = data[0].Pincode
                let contactperson = data[0].contactperson
                console.log("nanna",usernmae)
                this.setState({loading : false,usernmae : usernmae,address : address,countryname : countryname,statename : statename,cityname : cityname,Address2 : Address2,CountryC : CountryC,StateC : StateC,CityC : CityC,PincodeC : PincodeC,Photo : Photo,Email : Email,Contact : Contact,Mobile : Mobile,userid : userid,contactperson : contactperson,Pincode:Pincode,PhotoURL:PhotoURL
                })
            }else{
                this.setState({loading : false
                })
            }
        }catch(err){

        }
    }

    onHTTPError() {
        if(!this._isMounted) return;

        this.changeLoadingStatus(false)
        Alert.alert('Reset Password', 'Unable to connect with server, Please try after some time')
    }

    onScreenRefresh(){
        this.getTeacherProfileDetails()
    }
    render(){
        const childWidth = (screenWidth /
                    (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : (isTablet ? 2 : 1.5)));
         let imageIcon = "data:image/png;base64,"+this.state.Photo
        return(
             <Container style={{ backgroundColor: 'white' }}>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title> Profile </Title>
                    </Body>
                    <Right><TouchableOpacity onPress={() => this.props.navigation.navigate('UpdateProfileWnd',{
                        'onScreenRefresh': this.onScreenRefresh.bind(this),
                        'Object':this,
                    })}>
                        <Text style={{color:appColor.white}}>Edit</Text>
                    </TouchableOpacity></Right>
                </Header>

                <Content>
                    

                    <View style={{ width: childWidth, alignSelf: 'center' ,flex:1}}>
                        <View style={{flex:1}}>
                            <View style={{height:100,backgroundColor:appColor.colorPrimary}}>
                                <View style={layoutDesign.parentPhotoFrame}>
                            <Image source={this.state.Photo == '' || this.state.Photo == null ? require("../../assets/outline_perm_identity_black_48dp.png")
                                : { uri:imageIcon }} style={layoutDesign.parentPhoto} />
                            </View>
                            <View style={{backgroundColor:appColor.colorPrimary,height:1,margin:15}}></View>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:20}}>
                                <Text style={{width:'40%'}}>User Name</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.usernmae == null ? '' : this.state.usernmae}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Corresponding Address</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.address == null ? '' : this.state.address}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Country</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.countryname == null ? '' : this.state.countryname}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>State</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.statename == null ? '' : this.state.statename}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>City</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.cityname == null ? '' : this.state.cityname}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Pincode</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.Pincode == null ? '' : this.state.Pincode}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Permanent Address</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.Address2 == null ? '' : this.state.Address2}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Country</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.CountryC == null ? '' : this.state.CountryC}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>State</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.StateC == null ? '' : this.state.StateC}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>City</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.CityC == null ? '' : this.state.CityC}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Pincode</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.PincodeC == null ? '' : this.state.PincodeC}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Phone</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.Contact == null ? '' : this.state.Contact}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Mobile</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5}}>{this.state.Mobile == null ? '' : this.state.Mobile}</Text>
                            </View>
                            <View style={{flexDirection:'row',alignSelf:'center',justifyContent:'center',flex:1,marginLeft:35,marginTop:10}}>
                                <Text style={{width:'40%'}}>Email ID</Text>
                                <Text style={{marginLeft:2,marginRight:2}}>:</Text>
                                <Text style={{width:'60%',marginLeft:5,marginLeft:5}}>{this.state.Email == null ? '' : this.state.Email}</Text>
                            </View>
                        </View>
                    </View>
                </Content>

                <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%' }}
                    showProgress={true}
                    progressSize="large"
                    message="Loading, Please wait..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={false}
                />
            </Container>
        )
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
        padding: 1,
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
