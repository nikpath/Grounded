import React, {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import {Icon} from '@rneui/themed';

const BioDisplay = () => {
  const [BPM_average, setBPM] = useState(0);
  const [EDA_average, setEDA] = useState(0);
  const [HRV_average, setHRV] = useState(0);
  const [stress_level, setStress] = useState(0);

  const displayPrediction = async () => {
    try {
      const predictionJSON = await AsyncStorage.getItem('prediction');
      if (predictionJSON != null) {
        const prediction = JSON.parse(predictionJSON);
        console.log(prediction);
        setBPM(prediction.BPM_average);
        setEDA(Math.round(prediction.EDA_average));
        setHRV(Math.round(prediction.HRV_average * 100) / 100);
        setStress(prediction.stress_level);
      } else {
        setBPM(0);
        setEDA(0);
        setHRV(0);
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
    }, 10000);

    return () => clearInterval(interval);
  });

  return (
    <View style={styles.subContainerWrapper}>
      {stress_level == 2 ? (
        <View style={styles.textWrapper}>
          <Text style={styles.titleText}>Unable to predict stress level.</Text>
          <Text style={styles.normalText}>
            Ensure your skin is touching all three sensor pads. Re-connect the
            battery if the pulse sensor light is not on. Try again later if
            problem persists.
          </Text>
        </View>
      ) : (
        <View
          style={
            stress_level == 0
              ? styles.stressContainer_low
              : styles.stressContainer_high
          }>
          <Icon
            name="hand-holding-heart"
            type="font-awesome-5"
            color={stress_level == 0 ? '#d6e577' : '#FC9291'}
            size={70}
          />
          <Text style={styles.normalText}>Your stress level is:</Text>
          <Text style={styles.stressText}>
            {stress_level == 1 ? 'HIGH' : 'LOW'}
          </Text>
        </View>
      )}
      <View style={styles.dataContainer}>
        <View style={styles.dataPiece}>
          <Text style={styles.normalText}>BPM</Text>
          <Text style={styles.titleText}>{BPM_average}</Text>
        </View>
        <View style={styles.dataPiece}>
          <Text style={styles.normalText}>EDA</Text>
          <Text style={styles.titleText}>{EDA_average}</Text>
        </View>
        <View style={styles.dataPiece}>
          <Text style={styles.normalText}>HRV</Text>
          <Text style={styles.titleText}>{HRV_average}</Text>
        </View>
      </View>
    </View>
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
  },
  textWrapper: {
    margin: 40,
  },
  stressContainer_low: {
    marginTop: '30%',
    borderWidth: 1,
    borderColor: '#d6e577',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  stressContainer_high: {
    marginTop: '30%',
    borderWidth: 1,
    borderColor: '#FC9291',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataPiece: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 30,
    paddingLeft: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  stressText: {
    fontSize: 30,
    marginTop: 15,
    color: 'black',
  },
  titleText: {
    fontSize: 30,
    marginTop: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  normalText: {
    marginTop: 15,
    fontSize: 18,
  },
});

export default BioDisplay;
