import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../AuthContext';


export default function TabLayout() {
  
  const { verifyToken, token } = useContext(AuthContext);



  return (
    <Tabs
      screenListeners={{
        // run verifyToken function every time the user changes tab...
        tabPress: (e) => {
        
          if (token) {
            verifyToken(token);
          }
        }
      }}
      screenOptions={{ // style options for all tabs
        tabBarInactiveTintColor: 'teal', 
        tabBarActiveTintColor: 'blue',       
        headerStyle: {
          backgroundColor: "teal",
          borderWidth: 0,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontFamily: 'SourceCodePro-Medium', 
        },
        tabBarLabelStyle: {
          fontFamily: 'SourceCodePro-Regular', // 'Home', 'Play', 'Profile' in the bottom tab menu
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={22} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Play',
          headerShown: false, // play has its own Stack and thus its own headers.
          tabBarIcon: ({ color }) => <FontAwesome size={22} name="play" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={22} name="user-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
