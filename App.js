/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './screens/Home.js';
import Breathing from './screens/Breathing.js';
import BlsStimulation from './screens/BlsStimulation.js';
import History from './screens/History.js';
import About from './screens/About.js';
import DataStuff from './screens/DataStuff.js';

import {StyleSheet} from 'react-native';

const Stack = createNativeStackNavigator();

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} options={{title: 'Home'}} />
        <Stack.Screen name="Breathing" component={Breathing} />
        <Stack.Screen name="BLS" component={BlsStimulation} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Data" component={DataStuff} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
