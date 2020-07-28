import React, {useState, useEffect} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import {getTables, getAllRows} from '../Api/Api';
import {Text, View, ActivityIndicator} from 'react-native';
import DatabaseLayer from 'expo-sqlite-orm/src/DatabaseLayer';
import NetInfo from '@react-native-community/netinfo';
import {List, Button} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

function Home({navigation}) {
    const db = SQLite.openDatabase('db.db');
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectTable = (table_id) => {
        navigation.navigate('Row', {table_id});
    };

    const sync = () => {
        async function setConfig() {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');
            const tableData = await getTables(token);
            const rowData = await getAllRows(token);

            db.transaction((tx) => {
                tx.executeSql('create table if not exists tables (base_key text, api_key text, table_id int, table_name text);', []);
                tx.executeSql('create table if not exists records (table_id int, record_id int, name text, record text, attachment text);', []);
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
                    setLoading(false);
                });
            });

            const fileName = 'download';
            const fileUri = FileSystem.documentDirectory + fileName;
            FileSystem.downloadAsync(
                'https://user-images.githubusercontent.com/3825401/88519805-5279f580-d010-11ea-974b-644c54177369.jpg',
                fileUri
            );
            SecureStore.setItemAsync(fileName, fileUri);
        }

        NetInfo.fetch().then((state) => {
            if (state.isConnected) {
                setConfig();
            }
        });
    };

    useEffect(() => {
        db.transaction((txn) => {
            txn.executeSql('select * from tables', [], (_, {rows: {_array}}) => {
                setTables(_array);
            });
        });
    }, []);

    if (loading === true) {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    size='large'
                    color='#5E72E4'
                />
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <Text style={styles.headerStyle}>Tables</Text>
                <View style={[{flex: 1}, styles.elementsContainer]}>
                    <Button
                        icon='sync'
                        mode='contained'
                        onPress={() => sync()}
                        style={{backgroundColor: '#5E72E4'}}
                    >
                        <Text style={styles.loginStyle}>SYNC</Text>
                    </Button>
                    <View style={{marginTop: 40, flex: 1, backgroundColor: '#FFFFFF'}}>
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
    },
    loginStyle: {
        color: '#FFFFFF',
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '100',
        marginBottom: 24,
        fontFamily: 'Rubik_500Medium'
    }
};

export default Home;