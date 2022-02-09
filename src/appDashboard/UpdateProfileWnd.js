/**
    * @description      : 
    * @author           : Administrator
    * @group            : 
    * @created          : 07/02/2022 - 10:23:06
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 07/02/2022
    * - Author          : Administrator
    * - Modification    : 
**/
import React,{Component} from 'react';
import {
    View, Alert, Keyboard,
    StyleSheet, Dimensions,Platform,Image,TouchableOpacity,CheckBox,PermissionsAndroid,FlatList,Modal as RNModal,
} from 'react-native';

import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Item, Input, Form,
    Label, Toast, Thumbnail,Footer,ActionSheet,Picker
} from "native-base";
import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';
import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import HTTPRequestMng from './HTTPRequestMng'

export default class UpdateProfileWnd extends Component{
    constructor(props){
        super(props)
        this.state = {name:'',firstname:'',lastname:'',schoolname:'',loading:false,teacherImageData:'',checkbox:false,teacherImageData:'',usernmae :'',address :'',countryname :'',statename :'',cityname :'',Address2 :'',CountryC :'',StateC :'',CityC :'',PincodeC :'',Photo :'',Email :'',Contact :'',Mobile :'',userid :'',contactperson :'',Pincode:'',displayCountries: false,displayCountriesC: false,selectedCountry:'',selectedCountryC:'',selectedState:'',selectedStateC:'',displayStates:false,displayStatesC:false,statelist:[],citylist:[],displayCitites:false,displayCititesC:false,selectedCity:'',selectedCityC:'',CurrentStateList:[],CurrentCountryList:[],CurrentCityList:[],
        countrylist:[{
            name:"India",
            id:101
        },
        {
            name:"Pakistan",
            id:201
        },
        {
            name:"Pakistan",
            id:201
        },
        {
            name:"Pakistan",
            id:201
        }]
        }
    }

    changeCheckbox(){
        let value = this.state.checkbox
            this.setState({
                checkbox : !value
            })
    }

    componentDidMount(){
        this.getTeacherProfileDetails()
        this.getCountryListFromServer()
    }

    changeLoadingStatus(isShow) {
        this.setState({ loading: isShow })
    }

    checkAppPermission = async () => {
		try {
			if (Platform.OS == 'android') {
				let permissionList = [];
				let granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
				if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.CAMERA);
				granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
				if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

				if (permissionList.length > 0) {
					//ask permission required
					const granted = await PermissionsAndroid.requestMultiple(permissionList);

					let isGranted = true;
					for (let i = 0; i < permissionList.length; i++) {
						if (granted[permissionList[i]] != PermissionsAndroid.RESULTS.GRANTED) {
							isGranted = false;
							break;
						}
					}
					if (isGranted) {
						this.performAttachmentSelection();
					} else {
						Alert.alert('Message', 'You need to enable app permission before adding attachment');
					}
				} else {
					//all granted
					this.performAttachmentSelection();
				}
			} else {
				this.performAttachmentSelection();
			}
		} catch (err) {
			console.error(err);
		}
	};


    performAttachmentSelection() {
		ActionSheet.show(
			{
				options: [
					'Take Photo...',
					'Choose photo from Gallery...',
					'Cancel',
				],
				cancelButtonIndex: 4,
				destructiveButtonIndex: 3,
			},
			(buttonIndex) => {
				const fileName = String(new Date().valueOf()) + '.jpeg';
				if (buttonIndex == 0) {
                    this.setState({
                        Photo : null
                    })
					ImagePicker.openCamera({
						width: 600,
						height: 600,
						cropping: true,
						compressImageMaxHeight: 600,
						compressImageMaxWidth: 600,
						includeBase64: true,
						mediaType: 'photo',
						enableRotationGesture: true,
                        freeStyleCropEnabled:true,
					}).then((data) => {
						console.log('filesize', String(data['data'].fileSize));
						if (data['data'].fileSize > 2048 * 1024) {
							Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
						} else {
							let fileData = data['data'];
							if (fileData.length > 0) {
								this.setState({
									Photo: fileData,
									isAttachModify: true,
									fileName: String(data['path']),
									savedFileName: fileName,
									fileExtension: '.jpeg',
								});
							}
						}
						setTimeout(() => {
							ImagePicker.clean();
						}, 0);
					});
				} else if (buttonIndex == 1) {
                    this.setState({
                        Photo : null
                    })
					ImagePicker.openPicker({
						width: 600,
						height: 600,
						cropping: true,
                        freeStyleCropEnabled:true,
						compressImageMaxHeight: 600,
						compressImageMaxWidth: 600,
						includeBase64: true,
						mediaType: 'photo',
						//enableRotationGesture: true,
					}).then((data) => {
						//  console.log( 'filesize',  String(data['data']));
						//console.log( 'filename',  String(data['path']));

						if (data['data'].fileSize > 2048 * 1024) {
							Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
						} else {
							let fileData = data['data'];
							if (fileData.length > 0) {
                                console.log("DATTATATA",fileData)
								this.setState({
									Photo: fileData,
									isAttachModify: true,
									fileName: String(data['path']),
									savedFileName: fileName,
									fileExtension: '.jpeg',
								});
							}
						}

						setTimeout(() => {
							ImagePicker.clean();
						}, 0);
					});
				}
			}
		);
	}
    getCountryListFromServer = async() => {
      
        NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) {
          const obj = new HTTPRequestMng('', 'GetCountries', this);
          obj.executeRequest();
        }
        else {
          Alert.alert('Message', 'No internet Connection, Please try again after some time.');
        }
      });
    }

    onHTTPResponseCountries(respData){
            console.log("COUNTRIESS",respData) 
            let status = respData[0].Status
            let data = respData[0].Data
             console.log("COMINGRESPONSES",data) 
             if(status == 1){
                 this.setState({
                     loading : false,
                     countrylist : data,
                     CurrentCountryList: data
                 })
             }else{
                 this.setState({
                     loading : false
                 })
             }
        console.log("STATECOUNTRIESS",this.state.countrylist)
    }

    getStateLists = async(value) => {
        console.log("Callinngngng",value)
         NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) {
          const obj = new HTTPRequestMng('', 'GetStates', this);
          obj.executeRequest("CountryId="+value);
        }
        else {
          Alert.alert('Message', 'No internet Connection, Please try again after some time.');
        }
      });
    }

    onHTTPResponseStates(respData){
        console.log("STATTSTTSTSTS",respData)
        
        console.log("COUNTRIESS",respData) 
            let status = respData[0].Status
            let data = respData[0].Data
             console.log("COMINGRESPONSES",data) 
             if(status == 1){
                 this.setState({
                     loading : false,
                     statelist : data,
                     CurrentStateList: data
                 })
             }else{
                 this.setState({
                     loading : false
                 })
             }
        console.log("STATECOUNTRIESS",this.state.statelist)
    }

    getCityLists = async(value) => {
        console.log("Callinngngng",value)
         NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) {
          const obj = new HTTPRequestMng('', 'GetCitites', this);
          obj.executeRequest("StateId="+value);
        }
        else {
          Alert.alert('Message', 'No internet Connection, Please try again after some time.');
        }
      });
    }

    onHTTPResponseCities(respData){
        console.log("STATTSTTSTSTS",respData)
            
            console.log("COUNTRIESS",respData) 
                let status = respData[0].Status
                let data = respData[0].Data
                console.log("COMINGRESPONSES",data) 
                if(status == 1){
                    this.setState({
                        loading : false,
                        citylist : data,
                        CurrentCityList: data
                    })
                }else{
                    this.setState({
                        loading : false
                    })
                }
            console.log("citylist",this.state.citylist)
    }

      getTeacherProfileDetails = async() => {
        let RoleID = await AsyncStorage.getItem("RoleID");
        let LoginID = await AsyncStorage.getItem("LoginID");
        let InstituteId = await AsyncStorage.getItem("InstituteId");
        console.log(RoleID,LoginID)
        NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) {
         
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
                let Email = data[0].Email
                let Contact = data[0].Contact
                let Mobile = data[0].Mobile
                let userid = data[0].userid
                let Pincode = data[0].Pincode
                let contactperson = data[0].contactperson
                let countryID = data[0].countryid
                let stateId = data[0].stateid
                let cityId = data[0].cityid
                let countryIDC = data[0].countryidc
                let stateIdC = data[0].stateidc
                let cityIdC = data[0].cityidc
                // if(countryIDC != null){
                //     this.getStateLists(countryID)
                // }
                // if(stateId != null){
                //     this.getCityLists(stateId)
                // }
                console.log("nanna",usernmae)
                this.setState({loading : false,usernmae : usernmae,address : address,countryname : countryname,statename : statename,cityname : cityname,Address2 : Address2,CountryC : CountryC,StateC : StateC,CityC : CityC,PincodeC : PincodeC,Photo : Photo,Email : Email,Contact : Contact,Mobile : Contact,userid : userid,contactperson : contactperson,Pincode:Pincode,selectedCity:cityId,selectedCityC:cityIdC,selectedState:stateId,selectedStateC:stateIdC,selectedCountry:countryID,selectedCountryC:countryIDC,UserID:data[0].userid
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

    checkValidations(value){
        if(this.state.address == ''){
            alert("Please enter Address")
        }else if(this.state.selectedCountry == ''){
            alert("Please select country")
        }else if(this.state.selectedState == ''){
            alert("Please select state")
        }else if(this.state.selectedCity == ''){
            alert("Please select city")
        }else if(this.state.Mobile == '' || this.state.Mobile.length < 10){
            alert("Please enter valid Mobile Number")
        }else if(this.state.Email == '' ){
            alert("Please enter emailID")
        }else if(this.state.Address2 == ""){
            alert("Please enter permanent address")
        }else{
            this.updateProfileInfo(value)
        }
        
    }

    updateProfileInfo = async(value) => {
        

        console.log("PHOTOTOTO",this.state.Photo)
        let imageToSend
        if(value == "Direct" && this.state.Photo != null){
            imageToSend = "data:image/png;base64,"+String(this.state.Photo)
        }else{
            
            imageToSend = ""
            this.setState({
                Photo :""
            })
        }
        try{
            let InstituteId = await AsyncStorage.getItem("InstituteId");
            NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                this.changeLoadingStatus(true)
                const requestJson = {
                            UserName: this.state.usernmae,
                            InstId: InstituteId,
                            Address: this.state.address,
                            address2:this.state.Address2,
                            mobile:this.state.Mobile,
                            Phone:this.state.Mobile,
                            pincode:this.state.Pincode,
                            pincodeC:this.state.PincodeC,
                            Email: this.state.Email,
                            
                            City: this.state.cityname,
                            cityC:this.state.CityC,
                            CityId:this.state.selectedCity,
                            CityIdc:this.state.selectedCityC,
                            CountryId: this.state.selectedCountry,
                            CountryIdc:this.state.selectedCountryC, 
                            state:this.state.statename,
                            stateC : this.state.StateC,
                            StateId: this.state.selectedState,
                            StateIdc : this.state.selectedStateC,
                            UserID:this.state.UserID,
                            Image: imageToSend,
                        };
                    console.log("REQUESTJSON",requestJson)
                    const obj = new HTTPRequestMng('', 'UpdateProfile', this);
                    obj.executeRequest(requestJson);
            }
            else {
                this.changeLoadingStatus(false);
                Alert.alert('Message', 'No internet Connection, Please try again after some time.');
            }
        });
        }catch(err){

        }

    }

    

    onHTTPResponseUpdateProfile(respData){
        console.log("UPDATEPROIFIF",respData)
        let status = respData[0].Status
        let message = respData[0].Message
        let data = respData[0].Data
        if(status == 1){
            alert("Profile updated successfull")
            this.setState({
                loading : false
            })
             this.props.navigation.state.params.onScreenRefresh();
            this.props.navigation.goBack()
        }else{
           
                alert(message+","+data)
            
            
            this.setState({
                loading : false
            })
        }
    }

    checkStateStatus(){
        if(this.state.statelist.length > 0){
            this.setState({
                displayStates : true
            })
        }else{
            alert("Please select country first")
        }
    }

    checkStateStatusCity(){
        if(this.state.citylist.length > 0){
            this.setState({
                displayCitites : true
            })
        }else{
            alert("Please select state first")
        }
    }

    checkStateCStatus(){
        if(this.state.statelist.length > 0){
            this.setState({
                displayStatesC : true
            })
        }else{
            alert("Please select country first")
        }
    }
    checkStateStatusCityC(){
        if(this.state.citylist.length > 0){
            this.setState({
                displayCititesC : true
            })
        }else{
            alert("Please select state first")
        }
    }

    handleCheckbox(){
        this.setState({checkbox : !this.state.checkbox})
        if(!this.state.checkbox){
            let Taddress = this.state.address
            let Tcountry = this.state.countryname
            let Tcountryid = this.state.selectedCountry
            let Tstate = this.state.statename
            let TstateId = this.state.selectedState
            let Tcity = this.state.cityname
            let Tcityid =this.state.selectedCity
            let pincode = this.state.Pincode
            this.setState({
                Address2 : Taddress,
                CountryC : Tcountry,
                StateC : Tstate,
                CityC : Tcity,
                selectedCityC:Tcityid,
                selectedCountryC:Tcountryid,
                selectedStateC:TstateId,
                PincodeC : pincode

            })
        }else{
            this.setState({
                Address2 : "",
                CountryC : "",
                StateC : "",
                CityC : "",
                selectedCityC:"",
                selectedCountryC:"",
                selectedStateC:"",
                PincodeC : ""

            })
        }
    }

    

    render(){
        const childWidth = (screenWidth /(getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : (isTablet ? 2 : 1.5)));
        const countryItems = [];
		// const countrylist = this.state.countrylist;
		// countryItems.push(<Picker.Item label="Select Country" value={0} />);
		// countrylist.forEach((singleObj) => {
		// 	countryItems.push(<Picker.Item label={singleObj.countryname} value={singleObj.countryid} />);
		// });

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
                        <Title> Update Profile </Title>
                    </Body>
                    <Right></Right>
                </Header>
                <Content>                   
                    <View style={{ width: childWidth, alignSelf: 'center' ,flex:1}}>
                        <View style={{flex:1,backgroundColor:appColor.colorPrimary}}>
                            <View style={[layoutDesign.parentPhotoFrame,{marginTop:15}]}>
                            {this.state.Photo == null ? <Image source={{
								uri:
									Platform.OS === 'android'
										? 'file://' + this.state.fileName
										: '' + this.state.fileName,
							}} style={layoutDesign.parentPhoto} /> : <Image source={{
								uri:imageIcon
							}} style={layoutDesign.parentPhoto} />}
                            </View>
                            <View style={{flexDirection:'row',flex:1,justifyContent:'center',marginTop:10}}>
                                    <Button transparent onPress={() => {
                                        if(this.state.Photo != null){
                                            this.checkValidations("Remove")
                                        }else{
                                            alert("No photo selected")
                                        }
                                    }} small style={{margin:5,alignSelf:'flex-start',borderRadius:2,borderColor:appColor.white,borderWidth:1}}>
                                    <Text style={{color:appColor.white}}uppercase={false}>Remove Photo</Text></Button>
                                <Button onPress={() => this.checkAppPermission()} small style={{margin:5,alignSelf:'flex-end',borderRadius:2,borderColor:appColor.white,borderWidth:1}}><Text uppercase={false}>Change Photo</Text></Button>
                                </View>
                                <View style={{backgroundColor:appColor.colorPrimary,height:1,margin:15}}></View>                            
                           </View>
                        <Form style={{ alignSelf: 'stretch',margin:10 }}>
                               <Text style={{marginLeft:10,marginTop:10}} >Correspondence Address</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                    <Input
                                        placeholder='Address'
                                        returnKeyType='next'
                                        autoCapitalize='none'
                                        style={{ backgroundColor: '#00000005' }}
                                        keyboardType='default'
                                        onChangeText={(text) => this.setState({ address: text })}
                                        value={this.state.address} />
                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Select Country</Text>
                                    
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                    <View style={{flexDirection:'row',flex:1}}>
                                    <TouchableOpacity onPress={() => this.setState({
                                        displayCountries: true
                                    })}>
                                    <Text style={{margin:5,padding:5,width:268}}>{this.state.countryname == null || this.state.countryname == '' ?  'Select Country' : this.state.countryname}</Text>
                                    </TouchableOpacity>
                                   <Image style={{height:18,width:18,margin:10,tintColor:appColor.light_gray}} source={(require("../../assets/down_arrow.png"))}/>
                                    </View>
                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Select State</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                        <View style={{flexDirection:'row'}}>
                                            <TouchableOpacity onPress={() => this.checkStateStatus()}>
                                    <Text style={{margin:5,padding:5,width:268}}>{this.state.statename == '' || this.state.statename == null ?  'Select State' : this.state.statename}</Text>
                                    </TouchableOpacity>
                                   <Image style={{height:18,width:18,margin:10,tintColor:appColor.light_gray}} source={(require("../../assets/down_arrow.png"))}/>
                                        </View>

                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Select City</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                        <View style={{flexDirection:'row'}}>
                                            <TouchableOpacity onPress={() => this.checkStateStatusCity()}>
                                    <Text style={{margin:5,padding:5,width:268}}>{this.state.cityname == '' || this.state.cityname == null ?  'Select City' : this.state.cityname}</Text>
                                    </TouchableOpacity>
                                   <Image style={{height:18,width:18,margin:10,tintColor:appColor.light_gray}} source={(require("../../assets/down_arrow.png"))}/>
                                </View>

                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Pincode</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                    <Input
                                    maxLength={6}
                                        placeholder='Pincode'
                                        returnKeyType='next'
                                        style={{ backgroundColor: '#00000005' }}
                                        keyboardType = 'phone-pad'
                                        onChangeText={(text) => this.setState({ Pincode: text })}
                                        value={this.state.Pincode}
                                         />
                                </Item>
                                <View style={{flexDirection:'row',flex:1,justifyContent:'flex-end'}}>
                                <Text style={{marginLeft:10,marginTop:15,color:appColor.light_gray}} >Same as above</Text>
                                <CheckBox
                                    value={this.state.checkbox}
                                    onValueChange={() => this.handleCheckbox()}
                                    style={{margin:10,alignSelf:'flex-end'}}
                                    />
                                </View>
                                <Text style={{marginLeft:10,marginTop:10}} >Permanent Address</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                    <Input
                                        placeholder='Permanent Address'
                                        returnKeyType='next'
                                        autoCapitalize='none'
                                        style={{ backgroundColor: '#00000005' }}
                                        keyboardType='default'
                                        onChangeText={(text) => this.setState({ Address2: text })}
                                        value={this.state.Address2}
                                         />
                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Select Country</Text>
                                    
                                    <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                    <View style={{flexDirection:'row',flex:1}}>
                                    <TouchableOpacity onPress={() => this.setState({
                                        displayCountriesC: true
                                    })}>
                                    <Text style={{margin:5,padding:5,width:268}}>{this.state.CountryC == '' ?  'Select Country' : this.state.CountryC}</Text>
                                    </TouchableOpacity>
                                    <Image style={{height:18,width:18,margin:10,tintColor:appColor.light_gray}} source={(require("../../assets/down_arrow.png"))}/>
                                    </View>

                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Select State</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                        <View style={{flexDirection:'row'}}>
                                            <TouchableOpacity onPress={() => this.checkStateCStatus()}>
                                    <Text style={{margin:5,padding:5,width:268}}>{this.state.StateC == '' ?  'Select State' : this.state.StateC}</Text>
                                    </TouchableOpacity>
                                   <Image style={{height:18,width:18,margin:10,tintColor:appColor.light_gray}} source={(require("../../assets/down_arrow.png"))}/>
                                        </View>

                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Select City</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                        <View style={{flexDirection:'row'}}>
                                            <TouchableOpacity onPress={() => this.checkStateStatusCityC()}>
                                    <Text style={{margin:5,padding:5,width:268}}>{this.state.CityC == '' ?  'Select City' : this.state.CityC}</Text>
                                    </TouchableOpacity>
                                   <Image style={{height:18,width:18,margin:10,tintColor:appColor.light_gray}} source={(require("../../assets/down_arrow.png"))}/>
                                        </View>

                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Pincode</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10 ,borderRadius:10 }]}>
                                    <Input
                                    maxLength={6}
                                        placeholder='Pincode'
                                        returnKeyType='next'
                                        style={{ backgroundColor: '#00000005' }}
                                         keyboardType = 'phone-pad'
                                        onChangeText={(text) => this.setState({ PincodeC: text })}
                                        value={this.state.PincodeC}
                                         />
                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Email Id</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10,borderRadius:10  }]}>
                                    <Input
                                        placeholder='EmailId'
                                        returnKeyType='next'
                                        autoCapitalize='none'
                                        style={{ backgroundColor: '#00000005' }}
                                        keyboardType='default'
                                        onChangeText={(text) => this.setState({ Email: text })}
                                        value={this.state.Email} />
                                </Item>
                                <Text style={{marginLeft:10,marginTop:10}} >Mobile Number</Text>
                                <Item regular style={[layoutDesign.inputBoxLayout, { marginTop: 10,marginLeft:10,marginRight:10,borderRadius:10  }]}>
                                    <Input
                                    maxLength={10}
                                        placeholder='Mobile Number'
                                        returnKeyType='next'
                                        style={{ backgroundColor: '#00000005' }}
                                        keyboardType = 'phone-pad'
                                        onChangeText={(text) => this.setState({ Mobile: text })}
                                        value={this.state.Mobile}
                                        />
                                </Item>
                                <View style={{height:20}}></View>
                    </Form>
                    </View>                   
                </Content>
                     <Footer style={{backgroundColor:appColor.colorPrimary}}>
                        <TouchableOpacity onPress={() => this.checkValidations("Direct")}>
                            <Text style={{margin:10,color:appColor.white,fontSize:18}}>Submit</Text>
                        </TouchableOpacity>
                    </Footer>

            <RNModal
                    animationType='slide'
                    transparent={true}
                    // visible={true}
                    visible={this.state.displayCountries}
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
                        backgroundColor:appColor.colorPrimary,
                        flexDirection:'row'
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
                            textDecorationStyle: 'dashed',width:280,marginLeft:10
                        }}
                        >
                        Select Country
                        </Text>
                        <TouchableOpacity onPress={() => this.setState({
                            displayCountries: false
                        })}>
                        <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            height: 35,
                            fontSize: 20,
                            alignSelf: 'flex-end',
                            color: appColor.white,
                            justifyContent: 'center',
                            marginTop: 15,
                            textDecorationStyle: 'dashed',
                            fontWeight:'bold'
                        }}
                        >
                        X
                        </Text>
                        </TouchableOpacity>
                        <View style={{backgroundColor:appColor.colorPrimaryDark,height:1}}></View>
                    </View>
                    {/* head of card is over started the card body */}
                    
                    <View style={{marginTop:20,height:350,width:320}}>
                    <FlatList
                        style={{ marginTop: 10 }}
                        data={this.state.countrylist}
                        renderItem={({ item, index }) => (
                          <View>
                            <TouchableOpacity
                            style={{ backgroundColor: 'white' }}
                            onPress={() => {
                              this.setState({
                                displayCountries: false,
                                countryname : this.state.countrylist[index].countryname,
                                selectedCountry : this.state.countrylist[index].countryid,
                                statelist: [],statename:'Select state',selectedState:'',cityname:'Select city',selectedCity:''
                              },() => this.getStateLists(this.state.countrylist[index].countryid))
                            }
                            }>
                            <View style={{ alignItems: 'center',flexDirection:'row' }}>
                            <Thumbnail
                                square
                                small
                                source={require('../../assets/country.png')}
                                style={{
                                  alignSelf: 'center',

                                  resizeMode: 'contain',
                                  width: 40,
                                  height:30,
                                  margin:5
                                }}
                              />
                              <Text style={{ fontWeight: '300', fontSize: 18 ,margin:10}}>{this.state.countrylist[index].countryname}</Text>
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
                <RNModal
                    animationType='slide'
                    transparent={true}
                    // visible={true}
                    visible={this.state.displayCountriesC}
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
                        backgroundColor:appColor.colorPrimary,
                        flexDirection:'row'
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
                            textDecorationStyle: 'dashed',width:280,marginLeft:10
                        }}
                        >
                        Select Country
                        </Text>
                        <TouchableOpacity onPress={() => this.setState({
                            displayCountriesC: false
                        })}>
                        <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            height: 35,
                            fontSize: 20,
                            alignSelf: 'flex-end',
                            color: appColor.white,
                            justifyContent: 'center',
                            marginTop: 15,
                            textDecorationStyle: 'dashed',
                            fontWeight:'bold'
                        }}
                        >
                        X
                        </Text>
                        </TouchableOpacity>
                        <View style={{backgroundColor:appColor.colorPrimaryDark,height:1}}></View>
                    </View>
                    {/* head of card is over started the card body */}
                    
                    <View style={{marginTop:20,height:350,width:320}}>
                    <FlatList
                        style={{ marginTop: 10 }}
                        data={this.state.countrylist}
                        renderItem={({ item, index }) => (
                          <View>
                            <TouchableOpacity
                            style={{ backgroundColor: 'white' }}
                            onPress={() => {
                              this.setState({
                                displayCountriesC: false,
                                CountryC : this.state.countrylist[index].countryname,
                                selectedCountryC : this.state.countrylist[index].countryid,
                                CurrentStateList: [],
                                selectedStateC:'',StateC:'Select State',CurrentCityList:[],selectedCityC:''
                              },() => this.getStateLists(this.state.countrylist[index].countryid))
                            }
                            }>
                            <View style={{ alignItems: 'center',flexDirection:'row' }}>
                            <Thumbnail
                                square
                                small
                                source={require('../../assets/country.png')}
                                style={{
                                  alignSelf: 'center',

                                  resizeMode: 'contain',
                                  width: 40,
                                  height:30,
                                  margin:5
                                }}
                              />
                              <Text style={{ fontWeight: '300', fontSize: 18 ,margin:10}}>{this.state.countrylist[index].countryname}</Text>
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
                <RNModal
                    animationType='slide'
                    transparent={true}
                    // visible={true}
                    visible={this.state.displayStates}
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
                        backgroundColor:appColor.colorPrimary,
                        flexDirection:'row'
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
                            textDecorationStyle: 'dashed',width:280,marginLeft:10
                        }}
                        >
                        Select State
                        </Text>
                        <TouchableOpacity onPress={() => this.setState({
                            displayStates: false
                        })}>
                        <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            height: 35,
                            fontSize: 20,
                            alignSelf: 'flex-end',
                            color: appColor.white,
                            justifyContent: 'center',
                            marginTop: 15,
                            textDecorationStyle: 'dashed',
                            fontWeight:'bold'
                        }}
                        >
                        X
                        </Text>
                        </TouchableOpacity>
                        <View style={{backgroundColor:appColor.colorPrimaryDark,height:1}}></View>
                    </View>
                    {/* head of card is over started the card body */}
                    
                    <View style={{marginTop:20,height:350,width:320}}>
                    <FlatList
                        style={{ marginTop: 10 }}
                        data={this.state.statelist}
                        renderItem={({ item, index }) => (
                          <View>
                            <TouchableOpacity
                            style={{ backgroundColor: 'white' }}
                            onPress={() => {
                              this.setState({
                                displayStates: false,
                                statename : this.state.statelist[index].statename,
                                selectedState:this.state.statelist[index].stateid,
                                citylist:[]
                              },() => this.getCityLists(this.state.statelist[index].stateid))
                            }
                            }>
                            <View style={{ alignItems: 'center',flexDirection:'row' }}>
                            <Thumbnail
                                square
                                small
                                source={require('../../assets/country.png')}
                                style={{
                                  alignSelf: 'center',
                                  resizeMode: 'contain',
                                  width: 40,
                                  height:30,
                                  margin:5
                                }}
                              />
                              <Text style={{ fontWeight: '300', fontSize: 18 ,margin:10}}>{this.state.statelist[index].statename}</Text>
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

                <RNModal
                    animationType='slide'
                    transparent={true}
                    // visible={true}
                    visible={this.state.displayStatesC}
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
                        backgroundColor:appColor.colorPrimary,
                        flexDirection:'row'
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
                            textDecorationStyle: 'dashed',width:280,marginLeft:10
                        }}
                        >
                        Select State
                        </Text>
                        <TouchableOpacity onPress={() => this.setState({
                            displayStatesC: false
                        })}>
                        <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            height: 35,
                            fontSize: 20,
                            alignSelf: 'flex-end',
                            color: appColor.white,
                            justifyContent: 'center',
                            marginTop: 15,
                            textDecorationStyle: 'dashed',
                            fontWeight:'bold'
                        }}
                        >
                        X
                        </Text>
                        </TouchableOpacity>
                        <View style={{backgroundColor:appColor.colorPrimaryDark,height:1}}></View>
                    </View>
                    {/* head of card is over started the card body */}
                    
                    <View style={{marginTop:20,height:350,width:320}}>
                    <FlatList
                        style={{ marginTop: 10 }}
                        data={this.state.statelist}
                        renderItem={({ item, index }) => (
                          <View>
                            <TouchableOpacity
                            style={{ backgroundColor: 'white' }}
                            onPress={() => {
                              this.setState({
                                displayStatesC: false,
                                StateC : this.state.statelist[index].statename,
                                selectedStateC:this.state.statelist[index].stateid,
                                CurrentCityList:[]
                              },() => this.getCityLists(this.state.statelist[index].stateid))
                            }
                            }>
                            <View style={{ alignItems: 'center',flexDirection:'row' }}>
                            <Thumbnail
                                square
                                small
                                source={require('../../assets/country.png')}
                                style={{
                                  alignSelf: 'center',

                                  resizeMode: 'contain',
                                  width: 40,
                                  height:30,
                                  margin:5
                                }}
                              />
                              <Text style={{ fontWeight: '300', fontSize: 18 ,margin:10}}>{this.state.statelist[index].statename}</Text>
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
                 <RNModal
                    animationType='slide'
                    transparent={true}
                    // visible={true}
                    visible={this.state.displayCitites}
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
                        backgroundColor:appColor.colorPrimary,
                        flexDirection:'row'
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
                            textDecorationStyle: 'dashed',width:280,marginLeft:10
                        }}
                        >
                        Select City
                        </Text>
                        <TouchableOpacity onPress={() => this.setState({
                            displayCitites: false
                        })}>
                        <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            height: 35,
                            fontSize: 20,
                            alignSelf: 'flex-end',
                            color: appColor.white,
                            justifyContent: 'center',
                            marginTop: 15,
                            textDecorationStyle: 'dashed',
                            fontWeight:'bold'
                        }}
                        >
                        X
                        </Text>
                        </TouchableOpacity>
                        <View style={{backgroundColor:appColor.colorPrimaryDark,height:1}}></View>
                    </View>
                    {/* head of card is over started the card body */}
                    
                    <View style={{marginTop:20,height:350,width:320}}>
                    <FlatList
                        style={{ marginTop: 10 }}
                        data={this.state.citylist}
                        renderItem={({ item, index }) => (
                          <View>
                            <TouchableOpacity
                            style={{ backgroundColor: 'white' }}
                            onPress={() => {
                              this.setState({
                                displayCitites: false,
                                cityname : this.state.citylist[index].cityname,
                                selectedCity: this.state.citylist[index].cityid,
                              })
                            }
                            }>
                            <View style={{ alignItems: 'center',flexDirection:'row' }}>
                            <Thumbnail
                                square
                                small
                                source={require('../../assets/country.png')}
                                style={{
                                  alignSelf: 'center',

                                  resizeMode: 'contain',
                                  width: 40,
                                  height:30,
                                  margin:5
                                }}
                              />
                              <Text style={{ fontWeight: '300', fontSize: 18 ,margin:10}}>{this.state.citylist[index].cityname}</Text>
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
                 <RNModal
                    animationType='slide'
                    transparent={true}
                    // visible={true}
                    visible={this.state.displayCititesC}
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
                        backgroundColor:appColor.colorPrimary,
                        flexDirection:'row'
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
                            textDecorationStyle: 'dashed',width:280,marginLeft:10
                        }}
                        >
                        Select City
                        </Text>
                        <TouchableOpacity onPress={() => this.setState({
                            displayCititesC: false
                        })}>
                        <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            height: 35,
                            fontSize: 20,
                            alignSelf: 'flex-end',
                            color: appColor.white,
                            justifyContent: 'center',
                            marginTop: 15,
                            textDecorationStyle: 'dashed',
                            fontWeight:'bold'
                        }}
                        >
                        X
                        </Text>
                        </TouchableOpacity>
                        <View style={{backgroundColor:appColor.colorPrimaryDark,height:1}}></View>
                    </View>
                    {/* head of card is over started the card body */}
                    
                    <View style={{marginTop:20,height:350,width:320}}>
                    <FlatList
                        style={{ marginTop: 10 }}
                        data={this.state.citylist}
                        renderItem={({ item, index }) => (
                          <View>
                            <TouchableOpacity
                            style={{ backgroundColor: 'white' }}
                            onPress={() => {
                              this.setState({
                                displayCititesC: false,
                                CityC : this.state.citylist[index].cityname,
                                selectedCityC: this.state.citylist[index].cityid,
                              })
                            }
                            }>
                            <View style={{ alignItems: 'center',flexDirection:'row' }}>
                            <Thumbnail
                                square
                                small
                                source={require('../../assets/country.png')}
                                style={{
                                  alignSelf: 'center',

                                  resizeMode: 'contain',
                                  width: 40,
                                  height:30,
                                  margin:5
                                }}
                              />
                              <Text style={{ fontWeight: '300', fontSize: 18 ,margin:10}}>{this.state.citylist[index].cityname}</Text>
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
        width: 80, height: 80, borderRadius: Platform.OS == 'android' ? 80 : 37
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
