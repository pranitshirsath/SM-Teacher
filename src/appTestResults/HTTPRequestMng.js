import HTTPConnection from '../networkConn/HTTPConnection'
import  {Webservice_URL } from '../config/AppConst'

export default class HTTPRequestMng extends HTTPConnection {
  constructor (authToken, method, classObject) {
    super()
    this.setAuthToken(authToken)
    this.setMethod(method)
    this.setClassRef(classObject)
  }

  linkGenerator (requestData) 
  {
    // if (this.getMethod() == 'GetSectionList') {
    //   return Webservice_URL + 'test/getsection_list?'+requestData
    // }
    if (this.getMethod() == 'GetSectionList') {
      return Webservice_URL + 'schooldiary/getsection_list?'+requestData
    }
    else if(this.getMethod() == 'GetExamList'){
       return Webservice_URL + 'test/getexam_list?'+requestData
    }
    else if(this.getMethod() == 'GetSubjectList'){
      return Webservice_URL + 'test/getsubject_list?'+requestData
    }
    else if(this.getMethod() == 'GetStudentList'){
      return Webservice_URL + 'test/getstudent_list?'+requestData
    }
     else if(this.getMethod() == 'GetTestType'){ 
      return Webservice_URL + 'test/gettesttype'
    }
     else if(this.getMethod() == 'PostTestResultDetails'){ 
      return Webservice_URL + 'test/posttests_details'
    }
    else if(this.getMethod() == 'DeleteTestResult'){ 
      return Webservice_URL + 'test/delete_testdetails?'+requestData
    }
    else if(this.getMethod() == 'DeleteTestResultInBG'){ 
      return Webservice_URL + 'test/delete_testdetails?'+requestData
    }
    else if(this.getMethod() == 'GetTestResultList'){ 
      return Webservice_URL + 'test/getnotsync_testdetails?'+requestData
    }
    else if(this.getMethod() == 'GetSyncTestResultList'){ 
      return Webservice_URL + 'test/getsync_testdetails?'+requestData
    }
    else if(this.getMethod() == 'GetGradeList'){ 
      return Webservice_URL + 'test/getgrade_list?'+requestData
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
      }
      else if(this.getMethod() == 'GetExamList'){
        this.getClassRef().onHTTPResponseExamList(respData)
      }
      else if(this.getMethod() == 'GetSubjectList'){
        this.getClassRef().onHTTPResponseSubjectList(respData)
      }
      else if(this.getMethod() == 'GetStudentList'){
        this.getClassRef().onHTTPResponseStudentList(respData)
      }
      else if(this.getMethod() == 'GetTestType'){
        this.getClassRef().onHTTPResponseTestTypeList(respData)
      }
      else if(this.getMethod() == 'PostTestResultDetails'){
        this.getClassRef().onHTTPResponseTestResultSave(respData)
      }
      else if(this.getMethod() == 'DeleteTestResult'){
        this.getClassRef().onHTTPResponseTestResultDelete(respData)
      }
      else if(this.getMethod() == 'DeleteTestResultInBG'){
        this.getClassRef().onHTTPResponseDeleteInBG(respData)
      }
      else if(this.getMethod() == 'GetTestResultList'){
        this.getClassRef().onHTTPResponseTestResultList(respData)
      }
      else if(this.getMethod() == 'GetSyncTestResultList'){
        this.getClassRef().onHTTPResponseSyncTestResultList(respData)
      }
      else if(this.getMethod() == 'GetGradeList'){
        this.getClassRef().onHTTPResponseGradeList(respData)
      }
      else if (this.getMethod() == 'GetClassList') {
        this.getClassRef().onHTTPReponseClassList(respData)
      }
      
      
    } 
    catch (error) {
      this.onHttpError()
    }
  }

  onHttpError () {
    if (this.getMethod() === 'GetAppVersion') {
      return
    }
  

    this.getClassRef().onHTTPError()
  }
}
