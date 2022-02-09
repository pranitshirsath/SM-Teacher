import React, {
    Component
} from 'react';
import { Dimensions } from 'react-native';

import {
    Container, Header, Title, Button, Icon,
    Text, Body, Right, Left, Tabs, Tab, TabHeading, Subtitle,
} from "native-base";

import appColor from '../config/color.json';

//tab lists
import TabTestResultListWnd from './TabTestResultListWnd';
import TabSyncTestResult from './TabSyncTestResult';

import {
    getOrientation, screenWidth,
    onChangeScreenSize, isTablet
} from '../utils/ScreenSize';


 export default class TestResultTabBarWnd extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        let tabLayout;

            tabLayout = <Tabs style={{ elevation: 3 }}>
                <Tab heading={
                    <TabHeading>
                        <Text>Recent</Text>
                    </TabHeading>
                } style={{ backgroundColor: '#00000000' }} >
                    <TabTestResultListWnd onRef={ref => (this.testListWnd = ref)}
                        navigation={this.props.navigation} />
                </Tab>
                <Tab heading={
                    <TabHeading>
                        <Text>Synced to offline</Text>
                    </TabHeading>
                } style={{ backgroundColor: '#00000000' }} >
                    <TabSyncTestResult onRef={ref => (this.syncTestListWnd = ref)}
                        navigation={this.props.navigation} />
                </Tab>
            </Tabs>
         

        return (
            <Container style={{ backgroundColor: appColor.background_gray }}>
                 <Header>
                    <Left>
                        <Button transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Test Results</Title>
                    </Body>
                </Header>
                                
                {tabLayout}
            </Container>
        );
    }
}
