import Carousel, { Pagination } from 'react-native-snap-carousel';
import React, {
    Component
} from 'react';
import { View,ScrollView} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
    Container, Header, Title, Button, Icon,
    Text, Body, Left,
    Thumbnail,
} from "native-base";
import {
   screenWidth, screenHeight,
} from '../utils/ScreenSize';
import appColor from '../config/color.json';

class AppInfo extends Component{
    constructor(props) {
        super(props)
        this.state = {
        entries:[],
        isSliding: true, slider1ActiveSlide: 0,
        pageTitle: '', pageSubTitle: '',
        }
    }
    
    componentWillMount(){
        this.state.entries = [];
        this.state.entries.push({
            'title':'Student Attendnace',
            'image': require('../../assets/sliderAttendance.png'),
            'subTitle': 'Attendnace Description',
        })
        this.state.entries.push({
            'title':'School Diary',
            'image': require('../../assets/sliderSchoolDiary.png'),
            'subTitle':'Diary Description',
        })
        this.state.entries.push({
            'title':'Test Result',
            'image': require('../../assets/sliderTestResult.png'),
            'subTitle': 'Result Description',
        })
        this.setState({ pageTitle: this.state.entries[0].title, pageSubTitle: this.state.entries[0].subTitle })
    }

    componentDidMount(){
        
    }

    // Carousel item 
    _renderItem ({item, index}) {
        const hasNotch = DeviceInfo.hasNotch();
        let height = screenHeight - 120, marginTop = 25;
        if (hasNotch) {
            height = screenHeight - 115;
            marginTop = 35;
        }

        return (
            <ScrollView>
            <View style={{flex:1,backgroundColor: 'white', height: height, marginTop: marginTop, marginBottom: 0, borderRadius: 20}}>
            <Thumbnail square source={item.image}
                style={{ resizeMode: 'cover', height: '100%', width: '100%', borderRadius: 20 }} />
                <Text style ={{textAlign:'center',marginTop:2}}>{item.subTitle}</Text>
          </View>
          </ScrollView>
        );
    }

    render(){
        return(
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
                        <Title>App Details</Title>
                    </Body>
                </Header>
        <ScrollView>
            <View style={{ flex: 1 }}>                
            <Carousel
               ref={(c) => { this._carousel = c; }}
                data={this.state.entries}
                style ={{flex:0.8}}
                renderItem={this._renderItem}
                sliderWidth={screenWidth}
                itemWidth={screenWidth-20}
                autoplay={true}
                autoplayDelay={500}
                autoplayInterval={3000}
                loop={true}
                onSnapToItem={(index) => this.setState({ slider1ActiveSlide: index,
                    pageTitle: this.state.entries[index].title, pageSubTitle: this.state.entries[index].subTitle }) }
                />
            </View>
            </ScrollView>
              <View style={{ flexDirection: 'column', width: '100%', position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'center' }} >                       
                        <Pagination
                            dotsLength={this.state.entries.length}
                            containerStyle={{paddingVertical: 4}}
                            activeDotIndex={this.state.slider1ActiveSlide}
                            dotColor={appColor.colorPrimary}
                            inactiveDotColor={appColor.black}
                            inactiveDotOpacity={0.6}
                            inactiveDotScale={0.8}
                            carouselRef={this._carousel}
                            tappableDots={!!this._carousel}
                        />
                    </View>
            </Container>
        );
    }
}
export default AppInfo;
