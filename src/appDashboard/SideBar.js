
import React from "react";
import {
    TouchableHighlight, FlatList, Platform,
    StyleSheet, Linking, Share, Alert
} from "react-native";
import {
    Container, Content, Text, View,
    Thumbnail, Icon, Badge
} from "native-base";

import {
    APP_STORE_LINK, PLAY_STORE_LINK,
    version_ios, version_android
} from '../config/AppConst'
import appColor from '../config/color.json';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';

import AwesomeAlert from 'react-native-awesome-alerts';
import { connect } from 'react-redux';
import { ActionAddTeacher, ActionDeleteTeacher } from '../redux_reducers/TeacherInfoReducer';


class SideBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            menuListData: [], loading: false
        }
    }
    changeLoadingStatus(isShow) {
        if (!this._isMounted) return;
        this.setState({ loading: isShow });
    }

    componentWillMount() {
        this._isMounted = true;

        //load menu list in flat list
        let recordsArr = [];

        // recordsArr.push({
        //     'name': 'Change Password',
        //     'icon': require('../../assets/outline_lock_black_48dp.png'),
        // });   
        recordsArr.push({
            'name': 'My Profile',
            'icon': require('../../assets/outline_perm_identity_black_48dp.png'),
        });
        recordsArr.push({
            'name': 'About App',
            'icon': require('../../assets/outline_info_outline_black_24dp.png'),
        });
        recordsArr.push({
            'name': 'Rate App',
            'icon': require('../../assets/outline_star_border_black_24dp.png'),
        });
        // recordsArr.push({
        //     'name': 'Message',
        //     'icon': require('../../assets/outline_forum_black_24dp.png'),            
        // });
        recordsArr.push({
            'name': 'Share',
            'icon': require('../../assets/outline_share_black_24dp.png'),
        });
        recordsArr.push({
            'name': 'Logout',
            'icon': require('../../assets/outline_power_settings_new_black_24dp.png'),
        });

        this.setState({ menuListData: recordsArr })
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    performMenuClick(menuName) {
        if (menuName == 'My Profile') {
            this.props.navigation.closeDrawer();
            this.props.navigation.navigate('ProfileScreen')
        } else if (menuName == 'Change Password') {
            this.props.navigation.closeDrawer();
            this.props.navigation.navigate('Dashboard_ChangePass')

        }
        // else if(menuName == 'Message') {
        //     this.props.navigation.closeDrawer();
        //     this.props.navigation.navigate('MessageList')

        // }
        else if (menuName == 'Share') {
            this.props.navigation.closeDrawer();
            let link;
            if (Platform.OS == 'ios') link = APP_STORE_LINK;
            else link = PLAY_STORE_LINK;

            Share.share({
                message: 'Excellent app to manage Online Test Results, Attendance,  messages & assignments. Download App ' + link,
                title: 'Share App'
            }, {
                dialogTitle: 'Share App', // Android only
            })
        } else if (menuName == 'Rate App') {
            this.props.navigation.closeDrawer();
            try {
                // let link;
                // if (Platform.OS == 'ios') link = APP_STORE_LINK;
                // else link = PLAY_STORE_LINK;

                // Linking.canOpenURL(link)
                //     .then(supported => {
                //         if(supported)
                //             Linking.openURL(link);
                //         else
                //             Alert.alert('Oops', 'No application found')
                //     }, (err) => {
                //         Alert.alert('Oops', 'No application found')
                //     });
                Alert.alert('Message', 'App is still in development.')
            } catch (error) { }

        } else if (menuName == 'About App') {
            this.props.navigation.closeDrawer();
            this.props.navigation.navigate('AppInfo');
        } else if (menuName == 'Logout') {
            Alert.alert('Are you sure?', 'If you Logout, you will no longer be able to receive notifications from School Magica.',
                [
                    {
                        text: 'Yes', onPress: () => this.performLogout()
                    },
                    { text: 'No' },
                ])
        }
    }



    performLogout = async () => {
        await AsyncStorage.clear();
        this.props.ActionDeleteTeacher();
        this.props.navigation.navigate('Launcher');
    }

    getRenderRow(data) {
        return <View style={{ flex: 1, flexDirection: 'column' }}>
            <TouchableHighlight underlayColor='#00000010'
                onPress={() => this.performMenuClick(data.name)}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 17 }}>
                    <Thumbnail square source={data.icon}
                        style={data.name === 'About App' ? { alignSelf: 'center', resizeMode: 'contain', width: 27, height: 27 } : { alignSelf: 'center', resizeMode: 'contain', width: 30, height: 30 }} />
                    <Text numberOfLines={1} ellipsizeMode={'tail'} style={[layoutDesign.titleHeadingText, { flex: 1 }]}>{data.name}</Text>
                    <Icon name='ios-arrow-forward' style={{ fontSize: 26, color: appColor.light_gray }} />
                </View>
            </TouchableHighlight>
            <View style={{ width: '100%', height: 1, backgroundColor: appColor.lightest_gray }} />
        </View>
    }

    render() {
        let versionLayout;
        if (Platform.OS == 'ios')
            versionLayout = <Text style={layoutDesign.footerText}>Version {version_ios}</Text>
        else
            versionLayout = <Text style={layoutDesign.footerText}>Version {version_android}</Text>
        let blankHeaderLayout;
        const hasNotch = DeviceInfo.hasNotch();
        if (hasNotch) {
            blankHeaderLayout = <View style={{ height: 50 }} />
        }

        return (
            <Container style={{ backgroundColor: 'white' }}>
                <Content style={{ flex: 1 }}>
                    {blankHeaderLayout}
                    <FlatList
                        data={this.state.menuListData}
                        key={'menu_' + this.props.feedbackUnreadCnt}
                        renderItem={({ item }) => this.getRenderRow(item)}
                        enableEmptySections={true}
                        numColumns={1}
                        keyExtractor={(item, index) => String(index)}
                    />
                </Content>

                <View style={{ height: 55, backgroundColor: appColor.lightest_gray, alignItems: 'center', justifyContent: 'center' }}>
                    {versionLayout}
                </View>

                {this.state.loading && <AwesomeAlert
                    show={this.state.loading}
                    overlayStyle={{ width: '100%', height: '100%' }}
                    messageStyle={{ textAlign: 'center' }}
                    showProgress={true}
                    progressSize="large"
                    message="Loading, Please wait..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={false}
                />}
            </Container>
        );
    }
}



const layoutDesign = StyleSheet.create({
    footerText: {
        fontSize: 14, color: appColor.font_gray, fontStyle: 'italic'
    },
    titleHeadingText: {
        fontSize: 18, color: appColor.darkgray,
        marginLeft: 15,
    },
    parentPhoto: {
        alignSelf: 'center', resizeMode: 'stretch',
        width: 25, height: 25,
        borderRadius: 13
    },
    parentPhotoFrame: {
        alignSelf: 'center', backgroundColor: '#00000010',
        width: 25, height: 25, marginRight: 5,
        borderRadius: 13, padding: 1
    },
});

const mapStateToProps = state => {
    return {
        instituteId: state.teacherInfo.InstituteId,
        fname: state.teacherInfo.FirstName,
        lname: state.teacherInfo.LastName,
        mobileNumber: '',
        emailID: state.teacherInfo.EmailID,
        teacherImageData: state.teacherInfo.PhotoPath,
    };
};
export default connect(mapStateToProps, { ActionAddTeacher, ActionDeleteTeacher })(SideBar);
