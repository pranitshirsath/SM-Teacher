import HTTPConnection from '../networkConn/HTTPConnection'
import  {Webservice_URL } from '../config/AppConst'
import { Alert } from 'react-native'

export default class HTTPRequestMng extends HTTPConnection {
  constructor (authToken, method, classObject,classData) {
    super()
    this.setAuthToken(authToken)
    this.setMethod(method)
    this.setClassRef(classObject)
  }

  linkGenerator (requestData) 
  {
    // if (this.getMethod() == 'GetSectionList') {
    //   return Webservice_URL + 'attendance/getattendance_sectionlist?'+requestData
    // }
    if (this.getMethod() == 'GetSectionList') {
      return Webservice_URL + 'schooldiary/getsection_list?'+requestData
    }
    else if(this.getMethod() == 'GetSectionListNoAttendance'){
       return Webservice_URL + 'attendance/getattendance_nottaken_sectionlist?'+requestData
    }
    else if(this.getMethod() == 'GetStudentList'){
      return Webservice_URL + 'attendance/getstudent_list?'+requestData
    }
    else if(this.getMethod() == 'GetHolidayList'){
      return Webservice_URL + 'attendance/getholiday_list?'+requestData
    }
    else if(this.getMethod() == 'GetHolidayList2'){
      return Webservice_URL + 'attendance/getholiday_list?'+requestData
    }
     else if(this.getMethod() == 'SaveAttendance'){ 
      return Webservice_URL + 'attendance/postattendance_details'
    }
     else if(this.getMethod() == 'GetAttendanceList'){ 
      return Webservice_URL + 'attendance/getnotsync_attendancedetails?'+requestData
    }
    else if(this.getMethod() == 'GetSyncAttendanceList'){ 
      return Webservice_URL + 'attendance/getsync_attendancedetails?'+requestData
    }
    else if(this.getMethod() == 'DeleteAttendance'){ 
      return Webservice_URL + 'attendance/delete_attendancedetails?'+requestData
    }
    else if(this.getMethod() == 'DeleteAttendanceInBackground'){ 
      return Webservice_URL + 'attendance/delete_attendancedetails?'+requestData
    }
   else if (this.getMethod() == 'GetClassList') {
    return Webservice_URL + 'schooldiary/getclass_list?'+requestData
  }
  
  }

  onHttpResponse (respCode, respData) {
    try 
    {
      if (this.getMethod() == 'GetSectionList') {
        this.getClassRef().onHTTPResponseSectionList(respData)
      } else if (this.getMethod() == 'GetClassList') {
        this.getClassRef().onHTTPReponseClassList(respData)
      }
      else if(this.getMethod() == 'GetSectionListNoAttendance'){
        this.getClassRef().onHTTPResponseSectionListWithNoAttendance(respData)
      }
      else if(this.getMethod() == 'GetStudentList'){
        this.getClassRef().onHTTPResponseStudentList(respData)
      }
      else if(this.getMethod() == 'GetHolidayList'){
        this.getClassRef().onHTTPResponseHolidayList(respData)
      } else if(this.getMethod() == 'GetHolidayList2'){
        this.getClassRef().onHTTPResponseHolidayList2(respData)
      }
      else if(this.getMethod() == 'SaveAttendance'){
        this.getClassRef().onHTTPResponseAttendanceSaved(respData)
      }
      else if(this.getMethod() == 'GetAttendanceList'){
        this.getClassRef().onHTTPResponseAttendanceList(respData)
      }
      else if(this.getMethod() == 'GetSyncAttendanceList'){
        this.getClassRef().onHTTPResponseSyncAttendanceList(respData)
      }
      else if(this.getMethod() == 'DeleteAttendance'){
        this.getClassRef().onHTTPResponseAttendanceDelete(respData)
      }
      else if(this.getMethod() == 'DeleteAttendanceInBackground'){
        this.getClassRef().onHTTPResponseAttendanceBackgroundDelete(respData)
      }
    } 
    catch (error) {
      // Alert.alert('Response error',JSON.stringify(error));
      this.onHttpError();
    }
  }

  onHttpError () {
    if (this.getMethod() === 'GetAppVersion') {
      return
    }
    this.getClassRef().onHTTPError();
  }
}
