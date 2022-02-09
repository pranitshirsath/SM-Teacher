import React from 'react';
import {View, Text} from 'react-native';
import AppNavigator from './src/AppNavigator';
import { StyleProvider, Root } from "native-base";

import getTheme from "./src/theme/components";
import variables from "./src/theme/variables/commonColor";

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import AppReducer from './src/redux_reducers/AppReducer';
import {middleware} from './src/AppNavigator';

export default class App extends React.Component {

  store = createStore(AppReducer, applyMiddleware(middleware));


  render() {
      console.disableYellowBox = true; 
      
      return (
         <Provider store={this.store}>
          <StyleProvider style={getTheme(variables)}>
              <Root>
                <AppNavigator/>
              </Root>
            </StyleProvider>
          </Provider>
    );
  }
}
