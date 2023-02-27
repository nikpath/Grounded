import Database from '../database/Database.js';


const db = new Database();

function GroundedAPI(): groundedPredictionAPI {
  const formatRawData = data_array => {
    const postObject = {
      EDA: data_array[0],
      BPM: data_array[1],
      IBI: data_array[2],
    };
    console.log(postObject);
    return JSON.stringify(postObject);
  };

  const p3_storePrediction = prediction => {
    db.add_prediction_results(prediction)
      .then(result => {
        console.log(result);
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
    fetch('http://7d5a-35-229-112-102.ngrok.io/predict', requestOptions)
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

  return {
    getPrediction,
  };
}

export default GroundedAPI;
