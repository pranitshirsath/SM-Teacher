/**
 * @flow
 */

import appColor from '../config/color.json'
import React, {
    Component
} from 'react';
import { 
    Image, TouchableHighlight,StyleSheet,TouchableOpacity,View
} from 'react-native';

import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Right,ActionSheet,
    Card,CardItem,Footer
} from "native-base";
import Left from '../theme/components/Left';

export default class MainMenu extends Component {
    performClickAction() {
        if (this.props.cardName == 'Test Results') {
            this.props.nativation.navigate('TestResultTabBarWnd')
        } else if (this.props.cardName == 'School Diary') {
            this.props.nativation.navigate('RecentSchoolDiary')
        } else if (this.props.cardName == 'Assignments') {
            this.props.nativation.navigate('AppAssignments')
        }else if (this.props.cardName == 'Attendance') {
            this.props.nativation.navigate('AttendanceTabBarWnd')
        }else if (this.props.cardName == 'Virtual Class') {
            this.props.nativation.navigate('ScheduleClassList')
        }
    }

    

    render() {
        let imageSource;
        if (this.props.cardName == 'Test Results') {
            imageSource = require('../../assets/Tests.png');
        } else if (this.props.cardName == 'School Diary') {
            imageSource = require('../../assets/Daily_activity_report.png');
        } else if (this.props.cardName == 'Assignments') {
            imageSource = require('../../assets/Assignments.png');
        }else if (this.props.cardName == 'Attendance') {
            imageSource = require('../../assets/Attendance.png');
        }else if (this.props.cardName == 'Virtual Class') {
            imageSource = require('../../assets/Attendance.png');
        }

        let menuColor;
        if (this.props.cardName == 'Test Results') {
            menuColor = '#493c91';
        } else if (this.props.cardName == 'School Diary') {
            menuColor = '#1ebcc1';
        } else if (this.props.cardName == 'Assignments') {
            menuColor = '#3190f7';
        }else if (this.props.cardName == 'Attendance') {
            menuColor = '#ef6a3a';
        }else if (this.props.cardName == 'Virtual Class') {
            menuColor = '#24c26e';
        }


        let circleColor;
        if (this.props.cardName == 'Test Results') {
            circleColor = '#443686';
        } else if (this.props.cardName == 'School Diary') {
            circleColor = '#1c9da1';
        } else if (this.props.cardName == 'Assignments') {
            circleColor = '#2d84df';
        }else if (this.props.cardName == 'Attendance') {
            circleColor = '#e05d2e';
        }else if (this.props.cardName == 'Virtual Class') {
            circleColor = '#21a05d';
        }


        const cardHeight = 80;
        return (
            <Card style={[layoutDesign.cardMenuBranch,{backgroundColor:menuColor}]}>
                <CardItem bordered style={[layoutDesign.cardMenuItemBrach,{backgroundColor:menuColor}]}>
                    <View style={layoutDesign.cardMenuItemContent}>
                        <View style = {[{justifyContent:'center',alignItems:'center',backgroundColor: circleColor,},layoutDesign.circleLayout]}>
                        <TouchableOpacity onPress = {()=> this.performClickAction()}>
                            <Image source = {imageSource}  style={layoutDesign.imageLayout}></Image>
                        </TouchableOpacity>
                        </View>
                       <Text style={layoutDesign.titleStyle}>{this.props.cardName}</Text>
                    </View>
                </CardItem>
           </Card>
        );
    }
}

const layoutDesign = StyleSheet.create({
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
        },
    
        cardMenuItemBrach:{
            flex:1,
            borderRadius: 20, 
            justifyContent:'center',
            alignItems:'center',
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
})

 