import React, { Component, PureComponent } from 'react';
import { StyleSheet, Alert, FlatList, TouchableHighlight, Image, AsyncStorage } from 'react-native';
import {
	View,
	Text,
	Card,
	CardItem,
	Button,
	Icon,
	Content,
	Picker,
	Toast,
	Header,
	Body,
	Title,
	Left,
	Container,
} from 'native-base';

import { connect } from 'react-redux';
import Moment from 'moment';
import ActionButton from 'react-native-action-button';
import InternetConn from '../networkConn/OfflineNotice';
import appColor from '../config/color.json';
import AwesomeAlert from 'react-native-awesome-alerts';
import HTTPRequestMng from './HTTPRequestMng';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';
import NetInfo from '@react-native-community/netinfo';

import {
	ActionDeleteDairyDetails,
	ActionUpdateDiaryDetailsStep1,
	ActionUpdateDiaryDetailsStep2,
} from '../redux_reducers/SchoolDiaryReducer';
import { getOrientation, screenWidth, onChangeScreenSize, isTablet } from '../utils/ScreenSize';
import { TouchableOpacity } from 'react-native-gesture-handler';

class AttendanceCell extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			expandedList: [],
			expanded: false,
			isExpandedTitle: 'More >>',
			studentList: [],
		};

		var temp_list = [];
		if (this.props.data.StudentList.length < 4) {
			temp_list = this.props.data.StudentList;
		} else {
			temp_list.push(this.props.data.StudentList[0]);
			temp_list.push(this.props.data.StudentList[1]);
			temp_list.push(this.props.data.StudentList[2]);
			temp_list.push(this.props.data.StudentList[3]);
		}
		this.state.expandedList = temp_list;
	}

	itemSeperator = () => {
		return <View style={{ padding: 4 }}></View>;
	};

	_onRefreshParent() {
		this.props.onRefresh();
	}

	render_FlatList_footer = () => {
		if (this.props.data.StudentList.length > 4) {
			return (
				<View>
					<TouchableOpacity
						style={{ marginLeft: 25, marginTop: 5 }}
						onPress={() => {
							this.onListExpanded(this.state.studentList);
						}}
					>
						<Text style={{ color: appColor.googleBlue, fontSize: 15 }}> {this.state.isExpandedTitle} </Text>
					</TouchableOpacity>
				</View>
			);
		} else {
			return <View></View>;
		}
	};

	onListExpanded(diaryList) {
		var temp_expanded = !this.state.expanded;
		if (temp_expanded) {
			this.setState({ expandedList: diaryList, isExpandedTitle: '<< Less', expanded: temp_expanded });
			console.log('length', this.state.expandedList.length);
		} else {
			var temp_list = [];
			if (diaryList.length < 4) {
				temp_list = diaryList;
			} else {
				temp_list.push(diaryList[0]);
				temp_list.push(diaryList[1]);
				temp_list.push(diaryList[2]);
				temp_list.push(diaryList[3]);
			}
			this.setState({ expandedList: temp_list, isExpandedTitle: 'More >>', expanded: temp_expanded });
		}
		console.log('length2', this.state.expandedList.length);
	}
	render() {
		const data = this.props.data;
		let monthVerticalText = '';
		let dateOfSchoolDiary2 = 'Not given';
		this.state.studentList = data.StudentList;
		// var temp_list =  [];
		//     if( data.StudentList.length < 4){
		//         temp_list =  data.StudentList;
		//     }else{
		//         temp_list.push( data.StudentList[0]);
		//         temp_list.push( data.StudentList[1]);
		//         temp_list.push( data.StudentList[2]);
		//         temp_list.push( data.StudentList[3]);

		//          }
		//         this.state.expandedList =  temp_list;

		if (data.SchoolDiary.SubmissionDate != '' && data.SchoolDiary.SubmissionDate != null) {
			// on 17-04-2020
			// const dateResult = Moment(data.SchoolDiary.SubmissionDate, 'dddd DD/MM/YYYY').toDate();
			// const dateOfSchoolDiary = String(Moment(dateResult).format('dddd DD/MM/YYYY'));
			// let temp_day = Moment(data.SchoolDiary.SubmissionDate).format('dddd');
			// let temp_date = Moment(data.SchoolDiary.SubmissionDate).format('DD/MM/YYYY');

			const dateResult = Moment(data.SchoolDiary.SubmissionDate, 'dddd DD/MM/YYYY').toDate();
			const dateOfSchoolDiary = String(Moment(dateResult).format('dddd DD/MM/YYYY'));
			let temp_day = Moment(data.SchoolDiary.SubmissionDate).format('dddd');
			let temp_date = Moment(data.SchoolDiary.SubmissionDate).format('DD/MM/YYYY');

			dateOfSchoolDiary2 = temp_day + ' ' + temp_date;
			let str = String(Moment(dateResult).format('MMM')).toUpperCase();
			let strArray = [];
			strArray = str.split('');
			strArray.forEach((singleObj) => {
				monthVerticalText = monthVerticalText + String(singleObj) + '\n';
			});
		} else {
			let strArray = [];
			strArray = 'Not given'.toUpperCase().split('');
			strArray.forEach((singleObj) => {
				monthVerticalText = monthVerticalText + String(singleObj) + '\n';
			});
		}

		return (
			<View style={{ flex: 1, paddingLeft: 10, paddingRight: 10, marginBottom: 10 }}>
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<TouchableHighlight underlayColor="#00000010" style={{ flex: 1 }}>
						<Card
							style={{
								borderTopStartRadius: 15,
								borderTopEndRadius: 15,
								borderBottomStartRadius: 15,
								borderBottomEndRadius: 15,
							}}
						>
							<CardItem
								bordered
								style={{
									borderTopStartRadius: 15,
									borderTopEndRadius: 15,
									borderBottomStartRadius: 15,
									borderBottomEndRadius: 15,
									borderColor: 'white',
								}}
							>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View
										style={{
											backgroundColor: '#00bcd4',
											width: 38,
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										<Text style={layoutDesign.verticalText}>{monthVerticalText}</Text>
									</View>

									<View style={{ flex: 1, flexDirection: 'column', marginLeft: 5 }}>
										{/* <Text numberOfLines={1} ellipsizeMode={'tail'}>
											{dateOfSchoolDiary2}
										</Text> */}

										<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
											<Text style={[layoutDesign.headingText]}>Title : </Text>
											<Text
												numberOfLines={1}
												ellipsizeMode={'tail'}
												style={{ color: appColor.black, fontSize: 14, marginLeft: 7 }}>
												{data.SchoolDiary.MessageTitle}
											</Text>
										</View>

										<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
											<Text style={[layoutDesign.headingText]}>Class : </Text>
											<Text
												numberOfLines={1}
												ellipsizeMode={'tail'}
												style={{ color: appColor.black, fontSize: 14, marginLeft: 7 }}
											>
												{data.SchoolDiary.AutoClassName  ? data.SchoolDiary.AutoClassName : '-'}
											</Text>
										</View>
										<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
											<Text style={[layoutDesign.headingText]}>Section : </Text>
											<Text
												numberOfLines={1}
												ellipsizeMode={'tail'}
												style={{ color: appColor.black, fontSize: 14, marginLeft: 7 }}
											>
												{data.SectionName}
											</Text>
										</View>
										
										<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
											<Text style={[layoutDesign.headingText]}>Subject : </Text>
											<Text
												numberOfLines={1}
												ellipsizeMode={'tail'}
												style={{ color: appColor.black, fontSize: 14, marginLeft: 7 }}
											>
												{data.SchoolDiary.SubjectName  ? data.SchoolDiary.SubjectName : '-'}
											</Text>
										</View>


										<View style={{ flexDirection: 'row',display:"none", alignItems: 'flex-start', marginTop: 3 }}>
											<Text style={[layoutDesign.headingText]}>Students : </Text>
											<FlatList
												style={{ marginTop: 3 }}
												data={this.state.expandedList}
												renderItem={
													({ item, index }) => (
														<Text style={{ fontSize: 14, width: 120, flexWrap: 'wrap' }}>
															{item.StudentName}
														</Text>
													)
													// <Text style={{fontSize:14,width:100}}>Kartik Narayan Satpute</Text>
												}
												enableEmptySections={true}
												keyExtractor={(item, index) => index.toString()}
												extraData={this.state}
												ItemSeparatorComponent={this.itemSeperator}
												ListFooterComponent={this.render_FlatList_footer}
											/>
											<TouchableOpacity
												onPress={() => {
													this.props.onListExpanded(this.state.this.state.studentList);
												}}
											>
												<Text style={{ color: 'black', fontSize: 14 }}>
													{this.props.expanded}
												</Text>
											</TouchableOpacity>
										</View>
									</View>
									<View style={{ alignItems: 'center', justifyContent: 'center' }}>
										<TouchableOpacity
											onPress={() => {
												this.props.onAttendanceSelection(
													this.props.index,
													data,
													this.props.parentReference
												);
											}}
										>
											<Image
												resizeMode={'stretch'}
												source={require('../../assets/ic_next.png')}
												style={{ width: 15, height: 30, marginLeft: 10 }}
											/>
										</TouchableOpacity>
									</View>
								</View>
							</CardItem>
						</Card>
					</TouchableHighlight>
				</View>
			</View>
		);
	}
}

class RecentSchoolDiary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			loadingMsg: '',
			schoolDiaryList: [],
			sectionList: [],
			refreshing: false,
			resreshScreen: false,
			expandedList: [],
			expanded: false,
			isExpandedTitle: 'More >>',
		};
	}

	onScreenRefresh() {
		Alert.alert('Screen refresh');
		setTimeout(() => {
			this.setState({ resreshScreen: true });
			// this.getSectionList();
			// this.getSchoolDiaryList();
		}, 100);
	}

	componentDidMount() {
		NetInfo.isConnected.fetch().then((isConnected) => {
			if (isConnected) {
				this.getSectionList();
				this.getSchoolDiaryList();
			} else {
				Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
			}
		});
	}

	_OnRefreshloadSchoolDiary() {
		NetInfo.isConnected.fetch().then((isConnected) => {
			if (isConnected) {
				this.setState({ refreshing: true });
				this.getSectionList();
				this.getSchoolDiaryList();
			} else {
				// this.changeLoadingStatus(false);
				Alert.alert('Message', 'No Internet Connection, Please try again after some time.');
			}
		});
	}

	getSchoolDiaryList() {
		// this.changeLoadingStatus(true);
		const obj = new HTTPRequestMng('', 'GetSchoolDiaryDetails', this);
		obj.executeRequest('InstituteId=' + this.props.instituteId + '&AutoTrainerId=' + this.props.autotrainerId);
	}

	getSectionList() {
		// this.changeLoadingStatus(true, 'Getting Diary details, Please wait...');
		this.changeLoadingStatus(true);
		const obj = new HTTPRequestMng('', 'GetSectionList', this);
		obj.executeRequest('InstituteId=' + this.props.instituteId);
	}

	onHTTPReponseSectionList(respData) {
		this.setState({ refreshing: false, loading: false });
		try {
			const jsonRec = respData[0];
			const status = jsonRec['Message'];
			if (status == 'Success') {
				// this.setState({ loading: false });

				const listData = jsonRec['Data'];
				console.info('SectionListData', listData);
				let recordCurrentList = [];

				if (listData != undefined) {
					listData.forEach((singleObj) => {
						const arrayObj = {
							SectionName: singleObj['SectionName'],
							AutoSectionId: singleObj['AutoSectionId'],
							AutoInstructorId: singleObj['AutoInstructorId'],
						};
						recordCurrentList.push(arrayObj);
					});

					// var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
					// const sorted = recordCurrentList.sort((a, b) => collator.compare(a.SectionName, b.SectionName))
					this.setState({ sectionList: recordCurrentList });
				}
			} else {
				Alert.alert('Message', 'Section is not created for given School Diary.');
				this.setState({ refreshing: false });
			}
		} catch (error) {
			this.setState({ refreshing: false, loading: false });
			// console.error("erroe", error);
		}
		//this.changeLoadingStatus(false,'');
	}

	changeLoadingStatus(isShow, msg) {
		this.setState({ loading: isShow, loadingMsg: msg });
	}

	onHTTPError() {
		//this.changeLoadingStatus(false);
		Alert.alert('Message', 'Unable to connect with server, Please try after some time');
		this.setState({ refreshing: false, loading: false });
	}

	onHTTPResponseDiaryDetails(respData) {
		this.setState({ refreshing: false, loading: false });
		try {
			const jsonRec = respData[0];
			const status = jsonRec['Message'];
			if (status == 'Success') {
				const listData = jsonRec['Data'];
				console.info('ClassListData', listData);
				let recordCurrentList = [];

				this.setState({ isClassListLoaded: true });

				if (listData != undefined) {
					listData.forEach((singleObj) => {
						//this.getSectionList(singleObj['SchoolDiaryDetails'].AutoClassId);
						let temp_sectionId = '-';
						for (var i = 0; i < this.state.sectionList.length; i++) {
							if (
								this.state.sectionList[i].AutoSectionId ===
								singleObj['SchoolDiaryDetails'].AutoSectionId
							) {
								temp_sectionId = this.state.sectionList[i].SectionName;
							}
						}
						const arrayObj = {
							SchoolDiary: singleObj['SchoolDiaryDetails'],
							StudentList: singleObj['StudentDetails'],
							Title: singleObj['MessageTitle'],
							SectionName: temp_sectionId,
						};
						console.log('Section list in', JSON.stringify(this.state.sectionList));
						recordCurrentList.push(arrayObj);
					});
					this.setState({ schoolDiaryList: recordCurrentList, refreshing: false, loading: false });
				}
			} else {
				//Alert.alert('Message', 'No School Diary detail is found.');
				this.changeLoadingStatus(false);
				this.setState({ isClassListLoaded: false, refreshing: false, loading: false });
			}
		} catch (error) {
			console.error('error', error);
			this.setState({ isClassListLoaded: false, refreshing: false, loading: false });
		}
		// this.changeLoadingStatus(false,'');
	}

	// onAttendanceSelection = async (index, data) => {
	//     try {
	//         const dateResult = Moment(data.SchoolDiary.Date, 'DD/MM/YYYY').toDate();
	//         const formatedDateVal = Moment(dateResult).format('YYYY/MM/DD');
	//         //Add attendance info into global status
	//         this.props.ActionUpdateDiaryDetailsStep1({
	//             instituteID: this.props.instituteID,
	//             classID: data.SchoolDiary.AutoClassId,
	//             sectionID: data.SchoolDiary.AutoSectionId,
	//             schoolDiaryID:data.SchoolDiary.AutoSDId,
	//             isClassListLoaded:false,
	//             classList:[],
	//             sectionList:[],
	//             studentList:data.StudentList,
	//             isEditDetails:true,
	//             AutoSDSectionId:data.SchoolDiary.AutoSDSectionId,
	//             subjectID: data.SchoolDiary.AutoSubjectId,
	//             //submissionDate:formatedDateVal,
	//             submissionDate:Moment(data.SchoolDiary.Date).format('DD/MM/YYYY'),
	//             msgTitle:data.SchoolDiary.MessageTitle,
	//             msgText: data.SchoolDiary.MessageText,
	//             sessionYear:data.SchoolDiary.SessionYear
	//         });

	//         await AsyncStorage.setItem('isScreen','UpdateDiary');
	//         this.props.navigation.navigate('AddSchoolDiaryWnd',{
	//             onScreenRefresh: this.onScreenRefresh.bind(this)
	//     });

	//     } catch (error) {
	//             console.log("error in update diary",error);
	//     }
	// }

	onAttendanceSelection = async (index, data, referenceObject) => {
		try {
			//console.log('attchament pathRecent',String(data.SchoolDiary.AttachmentPath));
			// Alert.alert(data.SchoolDiary.AttachmentPath);
			if (data.SchoolDiary.AttachmentPath === undefined) var attachment_path = '';
			else var attachment_path = data.SchoolDiary.AttachmentPath;
			//let attachment_path = data.SchoolDiary.AttachmentPath;
			const dateResult = Moment(data.SchoolDiary.Date, 'DD/MM/YYYY').toDate();
			const formatedDateVal = Moment(dateResult).format('YYYY/MM/DD');
			//Add attendance info into global status
			this.props.ActionUpdateDiaryDetailsStep1({
				instituteID: this.props.instituteID,
				classID: data.SchoolDiary.AutoClassId,
				schoolDiaryID: data.SchoolDiary.AutoSDId,
				sectionID: data.SchoolDiary.AutoSectionId,
				isClassListLoaded: false,
				classList: [],
				sectionList: [],
				studentList: data.StudentList,
				isEditDetails: true,
				AutoSDSectionId: data.SchoolDiary.AutoSDSectionId,
				subjectID: data.SchoolDiary.AutoSubjectId,
				submissionDate: Moment(data.SchoolDiary.SubmissionDate).format('DD/MM/YYYY'),
				msgTitle: data.SchoolDiary.MessageTitle,
				msgText: data.SchoolDiary.MessageText,
				sessionYear: data.SchoolDiary.SessionYear,
				attachFileData: attachment_path,
				fileName: attachment_path,
				attachFileExtension: attachment_path.substring(attachment_path.lastIndexOf('.')).trim(),
				isAttachModify: true,
			});
			await AsyncStorage.setItem('isScreen', 'UpdateDiary');
			this.props.navigation.navigate('AddSchoolDiaryWnd', {
				onScreenRefresh: referenceObject.onScreenRefresh.bind(referenceObject),
			});
		} catch (error) {
			console.log('error in update diary', error);
		}
	};

	onRenderSchoolDiaryListData(item, index) {
		return (
			<View
				style={{
					width: '100%',
					flex: 1,
					flexDirection: 'row',
					justifyContent: 'space-between',
					paddingLeft: 5,
					paddingRight: 5,
				}}
			>
				<Text style={[layoutDesign.item, { flex: 1 }]}>{item.StudentName}</Text>
			</View>
		);
	}

	render() {
		const childWidth = screenWidth / (getOrientation() == 'portrait' ? 1 : 1.5);
		const progressBarWidth = childWidth / 1.5;
		let listHeader;
		// if(this.state.studentList.length>0)
		// {
		//    listHeader= <View style={{width: '100%',flex: 1,flexDirection: 'row', justifyContent :'space-between',                                       backgroundColor:appColor.lighten_gray}}>
		//                     <Text style={[layoutDesign.item ,{flexGrow: 1,fontSize:11}]}>  </Text>
		//                     <Text style={[layoutDesign.item ,{flexGrow: 1,fontSize:11}]}> Student Name </Text>
		//                     <Text style={[layoutDesign.item ,{flexGrow: 1,fontSize:11,
		//                    textAlign: 'right',marginRight: 10}]}>Reg No.</Text>
		//                 </View>
		// }
		// else
		// {
		//     listHeader=<View></View>;
		// }
		let imageLayout;
		imageLayout = require('../../assets/ic_schooldiary.png');
		return (
			<Container style={{ backgroundColor: appColor.background_gray }}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()}>
							<Icon name="arrow-back" />
						</Button>
					</Left>
					<Body>
						<Title>School Diary</Title>
					</Body>
				</Header>
				<View>
					<InternetConn />
				</View>
				<Content style={{ padding: 10 }}>
					<FlatList
						data={this.state.schoolDiaryList}
						renderItem={({ item, index }) => (
							<AttendanceCell
								data={item}
								index={index}
								onAttendanceSelection={this.onAttendanceSelection}
								progressBarWidth={progressBarWidth}
								onRefresh={this.onScreenRefresh.bind(this)}
								parentReference={this}
							/>
						)}
						enableEmptySections={true}
						keyExtractor={(item, index) => index.toString()}
						extraData={this.state}
						onRefresh={() => this._OnRefreshloadSchoolDiary()}
						refreshing={false}
						onEndReachedThreshold={0.5}
					/>
				</Content>
				<ActionButton
					buttonColor={appColor.colorAccent}
					buttonTextStyle={{ fontSize: 36 }}
					onPress={async () => {
						this.props.navigation.navigate('AddSchoolDiaryWnd', {
							onScreenRefresh: this.onScreenRefresh.bind(this),
						});
						console.log('actionButton', 'asdazdasasdxdv');
						await AsyncStorage.setItem('isScreen', 'AddDiary');
					}}
					fixNativeFeedbackRadius={true}
				/>
				{this.state.schoolDiaryList.length > 0 ? (
					<Text>.</Text>
				) : (
					<View style={{ flex: 5, alignItems: 'center', justifyContent: 'center' }}>
						<Image
							resizeMode={'stretch'}
							source={imageLayout}
							style={{
								width: 100,
								height: 100,
							}}
						/>
						<Text style={{ color: appColor.font_gray, fontSize: 18 }}>
							{this.state.schoolDiaryList.length == 0 ? 'No School Diary details found ' : ''}
						</Text>
					</View>
				)}
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

const layoutDesign = StyleSheet.create({
	headingText: {
		fontSize: 11,
		color: appColor.gray_title,
		marginTop: 5,
	},
	pickerLayout: {
		backgroundColor: '#00000005',
		borderRadius: 5,
		marginTop: 2,
		borderWidth: 1,
		borderColor: '#DDDDDD',
	},
	headerText: {
		fontSize: 18,
		color: appColor.colorPrimary,
	},

	verticalText: {
		fontSize: 20,
		color: appColor.white,
		fontWeight: '200',
		width: 20,
		textAlign: 'center',
		textAlignVertical: 'center',
	},

	item: {
		paddingLeft: 5,
		paddingRight: 2,
		paddingTop: 7,
		paddingBottom: 7,
		alignItems: 'center',
	},
});

//export default StepSelectStudents;
const mapStateToProps = (state) => {
	return {
		instituteId: state.teacherInfo.InstituteId,
		autotrainerId: state.teacherInfo.AutoTrainerId,
	};
};

export default connect(mapStateToProps, { ActionAddTeacher, ActionDeleteDairyDetails, ActionUpdateDiaryDetailsStep1 })(
	RecentSchoolDiary
);
