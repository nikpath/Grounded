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
import Icon from 'react-native-vector-icons/FontAwesome';

const NavMenu = ({navigation}) => {
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
          <Button
            title="Home"
            onPress={() => navigation.navigate('Home')}
            icon={<Icon name="home" size={15} color="black" />}
          />
          <Button
            title="Techniques"
            onPress={() => navigation.navigate('Techniques')}
            icon={<Icon name="smile-o" size={15} color="black" />}
          />
          <Button
            title="History"
            onPress={() => navigation.navigate('History')}
            icon={<Icon name="line-chart" size={15} color="black" />}
          />
          <Button
            title="About"
            onPress={() => navigation.navigate('About')}
            icon={<Icon name="info-circle" size={15} color="black" />}
          />
          <Button
            title="Data"
            onPress={() => navigation.navigate('Data')}
            icon={<Icon name="database" size={15} color="black" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NavMenu;
