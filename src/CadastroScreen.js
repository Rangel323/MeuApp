import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  ActivityIndicator
} from 'react-native';

import { cadastrarUsuarioFirestore as cadastrarUsuario } from '../firebaseDb';

export default function CadastroScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleCadastro() {
    if (!email.trim() || !senha.trim() || !nome.trim() || !confirmarSenha.trim() || !idade.trim() || !peso.trim()) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas digitadas não coincidem.');
      return;
    }

    setSalvando(true); // Ativa spinner

    try {
      await cadastrarUsuario(nome, email, senha, idade, peso);

      Alert.alert('Sucesso', 'Conta cadastrada no Firestore com sucesso!', [
        { text: 'Ir para Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      if (error.message === 'EMAIL_EXISTS') {
        Alert.alert('Erro', 'Este e-mail já está cadastrado.');
      } else {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível salvar o usuário no banco de dados.');
      }
    } finally {
      setSalvando(false); // Desativa o spinner ao concluir (com sucesso ou erro)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.titulo}>Criar Nova Conta</Text>
      <Text style={styles.subtitulo}>Preencha os dados abaixo para se cadastrar</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="João"
          placeholderTextColor="#94A3B8"
          value={nome}
          onChangeText={setNome}
          editable={!salvando}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@email.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!salvando}
        />

        <Text style={styles.label}>Idade</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a sua idade"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={idade}
          onChangeText={setIdade}
          editable={!salvando}
        />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 70.5"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={peso}
          onChangeText={setPeso}
          editable={!salvando}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Crie uma senha"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!salvando}
        />

        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a senha novamente"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          editable={!salvando}
        />
      </View>

      {/* Botão com indicador de carregamento */}
      <TouchableOpacity 
        style={[styles.botao, salvando && styles.botaoDesabilitado]} 
        onPress={handleCadastro}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.textoBotao}>CADASTRAR</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.botaoVoltar} 
        onPress={() => navigation.navigate('Login')}
        disabled={salvando}
      >
        <Text style={styles.textoBotaoVoltar}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 24,
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
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
    marginBottom: 16,
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
  botaoVoltar: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  textoBotaoVoltar: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '600',
  },
});