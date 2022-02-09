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
import RNFetchBlob from 'rn-fetch-blob';
import PhotoEditor from 'react-native-photo-editor';
//for showing image progress
import Image from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Bar';
import { randomNumber } from '../utils/RandomGen';
// import { postFormData } from '../utils/FormPost';
var appColor = require('../config/color.json');
import { getOrientation, screenWidth, onChangeScreenSize, isTablet } from '../utils/ScreenSize';

import { connect } from 'react-redux';

class EvaluationScreens extends Component {
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
			TeachersAttachedFiles: [],
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
			selectedFile: '',
			StudentDetails: [],
			StudentsAttachedFiles: [],
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
			TeacherFeedback: '',
			Title: '',
			TotalMarks: '',
			MarksObtainedbyStudent: 0,
			SaveButtonPressed: true,
			StudentAssignmentId: '',
			Answer: '',
			fileurl: '',
			filename: '',
			feedbackAttachedFiles: [],
			actualimagePath: '',
			imageID: '',
			fileTypes: '',
			attchedImages: [],
			checkImageEdited: 'false',
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
		const StudentAssignmentId = this.props.navigation.state.params;
		this.setState({
			StudentAssignmentId: StudentAssignmentId,
		});
		this.loadStudentsAssignmentDetailsFromServer();
	}

	evaluateStudent = async (isInitial) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					const previous = this.state.selectedFilesArray;
					const curent = this.state.feedbackAttachedFiles;
					const latestGeneratedFiles = [];
					for (let i = 0; i < previous.length; i++) {
						if (previous[i].FileName.includes(this.props.AutoTrainerId)) {
							latestGeneratedFiles.push(previous[i]);
						}
					}
					const filesTosendToserver = latestGeneratedFiles.concat(curent);
					this.changeLoadingStatus(true);
					const requestJson = {
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
						StudentAssignmentId: this.state.StudentAssignmentId,
						FeedbackAttachmentURLs: filesTosendToserver,
						TeacherFeedback: this.state.TeacherFeedback,
						MarksObtained: this.state.MarksObtainedbyStudent,
					};
					const obj = new HTTPRequestMng('', 'EvaluateStudent', this);
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

	onEvaluateStudentResponse(respData) {
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
				this.props.navigation.goBack();
			} else {
				// Toast.show({
				// 	text: 'File not uploaded',
				// 	textStyle: { color: 'yellow' },
				// 	buttonTextStyle: { color: 'yellow' },
				// });
			}
		} catch (error) {
			console.error(error);
		}
	}

	loadStudentsAssignmentDetailsFromServer = async (isInitial) => {
		try {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					this.changeLoadingStatus(true);
					const requestJson = {
						StudentAssignmentId: this.state.StudentAssignmentId,
						SessionYear: this.props.SessionYear,
						InstituteId: this.props.instituteId,
					};
					const obj = new HTTPRequestMng('', 'GetEvaluateStudentDetails', this);
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

	onStudentDetailsResponse(respData) {
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];
			const allDataList = jsonRec['AssignmentSubmissionDetails'];
			console.log('RESPONSE456', allDataList.MarksObtained);
			if (status == 'Success') {
				let dummyData = [];
				if (allDataList.FeedbackAttachmentUrls.length > 0) {
					for (var i = 0; i < allDataList.FeedbackAttachmentUrls.length; i++) {
						dummyData.push({
							FileName: allDataList.FeedbackAttachmentUrls[i].FileName,
							FilePath: allDataList.FeedbackAttachmentUrls[i].FilePath,
							id: i,
						});
					}
					this.setState({
						checkButtonPress: true,
						selectedFilesArray: dummyData,
					});
				}
				for (let i = 0; i < allDataList.SubmitAttachmentUrls.length; i++) {
					let filename = allDataList.SubmitAttachmentUrls[i].FileName.toString();
					let extension = filename.substr(filename.lastIndexOf('.'));
					if (extension == '.png' || extension == '.svg' || extension == '.jpg' || extension == '.jpeg') {
						if (this.state.attchedImages.length > 0) {
							this.state.attchedImages.push({
								FileName: allDataList.SubmitAttachmentUrls[i].FileName,
								FilePath: allDataList.SubmitAttachmentUrls[i].FilePath,
								id: i,
							});
						} else {
							this.setState({
								attchedImages: [
									{
										FileName: allDataList.SubmitAttachmentUrls[i].FileName,
										FilePath: allDataList.SubmitAttachmentUrls[i].FilePath,
										id: i,
									},
								],
							});
						}
					}
				}
				this.setState({
					loading: false,
					listLoadAttempted: true,
					StudentDetails: allDataList,
					StudentsAttachedFiles: allDataList.SubmitAttachmentUrls,
					Title: allDataList.Title,
					Answer: allDataList.Answer,
					TotalMarks: allDataList.MaxMarks,
					MarksObtainedbyStudent: '' + allDataList.MarksObtained,
					TeacherFeedback: allDataList.TeacherFeedback,
				});
			} else {
				// Toast.show({
				// 	text: 'File not uploaded',
				// 	textStyle: { color: 'yellow' },
				// 	buttonTextStyle: { color: 'yellow' },
				// });
			}
		} catch (error) {
			console.error(error);
		}
	}

	//send attached files to server
	sendAttachedFileToServer = async (rawfile, check, IsInParts) => {
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
		} catch (error) { }
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
						if (this.state.feedbackAttachedFiles.length > 0) {
							this.state.feedbackAttachedFiles.push({
								FileName: uploadedFileName,
								FilePath: '/thisisdummy/path',
								id: 1,
							});
						} else {
							this.setState({
								feedbackAttachedFiles: [
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
			try {
				let data = await DocumentPicker.pick({
					type: [DocumentPicker.types.allFiles],
				});
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
					console.log(err);
					//alert('Unknown Error: ' + JSON.stringify(err));
					throw err;
				}
			}
		} else {
			try {
				console.log('workinggg');
				let data = await DocumentPicker.pick({
					type: [DocumentPicker.types.allFiles],
				});
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
					console.log(err);
					//alert('Unknown Error: ' + JSON.stringify(err));
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
	deleteelementfromArray(id, type) {
		if (type == 'image') {
			const filteredData = this.state.attchedImages.filter((item) => item.id !== id);
			this.setState({ attchedImages: filteredData });
		} else {
			const filteredData = this.state.selectedFilesArray.filter((item) => item.id !== id);
			this.setState({ selectedFilesArray: filteredData });
		}
	}
	//FOR RENDERING TEACHERS ATTACHEMNTS
	renderAttachedTeachersFilesView(index, item) {
		return (
			<Item style={{ marginTop: 8 }}>
				<TouchableHighlight
					underlayColor="#00000010"
					onPress={() => this.deleteelementfromArray(item.id, 'file')}
				>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<Icon
							name="md-trash"
							style={{
								color: appColor.colorPrimary,
							}}
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
				</TouchableHighlight>
			</Item>
		);
	}
	checkPermission = async () => {
		// Function to check the platform
		// If iOS then start downloading
		// If Android then ask for permission

		if (Platform.OS === 'ios') {
			this.downloadAssignmentFile();
		} else {
			try {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
					{
						title: 'Storage Permission Required',
						message: 'App needs access to your storage to download Photos',
					}
				);
				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					// Once user grant the permission start downloading
					console.log('Storage Permission Granted.');
					if (this.state.fileurl != '') {
						this.downloadAssignmentFile();
					} else {
						Toast.show({
							text: 'No Attached Files',
							textStyle: { color: 'yellow' },
							buttonTextStyle: { color: 'yellow' },
						});
					}
				} else {
					// If permission denied then show alert
					alert('Storage Permission Not Granted');
				}
			} catch (err) {
				// To handle permission related exception
				console.warn(err);
			}
		}
	};

	getExtention = (filename) => {
		// To get the file extension
		return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
	};

	downloadAssignmentFile = () => {
		this.changeLoadingStatus(true);
		let notificationstatus;
		console.log('this.state.fileTypes', this.state.fileTypes);
		if (this.state.fileTypes == 'file') {
			Toast.show({
				text: 'File downloading in background..',
				textStyle: { color: 'yellow' },
				buttonTextStyle: { color: 'yellow' },
			});
			notificationstatus = true;
		} else {
			notificationstatus = false;
		}
		let image_URL = this.state.fileurl;
		if (image_URL.includes('emulated')) {
			let actualpath = image_URL.replace('file://', '')
			console.log("image_URL", image_URL)
			PhotoEditor.Edit({
				// path: RNFS.DocumentDirectoryPath + "/Add.png"
				path: actualpath,
				onDone: (result) => {
					// this.deleteDownloadedImageFile(this.state.actualimagePath);
					this.deleteelementfromArray(this.state.imageID, this.state.fileTypes);
					this.convertAnnotatedFileToBase64(result, this.state.filename);
					const dummyarrya = [];
					this.state.attchedImages.push({
						FileName: this.state.filename,
						FilePath: 'file://' + result,
						id: this.state.imageID,
					});

					console.log(this.state.attchedImages);
					// Note: the path of file saved after editing is different than the file opened.
					//console.log('on done', photo);
					// use this path to preview the saved image or overwrite the original image.
					// eg: result --> /storage/emulated/0/Pictures/PhotoEditorSDK/IMG_20200813_130958.jpg
				},
				onCancel: () => {
					console.log('on cancel');
				},
				//hiddenControls:["clear","save"]
			});
			this.changeLoadingStatus(false);
		} else {
			// Main function to download the image
			// To add the time suffix in filename
			let date = new Date();
			// Image URL which we want to download
			let image_URL = this.state.fileurl;
			// Getting the extention of the file
			let ext = this.getExtention(image_URL);
			ext = '.' + ext[0];
			// Get config and fs from RNFetchBlob
			// config: To pass the downloading related options
			// fs: Directory path where we want our image to download
			const { config, fs } = RNFetchBlob;
			let PictureDir = fs.dirs.PictureDir;
			let options = {
				fileCache: true,
				addAndroidDownloads: {
					// Related to the Android only
					useDownloadManager: true,
					notification: notificationstatus,
					path:
						PictureDir +
						'/' +
						this.state.filename +
						Math.floor(date.getTime() + date.getSeconds() / 2) +
						ext,
					description: 'Image',
				},
			};

			this.setState({
				actualimagePath:
					PictureDir + '/' + this.state.filename + Math.floor(date.getTime() + date.getSeconds() / 2) + ext,
			});
			config(options)
				.fetch('GET', image_URL)
				.then((res) => {
					// Showing alert after successful downloading
					console.log('res -> ', JSON.stringify(res));
					console.log("this.state.actualimagePath", this.state.actualimagePath)
					this.changeLoadingStatus(false);
					this.deleteTempFileFromServer();
					if (this.state.fileTypes == 'image') {
						PhotoEditor.Edit({
							// path: RNFS.DocumentDirectoryPath + "/Add.png"
							path: this.state.actualimagePath,
							onDone: (result) => {
								// this.deleteDownloadedImageFile(this.state.actualimagePath);
								this.deleteelementfromArray(this.state.imageID, this.state.fileTypes);
								this.convertAnnotatedFileToBase64(result, this.state.filename);
								const dummyarrya = [];
								this.state.attchedImages.push({
									FileName: this.state.filename,
									FilePath: 'file://' + result,
									id: this.state.imageID,
								});

								console.log(this.state.attchedImages);
								// Note: the path of file saved after editing is different than the file opened.
								//console.log('on done', photo);
								// use this path to preview the saved image or overwrite the original image.
								// eg: result --> /storage/emulated/0/Pictures/PhotoEditorSDK/IMG_20200813_130958.jpg
							},
							onCancel: () => {
								console.log('on cancel');
							},
							//hiddenControls:["clear","save"]
						});
					} else {
						alert('Assignment Downloaded successfully');
					}
				});
		}
	};

	convertAnnotatedFileToBase64 = async (fileData, name) => {
		console.log(name);
		// Check if any file is selected or not
		RNFS.readFile(fileData, 'base64').then((res) => {
			this.changeLoadingStatus(true);
			console.log('Base 64', res);
			this.setState({
				singleFileRawData: res,
			});
			const value = res.match(/.{1,1000000}/g);
			if (value.length > 1) {
				for (let i = 0; i < value.length; i++) {
					if (i == value.length - 1) {
						//console.log('finished', value[i]);
						this.sendAnnotatedFileToServer(value[i], true, true);
					} else {
						//console.log('working', value[i]);
						this.sendAnnotatedFileToServer(value[i], false, true);
					}
				}
			} else {
				this.sendAnnotatedFileToServer(res, true, true);
			}
		});
	};

	//send Annotated files to server
	sendAnnotatedFileToServer = async (rawfile, check, IsInParts) => {
		console.log('studnetid', this.props.childID);
		var date = new Date().getDate(); //Current Date
		var month = new Date().getMonth() + 1; //Current Month
		var year = new Date().getFullYear(); //Current Year
		var hours = new Date().getHours(); //Current Hours
		var min = new Date().getMinutes(); //Current Minutes
		var sec = new Date().getSeconds(); //Current Seconds
		var filename = this.state.filename;
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
		try {
			let tempfilename =
				'Temp_' +
				filename +
				'_' +
				this.props.childID +
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
			console.log('tempfilename', tempfilename);
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					const requestJson = {
						StaffId: this.props.AutoTrainerId,
						FileName: this.state.filename,
						FileData: rawfile,
						EOF: check,
						IsInParts: IsInParts,
						TempFileName: tempfilename,
					};
					console.log('requestJson', requestJson);
					const obj = new HTTPRequestMng('', 'AnnotatedFileUpload', this);
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

	onAnnotatedImageUploadResponse(respData) {
		this.setState({
			loading: false,
		});
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				console.log('succcccccccccse');
				const uploadedFileName = jsonRec['FileName'];
				if (uploadedFileName != '') {
					console.log(uploadedFileName);
				}
			} else {
				this.setState({
					loading: false,
					listLoadAttempted: true,
				});
			}
		} catch (error) {
			console.error(error);
		}
	}

	deleteDownloadedImageFile(filepath) {
		console.log(filepath);
		RNFS.exists(filepath)
			.then((result) => {
				console.log('file exists: ', result);

				if (result) {
					return (
						RNFS.unlink(filepath)
							.then(() => {
								console.log('FILE DELETED');
							})
							// `unlink` will throw an error, if the item to unlink does not exist
							.catch((err) => {
								console.log(err.message);
							})
					);
				}
			})
			.catch((err) => {
				console.log(err.message);
			});
	}

	deleteTempFileFromServer = async () => {
		var date = new Date().getDate(); //Current Date
		var month = new Date().getMonth() + 1; //Current Month
		var year = new Date().getFullYear(); //Current Year
		var hours = new Date().getHours(); //Current Hours
		var min = new Date().getMinutes(); //Current Minutes
		var sec = new Date().getSeconds(); //Current Seconds
		var filename = this.state.filename;
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
			this.state.StudentAssignmentId +
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
		console.log(',,,,', tempfilename);
		NetInfo.isConnected.fetch().then((isConnected) => {
			if (isConnected) {
				const requestJson = {
					TempFileName: tempfilename,
				};
				console.log('requestJson', requestJson);
				const obj = new HTTPRequestMng('', 'DeleteTempfile', this);
				obj.executeRequest({ jsonstring: JSON.stringify(requestJson) });
			} else if (!isInitial) {
				this.setState({ loading: false, listLoadAttempted: true });
				Alert.alert('Oops', 'No internet connection');
			} else {
				this.setState({ loading: false, listLoadAttempted: true });
			}
		});
	};
	onTempFileDeletedResponse(respData) {
		console.log('onTempFileDeletedResponse');
		let _data = JSON.parse(respData);
		let _data1 = _data.d;
		console.log(JSON.parse(_data1)[0]);
		try {
			if (!this._isMounted) return;
			const jsonRec = JSON.parse(_data1)[0];
			const status = jsonRec['TransactionStatus'];
			const message = jsonRec['Msg'];

			if (status == 'Success') {
				console.log('tempfile deleted successfully');
			} else {
			}
		} catch (error) {
			console.error(error);
		}
	}
	getFileURLtoDownload(fileurl, filename, id, type) {
		this.setState({
			fileurl: fileurl,
			filename: filename,
			imageID: id,
			fileTypes: type,
		});
		this.checkPermission();
	}
	renderAttachedStudentsFilesView(index, item) {
		let filename = item.FileName.toString();
		let extension = filename.substr(filename.lastIndexOf('.'));
		console.log(extension);

		if (extension == '.png' || extension == '.svg' || extension == '.jpg' || extension == '.jpeg') {
		} else {
			return (
				<View style={{ marginTop: 10 }}>
					<TouchableHighlight
						underlayColor="#00000010"
						onPress={() => this.getFileURLtoDownload(item.FilePath, item.FileName, item.id, 'file')}
					>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<Icon
								name="md-arrow-down"
								style={{
									color: appColor.colorPrimary,
								}}
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
					</TouchableHighlight>
				</View>
			);
		}
	}
	renderAttachedImagesList(index, item) {
		// console.log('ittttttttttttt', item);
		// let randInt =""
		// randomNumber().then((value)=>{
		// 	 randInt = value
		// });
		// console.log(randInt)
		let randomNumber = String(Math.floor(Math.random() * 1000000000));
		//console.log('randomunuu', randomNumber);
		return (
			<Card>
				<CardItem style={{ marginTop: 5 }}>
					<TouchableHighlight
						underlayColor="#00000010"
						onPress={() => this.getFileURLtoDownload(item.FilePath, item.FileName, item.id, 'image')}
					>
						<Image
							source={{ uri: item.FilePath + '?randomNumber=' + randomNumber }}
							style={{ width: 320, height: 240, resizeMode: 'stretch' }}
							indicator={ProgressBar}
						/>
					</TouchableHighlight>
				</CardItem>
			</Card>
		);
	}
	checkValidation() {
		if (this.state.MarksObtainedbyStudent == 0) {
			Toast.show({
				text: 'Please give marks to student',

				textStyle: { color: 'yellow' },
				buttonTextStyle: { color: 'yellow' },
			});
		} else {
			if (this.state.MarksObtainedbyStudent > this.state.TotalMarks) {
				Toast.show({
					text: 'Marks obtained should be less than or equal to Total Marks',

					textStyle: { color: 'yellow' },
					buttonTextStyle: { color: 'yellow' },
				});
			} else {
				this.evaluateStudent();
			}
		}
	}

	render() {
		const listWidth = screenWidth / (getOrientation() == 'portrait' ? 1 : 2);

		const childWidth = screenWidth / (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : isTablet ? 2 : 1.5);

		const filesLength = this.state.selectedFilesArray.length;
		const regex = /(<([^>]+)>)/gi;
		const result = this.state.TeacherFeedback.replace(regex, '');

		const studentanswer = this.state.Answer.replace(regex, '');
		return (
			<Container style={{ backgroundColor: 'white' }}>
				<Header>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()}>
							<Icon name="arrow-back" />
						</Button>
					</Left>
					<Body>
						<Title>Evaluate Student Assignment</Title>
					</Body>
					<Right />
				</Header>
				<Content padder>
					<View style={{ flex: 1 }}>
						<Form>
							<Text style={layoutDesign.bodyText}>Title</Text>
							<Text>{this.state.Title}</Text>
							<View style={{ flexDirection: 'row', marginTop: 15 }}>
								<Text style={{ flex: 0.9 }}>Total Marks</Text>
								<Text style={{ flex: 0.5, alignItems: 'center' }}>Marks Obtained</Text>
							</View>
							<View style={{ flexDirection: 'row' }}>
								<Text style={{ width: 200 }}>{this.state.TotalMarks}</Text>
								<Item
									regular
									style={{
										flex: 1,
										marginLeft: 10,
										width: 150,
										height: 40,
										alignItems: 'center',
									}}
								>
									<Input
										keyboardType="numeric"
										placeholder="00"
										maxLength={3}
										value={this.state.MarksObtainedbyStudent}
										onChangeText={(text) => this.setState({ MarksObtainedbyStudent: text })}
									/>
								</Item>
							</View>
							<Text style={{ marginTop: 15 }}>Student Answer:</Text>
							<Textarea
								style={{ marginTop: 5 }}
								rowSpan={5}
								bordered
								editable={false}
								placeholder="Answer"
								value={studentanswer}
							// onChangeText={(text) => this.setState({ Answer: text })}
							/>
							{this.state.StudentsAttachedFiles.length > 0 ? (
								<Text>{this.state.StudentsAttachedFiles.length} Files Attached by student</Text>
							) : (
								<Text
									style={{
										color: appColor.white,
									}}
								>
									.
								</Text>
							)}
							<View>
								<FlatList
									style={{ flex: 1 }}
									data={
										this.state.StudentsAttachedFiles.length > 0
											? this.state.StudentsAttachedFiles
											: (this.state.StudentsAttachedFiles = [])
									}
									renderItem={({ item, index }) => this.renderAttachedStudentsFilesView(index, item)}
									enableEmptySections={true}
									key={getOrientation()}
								/>
							</View>
							<FlatList
								// style={{ flex: 1 }}
								data={
									this.state.attchedImages
								}
								renderItem={({ item, index }) => this.renderAttachedImagesList(index, item)}
								enableEmptySections={true}
								key={getOrientation()}
							/>
							<Text style={{ marginTop: 15 }}>Your Feedback:</Text>
							<Textarea
								style={{ marginTop: 5 }}
								rowSpan={5}
								bordered
								placeholder="Description"
								value={result}
								onChangeText={(text) => this.setState({ TeacherFeedback: text })}
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
									style={{ flex: 1 }}
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
							<View style={{ height: 100 }}></View>
						</Form>
					</View>
				</Content>
				<Footer>
					<FooterTab>
						<Button primary style={{ margin: 2 }} onPress={() => this.checkValidation()}>
							<Text style={{ color: appColor.white }}>Submit</Text>
						</Button>
						<Button primary style={{ margin: 2 }} onPress={() => this.props.navigation.goBack(null)}>
							<Text style={{ color: appColor.white }}>Cancel</Text>
						</Button>
					</FooterTab>
				</Footer>
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
		childID: state.childInfo.childID,
	};
};
export default connect(mapStateToProps, {})(EvaluationScreens);
