import React, {useState, useEffect} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import {getTables, getAllRows} from '../Api/Api';
import {Text, View} from 'react-native';
import DatabaseLayer from 'expo-sqlite-orm/src/DatabaseLayer';
import NetInfo from '@react-native-community/netinfo';
import {AppLoading} from 'expo';
import {List} from 'react-native-paper';
import {
    useFonts,
    Rubik_300Light,
    Rubik_300Light_Italic,
    Rubik_400Regular,
    Rubik_400Regular_Italic,
    Rubik_500Medium,
    Rubik_500Medium_Italic,
    Rubik_700Bold,
    Rubik_700Bold_Italic,
    Rubik_900Black,
    Rubik_900Black_Italic
} from '@expo-google-fonts/rubik';

function Home({navigation}) {
    const [fontsLoaded] = useFonts({
        Rubik_300Light,
        Rubik_300Light_Italic,
        Rubik_400Regular,
        Rubik_400Regular_Italic,
        Rubik_500Medium,
        Rubik_500Medium_Italic,
        Rubik_700Bold,
        Rubik_700Bold_Italic,
        Rubik_900Black,
        Rubik_900Black_Italic
    });

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

    if (!fontsLoaded) {
        return <AppLoading/>;
    } else {
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