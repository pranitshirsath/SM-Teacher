import { 
    API_username, API_password, IsDEBUG 
} from '../config/AppConst';

var method = '', authToken = '';
var classRef;

export default class HTTPConnection {

    linkGenerator(requestData) {}
    onHttpResponse(respCode, respData) {}
    onHttpError() {}
    
    setAuthToken(token) {
        this.authToken = token;
    }
    getAuthToken() {
        return this.authToken;
    }
    setMethod(method) {
        this.method = method;
    }
    getMethod() {
        return this.method;
    }

    setClassRef(classObj) {
        this.classRef = classObj;
    }
    
    getClassRef() {
        return this.classRef;
    }

    executeRequest = async(requestData) => { 
        const url = this.linkGenerator(requestData)
        let temp_data = JSON.stringify(requestData);
        if(IsDEBUG) {
            console.info('Request URL : ' + url);
            console.info('Request Data : ' + JSON.stringify(requestData));
            //console.info('Request Auth Token : ' + this.getAuthToken());
        }
        fetch(url,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getAuthToken(),
                    username: API_username,
                    password: API_password
                },
                body: temp_data  
            }
        ).then((response) => {
            const respCode = response.status;
            let respData;
            if(respCode == 200) {
                respData = response.json()
            } else {
                respData = response;
            }
            return Promise.all([respCode, respData]);

        }).then((response) => {
            respCode = response[0]
            respData = response[1]

            if (IsDEBUG) console.log("Response Code : " + respCode)

            //show response data, return from server
            if (IsDEBUG) console.log("Response : " + JSON.stringify(respData))
            
            if(respCode == 200)
                this.onHttpResponse(respCode, respData)
            else
                this.onHttpError()

        }).catch((error) => {
            this.onHttpError()
            if (IsDEBUG) console.info("HTTP Error : " + error)
        });
    }


}