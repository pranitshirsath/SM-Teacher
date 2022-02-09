
import Moment from 'moment';
import { act } from 'react-test-renderer';

const initialState = {
    instituteID: '0',classID: '0', sectionID: '0', subjectID: '0', AutoStudId: '0', 
    AutoSDSectionId:'0', isDateReadOnly:true,isSubmissionDateAdded:false, submissionDate: Moment(new Date()).toDate(),msgTitle:'',msgText:'',
    isClassListLoaded:false,classList: [], sectionList: [], subjectList: [],studentList: [],
    diarySectionList:[],attachFileData:'',fileName:'',attachFileExtension:'',
    isAttachModify:false,homeWorkSectionID:0,
    schoolDiaryID:'0',
    isEditDetails:false,
    sessionYear:Moment().format('YYYY')

};

//Reducers
export default SchoolDiaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_SCHOOL_DIARY_DETAILS_step1':
      return { ...state,
        instituteID: action.payload.instituteID, 
        classID: action.payload.classID, 
        sectionID: action.payload.sectionID, 
        isClassListLoaded:action.payload.isClassListLoaded,
        classList:action.payload.classList,
        sectionList:action.payload.sectionList,
        studentList:action.payload.studentList,
      };
      case 'ADD_SCHOOL_DIARY_DETAILS_step2':
      return { ...state,
        AutoSDSectionId: action.payload.AutoSDSectionId,
        subjectID: action.payload.subjectID, 
        isDateReadOnly:action.payload.isDateReadOnly,
        isSubmissionDateAdded: action.payload.isSubmissionDateAdded, 
        submissionDate: action.payload.submissionDate,
        msgTitle: action.payload.msgTitle,
        msgText: action.payload.msgText,
        isListLoaded:action.payload.isListLoaded,
        diarySectionList:action.payload.diarySectionList,
        subjectList:action.payload.subjectList,
        attachFileData:action.payload.attachFileData,
        fileName:action.payload.fileName,
        attachFileExtension: action.payload.attachFileExtension,
        isAttachModify: action.payload.isAttachModify,
        homeWorkSectionID:action.payload.homeWorkSectionID,
      };
      case 'UPDATE_SCHOOL_DIARY_DETAILS_step1':
        return { ...state,
          instituteID: action.payload.instituteID, 
          classID: action.payload.classID, 
          sectionID: action.payload.sectionID, 
          schoolDiaryID:action.payload.schoolDiaryID,
          isClassListLoaded:action.payload.isClassListLoaded,
          classList:action.payload.classList,
          sectionList:action.payload.sectionList,
          studentList:action.payload.studentList,
          isEditDetails:action.payload.isEditDetails,
          AutoSDSectionId:action.payload.AutoSDSectionId,
          subjectID: action.payload.subjectID,
          submissionDate: action.payload.submissionDate,
          msgTitle: action.payload.msgTitle,
          msgText:action.payload.msgText,
          sessionYear:action.payload.sessionYear,
          attachFileData:action.payload.attachFileData,
          fileName:action.payload.fileName,
          attachFileExtension:action.payload.attachFileExtension,
          isAttachModify: action.payload.isAttachModify,
        };

        case 'UPDATE_SCHOOL_DIARY_DETAILS_step2':
      return { ...state,
        AutoSDSectionId: action.payload.AutoSDSectionId,
        subjectID: action.payload.subjectID, 
        schoolDiaryID:action.payload.schoolDiaryID,
        isDateReadOnly:action.payload.isDateReadOnly,
        isSubmissionDateAdded: action.payload.isSubmissionDateAdded, 
        submissionDate: action.payload.submissionDate,
        msgTitle: action.payload.msgTitle,
        msgText: action.payload.msgText,
        isListLoaded:action.payload.isListLoaded,
        diarySectionList:action.payload.diarySectionList,
        subjectList:action.payload.subjectList,
        attachFileData:action.payload.attachFileData,
        fileName:action.payload.fileName,
        attachFileExtension: action.payload.attachFileExtension,
        isAttachModify: action.payload.isAttachModify,
        homeWorkSectionID:action.payload.homeWorkSectionID,
        isEditDetails:action.payload.isEditDetails,
      };
      case 'DELETE_DAIRY_DATA':
      return { ...state,
        instituteID: 0, 
        classID: 0, 
        sectionID: 0, 
        subjectID:0,
        isClassListLoaded:false,
        classList:[],
        sectionList:[],
        subjectList:[],
        studentList:[],
        AutoSDSectionId: 0,
        isDateReadOnly:true,
        isSubmissionDateAdded: false, 
        submissionDate: '',
        msgTitle: '',
        msgText: '',
        isListLoaded:false,
        diarySectionList:[],
        attachFileData:'',
        fileName:'',
        attachFileExtension: '',
        isAttachModify: false
      };
   
    default:
      return state;
  }
};

//Action of Reducers
export const ActionAddDiaryDetailsStep1 = (data) => {
  return {
    type: 'ADD_SCHOOL_DIARY_DETAILS_step1',
    payload: data
  };
};
export const ActionAddDiaryDetailsStep2 = (data) => {
  return {
    type: 'ADD_SCHOOL_DIARY_DETAILS_step2',
    payload: data
  };
};

export const ActionUpdateDiaryDetailsStep1 = (data) => {
  return {
    type: 'UPDATE_SCHOOL_DIARY_DETAILS_step1',
    payload: data
  };
};

export const ActionUpdateDiaryDetailsStep2 = (data) => {
  return {
    type: 'UPDATE_SCHOOL_DIARY_DETAILS_step2',
    payload: data
  };
};


export const ActionDeleteDairyDetails= () => {
  return {
    type: 'DELETE_DAIRY_DATA',
  };
};
