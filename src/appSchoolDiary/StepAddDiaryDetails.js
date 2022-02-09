import React from 'react';
import { StyleSheet, Alert, TouchableHighlight, PermissionsAndroid, Platform, Image, AsyncStorage } from 'react-native';
import { View, Text, Card, CardItem, Textarea, Icon, Content, Picker, Toast, Input, ActionSheet } from 'native-base';

import InternetConn from '../networkConn/OfflineNotice';
import appColor from '../config/color.json';
import AwesomeAlert from 'react-native-awesome-alerts';
import HTTPRequestMng from './HTTPRequestMng';
import Moment from 'moment';
import DatePicker from 'react-native-datepicker';
import ImagePicker from 'react-native-image-crop-picker';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import { ActionAddDiaryDetailsStep2 } from '../redux_reducers/SchoolDiaryReducer';
import { ActionAddDiaryDetailsStep1, ActionUpdateDiaryDetailsStep1 } from '../redux_reducers/SchoolDiaryReducer';
import { ActionAddTeacher } from '../redux_reducers/TeacherInfoReducer';

import { connect } from 'react-redux';

import { getOrientation, screenWidth, isTablet, hasNotch, onChangeScreenSize } from '../utils/ScreenSize';
import DocumentPicker from 'react-native-document-picker';

class StepAddDiaryDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			loadingMsg: '',
			isListLoaded: this.props.isListLoaded,
			diarySectionList: this.props.diarySectionList,
			selectedSectionID: this.props.selectedSectionID,
			selectedSchoolDiaryID: this.props.selectedSchoolDiaryID,
			subjectList: this.props.subjectList,
			selectedSubjectID: this.props.subjectID,
			homeWorkSectionID: this.props.homeWorkSectionID,
			msgTitle: this.props.msgTitle,
			msgText: this.props.msgText,
			isDateReadOnly: this.props.isDateReadOnly,
			submissionDate: this.props.submissionDate,
			dateMin: Moment(new Date()).toDate(),
			sd_ImageData: this.props.attachFileData,
			isAttachModify: this.props.isAttachModify,
			fileName: this.props.fileName,
			fileExtension: this.props.attachFileExtension,
			isEdit: false,
			titleText: '',
			isScreenFrom: '',
			savedFileName: '',
		};
	}

	async componentDidMount() {
		this.props.onRef(this);
		var temp_screen = await AsyncStorage.getItem('isScreen', '');
		if (temp_screen === 'UpdateDiary') {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					if (this.state.fileName != '' && this.state.fileName != undefined) {
						this.downloadImage(this.state.fileName);
					}
				}
			});
		}

		this.setState({ isScreenFrom: temp_screen });
		if (this.props.submissionDate == '' || this.props.submissionDate == 'Invalid date') {
			this.setState({ submissionDate: Moment(new Date()).toDate() });
		}

		if (!this.props.isListLoaded) {
			NetInfo.isConnected.fetch().then((isConnected) => {
				if (isConnected) {
					this.getSubjectList();
					this.getDiarySectionList();
				}
			});
		}
	}

	async componentWillMount() {
		// temp_screen = await AsyncStorage.getItem('isScreen','');
		// console.log('Submission Date',this.props.submissionDate);
		// this.setState({isScreenFrom:temp_screen});
	}

	getDiarySectionList() {
		const obj = new HTTPRequestMng('', 'GetSD_SectionList', this);
		obj.executeRequest('InstituteId=' + this.props.instituteId);
	}

	getSubjectList() {
		const obj = new HTTPRequestMng('', 'GetSubjectList', this);
		obj.executeRequest('AutoClassId=' + this.props.classId);
	}

	onSectionValueChange(value) {
		this.setState({ selectedSectionID: value }, () => {
			if (value != 0) {
			}
		});
	}

	onSubjectValueChange(value) {
		this.setState({ selectedSubjectID: value });
	}

	performSelectDate(type, date) {
		const dateResult = Moment(date, 'DD/MM/YYYY').toDate();

		const currDateVal = Moment(dateResult).format('DD/MM/YYYY');
		const minDateVal = Moment(this.state.dateMin).format('DD/MM/YYYY');
		//const startDateVal = Moment(this.state.startDate).format('YYYY-MM-DD');
		//const endDateVal = Moment(this.state.endDate).format('YYYY-MM-DD');

		let diff = Moment(minDateVal).diff(currDateVal, 'days');
		if (diff > 0) {
			Alert.alert('Message', 'Date should not be less than todays date');
		} else {
			this.setState({ submissionDate: currDateVal });
		}
	}

	onHTTPError() {
		this.changeLoadingStatus(false);
		Alert.alert('Message', 'Unable to connect with server, Please try after some time');
	}

	onHTTPResponseDiarySectionList(respData) {
		try {
			const jsonRec = respData[0];
			const status = jsonRec['Message'];

			if (status == 'Success') {
				this.setState({ isListLoaded: true });
				const listData = jsonRec['Data'];
				console.info('Data', listData);
				let recordCurrentList = [];

				if (listData != undefined) {
					listData.forEach((singleObj) => {
						const arrayObj = {
							AutoSDSectionId: singleObj['AutoSDSectionId'],
							SDSection: singleObj['SDSection'],
						};

						if (singleObj['SDSection'].toLowerCase() == 'homework')
							this.setState({ homeWorkSectionID: singleObj['AutoSDSectionId'] });
						recordCurrentList.push(arrayObj);
					});

					// var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
					// const sorted = recordCurrentList.sort((a, b) => collator.compare(a.SDSection, b.SDSection))
					//this.setState({sectionList: sorted,subjectList:[]});
					this.setState({ diarySectionList: recordCurrentList });
				}
			} else {
				Alert.alert('Message', 'There is no Class found for given School Diary.');
				this.setState({ isListLoaded: false });
			}
		} catch (error) {
			console.error('error', error);
			this.setState({ isListLoaded: false });
		}
		// this.changeLoadingStatus(false)
	}

	onHTTPResponseSubjectList(respData) {
		try {
			const jsonRec = respData[0];
			const status = jsonRec['Message'];

			if (status == 'Success') {
				const listData = jsonRec['Data'];
				console.info('SubjectListData', listData);
				let recordCurrentList = [];

				if (listData != undefined) {
					listData.forEach((singleObj) => {
						const arrayObj = {
							AutoSubjectId: singleObj['AutoSubjectId'],
							SubjectName: singleObj['Name'],
							SubCode: singleObj['SubCode'],
							IsOptional: singleObj['IsOptional'],
							IsGradeSubject: singleObj['IsGradeSubject'],
						};
						recordCurrentList.push(arrayObj);
					});
					// var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
					// const sorted = recordCurrentList.sort((a, b) => collator.compare(a.SubjectName, b.SubjectName))
					this.setState({ subjectList: recordCurrentList });
				}
			} else {
				// Alert.alert('Oops', 'unable to get subject list');
				Alert.alert('Message', 'No Subject list is created for given School Diary.');
			}
		} catch (error) {
			console.error('erroe', error);
		}
		//this.changeLoadingStatus(false)
	}

	checkAppPermission = async () => {
		try {
			if (Platform.OS == 'android') {
				let permissionList = [];
				let granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
				if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.CAMERA);
				granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
				if (!granted) permissionList.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

				if (permissionList.length > 0) {
					//ask permission required
					const granted = await PermissionsAndroid.requestMultiple(permissionList);

					let isGranted = true;
					for (let i = 0; i < permissionList.length; i++) {
						if (granted[permissionList[i]] != PermissionsAndroid.RESULTS.GRANTED) {
							isGranted = false;
							break;
						}
					}
					if (isGranted) {
						this.performAttachmentSelection();
					} else {
						Alert.alert('Message', 'You need to enable app permission before adding attachment');
					}
				} else {
					//all granted
					this.performAttachmentSelection();
				}
			} else {
				this.performAttachmentSelection();
			}
		} catch (err) {
			console.error(err);
		}
	};

	performAttachmentSelection() {
		ActionSheet.show(
			{
				options: [
					'Take Photo...',
					'Choose photo from Gallery...',
					'Choose file from Storage',
					'Remove Attachment',
					'Cancel',
				],
				cancelButtonIndex: 4,
				destructiveButtonIndex: 3,
			},
			(buttonIndex) => {
				const fileName = String(new Date().valueOf()) + '.jpeg';
				if (buttonIndex == 0) {
					ImagePicker.openCamera({
						width: 600,
						height: 600,
						// cropping: true,
						compressImageMaxHeight: 600,
						compressImageMaxWidth: 600,
						includeBase64: true,
						mediaType: 'photo',
						enableRotationGesture: true,
					}).then((data) => {
						console.log('filesize', String(data['data'].fileSize));
						if (data['data'].fileSize > 2048 * 1024) {
							Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
						} else {
							let fileData = data['data'];
							if (fileData.length > 0) {
								this.setState({
									sd_ImageData: fileData,
									isAttachModify: true,
									fileName: String(data['path']),
									savedFileName: fileName,
									fileExtension: '.jpeg',
								});
							}
						}
						setTimeout(() => {
							ImagePicker.clean();
						}, 0);
					});
				} else if (buttonIndex == 1) {
					ImagePicker.openPicker({
						width: 600,
						height: 600,
						//cropping: true,
						compressImageMaxHeight: 600,
						compressImageMaxWidth: 600,
						includeBase64: true,
						mediaType: 'photo',
						//enableRotationGesture: true,
					}).then((data) => {
						//  console.log( 'filesize',  String(data['data']));
						//console.log( 'filename',  String(data['path']));

						if (data['data'].fileSize > 2048 * 1024) {
							Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
						} else {
							let fileData = data['data'];
							if (fileData.length > 0) {
								this.setState({
									sd_ImageData: fileData,
									isAttachModify: true,
									fileName: String(data['path']),
									savedFileName: fileName,
									fileExtension: '.jpeg',
								});
							}
						}

						setTimeout(() => {
							ImagePicker.clean();
						}, 0);
					});
				} else if (buttonIndex == 2) {
					this.selectFilesFromStorage();
				} else if (buttonIndex == 3) {
					Alert.alert('Are you sure?', 'You want to remove your attachment.', [
						{ text: 'No' },
						{
							text: 'Yes',
							onPress: () =>
								this.setState({
									sd_ImageData: '',
									isAttachModify: true,
									fileName: '',
									fileExtension: '',
								}),
						},
					]);
				}
			}
		);
	}

	//for opening image from storage
	selectFilesFromStorage = async () => {
		try {
			let data = await DocumentPicker.pick({
				type: [DocumentPicker.types.allFiles],
			});
			console.log('ddddd', data);
			if (data != null && data != undefined) {
				if (parseInt(data.size) > 2048 * 1024) {
					Toast.show({ text: 'File should be less than 2 MB', type: 'danger' });
				} else {
					var temp_fileExtension = this.getExtention(data.name);
					fileExtension = '.' + temp_fileExtension[0];
					// const fileExtension = fileName.substring(fileName.lastIndexOf('.')).trim();
					console.log(fileExtension);

					if (
						fileExtension == '.png' ||
						fileExtension == '.jpeg' ||
						fileExtension == '.jpg' ||
						fileExtension == '.bmp' ||
						fileExtension == '.gif'
					) {
						Alert.alert('Message', 'Please select valid document file.');
						//Toast.show({ text: 'Please select document file.', type: 'danger' });
					} else {
						const fileName = String(data.name);
						this.setState({ isAttachModify: true, fileName: fileName, fileExtension: fileExtension });
						RNFS.readFile(data.uri, 'base64')
							.then((res2) => {
								//console.log('base 64',res2);
								this.setState({
									sd_ImageData: res2,
									isAttachModify: true,
									fileName: fileName,
									savedFileName: fileName,
									fileExtension: fileExtension,
								});
							})
							.catch((err) => { });
					}
				}
			}
		} catch (err) {
			if (DocumentPicker.isCancel(err)) {
				//alert('Canceled from single doc picker');
			} else {
				//alert('Unknown Error: ' + JSON.stringify(err));
				throw err;
			}
		}
	};

	downloadImage(image_URL, that) {
		var date = new Date();
		const fileName = String(new Date().valueOf());
		// var image_URL = 'https://reactnativecode.com/wp-content/uploads/2018/02/motorcycle.jpg';
		var ext = this.getExtention(image_URL);
		ext = '.' + ext[0];
		try {
			const { config, fs } = RNFetchBlob;
			let PictureDir = fs.dirs.PictureDir;

			let options = {
				fileCache: true,
				addAndroidDownloads: {
					useDownloadManager: true,
					notification: true,
					path: PictureDir + '/image_' + Math.floor(date.getTime() + date.getSeconds() / 2) + ext,
					description: 'Image',
				},
			};
			config(options)
				.fetch('GET', image_URL)
				.then((res) => {
					console.log(res);
					this.setState({ fileName: 'file://' + res['data'], savedFileName: fileName + ext });
					return res.readFile('base64');
				})
				.then((base64) => {
					this.setState({ sd_ImageData: base64 });
				});
		} catch (error) {
			Alert.alert('Message', 'File downloading failed.');
		}
	}

	getExtention = (filename) => {
		return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
	};

	openAttachmentFile() {
		console.log(this.state.fileName);
		// if(this.state.isScreenFrom==='UpdateDiary'){
		//     FileViewer.open(this.state.fileName,
		//         { showOpenWithDialog: true, displayName: this.state.fileName, showAppsSuggestions: true }
		//     ).then(() => {})
		//     .catch(error => {
		//         console.error(error);
		//     });
		//   }else{
		// var path = RNFS.DocumentDirectoryPath+ '/'+this.state.fileName;
		// console.log('path ',path);
		// FileViewer.open(path,
		//     { showOpenWithDialog: true, displayName: this.state.fileName, showAppsSuggestions: true }
		// ).then(() => {})
		// .catch(error => {
		//     console.error(error);
		// });

		var path = RNFS.DocumentDirectoryPath + '/' + this.state.savedFileName;
		console.log('path ', path);
		this.changeLoadingStatus(true);
		// write the file
		RNFS.writeFile(path, this.state.sd_ImageData, 'base64')
			.then((success) => {
				console.log('FILE WRITTEN!');
				if (path != '') {
					FileViewer.open(path, {
						showOpenWithDialog: true,
						displayName: this.state.fileName,
						showAppsSuggestions: true,
					})
						.then(() => { })
						.catch((error) => {
							Toast.show({ text: 'Failed to open file', type: 'danger' });
							// console.error(error);
						});
				}
			})
			.catch((err) => {
				console.log(err.message);
				Toast.show({ text: 'Failed to open file', type: 'danger' });
			});

		this.changeLoadingStatus(false);
	}

	checkForValidation() {
		console.log("SEELELELE",this.state.selectedSectionID, this.state.selectedSubjectID,this.state.isDateReadOnly)
		if(this.state.selectedSectionID == ''){
			alert("Please select Diary Secton")

		}else{
			const sel_diary_obj = this.state.diarySectionList.find((item, index) => { return item.AutoSDSectionId == this.state.selectedSectionID })
		let isDataRequired = true;
		switch (sel_diary_obj.SDSection) {
			case "Homework":
				isDataRequired = false;
				break;
			case "Activities":
				isDataRequired = false;
				break;
			case "Notices":
				isDataRequired = false;
				break;
			case "Planning":
				isDataRequired = false;
				break;
			default:
				break;
		}

			if (this.state.selectedSectionID == 0) {
				Alert.alert('Message', 'Please select school diary section');
				return false;
			}else if(this.state.selectedSectionID == 229 && this.state.selectedSubjectID == ''){
					Alert.alert('Message', 'Subject required ');
			}else if(this.state.isDateReadOnly == true && this.state.selectedSectionID == 229){
				Alert.alert('Message', 'Submission date is required. ');
			}else if(this.state.msgTitle == ''){
				Alert.alert('Message', 'Message title required');
			}else if(this.state.msgText == ''){
				Alert.alert('Message', 'Message text required');
			}else{
				this.saveDiaryDetails();
				this.saveDetailsOnServer();
			}
		}
	}

	saveDiaryDetails() {
		this.props.ActionAddDiaryDetailsStep2({
			AutoSDSectionId: this.state.selectedSectionID,
			subjectID: this.state.selectedSubjectID,
			isDateReadOnly: this.state.isDateReadOnly,
			isSubmissionDateAdded: this.state.isSubmissionDateAdded,
			submissionDate: this.state.submissionDate,
			msgTitle: this.state.msgTitle,
			msgText: this.state.msgText,
			isListLoaded: this.state.isListLoaded,
			diarySectionList: this.state.diarySectionList,
			subjectList: this.state.subjectList,
			attachFileData: this.state.sd_ImageData,
			fileName: this.state.fileName,
			attachFileExtension: this.state.fileExtension,
			isAttachModify: this.state.isAttachModify,
			homeWorkSectionID: this.state.homeWorkSectionID,
		});
	}

	deleteSchoolDiaryOnServer() {
		this.changeLoadingStatus(true);
		const obj = new HTTPRequestMng('', 'DeleteSchoolDiaryDetails', this);
		if (this.props.instituteId != undefined && parseInt(this.props.instituteId) != 0) {
			obj.executeRequest(
				'InstituteId=' + parseInt(this.props.instituteId) + '&AutoSDId=' + this.state.selectedSchoolDiaryID
			);
		}
	}

	saveDetailsOnServer() {
		let attachmentData;
		if (this.state.isScreenFrom != '' && this.state.isScreenFrom === 'UpdateDiary') {
			if (this.state.fileName > 0) {
				attachmentData = this.state.sd_ImageData;
				// RNFS.readFile(this.state.fileName, 'base64').then(res => {
				//     attachmentData=res;
				// }).catch((err) => { });
			} else {
				if (this.state.isAttachModify) {
					attachmentData = this.state.sd_ImageData;
				} else if (this.state.fileName.length > 0) {
					RNFS.readFile(this.state.fileName, 'base64')
						.then((res) => {
							attachmentData = res;
						})
						.catch((err) => { });
				} else {
					attachmentData = '';
				}
			}
		} else {
			if (this.state.isAttachModify) {
				attachmentData = this.state.sd_ImageData;
			} else if (this.state.fileName.length > 0) {
				RNFS.readFile(this.state.fileName, 'base64')
					.then((res) => {
						attachmentData = res;
					})
					.catch((err) => { });
			} else {
				attachmentData = '';
			}
		}
		console.log('attachment Ext: ', this.state.fileExtension);
		//console.log("attachmnetdata: ", attachmentData);
		NetInfo.isConnected.fetch().then(async (isConnected) => {
			if (isConnected) {
				this.changeLoadingStatus(true);

				let jsonArrayStudent = [];

				let recordList = this.props.studentList;

				console.log('Saved student list', JSON.stringify(recordList));

				recordList.forEach((singleObj) => {
					if (singleObj.isSelected) {
						jsonArrayStudent.push({
							AutoParentId: singleObj['AutoParentId'],
							AutoStudId: singleObj['AutoStudId'],
						});
					}
				});

				let formatedDate;

				if (this.state.submissionDate != '' && !this.state.isDateReadOnly) {
					const currDateVal = Moment(this.state.submissionDate, 'DD/MM/YYYY').toDate();
					formatedDate = Moment(currDateVal).format('YYYY/MM/DD');
				} else{
					const currDateVal = Moment(new Date(), 'DD/MM/YYYY').toDate();
					formatedDate = Moment(currDateVal).format('YYYY/MM/DD');
					
				} ;

				if (attachmentData == null) {
					attachmentData = '';
				}

				//create sending json
				if (this.state.isScreenFrom != '' && this.state.isScreenFrom === 'UpdateDiary') {
					const requestJson = {
						InstituteId: parseInt(this.props.instituteId),
						AutoClassId: this.props.classId,
						AutoSectionId: this.props.sectionID,
						AutoSubjectId: this.props.subjectID,
						AutoSDSectionId: this.state.selectedSectionID,
						SubmissionDate: formatedDate,
						MessageTitle: this.state.msgTitle,
						MessageText: this.state.msgText,
						// 'SessionYear': 0,
						AttachFileData: String(attachmentData),
						AttachFileExtension: String(this.state.fileExtension),
						AutoTrainerId: parseInt(await AsyncStorage.getItem('AutoTrainerId')),
						AutoSDId: this.state.selectedSchoolDiaryID,
						StudentList: jsonArrayStudent,
					};

					console.log('Update request input', JSON.stringify(requestJson));

					const obj = new HTTPRequestMng('', 'UpdateSchoolDiaryDetails', this);
					obj.executeRequest(requestJson);
				} else if (this.state.isScreenFrom != '' && this.state.isScreenFrom === 'AddDiary') {
					const requestJson = {
						InstituteId: parseInt(this.props.instituteId),
						AutoClassId: this.props.classId,
						AutoSectionId: this.props.sectionID,
						AutoSubjectId: this.props.subjectID,
						AutoSDSectionId: this.state.selectedSectionID,
						SubmissionDate: formatedDate,
						MessageTitle: this.state.msgTitle,
						MessageText: this.state.msgText,
						// 'SessionYear': 0,
						AttachFileData: String(attachmentData),
						AttachFileExtension: String(this.state.fileExtension),
						AutoTrainerId: parseInt(await AsyncStorage.getItem('AutoTrainerId')),
						AutoSDId: 0,
						StudentList: jsonArrayStudent,
					};
					console.log('request input', JSON.stringify(requestJson));
					const obj = new HTTPRequestMng('', 'SaveSchoolDiaryDetails', this);
					obj.executeRequest(requestJson);
				}
			} else {
				this.changeLoadingStatus(false);
				Alert.alert('Message', 'No internet connection');
			}
		});
	}

	onHTTPResponseDiaryDetailsSaved(respData) {
		try {
			const jsonRec = respData[0];
			const status = jsonRec['Status'];
			const msg = jsonRec['Message'];

			if (status == 1) {
				Alert.alert('Success', msg, [
					{
						text: 'OK',
						onPress: () => {
							// this.props.onScreenRefresh();
							//this.props.navigation.state.params.onScreenRefresh();
							//  this.props.navigation.goBack();
							this.props.navigation.navigate('DashboardWnd');
							// this.props.onScreenRefresh();
							//this.props.navigation.goBack();
						},
					},
				]);
			} else {
				Alert.alert('Message', msg, [
					{
						text: 'OK',
						onPress: () => {
							this.props.navigation.goBack();
							this.props.refreshParent;
						},
					},
				]);
			}
		} catch (error) {
			console.error('error', error);
			this.setState({ isListLoaded: false });
		} finally {
			this.changeLoadingStatus(false);
		}
	}
	onHTTPResponseUpdateDiaryDetails(respData) {
		try {
			const jsonRec = respData[0];
			const status = jsonRec['Status'];
			const msg = jsonRec['Message'];

			if (status == 1) {
				Alert.alert('Success', msg, [
					{
						text: 'OK',
						onPress: () => {
							this.props.navigation.goBack();
						},
					},
				]);
			} else {
				Alert.alert('Message', msg, [
					{
						text: 'OK',
						onPress: () => {
							this.props.navigation.goBack();
						},
					},
				]);
			}
		} catch (error) {
			console.error('error', error);
			this.setState({ isListLoaded: false });
		} finally {
			this.changeLoadingStatus(false);
		}
	}

	onHTTPResponseDeleteDiaryDetails(respData) {
		try {
			const jsonRec = respData[0];
			const status = jsonRec['Status'];
			const msg = jsonRec['Message'];

			if (status == 1) {
				Alert.alert('Success', msg, [
					{
						text: 'OK',
						onPress: () => {
							this.props.navigation.goBack();
						},
					},
				]);
			} else {
				Alert.alert('Message', msg, [
					{
						text: 'OK',
						onPress: () => {
							this.props.navigation.goBack();
						},
					},
				]);
			}
		} catch (error) {
			console.error('error', error);
			this.setState({ isListLoaded: false });
		} finally {
			this.changeLoadingStatus(false);
		}
	}

	changeLoadingStatus(isShow, msg) {
		this.setState({ loading: isShow, loadingMsg: msg });
	}

	render() {
		const childWidth =
			screenWidth / (getOrientation() == 'portrait' ? (isTablet ? 1.3 : 1) : isTablet ? 2 : 1.5) - 20;
		let Image_Http_URL = { uri: 'https://reactnativecode.com/wp-content/uploads/2017/05/react_thumb_install.png' };
		let sliderHeight = childWidth / 2.2 < 250 ? 250 : childWidth / 2.2;

		const sectionPickerItems = [];
		const sectionList = this.state.diarySectionList;
		sectionPickerItems.push(<Picker.Item label="Select" value={0} />);
		sectionList.forEach((singleObj) => {
			sectionPickerItems.push(<Picker.Item label={singleObj.SDSection} value={singleObj.AutoSDSectionId} />);
		});

		const subjectPickerItems = [];
		const subjectList = this.state.subjectList;
		subjectPickerItems.push(<Picker.Item label="Select subject" value={0} />);
		subjectList.forEach((singleObj) => {
			subjectPickerItems.push(<Picker.Item label={singleObj.SubjectName} value={singleObj.AutoSubjectId} />);
		});

		let sectionNameLayout = (
			<Picker
				mode="dropdown"
				iosIcon={<Icon name="ios-arrow-down" />}
				placeholder="Select"
				iosHeader="Select"
				style={{ width: '100%', height: 40 }}
				textStyle={{ maxWidth: '85%', paddingLeft: 5, paddingRight: 0 }}
				selectedValue={this.state.selectedSectionID}
				onValueChange={this.onSectionValueChange.bind(this)}
			>
				{sectionPickerItems}
			</Picker>
		);

		let SubjectNameLayout = (
			<Picker
				mode="dropdown"
				iosIcon={<Icon name="ios-arrow-down" />}
				placeholder="Select subject"
				iosHeader="Select subject"
				style={{ width: '100%', height: 40 }}
				textStyle={{ maxWidth: '85%', paddingLeft: 5, paddingRight: 0 }}
				selectedValue={this.state.selectedSubjectID}
				onValueChange={this.onSubjectValueChange.bind(this)}
			>
				{subjectPickerItems}
			</Picker>
		);

		let checkLayout, dateFontStyle;

		if (this.state.isDateReadOnly) {
			checkLayout = <Icon name="square-outline" style={{ fontSize: 24, marginRight: 5, marginLeft: 10 }} />;
			dateFontStyle = {
				dateInput: { marginLeft: 5, alignItems: 'flex-start', borderWidth: 0 },
				placeholderText: { color: appColor.semi_dark_gray },
			};
		} else {
			checkLayout = <Icon name="checkbox" style={{ fontSize: 24, marginRight: 5, marginLeft: 10 }} />;
			dateFontStyle = {
				dateInput: { marginLeft: 5, alignItems: 'flex-start', borderWidth: 0 },
				placeholderText: { color: appColor.black },
			};
		}

		let datePickerLayout = (
			<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
				<TouchableHighlight onPress={() => this.setState({ isDateReadOnly: !this.state.isDateReadOnly })}>
					{checkLayout}
				</TouchableHighlight>
				<DatePicker
					date={this.state.submissionDate}
					disabled={this.state.isDateReadOnly}
					mode="date"
					androidMode="calendar"
					locale={'en'}
					confirmBtnText="Select"
					cancelBtnText="Cancel"
					iconComponent={<Icon name="md-calendar" style={{ fontSize: 0, color: appColor.black }} />}
					format="DD/MM/YYYY"
					onDateChange={(date) => this.performSelectDate('start', date)}
					customStyles={dateFontStyle}
				/>
			</View>
		);

		let attachmentLayout,
			attachment = '';

		let typeName, imageRes;
		let fileExt = '';
		if (this.state.fileExtension != undefined) fileExt = this.state.fileExtension.toUpperCase();
		if (this.state.fileExtension != '') {
			if (
				fileExt == '.PNG' ||
				fileExt == '.JPEG' ||
				fileExt == '.JPG' ||
				fileExt == '.BMP' ||
				fileExt == '.GIF'
			) {
				typeName = 'Image';
				imageRes = (
					<Image
						resizeMode={'stretch'}
						source={require('../../assets/icon_img.png')}
						style={{ width: 38, height: 38, marginLeft: 5, tintColor: 'black', marginRight: 10 }}
					/>
				);
			} else if (fileExt == '.DOC' || fileExt == '.DOCX') {
				typeName = 'DOC';
				imageRes = (
					<Image
						resizeMode={'stretch'}
						source={require('../../assets/icon_file_doc.png')}
						style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }}
					/>
				);
			} else if (fileExt == '.PDF') {
				typeName = 'PDF';
				imageRes = (
					<Image
						resizeMode={'stretch'}
						source={require('../../assets/icon_file_pdf.png')}
						style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }}
					/>
				);
			} else if (fileExt == '.XLS' || fileExt == '.XLSX') {
				typeName = 'Excel';
				imageRes = (
					<Image
						resizeMode={'stretch'}
						source={require('../../assets/icon_file_xls.png')}
						style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }}
					/>
				);
			} else if (fileExt == '.PPT' || fileExt == '.PPTX') {
				typeName = 'PPT';
				imageRes = (
					<Image
						resizeMode={'stretch'}
						source={require('../../assets/icon_file_ppt.png')}
						style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }}
					/>
				);
			} else {
				typeName = 'File';
				imageRes = (
					<Image
						resizeMode={'stretch'}
						source={require('../../assets/icon_file_unknown.png')}
						style={{ width: 32, height: 38, marginLeft: 5, marginRight: 10 }}
					/>
				);
			}
		}

		if (this.state.fileName != '') {
			let imageLay;
			if (
				fileExt == '.PNG' ||
				fileExt == '.JPEG' ||
				fileExt == '.JPG' ||
				fileExt == '.BMP' ||
				fileExt == '.GIF'
			) {
				if (this.state.isScreenFrom != '' && this.state.isScreenFrom === 'UpdateDiary') {
					imageLay = (
						<Image
							source={{ uri: this.state.fileName }}
							style={{ resizeMode: 'stretch', width: '100%', height: sliderHeight }}
						/>
					);
				} else {
					imageLay = (
						<Image
							source={{
								uri:
									Platform.OS === 'android'
										? 'file://' + this.state.fileName
										: '' + this.state.fileName,
							}}
							style={{ resizeMode: 'stretch', width: '100%', height: sliderHeight }}
						/>
					);
				}
				// imageLay = <Image source= {{uri:this.state.fileName}}
				// style={{ resizeMode: 'stretch', width: 30, height: 30 }} />
			}

			attachment = (
				<TouchableHighlight underlayColor="#00000010" onPress={() => this.openAttachmentFile()}>
					<View style={{ flex: 1, minHeight: 60 }}>
						{imageLay}
						<View
							style={{
								width: '100%',
								flexDirection: 'row',
								backgroundColor: '#ffffffEA',
								height: 60,
								position: 'absolute',
								alignItems: 'center',
								bottom: 0,
							}}
						>
							{imageRes}
							<View style={{ flex: 1, flexDirection: 'column' }}>
								<Text style={{ fontSize: 17, color: appColor.black }}>{this.state.fileName}</Text>
								<Text style={{ fontSize: 14, color: appColor.darkgray, marginTop: 5 }}>{typeName}</Text>
							</View>
						</View>
					</View>
				</TouchableHighlight>
			);
		}

		if (attachment != '') {
			//check for is attachment modified
			if (this.state.isAttachModify) {
				if (this.state.sd_ImageData == '') {
					// do something if image data is not avaliable
					attachment = <View></View>;
				} else {
					let imageLay;
					// if (fileExt == '.PNG' || fileExt == '.JPEG' || fileExt == '.JPG' || fileExt == '.BMP' || fileExt == '.GIF') {
					//     imageLay = <Image source={{ uri: this.state.sd_ImageData }}
					//         style={{ resizeMode: 'stretch', width: '100%', height: sliderHeight }} />
					// }

					if (this.state.isScreenFrom != '' && this.state.isScreenFrom === 'UpdateDiary') {
						imageLay = (
							<Image
								source={{ uri: this.state.fileName }}
								style={{ resizeMode: 'stretch', width: '100%', height: sliderHeight }}
							/>
						);
					} else {
						//var base64Icon = 'data:image/jpeg;base64,' + {this.state.sd_ImageData};
						//{{uri: `data:image/gif;base64,${encodedData}`}}
						console.log(this.state.sd_ImageData);
						imageLay = (
							<Image
								source={{ uri: this.state.fileName }}
								style={{ resizeMode: 'stretch', width: '100%', height: sliderHeight }}
							/>
						);
					}
					attachment = (
						<TouchableHighlight underlayColor="#00000010" onPress={() => this.openAttachmentFile()}>
							<View style={{ flex: 1, minHeight: 60 }}>
								{imageLay}
								<View
									style={{
										width: '100%',
										flexDirection: 'row',
										backgroundColor: '#ffffffEA',
										height: 60,
										position: 'absolute',
										alignItems: 'center',
										bottom: 0,
									}}
								>
									{imageRes}
									<View style={{ flex: 1, flexDirection: 'column', marginTop: 10 }}>
										<Text style={{ fontSize: 13, color: appColor.black }}>
											{this.state.fileName}
										</Text>
										<Text style={{ fontSize: 13, color: appColor.darkgray, marginTop: 6 }}>
											{typeName}
										</Text>
									</View>
								</View>
							</View>
						</TouchableHighlight>
					);
				}

				if (this.state.sd_ImageData == '') {
					attachmentLayout = <View></View>;
				} else {
					attachmentLayout = (
						<Card style={{ borderRadius: 10, marginTop: 10 }}>
							<CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
								<View style={{ flex: 1, flexDirection: 'column', marginLeft: -5, marginRight: -5 }}>
									{attachment}
								</View>
							</CardItem>
						</Card>
					);
				}
			}
		}

		return (
			<View style={{ flex: 1, backgroundColor: appColor.backgroundColor }}>
				<InternetConn />
				<Content style={{ padding: 10 }}>
					<Card style={{ borderRadius: 10, marginTop: 10, marginBottom: 10 }}>
						<CardItem bordered style={{ borderRadius: 10, borderColor: 'white' }}>
							<View style={{ flex: 1, flexDirection: 'column', marginLeft: -5, marginRight: -5 }}>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View style={{ flex: 1, flexDirection: 'column' }}>
										<Text style={layoutDesign.headingText}>Diary Section </Text>
										<View style={[layoutDesign.pickerLayout, { marginRight: 10 }]}>
											{sectionNameLayout}
										</View>
									</View>

									<View style={{ flex: 1, flexDirection: 'column' }}>
										<Text style={layoutDesign.headingText}>Subject </Text>
										<View style={layoutDesign.pickerLayout}>{SubjectNameLayout}</View>
									</View>
								</View>

								<View style={{ flex: 1, flexDirection: 'column' }}>
									<Text style={layoutDesign.headingText}>Add submission date </Text>
									<View style={layoutDesign.pickerLayout}>{datePickerLayout}</View>
								</View>

								<Text style={[layoutDesign.headingText, { marginTop: 5 }]}>Message Title </Text>
								<View style={layoutDesign.pickerLayout}>
									<Input
										style={[layoutDesign.inputBoxFontStyle, { height: 40 }]}
										onChangeText={(text) => this.setState({ msgTitle: text })}
										value={this.state.msgTitle}
									/>
								</View>
								<Text style={[layoutDesign.headingText, { marginTop: 5 }]}>Message Text </Text>
								<View style={layoutDesign.pickerLayout}>
									<Textarea
										ref="detailsInput"
										rowSpan={4}
										placeholder="Write your description"
										returnKeyType="done"
										value={this.state.msgText}
										style={[layoutDesign.inputBoxLayout, { flex: 1, marginBottom: 2 }]}
										onChangeText={(text) => this.setState({ msgText: text })}
									/>
								</View>
								<TouchableHighlight
									underlayColor="#00000010"
									style={{ alignItems: 'flex-end' }}
									onPress={() => this.checkAppPermission()}
								>
									<Text
										style={{
											width: 100,
											marginTop: 10,
											color: appColor.colorPrimary,
											height: 35,
											textAlign: 'center',
											textAlignVertical: 'center',
											borderRadius: 5,
											borderWidth: 1,
											borderColor: appColor.colorPrimary,
										}}
									>
										Attachment{' '}
									</Text>
								</TouchableHighlight>
								{attachmentLayout}
							</View>
						</CardItem>
					</Card>
				</Content>
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
			</View>
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
	item: {
		paddingLeft: 5,
		paddingRight: 2,
		paddingTop: 7,
		paddingBottom: 7,
		alignItems: 'center',
	},
});

//export default StepAddDiaryDetails;
const mapStateToProps = (state) => {
	return {
		instituteId: state.teacherInfo.InstituteId,
		selectedSectionID: state.diaryInfo.AutoSDSectionId,
		selectedSubjectID: state.diaryInfo.subjectID,
		selectedSchoolDiaryID: state.diaryInfo.schoolDiaryID,
		isDateReadOnly: state.diaryInfo.isDateReadOnly,
		submissionDate: state.diaryInfo.submissionDate,
		msgTitle: state.diaryInfo.msgTitle,
		msgText: state.diaryInfo.msgText,
		diarySectionList: state.diaryInfo.diarySectionList,
		subjectList: state.diaryInfo.subjectList,
		classId: state.diaryInfo.classID,
		sectionID: state.diaryInfo.sectionID,
		subjectID: state.diaryInfo.subjectID,
		studentList: state.diaryInfo.studentList,
		attachmentLocalPath: state.diaryInfo.attachmentLocalPath,
		attachFileData: state.diaryInfo.attachFileData,
		fileName: state.diaryInfo.fileName,
		attachFileExtension: state.diaryInfo.attachFileExtension,
		isAttachModify: state.diaryInfo.isAttachModify,
		homeWorkSectionID: state.diaryInfo.homeWorkSectionID,
		selectedsessionYear: state.diaryInfo.sessionYear,
	};
};

export default connect(mapStateToProps, {
	ActionAddDiaryDetailsStep2,
	ActionAddDiaryDetailsStep1,
	ActionUpdateDiaryDetailsStep1,
	ActionAddTeacher,
})(StepAddDiaryDetails);
