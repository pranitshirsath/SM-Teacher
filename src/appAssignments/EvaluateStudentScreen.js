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

class EvaluateStudentScreen extends Component {
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
			AssignmentList: [],
			selectedStartDate: false,
			selectedEndDate: false,
			TextEditable: false,
			AssignmentId: '',
			StudentsList: [
				{
					name: '',
					id: 0,
					checked: false,
				},
			],
			totalAssignmentSubmission: '',
			AssignmentTitle: '',
			SubmittionDate: '',
			CreatedOn: '',
			checked: false,
			ScreenName: '',
			TotalMarks: '',
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
		//const comingFrom = this.props.navigation.state.params.comingFrom;
		// this.setState({
		// 	ScreenName: comingFrom,
		// });
		this._isMounted = true;
		const AssignmetnID = this.props.navigation.state.params;
		this.setState({
			AssignmentId: AssignmetnID,
		});
		this.props.navigation.addListener('willFocus', this._handleStateChange);
	}

	_handleStateChange = (state) => {
		this.loadEvaluateAssignmentDetails(false);
	};

	loadEvaluateAssignmentDetails = async (isInitial) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					this.changeLoadingStatus(true);
					const requestJson = {
						AutoAssignmentId: this.state.AssignmentId,
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
					};
					const obj = new HTTPRequestMng('', 'GetAssignmentEvaluateDetails', this);
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

	onEvaluateDeatailsResponse(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				this.state.selectedStartDate = '';
				this.state.selectedEndDate = '';
				const assignmentsList = jsonRec['cEvaluateAssignmentDetails'];
				const title = assignmentsList[0].Title;
				const totalmarks = assignmentsList[0].MaxMarks;
				const creationdate = assignmentsList[0].CreateDate;
				const submissiondate = assignmentsList[0].SubmissionDate;
				const totalAssignmentsubmission = assignmentsList[0].TotalSubmission;
				if (assignmentsList != undefined) {
					this.setState({
						StudentsList: assignmentsList,
						loading: false,
						listLoadAttempted: true,
						totalAssignmentSubmission: totalAssignmentsubmission,
						AssignmentTitle: title,
						SubmittionDate: submissiondate,
						CreatedOn: creationdate,
						TotalMarks: totalmarks,
					});
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

	handleCheckBox(itemID) {
		let list = this.state.StudentsList;
		list[itemID].checked = !list[itemID].checked;
		this.setState({ StudentsList: list });
	}

	checkStatus(status, StudentAssignmentId) {
		console.log(status);
		if (status == 2 || status == 3) {
			this.props.navigation.navigate('EvaluationScreens', StudentAssignmentId);
		} else {
			alert('Student not Submitted this Assignment yet!');
		}
	}

	renderAssignmentList(index, item) {
		console.log(item, index);
		return (
			<View style={{ flex: 1, marginLeft: 10, marginRight: 10, marginTop: 10 }}>
				<TouchableHighlight>
					<Card style={{ borderRadius: 10 }}>
						<CardItem bordered style={{ borderRadius: 5, borderColor: 'white' }}>
							<View
								style={{
									flex: 1,
									margin: 5,
								}}
							>
								<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
									<Text
										numberOfLines={1}
										ellipsizeMode={'tail'}
										style={layoutDesign.titleHeadingText}
									>
										{item.StudentName}
									</Text>
									<Text
										style={{
											fontSize: 14,
											color: appColor.font_gray,
											fontWeight: '400',
											marginLeft: 30,
										}}
									>
										Marks: {item.MarksObtained}
									</Text>
								</View>
								<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
									<Text style={layoutDesign.headingText}>Registration Number:</Text>
									<Text
										style={{
											fontSize: 14,
											color: appColor.font_gray,
											fontWeight: '400',
											marginLeft: 10,
										}}
									>
										{item.RegistrationNumber}
									</Text>
								</View>
								<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
									<Text style={layoutDesign.headingText}>Submission Date:</Text>
									<Text
										style={{
											fontSize: 14,
											color: appColor.font_gray,
											fontWeight: '400',
											marginLeft: 10,
										}}
									>
										{item.SubmissionDate}
									</Text>
								</View>
								<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
									<Text style={layoutDesign.headingText}>Evaluation Date:</Text>
									<Text
										style={{
											fontSize: 14,
											color: appColor.font_gray,
											fontWeight: '400',
											marginLeft: 10,
											width: 150
										}}
									>
										{item.FeedbackDate ? item.FeedbackDate : "-"}
									</Text>
								</View>
								{/* <View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										marginTop: 10,
									}}
								>
									<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
										<Text style={{ fontSize: 11, color: appColor.font_gray, width: 150 }}>
											Evaluation Date: {item.FeedbackDate ? item.FeedbackDate :"-" }
										</Text>
										<Icon
											name="md-checkmark-circle"
											style={{
												color: appColor.colorPrimary,
												marginLeft: 100,
											}}
											onPress={() => this.checkStatus(item.IsRead, item.StudentAssignmentId)}
										/>
									</View>
								</View> */}
								<View
									style={{
										alignSelf: "flex-end",
										flexDirection: "column",
										justifyContent: "center",
										// alignContent: "center",
										alignItems: "center",
										flexWrap: "wrap"
									}}>
									{/* <View style={{
									}}> */}
									<Icon
										name="md-checkmark-circle"
										style={{
											color: appColor.colorPrimary,
											marginLeft: 10
										}}
										onPress={() => this.checkStatus(item.IsRead, item.StudentAssignmentId)}
									/>
									<Text style={{ color: appColor.colorPrimary, fontsize: 11, textAlign: "center" }}>
										{item.IsRead == 3 ? 'Re-Evaluate' : 'Evaluate'}
									</Text>
								</View>
							</View>
							{/* </View> */}
						</CardItem>
					</Card>
				</TouchableHighlight>
			</View>
		);
	}


	checkOnWhichScreenDataToBeSent(data) {
		const screenName = this.state.ScreenName;
		if (screenName == 'Update Assignment') {
			this.props.navigation.navigate('EditAssignmentsScreen', { data: data });
		} else {
			this.props.navigation.navigate('CreateAssignment', { data: data });
		}
	}
	render() {
		const listWidth = screenWidth / (getOrientation() == 'portrait' ? 1 : 2);

		const childWidth = screenWidth / (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : isTablet ? 2 : 1.5);

		//no data available panel
		let noDataLayout;
		if (this.state.AssignmentList.length == 0 && this.state.listLoadAttempted) {
			let noLayImageName = 'blank_assignment';
			if (PixelRatio.get() > 1.5) {
				if (isTablet || (getOrientation() == 'portrait' && !isTablet)) {
					noLayImageName = 'blank_assignment';
				}
			}
			noDataLayout = (
				<NoDataFound
					orientation={getOrientation()}
					imageName={noLayImageName}
					title="No record found"
					body="All Assignments will appear here"
				/>
			);
		}

		return (
			<Container style={{ backgroundColor: 'white' }}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()}>
							<Icon name="arrow-back" />
						</Button>
					</Left>
					<Body>
						<Title>Evaluate Assignment</Title>
					</Body>
				</Header>
				<Content padder>
					<View
						style={{
							flex: 1,
							marginTop: 10,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<View
							style={{
								marginTop: 5,
								marginLeft: 10,
								flexDirection: 'row',
							}}
						>
							<Text
								style={{
									justifyContent: 'flex-start',
									alignItems: 'flex-start',
									flex: 1,
								}}
							>
								Title:- {this.state.AssignmentTitle}
							</Text>
						</View>
						<View
							style={{
								marginTop: 5,
								marginLeft: 10,
								flexDirection: 'row',
							}}
						>
							<Text
								style={{
									justifyContent: 'flex-start',
									alignItems: 'flex-start',
									flex: 1,
								}}
							>
								Submission Date :- {this.state.SubmittionDate}
							</Text>
						</View>
						<View
							style={{
								marginTop: 5,
								marginLeft: 10,
								flexDirection: 'row',
							}}
						>
							<Text
								style={{
									justifyContent: 'flex-start',
									alignItems: 'flex-start',
									flex: 1,
								}}
							>
								Creation Date :- {this.state.CreatedOn}
							</Text>
						</View>
						<View
							style={{
								marginTop: 5,
								marginLeft: 10,
								flexDirection: 'row',
							}}
						>
							<Text
								style={{
									justifyContent: 'flex-start',
									alignItems: 'flex-start',
									flex: 1,
								}}
							>
								Total Marks :- {this.state.TotalMarks}
							</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
							<View style={{ flex: 1, height: 1, backgroundColor: appColor.colorPrimary }} />
							<View>
								<Text style={{ height: 1, textAlign: 'center', color: appColor.colorPrimary }}></Text>
							</View>
							<View style={{ flex: 1, height: 1, backgroundColor: appColor.colorPrimary }} />
						</View>
						<View>
							<Text style={{ marginTop: 5 }}>
								Total Submission:- {this.state.totalAssignmentSubmission}
							</Text>
						</View>
						<FlatList
							style={{ width: listWidth, marginTop: 10 }}
							data={this.state.StudentsList}
							renderItem={({ item, index }) => this.renderAssignmentList(index, item)}
							enableEmptySections={true}
							key={getOrientation()}
							onRefresh={() => this.loadEvaluateAssignmentDetails(false)}
							refreshing={false}
						/>
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
export default connect(mapStateToProps, {})(EvaluateStudentScreen);
