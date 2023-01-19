import React from 'react';
import Section from '../components/Section.js';

import {
  SafeAreaView,
  ScrollView,
  useColorScheme,
  View,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const BlsStimulation = (navigation, route) => {
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
          <Section title="BLS">
            BLS is a technique where stimulation (tapping, vibrations, music) is
            applied in an alternating pattern on both sides of your body. It's
            proven to lower heart rate within 1-2 min.
          </Section>
          <Button title="Try out BLS" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BlsStimulation;
