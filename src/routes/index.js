import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../LoginScreen';
import HomeScreen from '../HomeScreen';
import UserScreen from '../UserScreen';
import CadastrarPedidoScreen from '../CadastrarPedidos';
import CadastroScreen from '../CadastroScreen';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="CadastroScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0284C7', 
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="CadastroScreen"
        component={CadastroScreen}
        options={{ title: 'Cadastro de Usuário' }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: () => (
            <View style={styles.headerTituloContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
              <Text style={styles.headerTexto}>Área de Login</Text>
            </View>
          ),
        }}
      />

      {/* Tela Home com envio do userId para a UserScreen */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation, route }) => {
          // Captura o usuario enviado pela LoginScreen
          const usuarioLogado = route.params?.usuario;

          return {
            title: 'Painel Principal',
            headerRight: () => (
              <View style={styles.headerAcoes}>
                {/* Repassa o userId recebido para a UserScreen */}
                <TouchableOpacity 
                  onPress={() => navigation.navigate('UserScreen', { userId: usuarioLogado?.id })}
                  style={styles.iconBotao}
                >
                  <Image
                    source={require('../../assets/user.png')}
                    style={styles.iconeAsset}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => alert('Home')} style={styles.iconBotao}>
                  <Ionicons name="home" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => alert('Notificações')} style={styles.iconBotao}>
                  <Image
                    source={require('../../assets/active.png')}
                    style={styles.iconeAsset}
                  />
                </TouchableOpacity>
              </View>
            ),
          };
        }}
      />

      {/* Tela de Perfil */}
      <Stack.Screen
        name="UserScreen"
        component={UserScreen}
        options={{ title: 'Meu Perfil' }}
      />

         {/* Tela de Cadastro de pedidos */}
      <Stack.Screen
      name="CadastrarPedidoScreen"
      component={CadastrarPedidoScreen}
      options={{ title: 'Cadastrar Pedido' }}
      />

    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBotao: {
    padding: 6,
    marginLeft: 8,
  },
  iconeAsset: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
});