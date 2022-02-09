
const initialState = {
  childID: '', studentName: '',
  instituteID: 0, classID: 0, sectionID: 0,
  childPhotoPath: '', admissionNo: '', 
  className: '', sectionName: '', childAddress: '',
  unreadMsg: 0, oriUnreadMsg: 0, fees: 0, discount: 0, tax: 0, paid: 0, outstanding: 0, lateFees: 0,
  present: 0, absent: 0, attPercent: 0, maxMark: 0, obtainedMark: 0, testPercent: 0,
};

export default ChildInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_CHILD_INFO':
      return { ...state,
        childID: action.payload.childID, studentName: action.payload.studentName,
        instituteID: action.payload.instituteID, classID: action.payload.classID,
        sectionID: action.payload.sectionID, childPhotoPath: action.payload.childPhotoPath,
        admissionNo: action.payload.admissionNo, className: action.payload.className,
        sectionName: action.payload.sectionName, unreadMsg: action.payload.unreadMsg,
        childAddress: action.payload.childAddress, oriUnreadMsg: action.payload.oriUnreadMsg,
      };
    case 'UPDATE_UNREAD_MSG_CNT':
      return { ...state,
        unreadMsg: action.payload.unreadMsg < 0 ? 0 : action.payload.unreadMsg,
      };
    case 'UPDATE_ATTENDANCE_SUMMERY':
      return { ...state,
        present: action.payload.present, absent: action.payload.absent,
        attPercent: action.payload.attPercent,
      };
    case 'UPDATE_TEST_SUMMERY':
      return { ...state,
        maxMark: action.payload.maxMark, obtainedMark: action.payload.obtainedMark,
        testPercent: action.payload.testPercent,
      };
    case 'UPDATE_PAYMENT_SUMMERY':
      return { ...state,
        fees: action.payload.fees, discount: action.payload.discount,
        lateFees: action.payload.lateFees, tax: action.payload.tax,
        outstanding: action.payload.outstanding, paid: action.payload.paid,
      };
    case 'DELETE_CHILD_INFO':
      return { ...state,
        childID: '0', studentName: '', instituteID: 0, classID: 0, sectionID: 0,
        childPhotoPath: '', admissionNo: '', className: '', sectionName: '',
        unreadMsg: 0, fees: 0, discount: 0, tax: 0, paid: 0, outstanding: 0, lateFees: 0,
        present: 0, absent: 0, attPercent: 0, maxMark: 0, obtainedMark: 0, testPercent: 0,
        childAddress: '', oriUnreadMsg: 0,
      };
    default:
      return state;
  }
};

export const ActionAddChild = (data) => {
  return {
    type: 'ADD_CHILD_INFO',
    payload: data
  };
};
export const ActionUpdateUnreadMsgCount = (data) => {
  return {
    type: 'UPDATE_UNREAD_MSG_CNT',
    payload: data
  };
};
export const ActionUpdateAttSummary = (data) => {
  return {
    type: 'UPDATE_ATTENDANCE_SUMMERY',
    payload: data
  };
};
export const ActionUpdateTestSummary = (data) => {
  return {
    type: 'UPDATE_TEST_SUMMERY',
    payload: data
  };
};
export const ActionUpdatePaymentSummary = (data) => {
  return {
    type: 'UPDATE_PAYMENT_SUMMERY',
    payload: data
  };
};
export const ActionDeleteChild = () => {
  return {
    type: 'DELETE_CHILD_INFO',    
  };
};