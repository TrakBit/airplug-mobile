import React, {useState, useEffect} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import {getTables, getAllRows} from '../Api/Api';
import {Text, View} from 'react-native';
import DatabaseLayer from 'expo-sqlite-orm/src/DatabaseLayer';
import NetInfo from '@react-native-community/netinfo';
import {List} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

function Home({navigation}) {
    const db = SQLite.openDatabase('db.db');
    const [tables, setTables] = useState([]);

    const selectTable = (table_id) => {
        navigation.navigate('Row', {table_id});
    };

    useEffect(() => {
        async function setConfig() {
            const token = await SecureStore.getItemAsync('token');
            const tableData = await getTables(token);
            const rowData = await getAllRows(token);

            rowData.data.rows.forEach((items) => {
                Object.entries(JSON.parse(items.record)).forEach((value) => {
                    if (typeof (value[1]) === 'object') {
                        //const val = value[1][0];

                        value[1].forEach((image, i) => {
                            const val = value[1][i];
                            if (typeof (val) === 'object' && 'url' in val) {
                                const fileName = val.id;
                                const fileUri = FileSystem.documentDirectory + fileName;
                                FileSystem.downloadAsync(
                                    val.url,
                                    fileUri
                                );
                                SecureStore.setItemAsync(fileName, fileUri);
                            }
                        });
                    }
                });
            });

            await db.transaction((tx) => {
                tx.executeSql('create table if not exists tables (base_key text, api_key text, table_id int, table_name text);', []);
                tx.executeSql('create table if not exists records (table_id int, record text);', []);
                tx.executeSql('delete from tables');
                tx.executeSql('delete from records');
            });

            const databaseLayerTables = new DatabaseLayer(async () => db, 'tables');
            await databaseLayerTables.bulkInsertOrReplace(tableData.data.tables);

            const databaseLayerRecords = new DatabaseLayer(async () => db, 'records');
            await databaseLayerRecords.bulkInsertOrReplace(rowData.data.rows);

            db.transaction((txn) => {
                txn.executeSql('select * from tables', [], (_, {rows: {_array}}) => {
                    setTables(_array);
                });
            });
        }

        NetInfo.fetch().then((state) => {
            if (state.isConnected) {
                setConfig();
            } else {
                db.transaction((tx) => {
                    tx.executeSql('select * from tables', [], (_, {rows: {_array}}) => {
                        setTables(_array);
                    });
                });
            }
        });
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.headerStyle}>Tables</Text>
            <View style={[{flex: 1}, styles.elementsContainer]}>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                    {
                        tables.map((value, i) => {
                            return (
                                <List.Item
                                    key={i}
                                    title={value.table_name}
                                    style={{backgroundColor: '#e4f9ff', marginTop: 10}}
                                    onPress={() => selectTable(value.table_id)}
                                />
                            );
                        })
                    }
                </View>
            </View>
        </View>
    );
}

const styles = {
    container: {
        backgroundColor: '#FFFFFF',
        paddingTop: 48,
        flex: 1
    },
    headerStyle: {
        color: '#5E72E4',
        fontSize: 36,
        textAlign: 'center',
        fontWeight: '100',
        marginBottom: 24,
        fontFamily: 'Rubik_500Medium'
    },
    elementsContainer: {
        backgroundColor: '#FFFFFF',
        marginLeft: 24,
        marginRight: 24,
        marginBottom: 24
    }
};

export default Home;