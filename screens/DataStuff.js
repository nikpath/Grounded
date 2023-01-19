import React from 'react';
import Section from '../components/Section.js';
import Database from '../database/Database.js';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Button,
  FlatList,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const db = new Database();

const DataStuff = (navigation, route) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.light : Colors.lighter,
  };

  const [heartRate, onChangeHeartRate] = React.useState(0);
  const [skinConductance, onChangeSkinConductance] = React.useState(0);
  const [stressLevel, onChangeStressLevel] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);
  const [bioData, setBioData] = React.useState([]);

  const submitData = () => {
    console.log('SUBMITTING DATA');
    setLoading(true);

    let data = {
      heartRate,
      skinConductance,
      stressLevel,
    };
    db.addSudoData(data)
      .then(result => {
        console.log(result);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const fetchAllData = () => {
    let bio_data = [];
    console.log('GETTING DATA');
    db.listAllData()
      .then(data => {
        bio_data = data;
        setBioData(bio_data);
        setLoading(true);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const deleteData = () => {
    db.deleteData()
      .then(result => {
        console.log(result);
        setLoading(true);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const deleteTable = () => {
    db.deleteTable()
      .then(result => {
        console.log(result);
        setLoading(true);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  const generateTable = (item, index) => {
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={{width: 50, backgroundColor: 'lightyellow'}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>
            {item.heartRate}
          </Text>
        </View>
        <View style={{width: 50, backgroundColor: 'lightpink'}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>
            {item.skinConductance}
          </Text>
        </View>
        <View style={{width: 50, backgroundColor: 'lavender'}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}>
            {item.stressLevel}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.light : Colors.white,
          }}>
          <Section title="Enter Sudo Data">
            <View style={{height: 200}}>
              <TextInput
                style={{backgroundColor: '#d6e577', flex: 1}}
                onChangeText={onChangeHeartRate}
                value={heartRate}
                placeholder="Heart Rate"
                keyboardType="numeric"
              />
              <TextInput
                style={{backgroundColor: '#d6e577', flex: 1}}
                onChangeText={onChangeSkinConductance}
                value={skinConductance}
                placeholder="Skin Conductance"
                keyboardType="numeric"
              />
              <TextInput
                style={{backgroundColor: '#d6e577', flex: 1}}
                onChangeText={onChangeStressLevel}
                value={stressLevel}
                placeholder="Stress Level"
              />
              <Button title="Add data" onPress={() => submitData()} />
            </View>
          </Section>
          <Section title="List Data">
            <Button title="Get all data" onPress={() => fetchAllData()} />
            {bioData.length > 0 &&
              bioData.map((item, index) => generateTable(item, index))}
          </Section>
          <Section title="Delete Data">
            <Button title="Delete Data" onPress={() => deleteData()} />
          </Section>
          <Section title="Delete Table">
            <Button title="Delete Table" onPress={() => deleteTable()} />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DataStuff;
