import HTTPConnection from '../networkConn/HTTPConnection'
import { DomainName, Webservice_URL } from '../config/AppConst'
import HTTPParseResponse from './HTTPParseResponse';

export default class HTTPRequestMng extends HTTPConnection {
  constructor(authToken, method, classObject) {
    super()
    this.setAuthToken(authToken)
    this.setMethod(method)
    this.setClassRef(classObject)
  }

  linkGenerator(requestData) {

    if (this.getMethod() == 'GetHolidayList2') {
      return DomainName + 'OSMWebAPI/api/attendance/getholiday_list?' + requestData;
    }else if(this.getMethod() == 'GetProfile'){
      return Webservice_URL + 'teacher/teacher_getprofile?' + requestData;
    }else if(this.getMethod() == 'GetCountries'){
      return Webservice_URL + 'teacher/teacher_getallcountries?';
    }else if(this.getMethod() == 'GetStates'){
      return Webservice_URL + 'teacher/teacher_getstatelist?'+requestData;
    }else if(this.getMethod() == 'GetCitites'){
      return Webservice_URL + 'teacher/teacher_getcities?'+requestData;
    }else if(this.getMethod() == 'UpdateProfile'){
      return Webservice_URL + 'teacher/teacher_updateprofile?';
    }

  }

  onHttpResponse(respCode, respData) {
    try {
      if (this.getMethod() == 'GetHolidayList') {
        const httpResp = new HTTPParseResponse(this.getMethod(), this.getClassRef());
        httpResp.parseResponse(respData);
      } else if (this.getMethod() == 'GetHolidayList2') {
        this.getClassRef().onHTTPResponseHolidayList2(respData)
      }else if (this.getMethod() == 'GetProfile') {
        this.getClassRef().onHTTPResponseProfile(respData)
      }else if (this.getMethod() == 'GetCountries') {
        this.getClassRef().onHTTPResponseCountries(respData)
      }else if (this.getMethod() == 'GetStates') {
        this.getClassRef().onHTTPResponseStates(respData)
      }else if (this.getMethod() == 'GetCitites') {
        this.getClassRef().onHTTPResponseCities(respData)
      }else if (this.getMethod() == 'UpdateProfile') {
        this.getClassRef().onHTTPResponseUpdateProfile(respData)
      }

    } catch (error) {
      this.onHttpError()
    }
  }

  onHttpError() {
    if (this.getMethod() === 'GetAppVersion') {
      return
    }
    this.getClassRef().onHTTPError()
  }
}

