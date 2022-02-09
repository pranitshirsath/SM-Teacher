import {
	createStackNavigator, createSwitchNavigator, NavigationActions,
	createDrawerNavigator, createAppContainer
} from 'react-navigation'

import React from 'react';
import { BackHandler, Alert } from "react-native";

import SplashScreen from './SplashScreen'
import LoginScreen from './appAccountManager/LoginScreen'
import ForgotPassword from './appAccountManager/ForgotPassword'
import InstituteListWnd from './appAccountManager/InstituteListWnd'
import InstituteListWnd2 from './appAccountManager/InstituteListWnd2'

import DashboardWnd from './appDashboard/DashboardWnd'
import ProfileScreen from './appDashboard/ProfileScreen'
import UpdateProfileWnd from './appDashboard/UpdateProfileWnd'
import SideBarDrawer from "./appDashboard/SideBar";
import AddSchoolDiaryWnd from './appSchoolDiary/AddSchoolDiaryWnd'
import RecentSchoolDiary from './appSchoolDiary/RecentSchoolDiary'
import MessageList from './appMessages/MessageList'
import MessageDetailsWnd from './appMessages/MessageDetailsWnd'

import AddEditAttendanceWnd from './appAttendance/AddEditAttendanceWnd'
import AttendanceTabBarWnd from './appAttendance/AttendanceTabBarWnd'
import TabAttendanceListWnd from './appAttendance/TabAttendanceListWnd'
import TabSyncAttendanceList from './appAttendance/TabSyncAttendanceList'
import OfflineAttendanceDetailsWnd from './appAttendance/OfflineAttendanceDetailsWnd'

import TestResultTabBarWnd from './appTestResults/TestResultTabBarWnd.js'
import TabTestResultListWnd from './appTestResults/TabTestResultListWnd.js'
import TabSyncTestResult from './appTestResults/TabSyncTestResult.js'
import AddEditTestResultsWnd from './appTestResults/AddEditTestResultsWnd.js'
import OfflineTestDetailsWnd from './appTestResults/OfflineTestDetailsWnd.js'
import ScheduleClassList from './appVirtualClass/ScheduleClassList'
import AddEditClass from './appVirtualClass/AddEditClass'
import AssignmentLists from './appAssignments/AssignmentLists'
import AddNewAssignment from './appAssignments/AddNewAssignment'
import SelectStudentsScreen from './appAssignments/SelectStudentsScreen'
import EditAssignmentsScreen from './appAssignments/EditAssignmentsScreen'
import EvaluateStudentScreen from './appAssignments/EvaluateStudentScreen'
import EvaluationScreens from './appAssignments/EvaluationScreens'
import AppInfo from './appInformation/aboutAppInfo'


import { connect } from 'react-redux';
import { createReduxContainer, createReactNavigationReduxMiddleware, } from 'react-navigation-redux-helpers';
import VideoPlayerClass from './appVirtualClass/VideoPlayer';

const LoginStack = createStackNavigator(
	{
		SplashScreen: SplashScreen,
		LoginScreen: LoginScreen,
		ForgotPassword:ForgotPassword,
		InstituteListWnd2: InstituteListWnd2,
		InstituteListWnd: InstituteListWnd,
	},
	{ headerMode: 'none' });

//Dashboard Drawer
const DashboardDrawer = createDrawerNavigator({
	'Home': DashboardWnd,
}, {
	contentComponent: SideBarDrawer
});

const DashboardContainer = createAppContainer(DashboardDrawer);

const AppStack = createStackNavigator(
	{
		DashboardWnd: DashboardContainer,
		ProfileScreen:ProfileScreen,
		UpdateProfileWnd:UpdateProfileWnd,
		RecentSchoolDiary: RecentSchoolDiary,
		AddSchoolDiaryWnd: AddSchoolDiaryWnd,
		AttendanceTabBarWnd: AttendanceTabBarWnd,
		AttendanceListScreen: TabAttendanceListWnd,
		SyncAttendanceListScreen: TabSyncAttendanceList,
		AddEditAttendanceWnd: AddEditAttendanceWnd,
		OfflineAttendanceDetailsWnd: OfflineAttendanceDetailsWnd,
		TestResultTabBarWnd: TestResultTabBarWnd,
		TabTestResultListWnd: TabTestResultListWnd,
		TabSyncTestResult: TabSyncTestResult,
		AddEditTestResultsWnd: AddEditTestResultsWnd,
		OfflineTestDetailsWnd: OfflineTestDetailsWnd,
		ScheduleClassList: ScheduleClassList,
		RecordingPlayer: VideoPlayerClass,
		AddEditClass: AddEditClass,
		AppInfo: AppInfo,
		MessageList: MessageList,
		Child_MessageDetails: MessageDetailsWnd,
		AppAssignments: AssignmentLists,
		CreateAssignment: AddNewAssignment,
		SelectStudentsScreen: SelectStudentsScreen,
		EditAssignmentsScreen: EditAssignmentsScreen,
		EvaluateStudentScreen: EvaluateStudentScreen,
		EvaluationScreens: EvaluationScreens

	},

	{
		initialRouteName: "DashboardWnd",
		headerMode: 'none'
	});

export const AppNavigation = createSwitchNavigator(
	{
		Launcher: LoginStack,
		AppStack: AppStack
	},
	{
		initialRouteName: "Launcher"
	}
);

export const middleware = createReactNavigationReduxMiddleware(
	state => state.nav,
);

const App = createReduxContainer(AppNavigation);

// create nav component
class ReduxNavigation extends React.Component {
	componentDidMount() {
		BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
	}
	componentWillUnmount() {
		BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
	}

	onBackPress = () => {
		const { navigation, dispatch } = this.props;

		if (navigation.index == 0) {
			if (navigation.routes[navigation.index].index == 1) { //login screen
				return false;
			}
			else if (navigation.routes[navigation.index].index == 2) {  // instituteList screen
				dispatch(NavigationActions.navigate({ routeName: 'LoginScreen' }));
			}
			else {
				if (navigation.routes[navigation.index].index == 0) {
					return false;
				}
			}
		}

		else if (navigation.index == 1) {
			if (navigation.routes[navigation.index].index == 0) {      //dashboard screen
				Alert.alert('Message', "Are you sure you want to exit?",
					[
						{ text: 'No' },
						{
							text: 'Yes', onPress: () => {
								BackHandler.exitApp()
							}
						},
					])
			} // add schooldiary screen || AttendanceListScreen ||any screen that started from dashboard
			else if (navigation.routes[navigation.index].index == 1) {
				dispatch(NavigationActions.navigate({ routeName: 'DashboardWnd' }));
			}
		}

		dispatch(NavigationActions.back());
		return true;
	};


	closeAppConfirmation = () => {

	}

	render() {
		const { navigation, dispatch } = this.props
		return <App state={navigation} dispatch={dispatch} />;
	}
}

const mapStateToProps = state => ({
	navigation: state.nav,
});
export default connect(mapStateToProps)(ReduxNavigation);