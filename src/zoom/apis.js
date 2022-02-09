import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import {Zoom_api_url,Zoom_Update_api_url} from '../config/AppConst'


export async function fetchUserId(userEmail,accessToken) {
    const userResult = await fetch(Zoom_api_url+userEmail, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }).then((response) => response.json())
      .then((json) => {
        return json;
      })
      .catch((error) => {
         console.error(error);
      });


      
      console.log('userResult', userResult);
    if (userResult && userResult.code === 429) {
      // rate error try again later
      Alert.alert('API Rate error try again in a few seconds');
    }

    if (userResult && userResult.id && userResult.status === 'active') {
      // set user id
      const userId = userResult.id;
      return userId;
    }else{
      return 0;
    }
  }



  export async function getUserID(userEmail, accessToken) {
    
    const fetchURL = `https://api.zoom.us/v2/users/${userEmail}`
    const userResult = await fetch(fetchURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json())
      .then((json) => {
        return json;
      })
      .catch((error) => {
        console.error(error);
      });
    console.log('userResult', userResult);
    if (userResult && userResult.code === 429) {
      // rate error try again later
      Alert.alert('API Rate error try again in a few seconds');
    }
    if (userResult && userResult.id && userResult.status === 'active') {
      // set user id
      const { id: userId } = userResult;
      // this.setState({ userId });
      return userId;
    }
    return false;
  }

export async function createJWT(accessToken) {
  
}
  
export async function createUserZAK(userId, accessToken) {
  // console.log("userId",userId)
  // console.log("accessToken",accessToken)
  const fetchURL = `https://api.zoom.us/v2/users/${userId}/token?type=zak`
  const userZAKResult = await fetch(fetchURL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }).then((response) => response.json())
    .then((json) => {
      // console.log("createUserZAK", json)
      return json;
    })
    .catch((error) => {
      console.error(error);
    });
  // console.log('userZAKResult', userZAKResult);
  if (userZAKResult && userZAKResult.code === 429) {
    Alert.alert('API Rate error try again in a few seconds');
  }
  if (userZAKResult && userZAKResult.token) {
    // set user id
    const { token } = userZAKResult;
    return token;
  }
  return false;
}
  export async function checkUser(userEmail,accessToken) {
    let userResult = '';
    let fetchUrl = Zoom_api_url+'email'+'?email='+userEmail;
    console.log('checkUrl',fetchUrl);
    try{
      await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }).then((response) => response.json())
      .then((json) => {
        console.log(JSON.stringify(json));
        userResult = json.existed_email;
      })
      .catch((error) => {
        userResult = 'Network error';
      });
    }catch(error){
      userResult = 'error';
    }
    return userResult
  }

  // create new user
  export async function createUser(userId,data,accessToken) {
    let userResult = '';
    try{
      console.log('zoomUserId',userId);
      console.log(JSON.stringify(data));
      await fetch(Zoom_api_url+userId+'/meetings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: data,
      }).then((response) => response.json())
      .then((json) => {
       // userResult = json.existed_email;
       console.log('UserCreateRes[ponse',json);
      })
      .catch((error) => {
        userResult = 'Network error';
      });
    }catch(error){
      userResult = 'error';
    }
    return userResult
  }


  // create new meeting
  export async function createZoomMeeting(userId,data,accessToken) {
    let userResult = '';

    try{

      console.log('zoomUserId',userId);
      console.log(JSON.stringify(data));

      await fetch(Zoom_api_url+userId+'/meetings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response) => response.json(data))
      .then((json) => {
       // userResult = json.existed_email;
       userResult = json;
       console.log('UserCreateResponse',JSON.stringify(json));
      })
      .catch((error) => {
        userResult = 'Network error';
        console.log(error);
      });
    }catch(error){
      userResult = 'error';
    }
    return userResult
  }


  // update  meeting
  export async function updateZoomMeeting(meetingId,data,accessToken) {
    let userResult = 0;

    try{

      console.log('zoomUserId',meetingId);
      console.log('UpdateUserData',JSON.stringify(data));

      await fetch(Zoom_Update_api_url+meetingId, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response) => {
        userResult = response.status;
      })
      .catch((error) => {
        userResult = 504;
        console.log(error);

      });
    }catch(error){
      userResult = 0;
    }
    return userResult
  }

  
  export async function getUserToken(userId,accessToken) {
    let userResult = '';
    let fetchUrl = Zoom_api_url+userId+'/token?type=zak';
    console.log('checkUrl',fetchUrl);
    try{
      await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }).then((response) => response.json())
      .then((json) => {
        console.log(JSON.stringify(json));
        userResult = json['token'];
      })
      .catch((error) => {
        userResult = 'Network error';
      });
    }catch(error){
      userResult = 'error';
    }
    return userResult
  }


