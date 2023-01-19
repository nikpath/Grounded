import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import BioDisplay from '../components/BioDisplay';
import {BleManager, Device} from 'react-native-ble-plx';

const manager = new BleManager();

const Home = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.light : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.light : Colors.white,
          }}>
          <BioDisplay />
          <Button
            title="Breathing"
            onPress={() => navigation.navigate('Breathing')}
          />
          <Button title="BLS" onPress={() => navigation.navigate('BLS')} />
          <Button title="About" onPress={() => navigation.navigate('About')} />
          <Button
            title="History"
            onPress={() => navigation.navigate('History')}
          />
          <Button title="Data" onPress={() => navigation.navigate('Data')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
