import SQLite from 'react-native-sqlite-storage';
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'Grounded.db';
const database_version = '1.0';
const database_displayname = 'Grounded Database';
const database_size = 200000;

export default class Database {
  initDB() {
    let db;
    return new Promise(resolve => {
      console.log('Plugin integrity check ...');
      SQLite.echoTest()
        .then(() => {
          console.log('Integrity check passed ...');
          console.log('Opening database ...');
          SQLite.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size,
          )
            .then(DB => {
              db = DB;
              console.log('Database OPEN');
              db.executeSql('SELECT 1 FROM BPM_raw LIMIT 1')
                .then(() => {
                  console.log('Database is ready ... executing query ...');
                })
                .catch(error => {
                  console.log('Received error: ', error);
                  console.log('Database not yet ready ... populating data');
                  db.transaction(tx => {
                    tx.executeSql(
                      'CREATE TABLE IF NOT EXISTS BPM_raw (beats_per_minute)',
                    );
                    tx.executeSql(
                      'CREATE TABLE IF NOT EXISTS IBI_raw (inter_beat_interval)',
                    );
                    tx.executeSql(
                      'CREATE TABLE IF NOT EXISTS EDA_raw (skin_conductance)',
                    );
                    tx.executeSql(
                      'CREATE TABLE IF NOT EXISTS prediction_results (BPM_average, IBI_average, EDA_average, stress_level, date_time)',
                    );
                  })
                    .then(() => {
                      console.log('Tables created successfully');
                    })
                    .catch(error => {
                      console.log(error);
                    });
                });
              resolve(db);
            })
            .catch(error => {
              console.log(error);
            });
        })
        .catch(error => {
          console.log('echoTest failed - plugin not functional');
        });
    });
  }

  closeDatabase(db) {
    if (db) {
      console.log('Closing DB');
      db.close()
        .then(status => {
          console.log('Database CLOSED');
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      console.log('Database was not OPENED');
    }
  }

  add_BPM_raw(BPMArray) {
    const SQLString = '';
    BPMArray.forEach(val => {
      SQLString.concat(
        'INSERT INTO BPM_raw (beats_per_minute) VALUES (' + val + ');',
      );
    });
    console.log(SQLString);
    return new Promise(resolve => {
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql(SQLString).then(([tx, results]) => {
              resolve(results);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  add_IBI_raw(interBeatInterval) {
    return new Promise(resolve => {
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO IBI_raw (inter_beat_interval) VALUES (?)',
              [interBeatInterval],
            ).then(([tx, results]) => {
              resolve(results);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  add_EDA_raw(skinConductance) {
    return new Promise(resolve => {
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql('INSERT INTO EDA_raw (skin_conductance) VALUES (?)', [
              skinConductance,
            ]).then(([tx, results]) => {
              resolve(results);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  getRawBPM() {
    //convert to get_BPM_raw() return data in json format?
    return new Promise(resolve => {
      const data = [];
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql('SELECT * FROM BPM_raw').then(([tx, results]) => {
              console.log('Query completed');
              var len = results.rows.length;
              var bpm_data = [];
              for (let i = 0; i < len; i++) {
                bpm_data.push(results.rows.item(i).beats_per_minute);
              }
              console.log(bpm_data);
              resolve(bpm_data);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }
  getRawIBI() {
    //convert to get_BPM_raw() return data in json format?
    return new Promise(resolve => {
      const data = [];
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql('SELECT * FROM IBI_raw').then(([tx, results]) => {
              console.log('Query completed');
              var len = results.rows.length;
              var ibi_data = [];
              for (let i = 0; i < len; i++) {
                ibi_data.push(results.rows.item(i).inter_beat_interval);
              }
              console.log(ibi_data);
              resolve(ibi_data);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  getRawEDA() {
    //convert to get_BPM_raw() return data in json format?
    return new Promise(resolve => {
      const data = [];
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql('SELECT * FROM EDA_raw').then(([tx, results]) => {
              console.log('Query completed');
              var len = results.rows.length;
              var eda_data = [];
              for (let i = 0; i < len; i++) {
                eda_data.push(results.rows.item(i).skin_conductance);
              }
              console.log(eda_data);
              resolve(eda_data);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  get_latest_results() {
    return new Promise(resolve => {
      const data = [];
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql('SELECT * FROM prediction_results LIMIT 1').then(
              ([tx, results]) => {
                let row = results.rows.item(0);
                //const {heartRate, skinConductance, stressLevel, time} = row;
                //console.log(row);
                resolve(row);
              },
            );
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  delete_ALL_raw_data() {
    return new Promise(resolve => {
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql('DELETE FROM BPM_raw').then(([tx, results]) => {
              //console.log(results);
              resolve(results);
            });
            tx.executeSql('DELETE FROM IBI_raw').then(([tx, results]) => {
              //console.log(results);
              resolve(results);
            });
            tx.executeSql('DELETE FROM EDA_raw').then(([tx, results]) => {
              //console.log(results);
              resolve(results);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  add_prediction_results(data) {
    return new Promise(resolve => {
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO prediction_results (BPM_average, IBI_average, EDA_average, stress_level, date_time) VALUES ( ?, ?, ?, ?, datetime())',
              [
                data.BPM_average,
                data.IBI_average,
                data.EDA_average,
                data.stress_level,
              ],
            ).then(([tx, results]) => {
              resolve(results);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  count_rows(table_name) {
    //returns true if all raw data tables have >= 1000 rows
    return new Promise(resolve => {
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            var sql_string = `SELECT COUNT(*) FROM ` + table_name;
            tx.executeSql(sql_string).then(([tx, results]) => {
              //console.log(results.rows.item(0)['COUNT(*)']);
              resolve(results.rows.item(0)['COUNT(*)']);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  deleteTable() {
    return new Promise(resolve => {
      this.initDB()
        .then(db => {
          db.transaction(tx => {
            tx.executeSql('DROP TABLE BPM_raw').then(([tx, results]) => {
              console.log(results);
              resolve(results);
            });
          })
            .then(result => {
              this.closeDatabase(db);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }
}
