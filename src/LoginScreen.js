import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';

import { autenticarUsuarioFirestore as buscarUsuario } from '../firebaseDb';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [carregando, setCarregando] = useState(false);

  // 3. Função de Login com consulta ao Firestore e tratamento de loading
  async function handleLogin() {
    // Validação de campos vazios
    if (email.trim() === '' || senha.trim() === '') {
      Alert.alert('Aviso', 'Por favor, informe o e-mail e a senha.');
      return;
    }

    setCarregando(true); // Ativa o spinner

    try {
      const usuarioEncontrado = await buscarUsuario(email, senha);

      if (usuarioEncontrado) {
        Alert.alert('Sucesso', `Bem-vindo(a), ${usuarioEncontrado.nome}!`);
        
        setEmail('');
        setSenha('');
        navigation.navigate('Home', { usuario: usuarioEncontrado });
      } else {
        Alert.alert('Erro de Autenticação', 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao consultar o banco de dados remoto.');
    } finally {
      setCarregando(false); 
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Faça o Login</Text>
      <Text style={styles.subtitulo}>Informe suas credenciais para acessar</Text>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@email.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!carregando}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!carregando} 
        />
      </View>

    
      <TouchableOpacity 
        style={[styles.botao, carregando && styles.botaoDesabilitado]} 
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.textoBotao}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Botão Secundário para criar conta */}
      <TouchableOpacity 
        style={styles.botaoCriarConta} 
        onPress={() => navigation.navigate('Cadastro')}
        disabled={carregando}
      >
        <Text style={styles.textoCriarConta}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  botao: {
    height: 48,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoCriarConta: {
    alignItems: 'center',
    padding: 8,
  },
  textoCriarConta: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '600',
  },
});