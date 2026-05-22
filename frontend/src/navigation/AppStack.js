import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../features/home/screens/HomeScreen';
import ChatMinimarketScreen from '../features/chat/screens/ChatMinimarketScreen';
import NegocioDetailScreen from '../features/valoracion/screens/NegocioDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ChatMinimarket" component={ChatMinimarketScreen} />
      <Stack.Screen name="NegocioDetail" component={NegocioDetailScreen} />
    </Stack.Navigator>
  );
}
