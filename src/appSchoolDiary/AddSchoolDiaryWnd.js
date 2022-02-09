
import React from 'react';
import {
    Dimensions, Alert,
    ScrollView, TouchableHighlight, StatusBar,

} from 'react-native';

import {
    Container, Header, Title, Button, Icon,
    Text, Body, Right, Left, View, Subtitle
} from "native-base";

import AwesomeAlert from 'react-native-awesome-alerts';
import appColor from '../config/color.json';

import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';

import { connect } from 'react-redux';
import { ActionDeleteDairyDetails } from '../redux_reducers/SchoolDiaryReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

import StepSelectStudents from './StepSelectStudents';
import StepAddDiaryDetails from './StepAddDiaryDetails';
import AsyncStorage from '@react-native-community/async-storage';

class AddSchoolDiaryWnd extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false, loadingMsg: '', currPageIndex: 0,
            isEditDetails: false,
            diaryText: 'Add diary details',
            isScreenFrom: '',
            object_main: null,
            parent_object: null,
            selfObject: this,
        }

        this.steps = [
            { component: <StepSelectStudents onRef={ref => (this.selectStudentTab = ref)} openStepByIndex={this.openStepByIndex.bind(this)} refreshParent={this.state.parent_object} />, routeName: 'Select Students' },
            {
                component: <StepAddDiaryDetails onRef={ref => (this.stepDiaryDetailsTab = ref)}
                    navigation={this.props.navigation} onScreenRefresh={this.onScreenRefresh} refreshParent={this.state.parent_object} />, routeName: this.state.diaryText
            },
        ];
    }


    onScreenRefresh() {
        // setTimeout(() => {
        //     console.log('dkdfnkfferwncf');
        //     //this.state.object_main.onScreenRefresh();
        //     this.props.navigation.state.params.onScreenRefresh();
        //     this.props.navigation.goBack();
        //     //this.props.navigation.state.params.onScreenRefresh();
        //     //this.props.navigation.goBack();
        //     //this.props.navigation.state.onScreenRefresh();
        // }, 100);
        console.log('dkdfnkfferwncf');
        Alert.alert('xz0128azaxaxzxxza');
        this.props.navigation.state.params.onScreenRefresh();
        this.props.navigation.goBack();
        // this.props.navigation.navigate('DashboardWnd');
        //    this.state.object_main.onScreenRefresh();
        // this.state.object_main.onScreenRefresh();
        // this.state.selfObject.props.navigation.state.params.onScreenRefresh();
    }

    componentWillUnmount() {
        Alert.alert('Unmount called');
    }

    async componentDidMount() {
        temp_screen = await AsyncStorage.getItem('isScreen', '');
        parent_object = this.setState({ isScreenFrom: temp_screen });
        if (temp_screen != '' && temp_screen === 'AddDiary') {
            this.steps[1].routeName = 'Add diary details';
            this.setState({ diaryText: 'Add diary details' });
        }

        if (temp_screen != '' && temp_screen === 'UpdateDiary') {
            this.steps[1].routeName = 'Update diary details';
            this.setState({ diaryText: 'Update diary details' });
        }

        StatusBar.setBackgroundColor
            (appColor.colorPrimaryDark);

    }

    componentWillUnmount() {
        this.props.ActionDeleteDairyDetails();
    }

    performSubmitDiaryDetails() {
        this.stepDiaryDetailsTab.checkForValidation();
    }

    performDeleteDiaryDetails() {
        Alert.alert('Message', 'Are you sure, you want to delete Selected School Diary?', [
            {
                text: 'Yes',
                onPress: () => {
                    this.stepDiaryDetailsTab.deleteSchoolDiaryOnServer();
                },
            },
            {
                text: 'No',
                style: 'cancel'
            }
        ]);
    }


    // checkAppPermission(){
    //     try {
    //         if(Platform.OS == 'android') {
    //             let permissionList = [];
    //             let granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
    //             if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.CAMERA)
    //             granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
    //             if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)

    //             if (permissionList.length > 0) {
    //                 //ask permission required
    //                 const granted = await PermissionsAndroid.requestMultiple(permissionList)

    //                 let isGranted = true;
    //                 for (let i = 0; i < permissionList.length; i++) {
    //                     if (granted[permissionList[i]] != PermissionsAndroid.RESULTS.GRANTED) {
    //                         isGranted = false; break;
    //                     }
    //                 }
    //                 if (isGranted) {
    //                     return true;
    //                 } else {
    //                     Alert.alert('Oops', 'You need to enable app permission before adding attachment')
    //                     return false;

    //                 }
    //             } else {
    //                 //all granted
    //                 return true;
    //             }
    //         } else {
    //             return true;
    //         }            
    //     } catch (err) {
    //         console.error(err)
    //         return false;

    //     }
    // }

    openStepByIndex(index, isValid) {
        if (index >= this.steps.length) return;
        if (index < 0) return;

        if (this.state.currPageIndex == 0 && !isValid) {
            // if(this.checkAppPermission()){
            // this.setState({ currPageIndex: index });
            // this.scrollView.scrollTo({ y: 0, x: 180 * index, animated: true});
            // }else{
            //     Alert.alert('Oops', 'You need to enable app permission before modifying attachment')
            // }
            if (this.selectStudentTab.checkForValidation()) {
                this.setState({ currPageIndex: index });
                this.scrollView.scrollTo({ y: 0, x: 180 * index, animated: true });
            }

        }

        else if (this.state.currPageIndex == 1) {
            this.stepDiaryDetailsTab.saveDiaryDetails();
            this.setState({ currPageIndex: index });
            this.scrollView.scrollTo({ y: 0, x: 180 * index, animated: true });

        }
        else if (isValid) {
            this.setState({ currPageIndex: index });
            this.scrollView.scrollTo({ y: 0, x: 180 * index, animated: true });
        }
    }


    render() {
        // this.state.parent_object = this.props.navigation.getParam('parent_object', '');
        //this.state.object_main =  this.props.navigation.getParam('onScreenRefresh',{});

        console.log(JSON.stringify(this.props.navigation.getParam('onScreenRefresh', {})));
        //console.log('object passd',JSON.stringify(this.state.object_main));
        const steps = this.steps;
        const currPageIndex = this.state.currPageIndex;
        let wizardTitles;
        const stepsLen = steps.length;

        for (let index = 0; index < stepsLen; index++) {
            let linePanel, textPanel;
            if (index < stepsLen - 1) {
                linePanel = <View style={{ height: 2, width: 60, backgroundColor: appColor.light_gray }} />
            }

            let indicatorLayout = <Text style={{ color: 'white', fontWeight: '500' }}>{index + 1}</Text>
            let selColorCircle;
            if (index <= currPageIndex) {
                textPanel = <Text style={{ marginLeft: 10, marginRight: 10, color: appColor.black, fontWeight: '500', fontSize: 17 }}>{steps[index].routeName}</Text>
                selColorCircle = appColor.googleBlue;
                if (index < currPageIndex) {
                    indicatorLayout = <Icon name="md-checkmark" style={{ color: 'white', fontSize: 16 }} />
                }
            } else {
                textPanel = <Text style={{ marginLeft: 10, marginRight: 10, color: appColor.semi_dark_gray }}>{steps[index].routeName}</Text>
                selColorCircle = appColor.semi_dark_gray;
            }

            // onPress={() => this.openStepByIndex(index, true) }
            const view = <TouchableHighlight key={index} underlayColor='#00000010' >
                <View key={index} style={{ flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                    <View style={{ width: 26, height: 26, backgroundColor: selColorCircle, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                        {indicatorLayout}
                    </View>
                    {textPanel}
                    {linePanel}
                </View>
            </TouchableHighlight>
            wizardTitles = [wizardTitles, view];
        }

        let footerPrevBtn, footerNextBtn;

        if (this.state.isScreenFrom === 'UpdateDiary') {
            if (currPageIndex > 0) {
                footerPrevBtn = <Button transparent onPress={() => this.performDeleteDiaryDetails()}>
                    <Icon name="close" style={{ color: 'white' }} />
                    <Text style={{ color: 'white', fontSize: 18, marginLeft: -20, alignItems: 'center' }}>Delete</Text>
                </Button>
            }

            if (currPageIndex == (stepsLen - 1)) {
                footerNextBtn = <Button transparent onPress={() => this.performSubmitDiaryDetails()}>
                    <Text style={{ color: 'white', fontSize: 18, marginRight: -20, alignItems: 'center' }}>Update</Text>
                    <Icon name="md-checkmark" style={{ color: 'white' }} />
                </Button>
            }

            else {
                footerNextBtn = <Button transparent onPress={() => this.openStepByIndex(this.state.currPageIndex + 1)}>
                    <Text style={{ color: 'white', fontSize: 18, marginRight: -20, alignItems: 'center' }}>Next</Text>
                    <Icon name="ios-arrow-forward" style={{ color: 'white' }} />
                </Button>

            }

        } else {
            if (currPageIndex > 0) {
                footerPrevBtn = <Button transparent onPress={() => this.openStepByIndex(this.state.currPageIndex - 1, true)}>
                    <Icon name="ios-arrow-back" style={{ color: 'white' }} />
                    <Text style={{ color: 'white', fontSize: 18, marginLeft: -20, alignItems: 'center' }}>Prev</Text>
                </Button>
            }

            if (currPageIndex == (stepsLen - 1)) {
                footerNextBtn = <Button transparent onPress={() => this.performSubmitDiaryDetails()}>
                    <Text style={{ color: 'white', fontSize: 18, marginRight: -20, alignItems: 'center' }}>Submit</Text>
                    <Icon name="md-checkmark" style={{ color: 'white' }} />
                </Button>
            }

            else {
                footerNextBtn = <Button transparent onPress={() => this.openStepByIndex(this.state.currPageIndex + 1)}>
                    <Text style={{ color: 'white', fontSize: 18, marginRight: -20, alignItems: 'center' }}>Next</Text>
                    <Icon name="ios-arrow-forward" style={{ color: 'white' }} />
                </Button>
            }
        }
        // if(currPageIndex > 0)
        // {
        //     footerPrevBtn = <Button transparent onPress={() => this.openStepByIndex(this.state.currPageIndex - 1, true)}>
        //         <Icon name="ios-arrow-back" style={{ color: 'white' }} />
        //         <Text style={{color: 'white', fontSize: 18, marginLeft: -20 ,  alignItems: 'center'}}>Prev</Text>
        //     </Button>
        // }

        // if(currPageIndex == (stepsLen - 1)) 
        // {
        //     footerNextBtn = <Button transparent onPress={() => this.performSubmitDiaryDetails()}>
        //         <Text style={{color: 'white', fontSize: 18,  marginRight: -20,alignItems: 'center' }}>Submit</Text>
        //          <Icon name="md-checkmark" style={{ color: 'white' }} />
        //     </Button>  
        // } 

        // else 
        // {
        //     footerNextBtn = <Button transparent onPress={() => this.openStepByIndex(this.state.currPageIndex + 1)}>
        //         <Text style={{color: 'white', fontSize: 18, marginRight: -20,alignItems: 'center' }}>Next</Text>
        //         <Icon name="ios-arrow-forward" style={{ color: 'white' }} />
        //     </Button>
        // }


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
                        <Title>School Diary</Title>
                    </Body>
                </Header>

                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <ScrollView horizontal={true} contentContainerStyle={{ alignItems: 'center' }}
                        showsHorizontalScrollIndicator={false}
                        style={{ backgroundColor: 'white', height: 40, maxHeight: 60, }}
                        ref={(scroll) => this.scrollView = scroll} >
                        {wizardTitles}
                    </ScrollView>

                    <View style={{ flex: 1 }}>
                        {steps[this.state.currPageIndex].component}
                    </View>

                    <View style={{ flexDirection: 'row', height: 50, backgroundColor: appColor.colorPrimaryDark }}>
                        {footerPrevBtn}
                        <View style={{ flex: 1, flexDirection: 'row' }}></View>
                        {footerNextBtn}
                    </View>
                </View>

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
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return { instituteId: state.teacherInfo.InstituteId };
};

//export default AddSchoolDiaryWnd;
export default connect(mapStateToProps, { ActionAddTeacher, ActionDeleteDairyDetails })(AddSchoolDiaryWnd);