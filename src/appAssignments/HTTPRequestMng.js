import HTTPConnection from '../networkConn/HTTPConnection';
import { Webservice_URL, AssignmentWebService } from '../config/AppConst';
import { Alert } from 'react-native';

export default class HTTPRequestMng extends HTTPConnection {
	constructor(authToken, method, classObject) {
		super();
		this.setAuthToken(authToken);
		this.setMethod(method);
		this.setClassRef(classObject);
	}

	linkGenerator(requestData) {
		if (this.getMethod() == 'GetAssignmentLists') {
			return AssignmentWebService + 'AssignmentLists';
		} else if (this.getMethod() == 'DeleteAssignment') {
			return AssignmentWebService + 'DeleteAssignment';
		} else if (this.getMethod() == 'FillClasses') {
			return AssignmentWebService + 'FillClasses';
		} else if (this.getMethod() == 'AdminFileUpload') {
			return AssignmentWebService + 'AdminFileUpload';
		} else if (this.getMethod() == 'FillStudents') {
			return AssignmentWebService + 'FillStudents';
		} else if (this.getMethod() == 'AddUpdateAssignment') {
			return AssignmentWebService + 'AddUpdateAssignment';
		} else if (this.getMethod() == 'GetAssignmentDetails') {
			return AssignmentWebService + 'GetAssignmentDetails';
		} else if (this.getMethod() == 'GetAssignmentEvaluateDetails') {
			return AssignmentWebService + 'GetAssignmentEvaluateDetails';
		} else if (this.getMethod() == 'GetEvaluateStudentDetails') {
			return AssignmentWebService + 'GetEvaluateStudentDetails';
		} else if (this.getMethod() == 'EvaluateStudent') {
			return AssignmentWebService + 'EvaluateStudent';
		}else if (this.getMethod() == 'AnnotatedFileUpload') {
			return 'http://bmhsschool.in//students/WebServices/Assignments.asmx/StudentFileUpload_APP_ANNOTATE';
		} else if (this.getMethod() == 'DeleteTempfile') {
			return 'http://bmhsschool.in/students/WebServices/Assignments.asmx/'+ 'DeleteTempFile_Annotate'
			;
		}
	}




	onHttpResponse(respCode, respData) {
		try {
			if (this.getMethod() == 'GetAssignmentLists') {
				this.getClassRef().onHTTPReponseAssignmentsList(JSON.stringify(respData));
			} else if (this.getMethod() == 'DeleteAssignment') {
				this.getClassRef().onDeleteAssignmentResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'FillClasses') {
				this.getClassRef().onClassDetailsResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'AdminFileUpload') {
				this.getClassRef().onFilesUploadResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'FillStudents') {
				this.getClassRef().onStudentsListsResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'AddUpdateAssignment') {
				this.getClassRef().onCreateAssignmentResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'GetAssignmentDetails') {
				this.getClassRef().onAssignmentDetailsResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'GetAssignmentEvaluateDetails') {
				this.getClassRef().onEvaluateDeatailsResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'GetEvaluateStudentDetails') {
				this.getClassRef().onStudentDetailsResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'EvaluateStudent') {
				this.getClassRef().onEvaluateStudentResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'AnnotatedFileUpload') {
				this.getClassRef().onAnnotatedImageUploadResponse(JSON.stringify(respData));
			} else if (this.getMethod() == 'DeleteTempfile') {
				this.getClassRef().onTempFileDeletedResponse(JSON.stringify(respData));
			}
		} catch(error) {
		// Alert.alert('Response error',JSON.stringify(error));
		this.onHttpError();
	}
}

onHttpError() {
	if (this.getMethod() === 'GetAppVersion') {
		return;
	}
	this.getClassRef().onHTTPError();
}
}
