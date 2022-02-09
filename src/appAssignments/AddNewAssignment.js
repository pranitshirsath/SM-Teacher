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
	PermissionsAndroid,
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
	Textarea,
	Picker,
	Footer,
	FooterTab,
	Badge,
} from 'native-base';
import RNFS from 'react-native-fs';

import AsyncStorage from '@react-native-community/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import InternetConn from '../networkConn/OfflineNotice';
import NetInfo from '@react-native-community/netinfo';
import HTTPRequestMng from './HTTPRequestMng';
import DatePicker from 'react-native-datepicker';
import NoDataFound from '../utils/NoDataView';
import ActionButton from 'react-native-action-button';
import DropDownPicker from 'react-native-dropdown-picker';
import DocumentPicker from 'react-native-document-picker';

var appColor = require('../config/color.json');
import { getOrientation, screenWidth, onChangeScreenSize, isTablet } from '../utils/ScreenSize';

import { connect } from 'react-redux';

class AddNewAssignment extends Component {
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
			country: 'uk',
			chooseFileHeading: 'Choose File',
			selected2: '',
			singleFileRawData: '',
			checkButtonPress: false,
			selectedFilesArray: [],
			classesLists: [],
			SectionList: [],
			SubjectList: [],
			selectedClassProviderId: undefined,
			selectedSubjectId: '',
			selectedSectionId: '',
			ClassName: '',
			totalStudents: 0,
			StudentIdsToSend: '',
			ClassIdToSend: '',
			SectionIdToSend: '',
			SubjectIdToSend: '',
			Description: '',
			Title: '',
			Marks: '',
			SaveButtonPressed: true,
			selectedFile: '',
			submitTeachersFiles: [],
			tempFileId: '',
			errorOccured: 'false',
			sentFilenameToServer: '',
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
		this.loadClassesDetailsFromServer();
		this.props.navigation.addListener('willFocus', this._handleStateChange);
	}

	_handleStateChange = (state) => {
		if (this.props.navigation.state.params != null) {
			const data = this.props.navigation.state.params.data;
			const count = data.length;
			this.setState({
				totalStudents: count,
			});
			const commaSep = data.map((item) => item.StudentId).join(', ');
			this.setState({
				StudentIdsToSend: commaSep,
			});
			console.log('CommaSeparated', commaSep);
			this.sendSelectedStudentsToPreviousScreen(data);
		}
	};

	sendSelectedStudentsToPreviousScreen(data) {
		const dummyarray = [];
		console.log('12', data.length);
		for (let i = 0; i < data.length; i++) {
			console.log('single', data[i]);
			if (data[i].checked) {
				dummyarray.push(data[i]);
			}
		}
		console.log('2345', dummyarray);
	}

	createNewAssignment = async (isInitial) => {
		let filetosendtoserver = [];
		if (this.state.submitTeachersFiles.length != this.state.selectedFilesArray) {
			for (let i = 0; i < this.state.submitTeachersFiles.length; i++) {
				for (let j = 0; j < this.state.selectedFilesArray.length; j++) {
					const splitFilename = this.state.selectedFilesArray[j].FileName.split('.');
					filename = splitFilename[0];
					if (this.state.submitTeachersFiles[i].FileName.includes(filename)) {
						filetosendtoserver.push({
							FileName: this.state.submitTeachersFiles[i].FileName,
							FilePath: 'content://com.android.providers.media.documents/document/image%3A1322',
							id: j,
						});
					}
				}
			}
		} else {
			filetosendtoserver = this.state.submitTeachersFiles;
		}
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					this.changeLoadingStatus(true);
					const requestJson = {
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
						AutoAssignmentId: 0,
						SubmissionDate: this.state.selectedStartDate,
						Title: this.state.Title,
						Description: this.state.Description,
						AutoClassId: this.state.selectedClassProviderId,
						AutoSectionId: this.state.selectedSectionId,
						AutoSubjectId: this.state.selectedSubjectId,
						AutoStudIds: this.state.StudentIdsToSend,
						AttachmentUrls: filetosendtoserver,
						AutoTrainerId: this.props.AutoTrainerId,
						IsSelectedStudents: true,
						IsChangeStudents: false,
						MaxMarks: this.state.Marks,
					};
					const obj = new HTTPRequestMng('', 'AddUpdateAssignment', this);
					obj.executeRequest({ jsonstring: JSON.stringify(requestJson) });
				} else if (!isInitial) {
					this.setState({ loading: false, listLoadAttempted: true });
					Alert.alert('Oops', 'No internet connection');
				} else {
					this.setState({ loading: false, listLoadAttempted: true });
				}
			});
		} catch (error) {}
	};

	onCreateAssignmentResponse(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				this.setState({
					loading: false,
					listLoadAttempted: true,
				});
				this.props.navigation.navigate('AppAssignments', { id: 2 });
			} else {
				Toast.show({
					text: 'File Not Uploaded!',

					textStyle: { color: 'yellow' },
					buttonTextStyle: { color: 'yellow' },
				});
			}
		} catch (error) {
			console.error(error);
		}
	}

	loadClassesDetailsFromServer = async (isInitial) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					//this.changeLoadingStatus(true);
					const requestJson = {
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
					};
					const obj = new HTTPRequestMng('', 'FillClasses', this);
					obj.executeRequest({ jsonstring: JSON.stringify(requestJson) });
				} else if (!isInitial) {
					this.setState({ loading: false, listLoadAttempted: true });
					Alert.alert('Oops', 'No internet connection');
				} else {
					this.setState({ loading: false, listLoadAttempted: true });
				}
			});
		} catch (error) {}
	};

	onClassDetailsResponse(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];
			const allDataList = jsonRec['ClassLists'];
			console.log('RESPONSE456', allDataList);
			if (status == 'Success') {
				this.setState({
					loading: false,
					listLoadAttempted: true,
					classesLists: allDataList,
					selectedClassProviderId: 0,
				});
			} else {
				Toast.show({
					text: 'File Not Uploaded!',

					textStyle: { color: 'yellow' },
					buttonTextStyle: { color: 'yellow' },
				});
			}
		} catch (error) {
			console.error(error);
		}
	}

	//send attached files to server
	sendAttachedFileToServer = async (rawfile, check, IsInParts) => {
		this.setState({
			errorOccured: 'false',
		});

		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					const requestJson = {
						StaffId: this.props.AutoTrainerId,
						FileName: this.state.selectedFile,
						FileData: rawfile,
						EOF: check,
						IsInParts: IsInParts,
						TempFileName: this.state.sentFilenameToServer,
					};
					console.log('requestJson', requestJson);
					const obj = new HTTPRequestMng('', 'AdminFileUpload', this);
					obj.executeRequest({ jsonstring: JSON.stringify(requestJson) });
				} else if (!isInitial) {
					this.setState({ loading: false, listLoadAttempted: true });
					Alert.alert('Oops', 'No internet connection');
				} else {
					this.setState({ loading: false, listLoadAttempted: true });
				}
			});
		} catch (error) {}
	};

	onFilesUploadResponse(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				const uploadedFileName = jsonRec['FileName'];
				if (uploadedFileName != '') {
					if (this.state.errorOccured == 'false') {
						if (this.state.submitTeachersFiles.length > 0) {
							this.state.submitTeachersFiles.push({
								FileName: uploadedFileName,
								FilePath: '/thisisdummy/path',
								id: 1,
							});
						} else {
							this.setState({
								submitTeachersFiles: [
									{
										FileName: uploadedFileName,
										FilePath: '/thisisdummy/path',
										id: 1,
									},
								],
							});
						}
						this.setState({
							loading: false,
							checkButtonPress: true,
						});
					} else {
						Alert.alert(
							'Hello Teacher',
							'Something went wrong with this file, please delete it and attach another file' +
								' (' +
								this.state.ClassName +
								' )',
							[
								{
									text: 'Ok',
									onPress: () => console.log('Cancel Pressed!'),
								},
								{ text: 'Delete', onPress: () => this.deleteelementfromArray(this.state.tempFileId) },
							],
							{ cancelable: false }
						);
					}
				}
			} else {
				this.setState({
					loading: false,
					listLoadAttempted: true,
					errorOccured: 'true',
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
	selectOneFile = async () => {
		if (this.state.checkButtonPress) {
			//checking if user already selected file or not
			try {
				let data = await DocumentPicker.pick({
					type: [DocumentPicker.types.allFiles],
				});
				console.log('f', data);
				this.changeLoadingStatus(true);

				if (data != null) {
					if (data.hasOwnProperty('name')) {
						this.setState({
							selectedFile: data.name,
						});
						let count = this.state.selectedFilesArray.length;
						//for showing file names in list
						this.state.selectedFilesArray.push({
							FileName: data.name,
							FilePath: data.uri,
							id: count + 1,
						});
						this.convertFileToBase64(data);
						this.setState({
							chooseFileHeading: 'Choose Another file',
							tempFileId: count + 1,
						});
						//sending attached file to server
						//this.sendAttachedFileToServer();
					} else {
						if (data.fileCopyUri != '') {
							var filename = data.fileCopyUri.split('/').pop();
							this.setState({
								selectedFile: filename,
							});
							let count = this.state.selectedFilesArray.length;
							//for showing file names in list
							this.state.selectedFilesArray.push({
								FileName: filename,
								FilePath: data.uri,
								id: count + 1,
							});
							this.convertFileToBase64(data);
							this.setState({
								chooseFileHeading: 'Choose Another file',
								tempFileId: count + 1,
							});
							//sending attached file to server
							//this.sendAttachedFileToServer();
						} else {
							Toast.show({
								text: 'Something went wrong with the file',

								textStyle: { color: 'yellow' },
								buttonTextStyle: { color: 'yellow' },
							});
						}
					}
				} else {
					Toast.show({
						text: 'Something went wrong with the file',

						textStyle: { color: 'yellow' },
						buttonTextStyle: { color: 'yellow' },
					});
				}
			} catch (err) {
				if (DocumentPicker.isCancel(err)) {
					//alert('Canceled from single doc picker');
				} else {
					//alert('Unknown Error: ' + JSON.stringify(err));
					throw err;
				}
			}
		} else {
			try {
				let data = await DocumentPicker.pick({
					type: [DocumentPicker.types.allFiles],
				});
				console.log('f', data);
				this.changeLoadingStatus(true);

				if (data != null) {
					if (data.hasOwnProperty('name')) {
						this.setState({
							selectedFile: data.name,
						});
						//for showing file names in list
						this.setState({
							selectedFilesArray: [
								{
									FileName: data.name,
									FilePath: data.uri,
									id: 1,
								},
							],
						});
						this.convertFileToBase64(data);
						this.setState({
							chooseFileHeading: 'Choose Another file',
							tempFileId: 1,
						});
						//sending attached file to server
						//this.sendAttachedFileToServer();
					} else {
						if (data.fileCopyUri != '') {
							var filename = data.fileCopyUri.split('/').pop();
							this.setState({
								selectedFile: filename,
							});
							//for showing file names in list
							this.setState({
								selectedFilesArray: [
									{
										FileName: filename,
										FilePath: data.uri,
										id: 1,
									},
								],
							});
							this.convertFileToBase64(data);
							this.setState({
								chooseFileHeading: 'Choose Another file',
								tempFileId: 1,
							});
							//sending attached file to server
							//this.sendAttachedFileToServer();
						} else {
							Toast.show({
								text: 'Something went wrong with the file',

								textStyle: { color: 'yellow' },
								buttonTextStyle: { color: 'yellow' },
							});
						}
					}
				}
			} catch (err) {
				if (DocumentPicker.isCancel(err)) {
					//alert('Canceled from single doc picker');
				} else {
					alert('Unknown Error: ' + JSON.stringify(err));
					throw err;
				}
			}
		}
		//Opening Document Picker for selection of one file
	};

	checkAttachFilePermission = async () => {
		// Function to check the platform
		// If iOS then start downloading
		// If Android then ask for permission

		const length = this.state.selectedFilesArray.length;
		if (length < 10) {
			if (Platform.OS === 'ios') {
				this.downloadAssignmentFile();
			} else {
				try {
					const granted = await PermissionsAndroid.request(
						PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
						{
							title: 'Storage Permission Required',
							message: 'App needs access to your storage to download Photos',
						}
					);
					if (granted === PermissionsAndroid.RESULTS.GRANTED) {
						this.selectOneFile();
						// Once user grant the permission start downloading
						this.setState({
							checkButtonPress: true,
						});
						console.log('Storage Permission Granted.');
						// if (this.state.fileurl != '') {
						// 	this.downloadAssignmentFile();
						// } else {
						// }
					} else {
						// If permission denied then show alert
						alert('Storage Permission Not Granted');
					}
				} catch (err) {
					// To handle permission related exception
					console.warn(err);
				}
			}
		} else {
			Toast.show({
				text: 'You can attach only 10 files',

				textStyle: { color: 'yellow' },
				buttonTextStyle: { color: 'yellow' },
			});
		}
	};

	convertFileToBase64 = async (fileData) => {
		// Check if any file is selected or not
		RNFS.readFile(fileData.uri, 'base64').then((res) => {
			console.log('Base 64', res);
			this.setState({
				singleFileRawData: res,
			});
			const value = res.match(/.{1,1000000}/g);
			var date = new Date().getDate(); //Current Date
			var month = new Date().getMonth() + 1; //Current Month
			var year = new Date().getFullYear(); //Current Year
			var hours = new Date().getHours(); //Current Hours
			var min = new Date().getMinutes(); //Current Minutes
			var sec = new Date().getSeconds(); //Current Seconds
			var filename = this.state.selectedFile;
			const splitFilename = filename.split('.');
			filename = splitFilename[0];
			var extension = splitFilename[1];
			if (date < 10) {
				date = '0' + date;
			}
			if (month < 10) {
				month = '0' + month;
			}
			if (hours < 10) {
				hours = '0' + hours;
			}
			if (min < 10) {
				min = '0' + min;
			}
			if (sec < 10) {
				sec = '0' + sec;
			}
			console.log('time', date + '/' + month + '/' + year + '/' + hours + '/' + min + '/' + sec);
			let tempfilename =
				'Temp_' +
				filename +
				'_' +
				this.props.AutoTrainerId +
				'_' +
				date +
				'' +
				month +
				'' +
				year +
				'' +
				hours +
				'' +
				min +
				'' +
				sec +
				'.' +
				extension;
			this.setState({
				sentFilenameToServer: tempfilename,
			});
			console.log('tempfilename', tempfilename);
			if (value.length > 1) {
				for (let i = 0; i < value.length; i++) {
					if (i == value.length - 1) {
						console.log('finished', value[i]);
						this.sendAttachedFileToServer(value[i], true, true);
					} else {
						console.log('working', value[i]);
						this.sendAttachedFileToServer(value[i], false, true);
					}
				}
			} else {
				this.sendAttachedFileToServer(res, true, true);
			}
		});
	};
	deleteelementfromArray(id) {
		const filteredData = this.state.selectedFilesArray.filter((item) => item.id !== id);
		console.log('filterdata', filteredData);
		this.setState({ selectedFilesArray: filteredData });
	}
	//FOR RENDERING TEACHERS ATTACHEMNTS
	renderAttachedTeachersFilesView(index, item) {
		return (
			<Item style={{ marginTop: 7 }}>
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<Icon
						name="md-trash"
						style={{
							color: appColor.colorPrimary,
						}}
						onPress={() => this.deleteelementfromArray(item.id)}
					/>
					<Text
						style={{
							color: appColor.colorPrimary,
							marginLeft: 10,
						}}
					>
						{item.FileName}
					</Text>
				</View>
			</Item>
		);
	}
	onProviderChange = (label) => {
		console.log('' + label);
		this.state.selectedClassProviderId = label;
		for (var i = 0; i < this.state.classesLists.length; i++) {
			const item = this.state.classesLists[i];
			console.log(item.ClassName + '-' + label);
			if (item.ClassId == label) {
				this.state.ClassName = item.ClassName;
				if (item.SubjectLists.length > 0) {
					this.setState({
						SubjectList: item.SubjectLists,
					});
				}
				if (item.SectionLists.length > 0) {
					this.setState({
						SectionList: item.SectionLists,
					});
				}
			}
		}

		const value = this.state.selectedClassProviderId;
	};

	onSubjectChange(value) {
		this.setState({
			selectedSubjectId: value,
		});
		// this.state.selectedSubjectId = value;
		// console.log('idd', this.state.selectedSubjectId);
	}

	onSectionChanges(value) {
		this.setState({
			selectedSectionId: value,
		});
		//this.state.selectedSectionId = value;
	}

	checkValidation() {
		if (this.state.Marks == '' || this.state.Title == '' || this.state.selectedStartDate == '') {
			Toast.show({
				text: 'All fields are mandatory',

				textStyle: { color: 'yellow' },
				buttonTextStyle: { color: 'yellow' },
			});
		} else {
			if (this.state.totalStudents == 0) {
				Toast.show({
					text: 'Please select the student',

					textStyle: { color: 'yellow' },
					buttonTextStyle: { color: 'yellow' },
				});
			} else {
				const startdate = this.state.selectedStartDate;
				const currentDate = new Date();
				date =
					currentDate.getDate() +
					'/' +
					parseInt(currentDate.getMonth() + 1) +
					'/' +
					currentDate.getFullYear();
				let splitdate = startdate.split('-');
				let splitendate = date.split('/');
				let selectedMonth = splitdate[1];
				let currentMonth = splitendate[1];
				let selectedDate = splitdate[2];
				let currentDateactual = splitendate[0];
				let selectedY = splitdate[0];
				let currentYear = splitendate[2];

				if (currentMonth < 10) {
					currentMonth = '0' + currentMonth;
				}
				if (currentDateactual < 10) {
					currentDateactual = '0' + currentDateactual;
				}
				console.log('Selected date', selectedDate + '-' + selectedMonth + '-' + selectedY);
				console.log('Current date', currentDateactual + '-' + currentMonth + '-' + currentYear);
				if (selectedY > currentYear || selectedY == currentYear) {
					if (selectedMonth > currentMonth || selectedMonth == currentMonth) {
						if (
							((selectedDate == currentDateactual || selectedDate > currentDateactual) &&
								selectedMonth == currentMonth) ||
							((selectedDate == currentDateactual || selectedDate > currentDateactual) &&
								selectedMonth != currentMonth)
						) {
							Alert.alert(
								'Hello Teacher',
								'Are you sure you want to save the Assignment for Class  ' +
									' (' +
									this.state.ClassName +
									' )',
								[
									{
										text: 'Yes',
										onPress: () => this.createNewAssignment(),
									},
									{ text: 'No', onPress: () => console.log('Cancel Pressed!') },
								],
								{ cancelable: false }
							);
						} else {
							Toast.show({
								text: 'Submission Date should be prior than Current Date!',

								textStyle: { color: 'yellow' },
								buttonTextStyle: { color: 'yellow' },
							});
						}
					} else {
						Toast.show({
							text: 'Submission Date should be prior than Current Date!',

							textStyle: { color: 'yellow' },
							buttonTextStyle: { color: 'yellow' },
						});
					}
				} else {
				}
			}
		}
	}

	checkClassIsSelectedorNot() {
		if (
			this.state.selectedClassProviderId == '' ||
			this.state.selectedSectionId == '' ||
			this.state.selectedSubjectId == ''
		) {
			Toast.show({
				text: 'Please select class,section,subject',

				textStyle: { color: 'yellow' },
				buttonTextStyle: { color: 'yellow' },
			});
		} else {
			this.props.navigation.navigate('SelectStudentsScreen', {
				comingFrom: 'Add New Assignment',
				AutoClassId: this.state.selectedClassProviderId,
				AutoSectionId: this.state.selectedSectionId,
				AutoSubjectId: this.state.selectedSubjectId,
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

		//for displaying class list
		const classProviderPickerItems = [];
		classProviderPickerItems.push(<Item label="Select" value={0} />);
		for (var i = 0; i < this.state.classesLists.length; i++) {
			const item = this.state.classesLists[i];
			classProviderPickerItems.push(<Item label={item.ClassName} value={item.ClassId} />);
		}

		//for displaying subject lists
		const subjectLists = [];
		if (this.state.SubjectList.length < 1) {
			subjectLists.push(<Item label="No Subject Available" value={0} />);
		} else {
			for (var i = 0; i < this.state.SubjectList.length; i++) {
				const item = this.state.SubjectList[i];
				subjectLists.push(<Item label={item.SubjectName} value={item.SubjectId} />);
			}
		}

		//for displaying sectionslists
		const sectionLists = [];
		if (this.state.SectionList.length < 1) {
			sectionLists.push(<Item label="No Section Available" value={0} />);
		} else {
			for (var i = 0; i < this.state.SectionList.length; i++) {
				const item = this.state.SectionList[i];
				sectionLists.push(<Item label={item.SectionName} value={item.SectionId} />);
			}
		}

		const filesLength = this.state.selectedFilesArray.length;

		return (
			<Container style={{ backgroundColor: 'white' }}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.navigate('AppAssignments', { id: 2 })}>
							<Icon name="arrow-back" />
						</Button>
					</Left>
					<Body>
						<Title>Add New Assignment</Title>
					</Body>
					<Right />
				</Header>
				<Content padder>
					<View style={{ flex: 1 }}>
						<Form>
							<Text style={layoutDesign.bodyText}>Title</Text>
							<Item regular style={layoutDesign.bodyText}>
								<Input placeholder="Title" onChangeText={(text) => this.setState({ Title: text })} />
							</Item>
							<View style={{ flexDirection: 'row', marginTop: 15 }}>
								<Text style={{ flex: 1 }}>Submission Date</Text>
								<Text style={{ flex: 0.5, alignItems: 'center' }}>Marks</Text>
							</View>
							<View style={{ flexDirection: 'row' }}>
								<DatePicker
									style={layoutDesign.datePickerStyle}
									date={this.state.selectedStartDate} // Initial date from state
									mode="date" // The enum of date, datetime and time
									placeholder="submission date"
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
								<Item
									regular
									style={{
										flex: 1,
										marginLeft: 10,
										marginTop: 10,
										width: 150,
										height: 40,
										alignItems: 'center',
									}}
								>
									<Input
										keyboardType="numeric"
										placeholder="00"
										maxLength={3}
										onChangeText={(text) => this.setState({ Marks: text })}
									/>
								</Item>
							</View>
							<Text style={{ marginTop: 15 }}>Description</Text>
							<Textarea
								style={{ marginTop: 5 }}
								rowSpan={5}
								bordered
								placeholder="Description"
								onChangeText={(text) => this.setState({ Description: text })}
							/>
							<View>
								<Button
									block
									iconRight
									style={{ marginTop: 10 }}
									onPress={() => this.checkAttachFilePermission()}
								>
									<Text>{this.state.chooseFileHeading}</Text>
									<Icon name="md-attach" style={{ color: appColor.white }} />
								</Button>
							</View>
							<View>
								{filesLength > 0 ? (
									<Text>{filesLength} Files Selected</Text>
								) : (
									<Text
										style={{
											color: appColor.white,
										}}
									>
										.
									</Text>
								)}
								<FlatList
									style={{ marginTop: 10 }}
									data={
										this.state.selectedFilesArray.length > 0
											? this.state.selectedFilesArray
											: (this.state.selectedFilesArray = [])
									}
									renderItem={({ item, index }) => this.renderAttachedTeachersFilesView(index, item)}
									enableEmptySections={true}
									key={getOrientation()}
								/>
							</View>
							<View style={{ flexDirection: 'row', marginTop: 10 }}>
								<Text>Select Class</Text>
								<Text style={{ color: 'red' }}>*</Text>
							</View>
							<Item regular picker style={{ margin: 10 }}>
								<Picker
									mode="dropdown"
									iosIcon={<Icon name="ios-arrow-down" />}
									placeholder="Payment Mode"
									iosHeader="Select payment mode"
									style={{ height: 35, padding: 2 }}
									textStyle={{ maxWidth: '80%', paddingLeft: 5, paddingRight: 0 }}
									selectedValue={this.state.selectedClassProviderId}
									onValueChange={this.onProviderChange.bind(this)}
								>
									{classProviderPickerItems}
								</Picker>
							</Item>
							<View style={{ flexDirection: 'row', marginTop: 10 }}>
								<Text>Select Section</Text>
							</View>
							<Item regular picker style={{ margin: 10 }}>
								<Picker
									iosIcon={<Icon name="arrow-down" />}
									style={{ height: 50, width: '80%', color: '#344953', justifyContent: 'center' }}
									placeholder="Select your SIM"
									placeholderStyle={{ color: '#bfc6ea' }}
									placeholderIconColor="#007aff"
									selectedValue={this.state.selectedSectionId}
									onValueChange={this.onSectionChanges.bind(this)}
								>
									{sectionLists}
								</Picker>
							</Item>

							<View style={{ flexDirection: 'row', marginTop: 10 }}>
								<Text>Select Subject</Text>
							</View>
							<Item regular picker style={{ margin: 10 }}>
								<Picker
									iosIcon={<Icon name="arrow-down" />}
									style={{ height: 50, width: '80%', color: '#344953', justifyContent: 'center' }}
									placeholder="Select your SIM"
									placeholderStyle={{ color: '#bfc6ea' }}
									placeholderIconColor="#007aff"
									selectedValue={this.state.selectedSubjectId}
									onValueChange={this.onSubjectChange.bind(this)}
								>
									{subjectLists}
								</Picker>
							</Item>
							<Button
								badge
								horizontal
								bordered
								block
								style={{
									color: appColor.colorPrimary,
									marginTop: 10,
									alignItems: 'center',
									justifyContent: 'center',
								}}
								onPress={() => this.checkClassIsSelectedorNot()}
							>
								<Text
									uppercase={false}
									style={{
										color: appColor.colorPrimary,
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 18,
									}}
								>
									{this.state.totalStudents != 0 ? ' Selected Students ' : ' Select Students'}
								</Text>
								<Right>
									<Badge primary>
										<Text>{this.state.totalStudents}</Text>
									</Badge>
								</Right>
							</Button>
						</Form>
					</View>
				</Content>
				<Footer>
					<FooterTab>
						<Button primary style={{ margin: 2 }} onPress={() => this.checkValidation()}>
							<Text style={{ color: appColor.white }}>Save</Text>
						</Button>
						<Button
							primary
							style={{ margin: 2 }}
							onPress={() => this.props.navigation.navigate('AppAssignments', { id: 2 })}
						>
							<Text style={{ color: appColor.white }}>Cancel</Text>
						</Button>
					</FooterTab>
				</Footer>
			{this.state.loading &&	<AwesomeAlert
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
		marginTop: 10,
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
		marginTop: 10,
		flex: 1,
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
		AutoTrainerId: state.teacherInfo.AutoTrainerId,
	};
};
export default connect(mapStateToProps, {})(AddNewAssignment);
