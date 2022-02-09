import React from 'react';
import {
    StyleSheet, Alert,FlatList,TouchableHighlight,
    PermissionsAndroid,Platform
} from 'react-native';
import {
    View, Text, Card, CardItem,
    Icon, Content, Picker, Toast
} from "native-base";

import InternetConn from '../networkConn/OfflineNotice';
import appColor from '../config/color.json'
import AwesomeAlert from 'react-native-awesome-alerts';
import HTTPRequestMng from "./HTTPRequestMng";
import NetInfo from "@react-native-community/netinfo";

import { ActionAddDiaryDetailsStep1,ActionUpdateDiaryDetailsStep1} from '../redux_reducers/SchoolDiaryReducer';
import { connect } from 'react-redux';
import { ActionAddTeacher} from '../redux_reducers/TeacherInfoReducer';
import AsyncStorage from '@react-native-community/async-storage';

class StepSelectStudents extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false, loadingMsg: '',
            classList: [], sectionList:[], 
            studentList: this.props.studentList,selectedCLassID:this.props.selectedCLassID, selectedSectionID:this.props.selectedSectionID,
            totalStudents :0,isChecked:false,isClassListLoaded:this.props.isClassListLoaded,
            isEditDetails:this.props.isEditDetails,
            isEdit:false,
            isScreenFrom:'',
            selectedSDSectionId: this.props.selectedSDSectionId,
            selectedsubjectId: this.props.selectedsubjectId,
            selectedSchoolDiaryID:this.props.selectedSchoolDiaryID,
            selectedsubmissionDate: this.props.selectedsubmissionDate,
            selectedmsgTitle: this.props.selectedmsgTitle,
            selectedmsgText: this.props.selectedmsgText,
            selectedsessionYear: this.props.selectedsessionYear,
            attachFileData: this.props.attachFileData,
            fileName : this.props.fileName,
            attachFileExtension: this.props.attachFileExtension,
            isAttachModify: this.props.isAttachModify,
        }
    }

    async componentDidMount() 
    {
        temp_screen = await AsyncStorage.getItem('isScreen','');
        this.setState({isScreenFrom:temp_screen});
       // console.log('IsAttcheddata',this.state.attachFileData);
        this.props.onRef(this)
        
        console.log('Saved Student list',JSON.stringify(this.props.studentList));

        if(temp_screen!='' && temp_screen==='AddDiary'){
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) 
                {
                    this.getClassList();
                }
               });
        }

        if(temp_screen!='' && temp_screen==='UpdateDiary'){
            NetInfo.isConnected.fetch().then((isConnected) => {
                if (isConnected) 
                {
                    this.getClassList();
                    this.getSectionList();
                    this.getStudentList();
                }
               });
        }

        // if(!this.props.isClassListLoaded)
        // {
        //     this.getClassList();
        // }   
        // if(this.props.isEditDetails){  
        //     this.getClassList(); 
        //     this.getSectionList();
        //     this.getStudentList();
        //     this.getClassList();
        // }
        // this.props.isEditDetails = false;
    }

    getClassList () 
    {
      // this.changeLoadingStatus(true);
       const obj = new HTTPRequestMng('', 'GetClassList', this)
       obj.executeRequest("InstituteId="+ this.props.instituteId );
    }

    
    getSectionList () 
    {
      //this.changeLoadingStatus(true);
       const obj = new HTTPRequestMng('', 'GetSectionList', this)
       obj.executeRequest("InstituteId="+ this.props.instituteId 
                        +"&AutoClassId="+this.state.selectedCLassID );
    }

    getStudentList () 
    {
       const obj = new HTTPRequestMng('', 'GetStudentList', this)
       obj.executeRequest("InstituteId="+ this.props.instituteId 
                        +"&AutoClassId="+this.state.selectedCLassID
                        +"&AutoSectionId="+this.state.selectedSectionID
                       );
    }


    changeLoadingStatus(isShow, msg) {
        this.setState({ loading: isShow, loadingMsg: msg });
    }

    onClassValueChange(value)
    {
        this.setState({selectedCLassID: value}, () => {
            if(value!=0)
                this.getSectionList();
        });
    }

    onSectionValueChange(value) 
    {
         this.setState({selectedSectionID: value}, () => {
               if(value!=0)
               {
                this. getStudentList (); 
               }
        });
    }

    onHTTPError() 
    {
        //this.changeLoadingStatus(false);
        Alert.alert('Message', 'Unable to connect with server, Please try after some time');
    }

    onHTTPReponseClassList(respData) 
    {
        try 
        {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];
            if (status == 'Success') 
            {
            const listData = jsonRec['Data'];
            console.info("ClassListData", listData);
            let recordCurrentList = [];
            this.setState({ isClassListLoaded: true });
            if (listData != undefined) {
                listData.forEach((singleObj) => {
                    const arrayObj = {
                                'ClassName':singleObj['Name'],
                                'AutoClassId': singleObj['AutoClassId']
                            }
                recordCurrentList.push(arrayObj);
                });
                
                if(this.state.isScreenFrom==='UpdateDiary'){
                    var temp_count =  0;
                    var temp_classList = [];
                    for(var i=0;i<recordCurrentList.length;i++){
                        if(recordCurrentList[i].AutoClassId===this.props.selectedCLassID){
                            temp_count = temp_count+1;
                            temp_classList.push({
                                'ClassName':recordCurrentList[i].ClassName,
                                'AutoClassId': recordCurrentList[i].AutoClassId
                            });
                            break;
                        }
                    }
                    if(temp_count>0){
                        this.setState({classList: temp_classList});
                    }
                }else{
                    // var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                    // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.ClassName, b.ClassName))
                    this.setState({classList: recordCurrentList});
                }
            }
            } 
            
            else 
            {
                Alert.alert('Message', 'There is no Class found for given Institute.');
                this.setState({ isClassListLoaded: false });
            }   

        } 
        catch (error) {
        //console.error("error", error);
         this.setState({ isClassListLoaded: false });
        }
        // this.changeLoadingStatus(false)
    }

    onHTTPReponseSectionList(respData) 
    {
        try 
        {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];
            if (status == 'Success') 
            {
            const listData = jsonRec['Data'];
            console.info("SectionListData", listData);
            let recordCurrentList = [];
            
            if (listData != undefined) {
                listData.forEach((singleObj) => {
                    const arrayObj = {
                                'SectionName':singleObj['SectionName'],
                                'AutoSectionId': singleObj['AutoSectionId'],
                                'AutoInstructorId': singleObj['AutoInstructorId']
                            }
                recordCurrentList.push(arrayObj);
                });
                // var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                // const sorted = recordCurrentList.sort((a, b) => collator.compare(a.SectionName, b.SectionName))
               this.setState({sectionList: recordCurrentList});
                // if(this.state.isEditDetails)
                // {
                //     this.setState({sectionList: this.props.sectionList,selectedSectionID:this.props.sectionID});
                // }
                // else{
                //     this.setState({sectionList: sorted});
                // }
            }
            } 
            else 
            {
                Alert.alert('Message', 'Section is not created for given Class.');
            }                 
        } 
        catch (error) {
        console.error("erroe", error);
        }
        // this.changeLoadingStatus(false)  
    }

    onHTTPReponseStudentList(respData) 
    {
        try 
        {
            const jsonRec = respData[0];
            const status = jsonRec['Message'];
            if (status == 'Success') 
            {
            const listData = jsonRec['Data'];
           // console.info("ListData", listData);
            let recordCurrentList = [];
            
            if (listData != undefined) {

                listData.forEach((singleObj) => {
                    var temp_count = 0;
                    var arrayObj = null;
                    for(var i=0;i<this.state.studentList.length;i++){
                        if(singleObj['AutoStudId']===this.state.studentList[i].AutoStudId){
                            temp_count = temp_count+1;
                            break;
                        }
                    }

                    if(temp_count>0){
                        arrayObj = {
                            'AutoStudId':singleObj['AutoStudId'],
                            'StudentName': singleObj['StudentName'],
                            'RegistrationNumber': singleObj['RegistrationNumber'],
                            'RollNo': singleObj['RollNo'],
                            'AutoParentId':singleObj['AutoParentId'],
                            'isSelected' : true
                        }
                    }else{
                        arrayObj = {
                            'AutoStudId':singleObj['AutoStudId'],
                            'StudentName': singleObj['StudentName'],
                            'RegistrationNumber': singleObj['RegistrationNumber'],
                            'RollNo': singleObj['RollNo'],
                            'AutoParentId':singleObj['AutoParentId'],
                            'isSelected' : false
                        }
                    }
                if(arrayObj!=null){
                    recordCurrentList.push(arrayObj);
                }
                });

                this.setState({studentList: recordCurrentList});
            }


            } 
            else 
            {

                // Alert.alert('Oops', 'unable to get student list');
                Alert.alert('Message', 'There is no student found for given Section or Class.');

            }   
        } 
        catch (error) {
        console.error("erroe", error);
        }
        //this.changeLoadingStatus(false)     
    }

    onSelectedAll(val)
    {
         //check for select/dis select all
        this.setState({ isChecked: val });
        let recordList = this.state.studentList;
        const isSelected = val;
        recordList.forEach(singleObj => {
            singleObj.isSelected = isSelected;
        });

       this.setState({ studentList: recordList });
   
    }

    onStudentRecordClick(index) 
    {
        let recordList = this.state.studentList;
        recordList[index].isSelected = !recordList[index].isSelected;
        this.setState({ studentList: recordList });
    }

    async checkAppPermission(){
        var granted = null;
        try {
            
      granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );           
        } catch (err) {
            console.error(err)
        }
        return granted;
    }

   async checkForValidation()
    {
        let recordList = this.state.studentList;
        let count=0;
        recordList.forEach(singleObj => {
            if(singleObj.isSelected)
                count++;
        });

        // if(count>0)
        // {
        //     this.addDiaryDetails();
        //     return true;
        // }

        // else
        // {
        //     Alert.alert('Oops', 'Please select atleast one student');
        //     return false;
        // } 
        if(this.state.isScreenFrom==='UpdateDiary'){
            if(this.state.fileName!=undefined && this.state.fileName!=''){              
                  if(await this.checkAppPermission()!=null && await this.checkAppPermission()===PermissionsAndroid.RESULTS.GRANTED){
                    if(count>0)
                        {
                        this.addDiaryDetails();
                        return true;
                         }else{
                            Alert.alert('Message', 'Please select atleast one student');
                            return false;
                         }
                }
            }else{
                if(count>0)
                        {
                        this.addDiaryDetails();
                        return true;
                         }else{
                            Alert.alert('Message', 'Please select atleast one student');
                            return false;
                      }
            }
        }else{
            if(count>0)
            {
                this.addDiaryDetails();
                return true;
            }
    
            else
            {
                Alert.alert('Message', 'Please select atleast one student');
                return false;
            } 

        }
        

    }


    addDiaryDetails() {
        if(this.state.isScreenFrom!='' && this.state.isScreenFrom==='UpdateDiary'){
            this.props.ActionUpdateDiaryDetailsStep1({ 
                instituteID: this.props.instituteId,
                schoolDiaryID:this.state.selectedSchoolDiaryID,
                classID:this.state.selectedCLassID, sectionID: this.state.selectedSectionID, 
                isClassListLoaded:this.state.isClassListLoaded,
                classList:this.state.classList,
                sectionList:this.state.sectionList,
                studentList:this.state.studentList,
                isEditDetails:this.state.isEditDetails,
                AutoSDSectionId:this.state.selectedSDSectionId,
                subjectID: this.state.selectedsubjectId,
                submissionDate:this.state.selectedsubmissionDate,
                msgTitle:this.state.selectedmsgTitle,
                msgText: this.state.selectedmsgText,
                sessionYear: this.state.selectedmsgText,
                attachFileData:this.state.attachFileData,
                fileName : this.state.fileName,
                attachFileExtension: this.state.attachFileExtension,
                isAttachModify: this.state.isAttachModify,
            });
        }

        if(this.state.isScreenFrom!='' && this.state.isScreenFrom==='AddDiary'){
            this.props.ActionAddDiaryDetailsStep1({ 
                instituteID: this.props.instituteId,
                classID:this.state.selectedCLassID, sectionID: this.state.selectedSectionID, 
                isClassListLoaded:this.state.isClassListLoaded,
                classList:this.state.classList,
                sectionList:this.state.sectionList,
                studentList:this.state.studentList,
            });
        }

        
    }

    onRenderStudentListData(item,index) 
    {

        let verticalLine=  <View style={{ width: 1,backgroundColor: appColor.light_gray }} />

        let checkLayout;
        if (item.isSelected)
            checkLayout = <Icon name='checkbox'/>
        else
            checkLayout = <Icon name='square-outline'/>

        return <View style={{ width: '100%',flex: 1,flexDirection: 'row',justifyContent :'space-between',paddingLeft:5,paddingRight:5}}>
                    <TouchableHighlight style={layoutDesign.item} underlayColor='#00000010'
                            onPress={() => {this.onStudentRecordClick(index)}}>
                        {checkLayout}
                    </TouchableHighlight>
                  
                    {/* {verticalLine} */}
                    <Text style={[layoutDesign.item ,{flex: 1}]}>{item.StudentName}</Text>

                    <View >
                        {/* {verticalLine} */}
                        <Text style={layoutDesign.item}> ({item.RegistrationNumber}) </Text>
                    </View>
                </View>
    }


    render() 
    {
        // this.state.isScreenFrom = this.props.navigation.getParam('fromScreen', '');
        // console.log('is FRom',this.props.navigation.getParam('fromScreen', ''));
        const classPickerItems = [];
        const classList = this.state.classList;
        classPickerItems.push(<Picker.Item  label="Select class" value={0} />);
        console.log('clas list',JSON.stringify(classList));
        classList.forEach(singleObj => {
            classPickerItems.push(<Picker.Item id={singleObj.AutoClassId}  label={singleObj.ClassName} value={singleObj.AutoClassId} />);
        });

        const sectionPickerItems = [];
        const sectionList = this.state.sectionList;
        sectionPickerItems.push(<Picker.Item label="Select section" value={0} />);

        sectionList.forEach(singleObj => {
            sectionPickerItems.push(<Picker.Item  label={singleObj.SectionName} value={singleObj.AutoSectionId} />);
        });

        let classNameLayout,sectionNameLayout;
            classNameLayout = <Picker
                mode="dropdown"
                iosIcon={<Icon name="ios-arrow-down" />}
                placeholder="Select class"
                iosHeader="Select class"
                style={{ width: '100%', height: 40}}
                textStyle={{ maxWidth : '85%', paddingLeft: 5, paddingRight: 0 }}
                selectedValue={this.state.selectedCLassID}
                onValueChange={this.onClassValueChange.bind(this)}
            >
                {classPickerItems}
            </Picker>
            sectionNameLayout = <Picker
                mode="dropdown"
                iosIcon={<Icon name="ios-arrow-down" />}
                placeholder="Select section"
                iosHeader="Select section"
                style={{ width: '100%',height: 40 }}
                textStyle={{ maxWidth : '85%', paddingLeft: 5, paddingRight: 0 }}
                selectedValue={this.state.selectedSectionID}
                onValueChange={this.onSectionValueChange.bind(this)}
            >
             {sectionPickerItems}
            </Picker>
    
        let checkLayout;
        if (this.state.isChecked)
            checkLayout = <Icon name='checkbox' />
        else
            checkLayout = <Icon name='square-outline'  />
        let listHeader;
        if(this.state.studentList.length>0)
        {
           listHeader= <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-between',                                       backgroundColor:appColor.lighten_gray}}>
                            <Text style={[layoutDesign.item ,{flexGrow: 1,fontSize:11}]}>  </Text>
                            <Text style={[layoutDesign.item ,{flexGrow: 1,fontSize:11}]}> Student Name </Text>
                            <Text style={[layoutDesign.item ,{flexGrow: 1,fontSize:11,
                           textAlign: 'right',marginRight: 10}]}>Reg No.</Text>
                        </View>
        }
        else
        {
            listHeader=<View></View>;
        }

        return (
            <View style={{ flex: 1, backgroundColor: appColor.backgroundColor }}>
                <InternetConn />
                <Content style={{ padding: 10 }}>
                    <Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 10 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: -5, marginRight: -5, }}> 
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text style={layoutDesign.headingText}>Class </Text>
                                        <View style={[layoutDesign.pickerLayout,{marginRight:10}]}>
                                            {classNameLayout}
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Text style={layoutDesign.headingText}>Section </Text>
                                        <View style={layoutDesign.pickerLayout}>
                                            {sectionNameLayout}
                                        </View>  
                                    </View>
                                </View>

                            </View>
                        </CardItem>
                    </Card>
                     <Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 5 }}>
                        <CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
                            <View style={{ flex: 1, flexDirection: 'column', marginLeft: -15, marginRight: -15, }}>
                               <View style={{width: '100%',flex: 1, flexDirection: 'row',paddingLeft:10,paddingRight:10, alignItems: 'center',
                                justifyContent:'center'}}>

                                    <Text style={[layoutDesign.headerText, {flex: 1}]}>Total {this.state.studentList.length} Students</Text>

                                    <TouchableHighlight underlayColor='#00000010'
                                                   onPress={() => {this.onSelectedAll(!this.state.isChecked )}}>
                    
                                     <View style={{ flexDirection: 'row',alignItems: 'flex-end' }}>
                                        {checkLayout}
                                        <Text style={{paddingBottom:5}}> All</Text>
                                    </View>
                                    </TouchableHighlight>
                                </View>
                                {/* <View style={{ marginLeft: -10, marginRight: -10, marginTop: 5, marginBottom: 5, height: 1, backgroundColor: appColor.light_gray}} /> */}
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
                
            {this.state.loading &&     <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%', textAlign: 'center' }}
                    messageStyle={{textAlign: 'center'}}
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
    headingText: {
        fontSize: 11, color: appColor.gray_title, marginTop: 5,
    },
    pickerLayout: {
        backgroundColor: '#00000005', borderRadius: 5,
        marginTop: 2, borderWidth: 1, borderColor: '#DDDDDD'
    },
    headerText: {
        fontSize: 18, color: appColor.colorPrimary,
    },
    
    item: 
    {
        paddingLeft:5,
        paddingRight:2,
        paddingTop:7,
        paddingBottom:7,
        alignItems: 'center'
    }
   
});


//export default StepSelectStudents;
const mapStateToProps = state => {
    return {
            instituteId: state.teacherInfo.InstituteId,
            selectedCLassID: state.diaryInfo.classID, 
            selectedSectionID: state.diaryInfo.sectionID,
            selectedSchoolDiaryID:state.diaryInfo.schoolDiaryID,
            isClassListLoaded:state.diaryInfo.isClassListLoaded,
            classList:state.diaryInfo.classList,
            sectionList:state.diaryInfo.sectionList,
            studentList:state.diaryInfo.studentList,
            isEditDetails:state.diaryInfo.isEditDetails,
            selectedSDSectionId:state.diaryInfo.AutoSDSectionId,
            selectedsubjectId: state.diaryInfo.subjectID,
            selectedsubmissionDate:state.diaryInfo.submissionDate,
            selectedmsgTitle:state.diaryInfo.msgTitle,
            selectedmsgText: state.diaryInfo.msgText,
            selectedsessionYear: state.diaryInfo.sessionYear,
            attachFileData: state.diaryInfo.attachFileData,
            fileName:state.diaryInfo.fileName,
            attachFileExtension: state.diaryInfo.attachFileExtension,
            isAttachModify: state.diaryInfo.isAttachModify,
    };
};

export default connect(mapStateToProps, { ActionAddDiaryDetailsStep1,ActionAddTeacher,ActionUpdateDiaryDetailsStep1}) (StepSelectStudents);
