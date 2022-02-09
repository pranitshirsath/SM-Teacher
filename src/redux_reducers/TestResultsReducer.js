const initialState = {
  autoSectionId: 0, autoExamId: 0, autoSubjectId: '', testTypeID: '',
  maxMarks: 0, minMarks: 0, testDate: '', studentDetails: [], sectionList: [],
  examList: [], subjectList: [], testTypeList: [], isSectionsListLoaded: false,
  isStudentListLoaded: false, isEdit: false,
  sectionName: '', className: '', examName: '', subjectName: '', AutoTestId: 0, IsGradeSubject: 0,
  gradingTitle: '', pickerSectionObj: '', pickerSubjectObj: ''
};

//Reducers
export default TestResultsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TEST_RESULT_DATA':
      return {
        ...state,
        autoSectionId: action.payload.autoSectionId,
        autoExamId: action.payload.autoExamId,
        autoSubjectId: action.payload.autoSubjectId,
        testTypeID: action.payload.testTypeID,
        pickerSectionObj: action.payload.pickerSectionObj,
        pickerSubjectObj: action.payload.pickerSubjectObj,

        maxMarks: action.payload.maxMarks,
        minMarks: action.payload.minMarks,
        testDate: action.payload.testDate,
        className: action.payload.className,

        sectionList: action.payload.sectionList,
        examList: action.payload.examList,
        subjectList: action.payload.subjectList,
        testTypeList: action.payload.testTypeList,
        isSectionsListLoaded: action.payload.isSectionsListLoaded,
        isEdit: action.payload.isEdit,
        IsGradeSubject: action.payload.IsGradeSubject,
        gradingTitle: action.payload.gradingTitle

      };
    case 'ADD_TEST_RESULT_STUDENT_LIST':
      return {
        ...state,
        studentDetails: action.payload.studentDetails,
        isStudentListLoaded: action.payload.isStudentListLoaded
      };
    case 'DELETE_TEST_RESULT_DATA':
      return {
        ...state,
        autoSectionId: 0, autoExamId: 0, autoSubjectId: '', testTypeID: '',
        maxMarks: 0, minMarks: 0, testDate: '', studentDetails: [], sectionList: [],
        examList: [], subjectList: [], testTypeList: [], isSectionsListLoaded: false,
        isStudentListLoaded: false, isEdit: false,
        sectionName: '', examName: '', subjectName: '', AutoTestId: '', IsGradeSubject: 0,
        gradingTitle: '',
        pickerSectionObj: '', pickerSubjectObj: '',

      };
    case 'UPDATE_TEST_RESULT_DATA':
      return {
        ...state,
        sectionName: action.payload.sectionName,
        examName: action.payload.examName,
        subjectName: action.payload.subjectName,
        AutoTestId: action.payload.AutoTestId,
      };
    default:
      return state;
  }
};

//Action of Reducers
export const ActionAddTestResult = (data) => {
  return {
    type: 'ADD_TEST_RESULT_DATA',
    payload: data
  };
};
export const ActionAddTestResultStudentList = (data) => {
  return {
    type: 'ADD_TEST_RESULT_STUDENT_LIST',
    payload: data
  };
};
export const ActionDeleteTestResult = () => {
  return {
    type: 'DELETE_TEST_RESULT_DATA',
  };
};
export const ActionUpdateTestResult = (data) => {
  return {
    type: 'UPDATE_TEST_RESULT_DATA',
    payload: data
  };
};