import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

export default function HomeScreen({ navigation, route }) {
  // Captura o usuário passado como parâmetro da tela de Login
  const usuario = route.params?.usuario;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Bem-vindo, {usuario?.nome || 'Usuário'}!</Text>
        <Text style={styles.subtitulo}>Você está na Tela Inicial (Home)</Text>
      </View>

      <View style={styles.containerImagem}>
        <Image
          source={{ uri: 'https://img.cdndsgni.com/preview/10781900.jpg' }}
          style={styles.logo}
        />
      </View>

      {/* Botão para ir ao Cadastrar Pedidos */}
      <TouchableOpacity 
        style={styles.botao}
        onPress={() => navigation.navigate('CadastrarPedidoScreen', { userId: usuario?.id })}
      >
        <Text style={styles.textoBotao}>+ NOVO PEDIDO</Text>
      </TouchableOpacity>

      {/* Botão para ir à tela de login */}
      <TouchableOpacity
        style={styles.botaoSair}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.textoBotao}>SAIR / DESCONECTAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fcf9',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  textoCard: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  botao: {
    height: 48,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoSair: {
    height: 48,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerImagem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});