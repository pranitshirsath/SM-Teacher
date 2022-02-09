const initialState = {
  attendanceID: 0, sectionID: 0, sectionName: '', isEditDetails: false, 
  totalStud: 0, totalPresent: 0, totalAbsent: 0, attDate: 0,studentList:[],

};

//Reducers
export default AttendanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_ATTENDANCE_DATA':
      return { ...state,
        attendanceID: action.payload.attendanceID, 
        sectionID: action.payload.sectionID, 
        sectionName: action.payload.sectionName,  
        isEditDetails: action.payload.isEditDetails,
        totalStud: action.payload.totalStud, 
        totalPresent: action.payload.totalPresent, 
        totalAbsent: action.payload.totalAbsent,
        attDate: action.payload.attDate,
        studentList:action.payload.studentList,
      };
    case 'DELETE_ATTENDANCE_DATA':
      return { ...state,
        attendanceID: 0, sectionID: 0, sectionName: '', isEditDetails: false,
        totalStud: 0, totalPresent: 0, totalAbsent: 0, attDate: 0,studentList:[],
      };
    default:
      return state;
  }
};

//Action of Reducers
export const ActionAddAttendance = (data) => {
  return {
    type: 'ADD_ATTENDANCE_DATA',
    payload: data
  };
};
export const ActionDeleteAttendance = () => {
  return {
    type: 'DELETE_ATTENDANCE_DATA',
  };
};