import * as React from 'react';
import {useState, useEffect, useRef} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Alert,
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
    writeToBiometrics,
    BLEClients,
  } = useBLE();

  const {getRawData, checkIfEnoughRows, getPrediction, resetRawData} =
    useGrounded();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inBLS, setInBLS] = useState(false);
  const [timerID, setTimerID] = useState(0);

  BackgroundJob.on('expiration', () => {
    console.log('iOS: I am being closed!');
  });

  const createStressAlert = () =>
    Alert.alert(
      'High Stress Detected',
      'It seems your stress level is elevated. Try a grounding technique to feel calmer.',
      [
        {
          text: 'BLS',
          onPress: () => console.log('BLS Pressed'),
        },
        {text: 'Breathing', onPress: () => console.log('Breathing Pressed')},
      ],
    );

  const pollData = async taskData => {
    //background action for continously sending and recieving prediction updates
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
        console.log('background action');
        const rawData = await getRawData();
        console.log(rawData);
        if (checkIfEnoughRows(rawData) === true) {
          writeToBiometrics(connectedDevice, '3');
          const current_prediction = getPrediction(rawData);
          const reset = await resetRawData();
          if (reset == true) {
            console.log('was reset');
            //TODO: resume polling or give stress options
            writeToBiometrics(connectedDevice, '4');
          }
          if (current_prediction) {
            if (current_prediction.stress_level === 1) {
              createStressAlert();
            }
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

  const pauseBLS = () => {
    writeToBiometrics(connectedDevice, '6');
    setInBLS(false);
    if (timerID) {
      clearTimeout(timerID);
      setTimerID(0);
      return;
    }
  };

  const startBLS = () => {
    writeToBiometrics(connectedDevice, '5');
    setInBLS(true);
    const newTimerID = setTimeout(pauseBLS, 60000);
    setTimerID(newTimerID);
  };

  const toggleBLS = () => {
    if (!inBLS) {
      startBLS();
    } else {
      pauseBLS();
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

  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {connectedDevice ? (
          <View style={styles.heartRateTitleWrapper}>
            <Text style={styles.heartRateText}>
              Devices connected: {BLEClients}
            </Text>
            <BioDisplay bls_on={inBLS} />
          </View>
        ) : (
          <View style={styles.heartRateTitleWrapper}>
            <Text style={styles.heartRateText}>
              Start by connecting your Grounded wearables.
            </Text>
          </View>
        )}
        <View style={styles.heartRateTitleWrapper}>
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
          <TouchableOpacity
            onPress={toggleBackground}
            style={
              connectedDevice ? styles.ctaButton : styles.ctaButton_disabled
            }
            disabled={connectedDevice ? false : true}>
            <Text style={styles.ctaButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heartRateTitleWrapper}>
          <TouchableOpacity onPress={toggleBLS} style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>
              {inBLS ? 'Stop BLS' : 'Start BLS'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={createStressAlert}
            style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Breathing exercises</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
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
  ctaButton_disabled: {
    backgroundColor: '#949494',
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
  scrollView: {
    marginHorizontal: 20,
  },
});

export default Home;
