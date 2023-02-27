/* eslint-disable no-bitwise */
import {useState, useEffect, useRef} from 'react';
//import {PermissionsAndroid, Platform} from 'react-native';
import {
  Base64,
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
//import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
//import DeviceInfo from 'react-native-device-info';

import {Buffer} from 'buffer';
import Database from './database/Database.js';

const BIOMETRICS_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const BPM_CHARACTERISTIC = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const IBI_CHARACTERISTIC = '98260937-1924-4af9-a874-3ad204344e1e';
const EDA_CHARACTERISTIC = '58260ca5-a468-496a-8f8c-ad30a21ba7cf';
const PAUSE_CHARACTERISTIC = '885bccf9-007a-4050-aa92-a9da38199deb';

const bleManager = new BleManager();
const db = new Database();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  writeToBiometrics(device: Device, writeValue: Base64): void;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  //const [beatsPerMinute, setBPM] = useState<number>(0);
  //const [interBeatInterval, setIBI] = useState<number>(0);
  //const [skinConductance, setEDA] = useState<number>(0);

  //const didMount = useRef(false);

  const requestPermissions = async (cb: VoidCallback) => {
    /*if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {*/
    cb(true);
    // }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes('Grounded_wearable_1')) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      // setBPM(0);
      // setIBI(0);
      // setEDA(0);
    }
  };

  const writeToBiometrics = (device: Device) => {
    var writeValue = 'unPause';
    device
      .writeCharacteristicWithResponseForService(
        BIOMETRICS_UUID,
        PAUSE_CHARACTERISTIC,
        writeValue,
      )
      .then(value => console.log(value))
      .catch(err => console.log(err));
  };

  const convertRawData = rawData => {
    return Buffer.from(rawData, 'base64').readUint32LE();
  };

  const onBPMUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No BPM was received');
      return -1;
    } else {
      console.log(convertRawData(characteristic.value));
      db.add_BPM_raw(convertRawData(characteristic.value))
        .then(result => {
          //console.log(result);
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  const onIBIUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No IBI was received');
      return -1;
    }
    db.add_IBI_raw(convertRawData(characteristic.value))
      .then(result => {
        //console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const onEDAUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No EDA was received');
      return -1;
    }
    db.add_EDA_raw(convertRawData(characteristic.value))
      .then(result => {
        //console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        BIOMETRICS_UUID,
        BPM_CHARACTERISTIC,
        (error, characteristic) => onBPMUpdate(error, characteristic),
      );
      device.monitorCharacteristicForService(
        BIOMETRICS_UUID,
        IBI_CHARACTERISTIC,
        (error, characteristic) => onIBIUpdate(error, characteristic),
      );
      device.monitorCharacteristicForService(
        BIOMETRICS_UUID,
        EDA_CHARACTERISTIC,
        (error, characteristic) => onEDAUpdate(error, characteristic),
      );
    } else {
      console.log('No Device Connected');
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    writeToBiometrics,
  };
}

export default useBLE;
