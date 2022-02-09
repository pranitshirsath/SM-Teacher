import React, { PureComponent } from 'react';
import {
    View, Text, Thumbnail
} from "native-base";

import appColor from '../config/color.json';

export default class NoDataView extends PureComponent {
    
    render() {
        let orientation = this.props.orientation;
        let bottomPadding = orientation == 'portrait' ? 80 : 0;
        let imgSize = orientation == 'portrait' ? 130 : 100;

        let imageLayout;
        if (this.props.imageName != '') {
            var image;
            if (this.props.imageName == 'blank_attendance')
                image = require('../../assets/blank_attendance.png');
            else if (this.props.imageName == 'blank_test')
                image = require('../../assets/blank_test.png');
           

            imageLayout = <Thumbnail square large source={image}
                style={{ alignSelf: 'center', resizeMode: 'contain', width: imgSize, height: imgSize }} />
        }

        return (
            <View style={{  position: 'absolute',left: 0, right: 0, bottom: bottomPadding, padding: 20,marginBottom:50}}>
                {imageLayout}
                <Text style={{ marginTop: 20, fontSize: 20, textAlign: 'center', color: appColor.black }}>
                    {this.props.title}
                </Text>
                <Text style={{ marginTop: 10, fontSize: 15, textAlign: 'center', color: appColor.semi_dark_gray }}>
                    {this.props.body}
                </Text>
            </View>
        );
    }
}