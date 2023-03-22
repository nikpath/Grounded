import AsyncStorage from '@react-native-async-storage/async-storage';

interface groundedPredictionAPI {
  getRawData(): void;
  checkIfEnoughRows(rawDataObject: Object): boolean;
  getPrediction(rawData: Object): void;
  resetRawData(): Promise<boolean>;
}

function GroundedAPI(): groundedPredictionAPI {
  const resetRawData = async () => {
    try {
      await AsyncStorage.setItem('HR', JSON.stringify([]));
      await AsyncStorage.setItem('EDA', JSON.stringify([]));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const storePrediction = async prediction => {
    try {
      await AsyncStorage.setItem('prediction', JSON.stringify(prediction));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const getPrediction = rawData => {
    const data_array = JSON.stringify(rawData);
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: data_array,
    };
    fetch('http://5cd2-34-125-137-104.ngrok.io/predict', requestOptions)
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
        storePrediction(data);
        return data;
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  const getRawData = async () => {
    try {
      const HR_json = await AsyncStorage.getItem('HR');
      const EDA_json = await AsyncStorage.getItem('EDA');

      const hr_data = HR_json != null ? JSON.parse(HR_json) : [];
      const eda_data = EDA_json != null ? JSON.parse(EDA_json) : [];

      return {EDA: eda_data, HR: hr_data};
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfEnoughRows = rawDataObject => {
    var enough = true;
    //console.log(rawDataObject);
    Object.values(rawDataObject).forEach(val => {
      if (val instanceof Array) {
        if (val.length < 150) {
          enough = false;
        }
      }
    });
    return enough;
  };

  return {
    getRawData,
    checkIfEnoughRows,
    getPrediction,
    resetRawData,
  };
}

export default GroundedAPI;
