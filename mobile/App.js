import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

const DarkTheme = {
  dark: true,
  colors: {
    primary: '#f0b90b',
    background: '#0f1419',
    card: '#1a2332',
    text: '#e8eef4',
    border: '#2a3a4a',
    notification: '#f0b90b',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}
