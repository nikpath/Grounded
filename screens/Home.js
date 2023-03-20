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
import {Icon} from '@rneui/themed';
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
  const [isPolling, setIsPolling] = useState(false);
  const [mockDeviceConnected, setMockDevice] = useState(true);

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
    taskName: 'PeriodicPrediction',
    taskTitle: 'Periodic update to prediction',
    taskDesc: 'Periodically sends collected sensor data to prediction API',
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

  const togglePolling = async () => {
    setIsPolling(!isPolling);
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

  const PairScreen = () => {
    return (
      <View style={styles.subContainerWrapper}>
        <Text style={styles.titleText}>
          Start by connecting your Grounded wearables:
        </Text>
        <TouchableOpacity onPress={openModal} style={styles.pairButton}>
          <Icon name="socks" type="font-awesome-5" color="#d6e577" size={50} />
          <Text style={styles.pairText}>Pair Devices</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const DeviceControls = () => {
    return (
      <View>
        <View style={styles.textWrapper}>
          <Text style={styles.normalText}>Devices connected: {BLEClients}</Text>
        </View>
        <View style={styles.controlButtonWrapper}>
          <TouchableOpacity
            onPress={disconnectFromDevice}
            style={styles.controlButton}>
            <Text style={styles.ctaButtonText}>Disconnect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePolling}
            style={styles.controlButton}>
            <Text style={styles.ctaButtonText}>
              {isPolling ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const GroundingTechniques = () => {
    return (
      <View style={styles.subContainerWrapper}>
        <Text style={styles.normalText}>Try a grounding technique</Text>
        <TouchableOpacity onPress={toggleBLS} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>
            {inBLS ? 'Stop BLS' : 'Start BLS'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={createStressAlert} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Breathing exercises</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {mockDeviceConnected ? (
          <View style={styles.connectedContainer}>
            <DeviceControls />
            <BioDisplay bls_on={inBLS} />
            <GroundingTechniques />
          </View>
        ) : (
          <PairScreen />
        )}
        <View style={styles.titleWrapper}>
          <DeviceModal
            closeModal={hideModal}
            visible={isModalVisible}
            connectToPeripheral={connectToDevice}
            devices={allDevices}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  subContainerWrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  connectedContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  controlButtonWrapper: {
    flexWrap: 'nowrap',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  titleWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
  },
  textWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#e4ecb5',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccd0d1',
  },
  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 15,
    color: 'black',
  },
  normalText: {
    fontSize: 18,
  },
  pairText: {
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
  pairButton: {
    margin: '30%',
    borderWidth: 1,
    borderColor: '#d6e577',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  controlButton: {
    borderWidth: 1,
    borderColor: '#ccd0d1',
    backgroundColor: '#e4ecb5',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginBottom: 5,
    width: '50%',
  },
  scrollView: {
    marginHorizontal: 20,
  },
});

export default Home;
