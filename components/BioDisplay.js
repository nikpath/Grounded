import React, {useState, useEffect, useCallback} from 'react';
import Database from '../database/Database.js';

import {StyleSheet, Text, useColorScheme, View, Button} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const db = new Database();

const BioDisplay = () => {
  const [heartRate, setHeartRate] = useState('');
  const [skinConductance, setSkinConductance] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [bioData, setBioData] = useState([]);
  const isDarkMode = useColorScheme() === 'dark';

  const fetchData = useCallback(() => {
    db.getLatestData()
      .then(data => {
        setBioData(data);
        setHeartRate(bioData.heartRate);
        setSkinConductance(bioData.skinConductance);
        setStressLevel(bioData.stressLevel);
        setLoading(true);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [bioData]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('5 seconds passed');
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <View>
      {heartRate ? <Text>{heartRate}</Text> : <Text>-</Text>}
      {skinConductance ? <Text>{skinConductance}</Text> : <Text>-</Text>}
      {stressLevel ? <Text>{stressLevel}</Text> : <Text>-</Text>}
      <Button title="Fetch Data" onPress={() => fetchData()} />
    </View>
  );
};

export default BioDisplay;
