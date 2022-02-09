/**
 * @flow
 */

import appColor from '../config/color.json'
import React, {
    Component
} from 'react';
import { 
    Image, TouchableHighlight,StyleSheet
} from 'react-native';

import {
    View, Text,
} from "native-base";
import Left from '../theme/components/Left';


export default class MenuActionCard extends Component {

    performClickAction() {
        if (this.props.cardName == 'Test Results') {
            this.props.nativation.navigate('TestResultTabBarWnd')
        } else if (this.props.cardName == 'School Diary') {
            this.props.nativation.navigate('RecentSchoolDiary')
        } else if (this.props.cardName == 'Attendance') {
            this.props.nativation.navigate('AttendanceTabBarWnd')
        }
    }

    render() {
        let imageLayout;
        if (this.props.cardName == 'Test Results') {
            imageLayout = require('../../assets/ic_testresult.png');
        } else if (this.props.cardName == 'School Diary') {
            imageLayout = require('../../assets/ic_schooldiary.png');
        } else if (this.props.cardName == 'Attendance') {
            imageLayout = require('../../assets/ic_attendance.png');
        }
        
        const cardHeight = 80;

        return (
            <View style={{ width: this.props.childWidth, borderRadius: 10, alignSelf: 'center', marginTop: 30 }}>
                <TouchableHighlight style={{ width: '100%' }} underlayColor='#00000002' onPress={() => this.performClickAction() }>
                    <View style={{ flex: 1, height: cardHeight, flexDirection: 'row', alignItems: 'center',  backgroundColor: 'white',borderRadius: 7, borderColor:appColor.light_gray ,borderWidth: 1}}>
                        
                        <View style={{padding:15, backgroundColor:this.props.cardColor, borderColor:appColor.light_gray,borderWidth: 1,borderRadius: 7, }}>
                            <Image  resizeMode={'stretch'} source={imageLayout} 
                             /> 
                        </View>

                        <View >
                            <Text style={{ color: appColor.darkgray, fontSize: 20, fontWeight: '500', marginLeft: 20, }}>
                                        {this.props.cardName}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}

const layoutDesign = StyleSheet.create({
 menuCardImage: {
        height: 60,
        width: 60,
        marginTop: -20,
        marginLeft:5,
        borderColor: appColor.light_gray,
        borderWidth: 2,
        backgroundColor: appColor.white,
        zIndex: 5,
       
    }
})

 