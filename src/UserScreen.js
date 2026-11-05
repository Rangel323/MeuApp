import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';

// Importa a função de busca por ID do Firestore
import { buscarUsuarioPorIdFirestore as buscarUsuarioPorId } from '../firebaseDb';

export default function UserScreen({ navigation, route }) {
  // Recebe o userId (string do Firestore) passado pela navegação
  const userId = route.params?.userId;

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Consulta no Firestore ao carregar a tela
  useEffect(() => {
    async function carregarDadosDoBanco() {
      try {
        if (userId) {
          const dadosDoBanco = await buscarUsuarioPorId(userId);
          setUsuario(dadosDoBanco);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário por ID no Firestore:', error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosDoBanco();
  }, [userId]);

  function formatarData(dataIso) {
    if (!dataIso) return 'N/A';
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function handleSair() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  if (carregando) {
    return (
      <View style={styles.containerCarregando}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.textoCarregando}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        
        {/* Cabeçalho */}
        <View style={styles.containerImagem}>
          <Image
            source={{ uri: 'https://img.cdndsgni.com/preview/10781900.jpg' }}
            style={styles.logo}
          />
          <Text style={styles.nomeHeader}>{usuario?.nome || 'Usuário'}</Text>
          <Text style={styles.emailHeader}>{usuario?.email || 'email@exemplo.com'}</Text>
        </View>

        {/* Card com os Dados buscados via ID */}
        <View style={styles.card}>
          <Text style={styles.tituloCard}>Informações do Registro</Text>

          <View style={styles.itemDado}>
            <Text style={styles.label}>ID do Documento:</Text>
            <Text style={styles.valor}>{usuario?.id || 'N/A'}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.itemDado}>
            <Text style={styles.label}>Nome Completo:</Text>
            <Text style={styles.valor}>{usuario?.nome || 'Não informado'}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.itemDado}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.valor}>{usuario?.email || 'Não informado'}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.itemDado}>
            <Text style={styles.label}>Idade:</Text>
            <Text style={styles.valor}>{usuario?.idade ? `${usuario.idade} anos` : 'Não informada'}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.itemDado}>
            <Text style={styles.label}>Peso:</Text>
            <Text style={styles.valor}>{usuario?.peso ? `${usuario.peso} kg` : 'Não informado'}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.itemDado}>
            <Text style={styles.label}>Cadastrado em:</Text>
            {/* Atualizado para 'criadoEm' alinhado ao campo gravado no Firestore */}
            <Text style={styles.valor}>{formatarData(usuario?.criadoEm)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.botaoSair} onPress={handleSair}>
          <Text style={styles.textoBotao}>Sair da Conta</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  containerCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  textoCarregando: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  containerImagem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#0284C7',
    marginBottom: 12,
  },
  nomeHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  emailHeader: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0284C7',
    marginBottom: 16,
  },
  itemDado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  valor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  divisor: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
});