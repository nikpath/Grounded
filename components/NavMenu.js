import React from 'react';
import {useState} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useGrounded from '../useGrounded';
import useBLE from '../useBLE';

const NavMenu = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    writeToBiometrics,
  } = useBLE();

  const {getRawData, checkIfEnoughRows, getPrediction, resetRawData} =
    useGrounded();

  const isDarkMode = useColorScheme() === 'dark';
  const [inBLS, setInBLS] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.light : Colors.lighter,
  };

  const predictStuff = async () => {
    const rawData = await getRawData();
    getPrediction(rawData);
  };

  const getAsyncData = async () => {
    try {
      const value = await AsyncStorage.getAllKeys();
      if (value !== null) {
        console.log(value);
        // value previously stored
      } else {
        console.log('is null');
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  const clearAsyncData = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      // clear error
      console.log(e);
    }

    console.log('Done.');
  };

  const tryBLS = async () => {
    if (!inBLS) {
      //start BLS
      writeToBiometrics(connectedDevice, '3');
      setInBLS(true);
    } else {
      writeToBiometrics(connectedDevice, '4');
      setInBLS(false);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <TouchableOpacity onPress={getAsyncData} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>get async storage</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={predictStuff} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Predict</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearAsyncData} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>clear async storage</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={tryBLS} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>BLS</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  stressLevelText: {
    fontSize: 30,
    marginTop: 15,
    color: '#d6e577',
  },
  ctaButton: {
    backgroundColor: '#d6e577',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default NavMenu;
