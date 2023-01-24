import React from 'react';
import Section from '../components/Section.js';
import NavMenu from '../components/NavMenu.js';

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

const Techniques = (navigation, route) => {
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
          <Section title="Breathing">
            Try out the{' '}
            <Text style={styles.highlight}>breathing visualizer</Text> here.
          </Section>
          <Section title="BLS">
            BLS is a technique where stimulation (tapping, vibrations, music) is
            applied in an alternating pattern on both sides of your body. It's
            proven to lower heart rate within 1-2 min.
          </Section>
          <Button title="Try out BLS" />
        </View>
      </ScrollView>
      <NavMenu />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default Techniques;
