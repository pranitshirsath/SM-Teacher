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
    if (this.getMethod() == 'GetClassList') {
      return Webservice_URL + 'schooldiary/getclass_list?'+requestData
    } 
    else if(this.getMethod() == 'GetSectionList'){
      return Webservice_URL + 'schooldiary/getsection_list?'+requestData
    }
    else if(this.getMethod() == 'GetSubjectList'){
      return Webservice_URL + 'schooldiary/getsubject_list?'+requestData
    }
    else if(this.getMethod() == 'GetStudentList'){
      return Webservice_URL + 'schooldiary/getstudent_list?'+requestData
    }
    else if(this.getMethod() == 'GetSD_SectionList'){
      return Webservice_URL + 'schooldiary/getschooldiarysections_list?'+requestData
    }
    else if(this.getMethod() == 'SaveSchoolDiaryDetails'){
      return Webservice_URL + 'schooldiary/postschooldiary'
    }
    else if(this.getMethod() == 'GetSchoolDiaryDetails'){
      return Webservice_URL + 'schooldiary/getschooldiarydetails?'+requestData
    }
    else if(this.getMethod() == 'UpdateSchoolDiaryDetails'){
      return Webservice_URL + 'schooldiary/update_schooldiary'
    } else if(this.getMethod() == 'DeleteSchoolDiaryDetails'){
      return Webservice_URL + 'schooldiary/delete_schooldiary?'+requestData
    }
  }


  onHttpResponse (respCode, respData) {
    try 
    {
      if (this.getMethod() == 'GetClassList') {
        this.getClassRef().onHTTPReponseClassList(respData)
      }

      else if (this.getMethod() == 'GetSectionList') {
        this.getClassRef().onHTTPReponseSectionList(respData)
      }

      else if (this.getMethod() == 'GetSubjectList') {
        this.getClassRef().onHTTPResponseSubjectList(respData)
      }

      else if (this.getMethod() == 'GetStudentList') {
        this.getClassRef().onHTTPReponseStudentList(respData)
      }

       else if (this.getMethod() == 'GetSD_SectionList') {
        this.getClassRef().onHTTPResponseDiarySectionList(respData)
      }

       else if (this.getMethod() == 'SaveSchoolDiaryDetails') {
        this.getClassRef().onHTTPResponseDiaryDetailsSaved(respData)
      }

      else if (this.getMethod() == 'GetSchoolDiaryDetails') {
        this.getClassRef().onHTTPResponseDiaryDetails(respData)
      } else if (this.getMethod() == 'UpdateSchoolDiaryDetails') {
        this.getClassRef().onHTTPResponseUpdateDiaryDetails(respData)
      }else if (this.getMethod() == 'DeleteSchoolDiaryDetails') {
        this.getClassRef().onHTTPResponseDeleteDiaryDetails(respData)
      }
    } catch (error) {
      console.log('Error',error);
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
