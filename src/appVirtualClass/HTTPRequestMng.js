import HTTPConnection from '../networkConn/HTTPConnection'
import HTTPParseResponse from './HTTPParseResponse';
import { DomainName, Webservice_URL } from '../config/AppConst'

export default class HTTPRequestMng extends HTTPConnection {
  constructor(authToken, method, classObject) {
    super()
    this.setAuthToken(authToken)
    this.setMethod(method)
    this.setClassRef(classObject)
  }

  linkGenerator(requestData) {
    if (this.getMethod() == 'GetAccountInfo') {
      return Webservice_URL + 'virtualclass/getsetting_list?' + requestData;
    } else if (this.getMethod() == 'GetClassInfo') {
      return Webservice_URL + 'virtualclass/getclass_list?' + requestData;
    } else if (this.getMethod() == 'GetSectionInfo') {
      return Webservice_URL + 'virtualclass/getsection_list?' + requestData;
    } else if (this.getMethod() == 'GetSmsSettingID') {
      return Webservice_URL + 'virtualclass/getsmssetting_list?' + requestData;
    } else if (this.getMethod() == 'GenerateMeeting') {
      // return Webservice_URL + 'virtualclass/postvirtualclass_details?';
      return "https://www.schoolmagica.com/osm/WebServices/virtualclass_app.asmx?CreateVirtualMeeting_App"
    } else if (this.getMethod() == 'GetPresenterInfo') {
      return Webservice_URL + 'virtualclass/getpresenter_list?' + requestData;
    } else if (this.getMethod() == 'GetVirtualClassDataLive') {
      return Webservice_URL + 'virtualclass/getvirtualclass_list?' + requestData;
    } else if (this.getMethod() == 'GetVirtualClassDataPast') {
      return Webservice_URL + 'virtualclass/getvirtualclass_list?' + requestData;
    } else if (this.getMethod() == 'deleteMeeting') {
      return "https://schoolmagica.com/osm/WebServices/VirtualClass_App.asmx/DeleteMeetingDetails";
    } else if (this.getMethod() == 'getrecordingurl') {
      return Webservice_URL + 'virtualclass/getrecordingurl?' + requestData;
    }




  }

  onHttpResponse(respCode, respData) {
    try {
      if (this.getMethod() == 'GetHolidayList') {
        const httpResp = new HTTPParseResponse(this.getMethod(), this.getClassRef());
        httpResp.parseResponse(respData);
      } else if (this.getMethod() == 'GetAccountInfo') {
        this.getClassRef().onHTTPResponseAccountInfo(respData)
      } else if (this.getMethod() == 'GetClassInfo') {
        this.getClassRef().onHTTPResponseClassInfo(respData)
      } else if (this.getMethod() == 'GetSectionInfo') {
        this.getClassRef().onHTTPResponseSectionInfo(respData)
      } else if (this.getMethod() == 'GetSmsSettingID') {
        this.getClassRef().onHTTPResponseSmsSettingIDInfo(respData)
      } else if (this.getMethod() == 'GenerateMeeting') {
        console.log("GenerateMeeting",respData)
        this.getClassRef().onHTTPResponseMeetingGenerated(respData)
      } else if (this.getMethod() == 'GetPresenterInfo') {
        this.getClassRef().onHTTPResponsePresenterInfo(respData)
      } else if (this.getMethod() == 'GetVirtualClassDataLive') {
        this.getClassRef().onHTTPResponseLiveMeetingList(respData)
      } else if (this.getMethod() == 'GetVirtualClassDataPast') {
        this.getClassRef().onHTTPResponsePastMeetingList(respData)
      } else if (this.getMethod() == 'deleteMeeting') {
        this.getClassRef().onHTTPResponseDeleteMeeting(respData)
      } else if (this.getMethod() == 'getrecordingurl') {
        this.getClassRef().onHttpResponseUrlToPlay(respData)
      }

    } catch (error) {
      this.onHttpError()
    }
  }

  onHttpError() {
    // if (this.getMethod() === 'GetAppVersion') {
    //   return
    // }
    this.getClassRef().onHTTPError()
  }
}

