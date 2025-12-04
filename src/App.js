import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider, useAuth} from './context/AuthContext';
import {LanguageProvider} from './context/LanguageContext';
import ServerUrlScreen from './screens/ServerUrlScreen';
import LoginScreen from './screens/LoginScreen';
import MissionListScreen from './screens/MissionListScreen';
import MissionDetailsScreen from './screens/MissionDetailsScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
  const {isAuthenticated, isLoading, serverUrl} = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!serverUrl ? (
          <Stack.Screen name="ServerUrl" component={ServerUrlScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MissionList" component={MissionListScreen} />
            <Stack.Screen name="MissionDetails" component={MissionDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      <LanguageProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
