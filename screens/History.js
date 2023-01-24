import React from 'react';
import Section from '../components/Section.js';
import NavMenu from '../components/NavMenu.js';

import {SafeAreaView, ScrollView, useColorScheme, View} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const History = (navigation, route) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.light : Colors.lighter,
  };
  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.light : Colors.white,
          }}>
          <Section title="History">
            This is where you can view your past data and how your stress
            patterns change over time.
          </Section>
        </View>
      </ScrollView>
      <NavMenu />
    </SafeAreaView>
  );
};

export default History;
