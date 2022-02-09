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
   
    if (this.getMethod() == 'GetMessageList') {
      return Webservice_URL + 'teacher/teacher_messagelist?'+requestData
    }
    else if(this.getMethod() == 'GetMessageUnreadCount'){
       return Webservice_URL + 'teacher/teacher_unread_message_count?'+requestData
    }
    else if(this.getMethod() == 'UpdateMessageStatus'){
      return Webservice_URL + 'teacher/teacher_updatemessagestatus?'+requestData
    }
    else if(this.getMethod() == 'DeleteMessage'){
      return Webservice_URL + 'teacher/teacher_deletemessage?'+requestData
    }

  }

  
  onHttpResponse (respCode, respData) {
    try 
    {
      if (this.getMethod() == 'GetMessageList') {
        this.getClassRef().onHTTPResponseMessageList(respData)
      }
      else if(this.getMethod() == 'GetMessageUnreadCount'){
        this.getClassRef().onHTTPResponseMessageUnreadCount(respData)
      }
      else if(this.getMethod() == 'UpdateMessageStatus'){
        this.getClassRef().onHTTPResponseMessageStatus(respData)
      }
      else if(this.getMethod() == 'DeleteMessage'){
        this.getClassRef().onHTTPResponseDeleteMessage(respData)
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
