import React, {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useBLE from '../useBLE';

import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const BioDisplay = props => {
  const [BPM_average, setBPM] = useState(0);
  const [EDA_average, setEDA] = useState(0);
  const [IBI_average, setIBI] = useState(0);
  const [stress_level, setStress] = useState(0);

  const displayPrediction = async () => {
    try {
      const predictionJSON = await AsyncStorage.getItem('prediction');
      if (predictionJSON != null) {
        const prediction = JSON.parse(predictionJSON);
        console.log(prediction);
        setBPM(prediction.BPM_average);
        setIBI(prediction.IBI_average);
        setEDA(prediction.EDA_average);
        setStress(prediction.stress_level);
      } else {
        console.log('is null');
        setBPM(0);
        setIBI(0);
        setEDA(0);
        setStress(0);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      displayPrediction();
    }, 20000);

    return () => clearInterval(interval);
  });

  if (props.bls_on && stress_level == 1) {
    return (
      <View style={styles.heartRateTitleWrapper}>
        <>
          <Text style={styles.heartRateTitleText}>
            Breathe in slowly and focus on the left-right movement of the
            vibrations.
          </Text>
        </>
      </View>
    );
  } else if (!props.bls_on && stress_level == 1) {
    return (
      <View style={styles.heartRateTitleWrapper}>
        <>
          <Text style={styles.heartRateTitleText}>
            It seems your stress level is elevated. Try one of the grounding
            techniques to relax:
          </Text>
        </>
      </View>
    );
  } else {
    return (
      <View style={styles.heartRateTitleWrapper}>
        <>
          <Text style={styles.heartRateTitleText}>BPM:</Text>
          <Text style={styles.heartRateText}>{BPM_average}</Text>
          <Text style={styles.heartRateTitleText}>Your stress level is:</Text>
          <Text style={styles.stressLevelText}>
            {stress_level == 1 ? 'HIGH' : 'LOW'}
          </Text>
          <Text style={styles.heartRateTitleText}>{props.bls_on}</Text>
        </>
      </View>
    );
  }
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
    height: '70%',
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

export default BioDisplay;
