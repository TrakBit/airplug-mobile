import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {TextInput, Button, Snackbar} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {login, getTables} from './Api/Api';
import * as SecureStore from 'expo-secure-store';

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
            await SecureStore.setItemAsync('token', regData.data.token);
            if (regData.data.loggedin === 1) {
                navigation.navigate('Home');
            } else {
                await setNotificationMsg('  Wrong Credentials');
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

function Home() {
    const [tables, setTables] = useState([]);

    useEffect(() => {
        async function setConfig() {
            const token = await SecureStore.getItemAsync('token');
            const tableData = await getTables(token);
            setTables(tableData.data.tables);
        }
        setConfig();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.headerStyle}>Home</Text>
            <View style={[{flex: 1}, styles.elementsContainer]}>
                <View style={{flex: 3, backgroundColor: '#FFFFFF'}}>
                    {
                        tables.map((value, i) => {
                            return (
                                <Text key={i}>{value.table_name}</Text>
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
        fontSize: 36,
        textAlign: 'center',
        fontWeight: '100',
        marginBottom: 24
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
            <Stack.Navigator initialRouteName='Login'>
                <Stack.Screen
                    name='Login'
                    component={Login}
                />
                <Stack.Screen
                    name='Home'
                    component={Home}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}