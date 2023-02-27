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
import {useNavigation} from '@react-navigation/native';

const NavMenu = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.light : Colors.lighter,
  };
  const navigation = useNavigation();

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
          <Button title="Home" onPress={() => navigation.navigate('Home')} />
          <Button
            title="Techniques"
            onPress={() => navigation.navigate('Techniques')}
          />
          <Button
            title="History"
            onPress={() => navigation.navigate('History')}
          />
          <Button title="About" onPress={() => navigation.navigate('About')} />
          <Button title="Data" onPress={() => navigation.navigate('Data')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NavMenu;
