import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function Login({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.headerStyle}>AirPlug</Text>
      <View style={[{flex: 1}, styles.elementsContainer]}>
        <View style={{flex: 1, backgroundColor: '#FFFFFF'}} />
        <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
          <TextInput
            label="Email"
            value={email}
            mode='outlined'
            onChangeText={text => setEmail(text)}
          />
        </View>
        <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
          <TextInput
            label="Password"
            value={password}
            mode='outlined'
            onChangeText={text => setPassword(text)}
          />          
        </View>
        <View style={{flex: 3, backgroundColor: '#FFFFFF'}}>
          <Button mode="contained" onPress={() => navigation.navigate('Home')}>
            LOGIN
          </Button>        
        </View>
      </View>
    </View>
  );
}


function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerStyle}>Home</Text>
      <View style={[{flex: 1}, styles.elementsContainer]}>
        <View style={{flex: 3, backgroundColor: '#FFFFFF'}}>
          <Text>Home</Text>       
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
}


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}