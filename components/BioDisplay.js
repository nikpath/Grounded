import React, {useState, useEffect, useCallback} from 'react';
import Database from '../database/Database.js';

import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  SafeAreaView,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const db = new Database();

const BioDisplay = props => {
  const [BPM_average, setBPM] = useState(0);
  const [EDA_average, setEDA] = useState(0);
  const [IBI_average, setIBI] = useState(0);
  const [stress_level, setStress] = useState(0);
  const [cleared, setCleared] = useState('NO');
  const [enoughData, setEnoughData] = useState(false);

  const formatRawData = data_array => {
    const postObject = {
      EDA: data_array[0],
      BPM: data_array[1],
      IBI: data_array[2],
    };
    //console.log(postObject);
    return JSON.stringify(postObject);
  };

  const checkIfEnoughRows = () => {
    var thousand_rows = true;
    Promise.all([
      db.count_rows('BPM_raw'),
      db.count_rows('EDA_raw'),
      db.count_rows('IBI_raw'),
    ]).then(values => {
      values.forEach(row_count => {
        if (row_count < 1000) {
          thousand_rows = false;
        }
      });
      setEnoughData(thousand_rows);
    });
  };

  const deleteRawData = () => {
    db.delete_ALL_raw_data()
      .then(result => {
        //console.log(result);
        setCleared('CLEARED');
        props.onResume();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const p3_storePrediction = prediction => {
    db.add_prediction_results(prediction)
      .then(result => {
        //console.log(result);
        return deleteRawData();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const p2_sendData = data_array => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: data_array,
    };
    fetch('http://e389-34-86-23-50.ngrok.io/predict', requestOptions)
      .then(async response => {
        const isJson = response.headers
          .get('content-type')
          ?.includes('application/json');
        const data = isJson && (await response.json());

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }

        console.log(data);

        setBPM(data.BPM_average);
        setEDA(data.EDA_average);
        setIBI(data.IBI_average);
        setStress(data.stress_level);
        return p3_storePrediction(data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  const getPrediction = () => {
    Promise.all([db.getRawEDA(), db.getRawBPM(), db.getRawIBI()]).then(
      values => {
        const postJSON = formatRawData(values);
        return p2_sendData(postJSON);
      },
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkIfEnoughRows();
      if (enoughData) {
        getPrediction();
      }
    }, 30000);

    return () => clearInterval(interval);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        <>
          <Text style={styles.heartRateTitleText}>BPM:</Text>
          <Text style={styles.heartRateText}>{BPM_average}</Text>
          <Text style={styles.heartRateTitleText}>IBI:</Text>
          <Text style={styles.heartRateText}>{IBI_average}</Text>
          <Text style={styles.heartRateTitleText}>EDA:</Text>
          <Text style={styles.heartRateText}>{EDA_average}</Text>
          <Text style={styles.heartRateTitleText}>Your stress level is:</Text>
          <Text style={styles.stressLevelText}>
            {stress_level == 1 ? 'HIGH' : 'LOW'}
          </Text>
          <Text style={styles.heartRateText}>{cleared}</Text>
        </>
      </View>
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

export default BioDisplay;
