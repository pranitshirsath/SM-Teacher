import { combineReducers } from 'redux';
import NavReducer from './NavReducer';
import TeacherInfoReducer from './TeacherInfoReducer';
import SchoolDiaryInfoReducer from './SchoolDiaryReducer';
import AttendanceInfoReducer from './AttendanceReducer';
import TestResultsReducer from './TestResultsReducer';
import MessageInfoReducer from './MessageInfoReducer';
import ChildInfoReducer from './ChildInfoReducer';
import VirtualClassReducer from './VirtualClassReducer';



const AppReducer = combineReducers({
  nav: NavReducer,
  teacherInfo: TeacherInfoReducer,
  diaryInfo: SchoolDiaryInfoReducer,
  attendanceInfo: AttendanceInfoReducer,
  testResultInfo: TestResultsReducer,
  messageInfo: MessageInfoReducer,
  childInfo: ChildInfoReducer,
  vcInfo:VirtualClassReducer,
});

export default AppReducer;