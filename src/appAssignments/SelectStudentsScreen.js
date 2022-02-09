import React, { Component } from 'react';
import {
	View,
	Alert,
	Keyboard,
	TouchableHighlight,
	Dimensions,
	StyleSheet,
	Platform,
	FlatList,
	SafeAreaView,
	PixelRatio,
	ToastAndroid,
	CheckBox,
} from 'react-native';

import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Icon,
	Text,
	Body,
	Left,
	Right,
	Item,
	Input,
	Form,
	Toast,
	Thumbnail,
	Card,
	CardItem,
	Fab,
	ListItem,
} from 'native-base';

import AsyncStorage from '@react-native-community/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import InternetConn from '../networkConn/OfflineNotice';
import NetInfo from '@react-native-community/netinfo';
import HTTPRequestMng from './HTTPRequestMng';
import DatePicker from 'react-native-datepicker';
import NoDataFound from '../utils/NoDataView';
import ActionButton from 'react-native-action-button';

var appColor = require('../config/color.json');
import { getOrientation, screenWidth, onChangeScreenSize, isTablet } from '../utils/ScreenSize';

import { connect } from 'react-redux';

class SelectStudentsScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			confimPassword: '',
			password: '',
			oldPassword: '',
			hidePassword: true,
			hideCPassword: true,
			hideOldPassword: true,
			loading: false,
			listLoadAttempted: false,
			StudentsList: [],
			selectedStartDate: false,
			selectedEndDate: false,
			TextEditable: false,
			AssignmentId: '',
			ScreenName: '',
			SelectedStudentsArray: [],
			AutoStudIds: '',
			SelectedStudents: [],
			isSelectAll: false,
			unselectall: false,
		};

		this._onOrientationChange = this._onOrientationChange.bind(this);
	}

	_onOrientationChange(newDimensions) {
		onChangeScreenSize(newDimensions, this, true);
	}
	changeLoadingStatus(isShow) {
		this.setState({ loading: isShow });
	}

	componentDidMount() {
		const comingFrom = this.props.navigation.state.params.comingFrom;
		const ClassId = this.props.navigation.state.params.AutoClassId;
		const SectionId = this.props.navigation.state.params.AutoSectionId;
		const AutoSubjectId = this.props.navigation.state.params.AutoSubjectId;

		console.log(ClassId + '' + SectionId + '' + AutoSubjectId);
		this.setState({
			ScreenName: comingFrom,
		});

		if (comingFrom == 'Update Assignment') {
			const AutoStudIds = this.props.navigation.state.params.SelectedStudents;
			console.log(AutoStudIds);
			const splitIds = AutoStudIds.split(',');
			const totalIds = splitIds.length;
			const studentarray = [];
			for (var i = 0; i < totalIds; i++) {
				studentarray.push(splitIds[i]);
			}
			console.log('totalSTUDENTS', studentarray);
			this.setState({
				SelectedStudents: studentarray,
			});
		}
		this._isMounted = true;

		if (ClassId == '') {
			ClassId = 0;
		}
		if (SectionId == '') {
			SectionId = 0;
		}
		if (AutoSubjectId == '') {
			AutoSubjectId = 0;
		}
		this.loadStudentsListFromServer(false, ClassId, SectionId, AutoSubjectId);
	}

	loadStudentsListFromServer = async (isInitial, ClassId, SectionId, AutoSubjectId) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					this.changeLoadingStatus(true);
					const requestJson = {
						AutoClassId: ClassId,
						AutoSectionId: SectionId,
						AutoSubjectId: AutoSubjectId,
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
					};
					const obj = new HTTPRequestMng('', 'FillStudents', this);
					obj.executeRequest({ jsonstring: JSON.stringify(requestJson) });
				} else if (!isInitial) {
					this.setState({ loading: false, listLoadAttempted: true });
					Alert.alert('Oops', 'No internet connection');
				} else {
					this.setState({ loading: false, listLoadAttempted: true });
				}
			});
		} catch (error) { }
	};

	onStudentsListsResponse(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				const assignmentsList = jsonRec['StudentLists'];
				if (assignmentsList != undefined) {
					const data = assignmentsList;
					if (data.length > 0) {
						if (this.state.ScreenName == 'Update Assignment') {
							const students = this.state.SelectedStudents;
							for (var i = 0; i < data.length; i++) {
								for (var j = 0; j < students.length; j++) {
									if (students[j] == data[i].StudentId) {
										data[i].IsChecked = true;
									}
								}
							}
							console.log('FORMATEDDSTUDENTSLIST', data);
							this.setState({
								StudentsList: data,
								loading: false,
								listLoadAttempted: true,
							});
						} else {
							this.setState({
								StudentsList: data,
								loading: false,
								listLoadAttempted: true,
							});
						}
					} else {
						Alert.alert(
							'Hello Teacher',
							'No students available in this class',
							[
								{
									text: 'Ok',
									onPress: () => this.checkOnWhichScreenDataToBeSent(data),
								},
								// { text: 'No', onPress: () => console.log('Cancel Pressed!') },
							],
							{ cancelable: false }
						);
					}

					console.log('99999999999');
				} else {
					this.setState({ loading: false, listLoadAttempted: true });
				}
			} else {
			}
		} catch (error) {
			console.error(error);
		}
	}

	onHttpError() {
		this.changeLoadingStatus(false);
		Alert.alert('Oops', 'Unable to connect with server, Please try after some time');
	}

	handleCheckBox(item) {
		let list = this.state.StudentsList;
		item.IsChecked = !item.IsChecked;

		this.setState({ StudentsList: list, isSelectAll: false });
	}

	selectAllStudents() {
		let data = this.state.StudentsList;
		let dummylist = [];
		for (let i = 0; i < data.length; i++) {
			dummylist.push({
				StudentId: data[i].StudentId,
				StudentName: data[i].StudentName,
				IsChecked: true,
			});
		}

		this.setState({
			StudentsList: dummylist,
			unselectall: false,
			isSelectAll: true
		});
	}

	unSelectAll() {
		let data = this.state.StudentsList;
		let dummylist = [];
		for (let i = 0; i < data.length; i++) {
			dummylist.push({
				StudentId: data[i].StudentId,
				StudentName: data[i].StudentName,
				IsChecked: false,
			});
		}

		this.setState({
			StudentsList: dummylist,
			isSelectAll: false,
			unselectall: true,
		});
	}

	renderAssignmentList(index, item) {
		return (
			<Item style={{ marginRight: 10, marginLeft: 10, padding: 10 }}>
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<CheckBox value={item.IsChecked} onValueChange={() => this.handleCheckBox(item)} />
					<Text style={{ marginLeft: 5, marginTop: 2 }}>{item.StudentName}</Text>
				</View>
			</Item>
		);
	}

	checkOnWhichScreenDataToBeSent(data) {
		const screenName = this.state.ScreenName;
		const dummyData = [];
		if (data.length > 0) {
			console.log(data[0].IsChecked);
			for (var i = 0; i < data.length; i++) {
				console.log(data[i].IsChecked);
				if (data[i].IsChecked) {
					console.log('inside sucess');
					dummyData.push(data[i]);
				}
			}
		} else {
		}

		console.log('FormateddeDATA', dummyData);
		if (screenName == 'Update Assignment') {
			this.props.navigation.navigate('EditAssignmentsScreen', { data: dummyData, AssignmentId: 'null' });
		} else {
			this.props.navigation.navigate('CreateAssignment', { data: dummyData, AssignmentId: 'null' });
		}
	}
	render() {
		const listWidth = screenWidth / (getOrientation() == 'portrait' ? 1 : 2);

		const childWidth = screenWidth / (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : isTablet ? 2 : 1.5);

		//no data available panel
		// let noDataLayout;
		// if (this.state.AssignmentList.length == 0 && this.state.listLoadAttempted) {
		// 	let noLayImageName = 'blank_assignment';
		// 	if (PixelRatio.get() > 1.5) {
		// 		if (isTablet || (getOrientation() == 'portrait' && !isTablet)) {
		// 			noLayImageName = 'blank_assignment';
		// 		}
		// 	}
		// 	noDataLayout = (
		// 		<NoDataFound
		// 			orientation={getOrientation()}
		// 			imageName={noLayImageName}
		// 			title="No record found"
		// 			body="All Assignments will appear here"
		// 		/>
		// 	);
		// }

		return (
			<Container style={{ backgroundColor: 'white' }}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()}>
							<Icon name="arrow-back" />
						</Button>
					</Left>
					<Body>
						<Title>Select Students</Title>
					</Body>
				</Header>
				<Content>
					<View
						style={{
							flex: 1,
							marginTop: 10,
							marginLeft: 3,
							marginRight: 3,
						}}
					>
						<View style={{ flex: 1, flexDirection: 'row', margin: 10 }}>
							<View style={{ flexDirection: 'row' }}>
								<CheckBox
									value={this.state.isSelectAll}
									onValueChange={() => this.selectAllStudents(this.state.isSelectAll)}
								/>
								<Text style={{ marginLeft: 2, marginTop: 3, color: appColor.colorPrimary }}>Select All</Text>
							</View>
							<View style={{ flexDirection: 'row' }}>
								<CheckBox
									value={this.state.unselectall}
									onValueChange={() => this.unSelectAll(this.state.unselectall)}
									tintColors={{ true: appColor.colorPrimary, false: appColor.colorPrimary }}
								/>
								<Text style={{ marginLeft: 2, marginTop: 3, color: appColor.colorPrimary }}>UnSelect All</Text>
							</View>
						</View>
						<FlatList
							style={{ width: listWidth, height: 350, marginTop: 10 }}
							data={this.state.StudentsList}
							renderItem={({ item, index }) => this.renderAssignmentList(index, item)}
							enableEmptySections={true}
							key={getOrientation()}
						/>
						<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
							<Button
								block
								style={{
									color: appColor.colorPrimary,

									margin: 25,
								}}
								onPress={() => this.checkOnWhichScreenDataToBeSent(this.state.StudentsList)}
							>
								<Text>Add Students</Text>
							</Button>
						</View>
					</View>
				</Content>
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
	parentPhoto: {
		alignSelf: 'center',
		resizeMode: 'stretch',
		width: 94,
		height: 94,
		borderRadius: Platform.OS == 'android' ? 94 : 47,
	},
	parentPhotoFrame: {
		alignSelf: 'center',
		backgroundColor: 'white',
		width: 100,
		height: 100,
		borderRadius: 50,
		marginLeft: 10,
		borderWidth: 2,
		borderColor: appColor.light_gray,
		padding: 1,
	},
	parentName: {
		fontSize: 18,
		fontWeight: '600',
		color: 'white',
	},
	parentEmail: {
		fontSize: 15,
		color: 'white',
		fontStyle: 'normal',
	},
	childPhoto: {
		alignSelf: 'center',
		resizeMode: 'stretch',
		width: 66,
		height: 66,
		borderRadius: Platform.OS == 'android' ? 66 : 33,
	},
	childPhotoFrame: {
		alignSelf: 'center',
		backgroundColor: 'white',
		width: 70,
		height: 70,
		borderRadius: 35,
		borderWidth: 1,
		borderColor: appColor.light_gray,
		padding: 1,
	},
	titleHeadingText: {
		fontSize: 20,
		fontWeight: '500',
		color: appColor.colorPrimaryDark,
		flex: 1,
	},
	headingText: {
		fontSize: 11,
		color: appColor.font_gray,
	},
	bodyText: {
		fontSize: 16,
		color: appColor.black,
	},
	holidayTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: appColor.black,
	},
	numberSmallText: {
		fontSize: 16,
		color: appColor.black,
		fontWeight: '400',
	},
	container: {
		flex: 1,
	},
	title: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
		padding: 20,
	},
	datePickerStyle: {
		width: 150,
		marginTop: 5,
	},
});
const mapStateToProps = (state) => {
	return {
		instituteId: state.teacherInfo.InstituteId,
		SessionStartMonth: state.teacherInfo.SessionStartMonth,
		SessionYear: state.teacherInfo.SessionYear,
		attendanceID: state.attendanceInfo.attendanceID,
		sectionID: state.attendanceInfo.sectionID,
		sectionName: state.attendanceInfo.sectionName,
		isEditDetails: state.attendanceInfo.isEditDetails,
		totalStud: state.attendanceInfo.totalStud,
		totalPresent: state.attendanceInfo.totalPresent,
		totalAbsent: state.attendanceInfo.totalAbsent,
		attDate: state.attendanceInfo.attDate,
		studentList: state.attendanceInfo.studentList,
		isOfflineRecord: state.attendanceInfo.isOfflineRecord,
	};
};
export default connect(mapStateToProps, {})(SelectStudentsScreen);
