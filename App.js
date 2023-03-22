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
import DeviceModal from './DeviceConnectionModal';
import BioDisplay from './components/BioDisplay';
import useBLE from './useBLE';
import Visualizer from './components/Visualizer';
import BackgroundJob from 'react-native-background-actions';
import useGrounded from './useGrounded';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const App = () => {
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
  const [techniqueScreen, setTechniqueScreen] = useState('bls');
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
          text: 'Okay',
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
        if (checkIfEnoughRows(rawData) === true) {
          writeToBiometrics(connectedDevice, '3');
          const current_prediction = getPrediction(rawData);
          const reset = await resetRawData();
          if (reset == true) {
            console.log('was reset');
            //TODO: resume polling or give stress options
            writeToBiometrics(connectedDevice, '4');
          }
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

  const toggleScreen = screen => {
    setTechniqueScreen(screen);
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
        {BLEClients < 2 ? (
          <View style={styles.textWrapper_error}>
            <Text style={styles.normalText}>
              Waiting for device connection...
            </Text>
          </View>
        ) : (
          ''
        )}
        <View style={styles.buttonWrapper}>
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
      <View>
        {/* <View style={styles.textWrapper}>
          <Text style={styles.normalText}>Try a grounding technique:</Text>
        </View> */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => toggleScreen('bls')}
            style={
              techniqueScreen == 'bls'
                ? styles.ctaButton_active
                : styles.ctaButton_inactive
            }>
            <Text style={styles.ctaButtonText}>
              {/* {inBLS ? 'Stop BLS' : 'Start BLS'} */}
              Bi-lateral Stimulation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleScreen('breath')}
            style={
              techniqueScreen == 'breath'
                ? styles.ctaButton_active
                : styles.ctaButton_inactive
            }>
            <Text style={styles.ctaButtonText}>4-7-8 Breathing</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const BLSScreen = () => {
    return (
      <View style={styles.techniqueContainer}>
        <Text style={styles.normalPara}>
          BLS is a technique where stimulation (tapping, vibrations, music) is
          applied in an alternating pattern on both sides of your body. It's
          proven to lower heart rate within 1-2 min.
        </Text>
        <Text style={styles.normalPara}>
          Try it out! Press play and follow the rhythm of the vibrations while
          breathing slowly.
        </Text>
        <TouchableOpacity onPress={toggleBLS} style={styles.playButton}>
          {inBLS ? (
            <Icon
              name="stop-circle"
              type="font-awesome-5"
              color="black"
              size={50}
            />
          ) : (
            <Icon
              name="play-circle"
              type="font-awesome-5"
              color="black"
              size={50}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const BreathScreen = () => {
    return (
      <View style={styles.techniqueContainer}>
        <Text style={styles.normalPara}>
          The 4-7-8 breathing technique involves breathing in for 4 seconds,
          holding for 7 seconds, and breathing out for 8 seconds. It may help
          reduce anxiety. Follow the visualizer below.
        </Text>
        <Visualizer />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {connectedDevice ? (
          <View style={styles.connectedContainer}>
            <DeviceControls />
            <BioDisplay />
            <GroundingTechniques />
            {techniqueScreen == 'bls' ? <BLSScreen /> : <BreathScreen />}
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
  techniqueContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: 10,
    padding: 50,
    paddingBottom: 500,
    backgroundColor: '#E0EB98',
  },
  buttonWrapper: {
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
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccd0d1',
  },
  textWrapper_error: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#FC9291',
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
  normalPara: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 15,
  },
  pairText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton_active: {
    backgroundColor: '#E0EB98',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: '45%',
    marginHorizontal: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  ctaButton_inactive: {
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: '45%',
    marginHorizontal: 10,
    borderRadius: 40,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginHorizontal: 20,
  },
  playButton: {
    margin: 20,
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
    backgroundColor: '#fff',
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

export default App;
