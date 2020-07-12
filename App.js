import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Login from './Component/Login';
import Home from './Component/Home';
import Row from './Component/Row';
import Card from './Component/Card';

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