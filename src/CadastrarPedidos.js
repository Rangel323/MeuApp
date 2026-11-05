import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

// Importações atualizadas para usar as funções do Firestore
import { 
  cadastrarPedidoFirestore as cadastrarPedido, 
  buscarPedidosPorUsuarioFirestore as buscarPedidosPorUsuario, 
  deletarPedidoPorIdFirestore as deletarPedidoPorId, 
  atualizarPedidoFirestore as atualizarPedido 
} from '../firebaseDb';

export default function CadastrarPedidoScreen({ navigation, route }) {
  const userId = route.params?.userId;

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [pedidos, setPedidos] = useState([]);

  // null = Cadastrando | String = ID do documento no Firestore sendo editado
  const [pedidoEmEdicaoId, setPedidoEmEdicaoId] = useState(null);

  // 2. Estado para controlar o carregamento durante gravação/atualização
  const [salvando, setSalvando] = useState(false);

  async function carregarPedidos() {
    if (!userId) return;
    try {
      const listaDoBanco = await buscarPedidosPorUsuario(userId);
      setPedidos(listaDoBanco);
    } catch (error) {
      console.error('Erro ao buscar pedidos no Firestore:', error);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, [userId]);

  // Prepara o formulário para edição ao clicar no lápis
  function handleIniciarEdicao(item) {
    setPedidoEmEdicaoId(item.id);
    setDescricao(item.descricao);
    setValor(item.valor.toString());
  }

  // Cancela o modo de edição e limpa os campos
  function handleCancelarEdicao() {
    setPedidoEmEdicaoId(null);
    setDescricao('');
    setValor('');
  }

  // Função unificada para Salvar (CREATE) ou Atualizar (UPDATE) com Loading
  async function handleSalvarPedido() {
    if (!descricao.trim() || !valor.trim()) {
      Alert.alert('Aviso', 'Por favor, preencha a descrição e o valor.');
      return;
    }

    setSalvando(true); // Ativa o spinner no botão

    try {
      if (pedidoEmEdicaoId) {
        // --- MODO UPDATE ---
        await atualizarPedido(pedidoEmEdicaoId, descricao, valor);
        Alert.alert('Sucesso', 'Pedido atualizado com sucesso!');
      } else {
        // --- MODO CREATE ---
        await cadastrarPedido(descricao, valor, userId);
        Alert.alert('Sucesso', 'Pedido cadastrado com sucesso!');
      }

      // Reseta os campos e atualiza a lista
      handleCancelarEdicao();
      await carregarPedidos();
    } catch (error) {
      console.error('Erro ao salvar/atualizar pedido no Firestore:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações na nuvem.');
    } finally {
      setSalvando(false); // Desativa o spinner ao concluir
    }
  }

  function handleDeletarPedido(pedidoId, descricaoPedido) {
    Alert.alert(
      'Excluir Pedido',
      `Deseja realmente remover o pedido "${descricaoPedido}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarPedidoPorId(pedidoId);
              if (pedidoEmEdicaoId === pedidoId) {
                handleCancelarEdicao();
              }
              await carregarPedidos();
            } catch (error) {
              console.error('Erro ao deletar pedido no Firestore:', error);
            }
          },
        },
      ]
    );
  }

  function formatarData(dataIso) {
    if (!dataIso) return 'N/A';
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR');
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>
          {pedidoEmEdicaoId ? 'Editar Pedido' : 'Novo Pedido'}
        </Text>
        <Text style={styles.subtitulo}>
          {pedidoEmEdicaoId 
            ? 'Editando item selecionado' 
            : `Cadastre pedidos para a conta`
          }
        </Text>

        {/* --- FORMULÁRIO --- */}
        <View style={styles.cardFormulario}>
          <Text style={styles.label}>Descrição do Pedido</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Tênis de Corrida, Caderno..."
            placeholderTextColor="#94A3B8"
            value={descricao}
            onChangeText={setDescricao}
            editable={!salvando}
          />

          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 150.00"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValor}
            editable={!salvando}
          />

          {/* Botão Principal com Spinner */}
          <TouchableOpacity 
            style={[
              styles.botao, 
              pedidoEmEdicaoId && styles.botaoAtualizar,
              salvando && styles.botaoDesabilitado
            ]} 
            onPress={handleSalvarPedido}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.textoBotao}>
                {pedidoEmEdicaoId ? 'ATUALIZAR PEDIDO' : 'SALVAR PEDIDO'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Exibe botão de cancelar se estiver no modo de edição */}
          {pedidoEmEdicaoId && !salvando && (
            <TouchableOpacity 
              style={styles.botaoCancelarEdicao} 
              onPress={handleCancelarEdicao}
            >
              <Text style={styles.textoCancelarEdicao}>Cancelar Edição</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- LISTAGEM DE PEDIDOS --- */}
        <Text style={styles.tituloSecao}>Meus Pedidos Cadastrados ({pedidos.length})</Text>

        {pedidos.length === 0 ? (
          <View style={styles.cardVazio}>
            <Text style={styles.textoVazio}>Nenhum pedido cadastrado ainda.</Text>
          </View>
        ) : (
          pedidos.map((item) => (
            <View key={item.id} style={styles.cardPedido}>
              <View style={styles.headerPedido}>
                <View style={styles.infoDescricao}>
                  <Text style={styles.descricaoPedido}>{item.descricao}</Text>
                </View>

                {/* Ações: Editar (Lápis) e Deletar (Lixeira) */}
                <View style={styles.containerAcoes}>
                  <TouchableOpacity 
                    onPress={() => handleIniciarEdicao(item)}
                    style={styles.iconBotao}
                    disabled={salvando}
                  >
                    <Ionicons name="pencil" size={18} color="#0284C7" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => handleDeletarPedido(item.id, item.descricao)}
                    style={styles.iconBotao}
                    disabled={salvando}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divisor} />

              <View style={styles.detalhesPedido}>
                <Text style={styles.valorPedido}>
                  R$ {Number(item.valor).toFixed(2).replace('.', ',')}
                </Text>
                <Text style={styles.dataPedido}>{formatarData(item.criadoEm)}</Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={styles.botaoVoltar} 
          onPress={() => navigation.goBack()}
          disabled={salvando}
        >
          <Text style={styles.textoBotaoVoltar}>Voltar ao Painel</Text>
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
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
 cardFormulario: {
    backgroundColor: '#FFFFFF',
    padding: 18,
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
    marginBottom: 14,
  },
  botao: {
    height: 48,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  botaoAtualizar: {
    backgroundColor: '#16A34A',
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  botaoCancelarEdicao: {
    alignItems: 'center',
    paddingTop: 12,
  },
  textoCancelarEdicao: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  cardVazio: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 16,
  },
  textoVazio: {
    color: '#94A3B8',
    fontSize: 14,
  },
  cardPedido: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  headerPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoDescricao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  descricaoPedido: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  containerAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBotao: {
    padding: 4,
  },
  divisor: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  detalhesPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  valorPedido: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  dataPedido: {
    fontSize: 12,
    color: '#64748B',
  },
  botaoVoltar: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  textoBotaoVoltar: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '600',
  },
});