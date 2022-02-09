import HTTPConnection from '../networkConn/HTTPConnection'
import  {Webservice_URL } from '../config/AppConst'

export default class HTTPRequestMng extends HTTPConnection {
  constructor (authToken, method, classObject) {
    super()
    this.setAuthToken(authToken)
    this.setMethod(method)
    this.setClassRef(classObject)
  }

  linkGenerator (requestData) {
    if (this.getMethod() == 'Login') {
      return Webservice_URL + 'teacher/teacher_login?'+ requestData
    } else if (this.getMethod() == 'GetAppVersion') {
      return Webservice_URL + 'VersionWebService.asmx/CheckVersion'
    } else if (this.getMethod() == 'InstituteList') {
      return Webservice_URL + 'institutelist.asmx/InstituteLists'
    }else if (this.getMethod() == 'teacher_direct_login') {
      return Webservice_URL + 'teacher/teacher_direct_login?'+requestData
    }else if (this.getMethod() == 'ForgotPassword') {
      return Webservice_URL + 'teacher/teacher_forgotpassword?'+requestData
    }
  }

  onHttpResponse (respCode, respData) {
    try {
      if (this.getMethod() == 'Login') {
        this.getClassRef().onHTTPResponseLogin(respData)
      } else if (this.getMethod() == 'GetAppVersion') {
        this.getClassRef().onHttpAppExpiryInfo(respData)
      } else if (this.getMethod() == 'InstituteList') {
        this.getClassRef().onHTTPReponseInstituteList(respData)
      }
      else if (this.getMethod() == 'teacher_direct_login') {
        this.getClassRef().onHTTPReponseDirectLogin(respData)
      }else if (this.getMethod() == 'ForgotPassword') {
        this.getClassRef().onHttpForgotPassResp(respData)
      }
    } catch (error) {
      console.log(error);
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
