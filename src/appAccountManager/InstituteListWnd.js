import React from 'react';
import {View, StyleSheet,  StatusBar, FlatList, Alert, ActivityIndicator} from 'react-native';
import {
    Container, Header, Title, Content, Button, Icon,
    Text, Body, Left, Right, Item, Input, Form,
} from "native-base";

import {AsyncStorage} from 'react-native'
import appColor from '../config/color.json'
import HTTPRequestMng from "./HTTPRequestMng";

export default class InstituteListWnd extends React.Component 
{
  constructor (props) 
  {
    super(props)
    this.state = {
      loading: false,
      searchName:'',
      recordCurrentList:[],
      listAvailable: false,
    }
  }

  componentDidMount() 
  {
      StatusBar.setBackgroundColor(appColor.colorPrimaryDark);
      this.getSchoolList();
  }

 getSchoolList () 
  {
     this.changeLoadingStatus(true);
     const obj = new HTTPRequestMng('', 'InstituteList', this)
     obj.executeRequest('');
  }
 GetItem(item) {
    Alert.alert(item);
  }
   onHTTPError() 
  {
      this.changeLoadingStatus(false);
      Alert.alert('Oops', 'Unable to connect with server, Please try after some time');
  }

   onHTTPReponseInstituteList(respData) 
  {
    
    try {
        const jsonRec = respData[0];
        const status = jsonRec['TransactionStatus'];
       
        if (status == 'Success') 
        {
      
           const listData = jsonRec['InstituteLists'];
           console.info("listData", listData);
           let recordCurrentList = [];
           
           if (listData != undefined) {
              listData.forEach((singleObj) => {
                const arrayObj = {
                            'InstituteName':singleObj['InstituteName'],
                            'InstituteID': singleObj['InstituteId']
                          }

              recordCurrentList.push(arrayObj);
              });
              this.setState({listAvailable: true ,recordCurrentList: recordCurrentList});
           }
        } 
        else 
        {
            Alert.alert('Oops', 'Error');
        }   
        this.changeLoadingStatus(false)     
        } catch (error) {
          console.error("erroe", error);
        }
    }

  changeLoadingStatus(isShow) {this.setState({ loading: isShow })}

  
  render() 
  {
      return (
      <Container>
                <Header  style={{backgroundColor: appColor.colorPrimary}} >
                    <Left>
                        <Button transparent
                            onPress={() => this.props.navigation.goBack()}>
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Select Institute</Title>
                    </Body>  
                </Header>
                <View style={layoutDesign.container}>
                  
                  <Item
                    regular
                    style={[layoutDesign.inputBoxLayout]} >
                    <Icon name='search'/>
                    <Input
                      placeholderTextColor='black'
                      returnKeyType='done'
                      onChangeText={(text) => this.setState({ searchName: text })}/>
                  </Item>
                  <FlatList
                      data={this.state.recordCurrentList}
                      renderItem={({item, index}) => <Text style={layoutDesign.item} onPress={this.GetItem.bind(this, item.InstituteID)} > {item.InstituteName} </Text>}
                      keyExtractor={(item, index) => index.toString()}
                    />
                     <ActivityIndicator animating={this.state.loading} />
                </View>
      </Container>
    ); 
  }
}


const layoutDesign = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColor.grey_background
  },
  formLayout: {
    alignSelf: 'stretch',
    padding: 10,
    paddingTop: 25,
    paddingBottom: 25,
    borderRadius: 10,
    backgroundColor: appColor.backgroundLayoutTrans
  },
  inputBoxLayout:
   {
    borderRadius: 0,
    backgroundColor: appColor.white,
    padding: 5,
    marginLeft: 10,
    marginRight: 10,
    marginTop:10,
    marginBottom:10
  },
   item: {
    paddingLeft: 10,
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10,
    marginBottom:1,
    backgroundColor: appColor.white,
    alignItems: 'center'
    
  }
 
})
