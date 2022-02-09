import React, {
    Component
} from 'react';
import {
    Dimensions, Alert, PixelRatio,
    FlatList, StyleSheet,
    TouchableOpacity, Image,
    RefreshControl,
    CheckBox,
    NativeEventEmitter,
    View,
} from 'react-native';
import {
    Container, Header, Title, Button, Icon,
    Text, Body, Right, Left, Card, CardItem,
    Content, Picker,
} from "native-base";
import WebView from 'react-native-webview';
import { BackHandler } from 'react-native';
// import Video from 'react-native-video';
// import VideoPlayer from 'react-native-video-controls';

class VideoPlayerClass extends Component {
    constructor(props) {
        super(props)
        this.state = {
            url: '',
            isRefresh: false,
            subject: ' - ',
            topic: ' - '
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        var x = null;
        x = this.props.navigation.state.params
        console.log("Received Props",x)
    }

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.navigate("ScheduleClassList");
        return true;
    }
    
    render() {
        // this.state.url = this.props.navigation.state.params.videoUrl;
        // this.state.subject = this.props.navigation.state.params.subject;
        // this.state.topic = this.props.navigation.state.params.topic;
        console.log('VideoUrl',this.state.url, this.props.navigation.state.params );
        return (


            <Container style={{ backgroundColor: '#453b3b' }}>
                <Header>
                    <Left>
                        <Button transparent onPress={() => this.handleBackButtonClick()}>
                            <Icon name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Recorded Video</Title>
                    </Body>
                </Header>
                <View style={{ flex: 1, backgroundColor: '#453b3b' }}>
                    <WebView
                        startInLoadingState={true}
                        source={{ uri: "https://www.google.com" }}
                        style={{ height: '100%', width: '100%' }}
                    />
                </View>
            </Container>
        );
    }
}


const layoutDesign = StyleSheet.create({
    conatainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#453b3b',
        marginLeft: 5, marginRight: 5
    },
})



export default VideoPlayerClass
