import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { PermissionsAndroid } from "react-native";
// import HTTPRequestMng from "../appCourses/HTTPRequestMng";

export async function requestCameraPermission() {
    try {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "LearnMagica Camera Permission",
                    message:
                        "LearnMagica needs to access your camera " +
                        "so you can attempt the proctor test.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        }
        else if (Platform.OS === "ios") {
            // ask ios permission
        }
    } catch (err) {
        return false;
    } finally {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "LearnMagica Camera Permission",
                    message:
                        "LearnMagica needs to access your camera " +
                        "so you can attempt the proctor test.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        }
        else if (Platform.OS === "ios") {
            // ask ios permission
        }
    }
};



export async function requestAudioPermission() {
    try {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: "LearnMagica Microphone Permission",
                    message:
                        "LearnMagica needs to access your microphone " +
                        "so you can attempt the proctor test.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        }
        else if (Platform.OS === "ios") {
            // ask ios permission
        }
    } catch (err) {
        return false;
    }
};




export async function requestStoragePermission() {
    
    try {
        if (Platform.OS === "android") {
            
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: "LearnMagica Storage Permission",
                    message:
                    "LearnMagica needs to access your Storage " +
                    "so you will be redirected to LearnMagica.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        }
        else if (Platform.OS === "ios") {
            // ask ios permission
        }
    } catch (err) {
        return false;
    } finally {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: "LearnMagica Storage Permission",
                    message:
                    "LearnMagica needs to access your Storage " +
                    "so you will be redirected to LearnMagica.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        }
        else if (Platform.OS === "ios") {
            // ask ios permission
        }
    }
};
