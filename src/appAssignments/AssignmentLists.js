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
	RefreshControl,
	Image,
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

class AssignmentLists extends Component {
	constructor(props) {
		super(props);

		console.log('propss', props);
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
			onRefresh: false,
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
		this._isMounted = true;
		this.loadAssignmentListFromServer(false);
	}

	componentWillReceiveProps() {
		this.loadAssignmentListFromServer(false);
	}

	loadAssignmentListFromServer = async (isInitial) => {
		console.log("workinggggggg")
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					this.changeLoadingStatus(true);
					const requestJson = {
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
					};
					const obj = new HTTPRequestMng('', 'GetAssignmentLists', this);
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

	searchAssignmentsFromList = async (isInitial) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					this.changeLoadingStatus(true);
					const requestJson = {
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
						FromDate: this.state.selectedStartDate,
						ToDate: this.state.selectedEndDate,
					};
					const obj = new HTTPRequestMng('', 'GetAssignmentLists', this);
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

	shoDeletePopAlert(AssignmentId) {
		Alert.alert(
			'Hello Teacher',
			'Are you sure, You want to delete this Assignment ? ',
			[
				{
					text: 'Yes',
					onPress: () => this.deleteAssignmentFromList(AssignmentId),
				},
				{ text: 'No', onPress: () => console.log('Cancel Pressed!') },
			],
			{ cancelable: false }
		);
	}

	deleteAssignmentFromList = async (AssignmentId) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					//this.changeLoadingStatus(true);
					const requestJson = {
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
						AutoAssignmentId: AssignmentId,
					};
					const obj = new HTTPRequestMng('', 'DeleteAssignment', this);
					obj.executeRequest({ jsonstring: JSON.stringify(requestJson) });
				} else {
					this.setState({ loading: false, listLoadAttempted: true });
					Alert.alert('Oops', 'No internet connection');
				}
			});
		} catch (error) { }
	};

	updateViewFlagAssignment = async (isInitial) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					//this.changeLoadingStatus(true);
					const requestJson = {
						StudentAssignmentId: this.state.StudAssignmentId,
						SessionYear: this.props.sessionYear,
						InstituteId: this.props.schoolID,
					};
					const obj = new HTTPRequestMng('', 'UpdateReadAssignmentFlag_Student', this);
					obj.executeRequest(requestJson);
				} else if (!isInitial) {
					this.setState({ loading: false, listLoadAttempted: true });
					Alert.alert('Oops', 'No internet connection');
				} else {
					this.setState({ loading: false, listLoadAttempted: true });
				}
			});
		} catch (error) { }
	};

	getStudAssignmentIDfromFunction(StudAssignmentId, AutoAssignmentId) {
		this.state.StudAssignmentId = StudAssignmentId;
		this.state.AutoAssignmentId = AutoAssignmentId;
		this.updateViewFlagAssignment();
	}

	onHTTPReponseUpdateAssignmentFlag(respData) {
		try {
			if (!this._isMounted) return;
			const jsonRec = respData[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				this.props.navigation.navigate('Child_ViewAssignments', this.state.AutoAssignmentId);
			} else {
				this.setState({ loading: false, listLoadAttempted: true });
			}
		} catch (error) {
			console.error(error);
		}
	}

	onHTTPReponseAssignmentsList(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				this.state.selectedStartDate = '';
				this.state.selectedEndDate = '';
				const assignmentsList = jsonRec['AssignmentLists'];
				if (assignmentsList != undefined) {
					this.setState({
						AssignmentList: assignmentsList,
						loading: false,
						listLoadAttempted: true,
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

	onDeleteAssignmentResponse(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['Status'];
			const message = jsonRec['ErrorMessage'];
			if (status == 1) {
				this.setState({ loading: false, listLoadAttempted: true });
				this.loadAssignmentListFromServer();
			} else {
				Toast.show({
					text: 'Something went wrong',

					textStyle: { color: 'yellow' },
					buttonTextStyle: { color: 'yellow' },
				});
			}
		} catch (error) {
			console.error(error);
		}
	}
	onHttpError() {
		this.changeLoadingStatus(false);
		Alert.alert('Oops', 'Unable to connect with server, Please try after some time');
	}

	handleSearchClick() {
		if (this.state.selectedStartDate == '' || this.state.selectedEndDate == '') {
			Toast.show({
				text: 'Please enter valid dates',

				textStyle: { color: 'yellow' },
				buttonTextStyle: { color: 'yellow' },
			});
		} else {
			this.compareDates();
		}
	}

	checkAssignemtResultStatus(isread, StudentAssignmentId) {
		if (isread == 3) {
			this.props.navigation.navigate('Child_ResultsAssignments', StudentAssignmentId);
		} else {
			alert('Assignment is not submitted yet');
		}
	}

	renderAssignmentList(index, item) {
		return (
			<View style={{ flex: 1, marginLeft: 10, marginRight: 10, marginTop: 15 }}>
				<TouchableHighlight>
					<Card style={{ borderRadius: 10 }}>
						<CardItem bordered style={{ borderRadius: 5, borderColor: 'white' }}>
							<View
								style={{
									flex: 1,
									margin: 5,
								}}
							>
								<Text numberOfLines={1} ellipsizeMode={'tail'} style={layoutDesign.titleHeadingText}>
									{item.Title}
								</Text>
								<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
									<Text style={layoutDesign.headingText}>Created Date:</Text>
									<Text
										style={{
											fontSize: 14,
											color: appColor.black,
											fontWeight: '400',
											marginLeft: 10,
										}}
									>
										{item.CreatedDate}
									</Text>
								</View>
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										marginTop: 10,
									}}
								>
									<Text style={layoutDesign.headingText}>Submission Date:</Text>
									<Text
										style={{
											fontSize: 14,
											color: appColor.black,
											fontWeight: '400',
											marginLeft: 10,
										}}
									>
										{item.SubmissionDate}
									</Text>
								</View>
							</View>
						</CardItem>
						<CardItem footer bordered>
							<View style={{ flexDirection: 'row', flex: 1 }}>
								<TouchableHighlight
									underlayColor="#00000010"
									onPress={() =>
										this.props.navigation.navigate('EditAssignmentsScreen', {
											AssignmentId: item.AssignmentId,
										})
									}
									style={{
										flex: 1,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<View>
										<Icon
											name="md-create"
											style={{
												color: appColor.colorPrimary,
												marginLeft: 5,
											}}
										/>
										<Text style={layoutDesign.headingText}>Edit</Text>
									</View>
								</TouchableHighlight>
								<TouchableHighlight
									underlayColor="#00000010"
									onPress={() =>
										this.props.navigation.navigate('EvaluateStudentScreen', item.AssignmentId)
									}
									// onPress={() =>
									// 	this.checkAssignemtResultStatus(item.IsRead, item.StudentAssignmentId)
									// }
									style={{
										flex: 1,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<View>
										<Icon
											name="md-paper"
											style={{
												color: appColor.colorPrimary,
												marginLeft: 9,
											}}
										/>
										<Text style={layoutDesign.headingText}>Evaluate</Text>
									</View>
								</TouchableHighlight>
								<TouchableHighlight
									underlayColor="#00000010"
									onPress={() => this.shoDeletePopAlert(item.AssignmentId)}
									style={{
										flex: 1,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<View>
										<Icon
											name="md-trash"
											style={{
												color: appColor.colorPrimary,
												marginLeft: 10,
											}}
										/>
										<Text
											style={{
												fontSize: 11,
												color: appColor.font_gray,
												marginLeft: 7,
											}}
										>
											Delete
										</Text>
									</View>
								</TouchableHighlight>
							</View>
						</CardItem>
					</Card>
				</TouchableHighlight>
			</View>
		);
	}

	compareDates() {
		const startdate = this.state.selectedStartDate;
		const endDate = this.state.selectedEndDate;
		const splitdate = startdate.split('-');
		const splitendate = endDate.split('-');
		const startMonth = splitdate[1];
		const endMonth = splitendate[1];
		const startDate = splitdate[2];
		const endDateactual = splitendate[2];
		const startYear = splitdate[0];
		const endYear = splitendate[0];
		if (startYear < endYear || startYear == endYear) {
			if (startMonth < endMonth || startMonth == endMonth) {
				if (
					(startDate <= endDateactual && startMonth == endMonth) ||
					(startDate >= endDateactual && startMonth != endMonth)
				) {
					const fromdate = this.state.selectedStartDate;
					const todate = this.state.selectedEndDate;
					if (fromdate && todate) {
						const selectedFromDate = new Date(fromdate);
						const selectedToDate = new Date(todate);
						this.searchAssignmentsFromList();
					} else {
						Toast.show({
							text: 'Please select the dates',

							textStyle: { color: 'yellow' },
							buttonTextStyle: { color: 'yellow' },
						});
					}
				} else {
					Toast.show({
						text: 'To Date can not prior than From Date!',

						textStyle: { color: 'yellow' },
						buttonTextStyle: { color: 'yellow' },
					});
				}
			} else {
				Toast.show({
					text: 'Please enter valid dates !',

					textStyle: { color: 'yellow' },
					buttonTextStyle: { color: 'yellow' },
				});
			}
		} else {
			Toast.show({
				text: 'Please enter valid dates !',

				textStyle: { color: 'yellow' },
				buttonTextStyle: { color: 'yellow' },
			});
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
		let imageLayout;
		imageLayout = require('../../assets/blank_assignment.png');
		return (
			<Container style={{ backgroundColor: 'white' }}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()}>
							<Icon name="arrow-back" />
						</Button>
					</Left>
					<Body>
						<Title>Assignments</Title>
					</Body>
					<Right>
						<Button transparent onPress={() => this.props.navigation.navigate('CreateAssignment')}>
							<Icon name="add" />
						</Button>
					</Right>
				</Header>
				{/* <View
					style={{
						// flex: 0.1,
						// marginTop: 10,
						// marginLeft: 3,
						// marginRight: 3,
					}}
				> */}

				{/* </View> */}
				<View style={{
					flexDirection: 'row',
					padding: 6,
					// position:"relative",
					// top:15,
					// zIndex:9,
					// display:"flex"
					//  flex: 1 
				}}>
					<View style={layoutDesign.container}>
						<DatePicker
							style={layoutDesign.datePickerStyle}
							date={this.state.selectedStartDate} // Initial date from state
							mode="date" // The enum of date, datetime and time
							placeholder="From date"
							format="YYYY-MM-DD"
							minDate="01-01-2016"
							maxDate="31-12-2028"
							confirmBtnText="Confirm"
							cancelBtnText="Cancel"
							customStyles={{
								dateIcon: {
									//display: 'none',
									position: 'absolute',
									left: 0,
									top: 4,
									marginLeft: 0,
								},
								dateInput: {
									marginLeft: 36,
								},
							}}
							onDateChange={(date) => {
								this.setState({ selectedStartDate: date });
							}}
						/>
					</View>
					<View style={
						layoutDesign.container
					}>
						<DatePicker
							style={layoutDesign.datePickerStyle}
							date={this.state.selectedEndDate} // Initial date from state
							mode="date" // The enum of date, datetime and time
							placeholder="To date"
							format="YYYY-MM-DD"
							minDate="01-01-2016"
							maxDate="31-12-2028"
							confirmBtnText="Confirm"
							cancelBtnText="Cancel"
							customStyles={{
								dateIcon: {
									//display: 'none',
									position: 'absolute',
									left: 0,
									top: 4,
									marginLeft: 0,
								},
								dateInput: {
									marginLeft: 36,
								},
							}}
							onDateChange={(date) => {
								this.setState({ selectedEndDate: date });
							}}
						/>
					</View>
					{/* <View> */}
					<Button onPress={() => this.handleSearchClick()}>
						<Icon name="md-search" />
					</Button>
					{/* </View> */}
				</View>
				<Content>
					<FlatList
						style={{ width: listWidth }}
						data={this.state.AssignmentList}
						renderItem={({ item, index }) => this.renderAssignmentList(index, item)}
						enableEmptySections={true}
						key={getOrientation()}
						keyExtractor={(item, index) => String(index)}
						onRefresh={() => this.loadAssignmentListFromServer(false)}
						refreshing={this.state.onRefresh}
					/>
					{/* <View style={{ alignItems: 'center', justifyContent: 'center' }}>
						<Text style={{ marginTop: 100, color: appColor.font_gray }}>
							{this.state.AssignmentList.length == 0 ? 'No Assignments found ' : ''}
						</Text>
					</View>
					<View style={{ flex: 1 }}></View> */}
				</Content>
				{this.state.AssignmentList.length > 0 ? (
					<Text>.</Text>
				) : (
					<View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
						<Image
							resizeMode={'stretch'}
							source={imageLayout}
							style={{
								width: 100,
								height: 100,
							}}
						/>
						<Text style={{ color: appColor.font_gray, fontSize: 18 }}>
							{this.state.AssignmentList.length == 0 ? 'No Assignments found ' : ''}
						</Text>
					</View>
				)}
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
		width: 130,
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
export default connect(mapStateToProps, {})(AssignmentLists);
