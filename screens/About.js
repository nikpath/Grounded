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

const About = (navigation, route) => {
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
          <Section title="About">
            Grounded is a stress-recognition and reduction device. Pair via
            bluetooth with the wearable foot wraps. Biometric sensors in the
            wraps will measure your stress levels and recognize when you are in
            a high-stress state. You will recieve a notification to try out some
            calming methods and take a moment to ground yourself.
          </Section>
          <Section title="Biometrics">Heart rate and EDA.</Section>
          <Section title="Grounding techniques">Breathing and BLS.</Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;
