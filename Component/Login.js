import React, {useState, useEffect} from 'react';
import * as SecureStore from 'expo-secure-store';
import {login, authenticate} from '../Api/Api';
import NetInfo from '@react-native-community/netinfo';
import {Text, View} from 'react-native';
import {TextInput, Button, Snackbar} from 'react-native-paper';
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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState('');

    useEffect(() => {
        async function setConfig() {
            const token = await SecureStore.getItemAsync('token');
            try {
                await authenticate(token);
                navigation.navigate('Home');
            } catch (error) {
                console.log(error);
            }
        }
        NetInfo.fetch().then((state) => {
            if (state.isConnected) {
                setConfig();
            } else {
                navigation.navigate('Home');
            }
        });
    }, []);

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

    if (!fontsLoaded) {
        return <AppLoading/>;
    } else {
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

export default Login;