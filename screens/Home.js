import * as React from 'react';
import {useState, useEffect, useRef} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import DeviceModal from '../DeviceConnectionModal';
import BioDisplay from '../components/BioDisplay';
import useBLE from '../useBLE';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundJob from 'react-native-background-actions';
import useGrounded from '../useGrounded';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const Home = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    pauseBiometrics,
  } = useBLE();

  const {getRawData, checkIfEnoughRows, getPrediction, resetRawData} =
    useGrounded();

  const [isModalVisible, setIsModalVisible] = useState(false);

  BackgroundJob.on('expiration', () => {
    console.log('iOS: I am being closed!');
  });

  const pollData = async taskData => {
    if (Platform.OS === 'ios') {
      console.warn(
        'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
        'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.',
      );
    }
    await new Promise(async resolve => {
      // For loop with a delay
      const {delay} = taskData;
      for (let i = 0; BackgroundJob.isRunning(); i++) {
        const rawData = await getRawData();
        if (checkIfEnoughRows(rawData) == true) {
          console.log('enough rows');
          pauseBiometrics(connectedDevice, '1');
          const current_prediction = getPrediction(rawData);
          console.log(current_prediction);
          const reset = await resetRawData();
          console.log(reset);
          if (reset == true) {
            console.log('was reset');
            //TODO: resume polling
          }
          //TODO: send notification if stress level is high
        }
        await sleep(delay);
      }
    });
  };

  const options = {
    taskName: 'Example',
    taskTitle: 'ExampleTask title',
    taskDesc: 'ExampleTask desc',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'exampleScheme://chat/jane',
    parameters: {
      delay: 10000,
    },
  };

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
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

  let playing = BackgroundJob.isRunning();

  const toggleBackground = async () => {
    playing = !playing;
    if (playing) {
      try {
        console.log('Trying to start background service');
        await BackgroundJob.start(pollData, options);
        console.log('Successful start!');
      } catch (e) {
        console.log('Error', e);
      }
    } else {
      console.log('Stop background service');
      await BackgroundJob.stop();
    }
  };

  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */

  return (
    <SafeAreaView style={styles.container}>
      <BioDisplay />
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            <Text style={styles.heartRateTitleText}>Device connected</Text>
          </>
        ) : (
          <Text style={styles.heartRateText}>
            Start by connecting your Grounded wearables.
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
      <TouchableOpacity onPress={toggleBackground} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={getRawData} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>get async storage</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={predictStuff} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Predict</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearAsyncData} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>clear async storage</Text>
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

export default Home;
