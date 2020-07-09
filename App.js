import React, {useState, useEffect} from 'react';
import {Text, View, ScrollView} from 'react-native';
import {TextInput, Button, Snackbar, List, Title, Subheading} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {login, getTables, getAllRows} from './Api/Api';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import DatabaseLayer from 'expo-sqlite-orm/src/DatabaseLayer';
import NetInfo from '@react-native-community/netinfo';
import {AppLoading} from 'expo';
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

function Login({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState('');

    const onDismissSnackBar = () => setVisible(false);

    const validateEmail = () => {
        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regexp.test(email);
    };

    const loginHandle = async () => {
        if (validateEmail(email) === true) {
            const regData = await login(email, password);
            if (regData.data.loggedin === 1) {
                await SecureStore.setItemAsync('token', regData.data.token);
                navigation.navigate('Home');
            } else {
                setNotificationMsg('  Wrong Credentials');
                setVisible(true);
            }
        } else {
            await setNotificationMsg('Invalid Email');
            setVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerStyle}>AirPlug</Text>
            <View style={[{flex: 1}, styles.elementsContainer]}>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}/>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                    <TextInput
                        label='Email'
                        value={email}
                        mode='outlined'
                        onChangeText={(text) => setEmail(text)}
                    />
                </View>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                    <TextInput
                        label='Password'
                        value={password}
                        mode='outlined'
                        onChangeText={(text) => setPassword(text)}
                    />
                </View>
                <View style={{flex: 3, backgroundColor: '#FFFFFF'}}>
                    <Button
                        mode='contained'
                        onPress={() => loginHandle()}
                    >
                        LOGIN
                    </Button>
                </View>
            </View>
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
                action={{
                    label: 'Undo',
                    onPress: () => {
                        // Do something
                    }
                }}
            >
                {notificationMsg}
            </Snackbar>
        </View>
    );
}

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

    const logout = () => {
        navigation.navigate('Login');
    };

    useEffect(() => {
        async function setConfig() {
            const token = await SecureStore.getItemAsync('token');
            let tableData = {};
            try {
                tableData = await getTables(token);
            } catch (error) {
                logout();
            }
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

            await db.transaction((tx) => {
                tx.executeSql('select * from tables', [], (_, {rows: {_array}}) => {
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

function Row({route, navigation}) {
    const db = SQLite.openDatabase('db.db');
    const [rows, setRows] = useState([]);

    const {table_id} = route.params;

    const selectRow = (record) => {
        navigation.navigate('Card', {record});
    };

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql('select * from records where table_id = (?)', [table_id], (_, {rows: {_array}}) => {
                setRows(_array);
            });
        });
    }, []);

    return (
        <View style={styles.container}>
            <View style={[{flex: 1}, styles.elementsContainer]}>
                <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                    <ScrollView>
                        {
                            rows.map((value, i) => {
                                return (
                                    <List.Item
                                        key={i}
                                        title={JSON.parse(value.record)[Object.keys(JSON.parse(value.record))[0]]}
                                        style={{backgroundColor: '#e4f9ff', marginTop: 10}}
                                        onPress={() => selectRow(JSON.parse(value.record))}
                                    />
                                );
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

function Card({route}) {
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
    const {record} = route.params;

    if (!fontsLoaded) {
        return <AppLoading/>;
    } else {
        return (
            <View style={styles.container}>
                <View style={[{flex: 1}, styles.elementsContainer]}>
                    <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
                        <ScrollView>
                            {
                                Object.entries(record).map((value, i) => {
                                    return (
                                        <View key={i}>
                                            <Title style={{fontFamily: 'Rubik_500Medium'}}>{value[0]}{':'}</Title>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                <Content value={value[1]}/>
                                            </View>
                                        </View>
                                    );
                                })
                            }
                        </ScrollView>
                    </View>
                </View>
            </View>
        );
    }
}

const Content = ({value}) => {
    if (typeof (value) === 'object') {
        return value.map((items, i) => {
            return (
                <View
                    key={i}
                    style={{
                        backgroundColor: '#ecfbfc',
                        marginLeft: 8,
                        marginTop: 8,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: '#00bcd4'
                    }}
                >
                    <Subheading style={{fontFamily: 'Rubik_400Regular'}}>&nbsp;{value[i]}&nbsp;</Subheading>
                </View>
            );
        });
    } else {
        return (
            <Subheading>{value}</Subheading>
        );
    }
};

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

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Home'>
                <Stack.Screen
                    name='Login'
                    component={Login}
                />
                <Stack.Screen
                    name='Home'
                    component={Home}
                />
                <Stack.Screen
                    name='Row'
                    component={Row}
                />
                <Stack.Screen
                    name='Card'
                    component={Card}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}