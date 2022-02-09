// packages
import { Dimensions, PixelRatio } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Retrieve initial screen's width
let screenWidth = Dimensions.get('window').width;

// Retrieve initial screen's height
let screenHeight = Dimensions.get('window').height;

let isTablet = DeviceInfo.isTablet();
let hasNotch = DeviceInfo.hasNotch();

/**
 * Converts provided width percentage to independent pixel (dp).
 * @param  {string} widthPercent The percentage of screen's width that UI element should cover
 *                               along with the percentage symbol (%).
 * @return {number}              The calculated dp depending on current device's screen width.
 */
const widthPercentageToDP = widthPercent => {
    // Parse string percentage input and convert it to number.
    const elemWidth = parseFloat(widthPercent);

    // Use PixelRatio.roundToNearestPixel method in order to round the layout
    // size (dp) to the nearest one that correspons to an integer number of pixels.
    return PixelRatio.roundToNearestPixel(screenWidth * elemWidth / 100);
};

/**
 * Converts provided height percentage to independent pixel (dp).
 * @param  {string} heightPercent The percentage of screen's height that UI element should cover
 *                                along with the percentage symbol (%).
 * @return {number}               The calculated dp depending on current device's screen height.
 */
const heightPercentageToDP = heightPercent => {
    // Parse string percentage input and convert it to number.
    const elemHeight = parseFloat(heightPercent);

    // Use PixelRatio.roundToNearestPixel method in order to round the layout
    // size (dp) to the nearest one that correspons to an integer number of pixels.
    return PixelRatio.roundToNearestPixel(screenHeight * elemHeight / 100);
};

/**Get Orientation of Screen
 * @param {*} that 
 */
const getOrientation = () => {
    // Retrieve and save new dimensions
    let { height, width } = Dimensions.get('window');

    return width < height ? 'portrait' : 'landscape';
};

const onChangeScreenSize = (newDimensions, that, isNeedRefresh) => {
    // Retrieve and save new dimensions
    screenWidth = newDimensions.window.width;
    screenHeight = newDimensions.window.height;

    if (hasNotch) {
        if (getOrientation() == 'landscape') {
            screenWidth -= 109; //height of notch 
        }
    }

    // // Trigger screen's rerender with a state update of the orientation variable
    if(isNeedRefresh) {
        that.setState({
            orientation: screenWidth < screenHeight ? 'portrait' : 'landscape'
        });
    }
}

export {
    widthPercentageToDP,
    heightPercentageToDP,
    getOrientation, screenWidth, screenHeight,
    onChangeScreenSize, isTablet, hasNotch
};