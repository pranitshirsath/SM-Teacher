// import RNZoomUsBridge from '@mokriya/react-native-zoom-us-bridge';
import { ZOOM_JWT_KEY, ZOOM_JWT_SECRET, ZOOM_APP_KEY, ZOOM_APP_SECRET } from '../config/AppConst'
import AsyncStorage from '@react-native-community/async-storage';

export async function initializeZoomSDK() {

  let status = '';

  try {
    if (ZOOM_APP_KEY == '' || ZOOM_APP_SECRET == '') return false;
    // init sdk  
    // status =  await RNZoomUsBridge.initialize(
    //     ZOOM_APP_KEY,
    //     ZOOM_APP_SECRET,
    //   ).then().catch((err) => {
    //     status =  'error';
    //   });
  } catch (error) {
    status = 'caughtError';
  }
  return status;
}

export const createAccessToken = async () => {
  let accessToken = '';
  try {
    if (!ZOOM_JWT_KEY || !ZOOM_JWT_SECRET) return false;
    //  accessToken = await RNZoomUsBridge.createJWT(
    //     ZOOM_JWT_KEY,
    //     ZOOM_JWT_SECRET
    // ).then().catch((err) => {
    // }
    // );
    console.log('createAccessToken', accessToken);
    await AsyncStorage.setItem("zoomAccessToken", accessToken);
  }
  catch (error) {
    console.log(error);
  }
  // return accessToken;
}