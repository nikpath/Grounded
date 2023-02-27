import * as React from 'react';
import {useState, useEffect, useRef} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NavMenu from '../components/NavMenu';
import DeviceModal from '../DeviceConnectionModal';
import BioDisplay from '../components/BioDisplay';
import useBLE from '../useBLE';
import Database from '../database/Database';

const db = new Database();

const Home = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    writeToBiometrics,
  } = useBLE('hello');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  const resumeDataStream = () => {
    writeToBiometrics(connectedDevice);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        <BioDisplay onResume={resumeDataStream} />
        {connectedDevice ? (
          <>
            <Text style={styles.heartRateTitleText}>Device connected</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
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
      <NavMenu />
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
