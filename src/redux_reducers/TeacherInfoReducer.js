
const initialState = {
    AutoTrainerId: '0', InstituteId: '0', EmailID: '', FirstName: '', 
    MiddleName: '', LastName: '',DOJ:'',DOB:'',EmployeeNo:'0',BarcodePath:'',
    PhotoPath: '', IsLogin:'false' ,SessionYear:0,SessionStartMonth:0
};

//Reducers
export default TeacherInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TEACHER_INFO':
      return { ...state,
        AutoTrainerId: action.payload.AutoTrainerId, 
        InstituteId: action.payload.InstituteId, 
        EmailID: action.payload.EmailID, 
        FirstName: action.payload.FirstName, 
        MiddleName: action.payload.MiddleName,
        LastName: action.payload.LastName,
        DOJ: action.payload.DOJ, 
        DOB: action.payload.DOB,
        EmployeeNo: action.payload.EmployeeNo,
        BarcodePath: action.payload.BarcodePath,
        PhotoPath: action.payload.PhotoPath,
        IsLogin: action.payload.IsLogin,
        SessionYear:action.payload.SessionYear,
        SessionStartMonth:action.payload.SessionStartMonth
       
      };
    case 'DELETE_TEACHER_INFO':
      return { ...state,
        AutoTrainerId:'0', 
        InstituteId: '0', 
        EmailID: '', 
        FirstName: '', 
        MiddleName:'',
        LastName: '',
        DOJ: '', 
        DOB: '',
        EmployeeNo: '0',
        BarcodePath: '',
        PhotoPath: '',
        IsLogin: false,
        SessionYear:0,
        SessionStartMonth:0
      };
    default:
      return state;
  }
};

//Action of Reducers
export const ActionAddTeacher = (data) => {
  return {
    type: 'ADD_TEACHER_INFO',
    payload: data
  };
};
export const ActionDeleteTeacher = () => {
  return {
    type: 'DELETE_TEACHER_INFO',    
  };
};

