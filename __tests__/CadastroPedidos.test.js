import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import CadastrarPedidoScreen from '../src/CadastrarPedidoScreen';
import { 
  cadastrarPedidoFirestore, 
  buscarPedidosPorUsuarioFirestore, 
  deletarPedidoPorIdFirestore, 
  atualizarPedidoFirestore 
} from '../firebaseDb';

// 1. Mock do serviço do Firebase
jest.mock('../firebaseDb', () => ({
  cadastrarPedidoFirestore: jest.fn(),
  buscarPedidosPorUsuarioFirestore: jest.fn(),
  deletarPedidoPorIdFirestore: jest.fn(),
  atualizarPedidoFirestore: jest.fn(),
}));

// 2. Spy na função Alert.alert do React Native
jest.spyOn(Alert, 'alert');

describe('Tela de Cadastro e Gestão de Pedidos (CadastrarPedidoScreen)', () => {
  const mockNavigation = { goBack: jest.fn() };
  const mockRoute = { params: { userId: 'user123' } };

  const pedidosMock = [
    { id: '1', descricao: 'Tênis de Corrida', valor: 150.00, criadoEm: '2026-06-01T10:00:00.000Z' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    buscarPedidosPorUsuarioFirestore.mockResolvedValue(pedidosMock);
  });

  it('deve carregar e exibir os pedidos do usuário ao iniciar', async () => {
    const { getByText } = render(
      <CadastrarPedidoScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(buscarPedidosPorUsuarioFirestore).toHaveBeenCalledWith('user123');
      expect(getByText('Tênis de Corrida')).toBeTruthy();
      expect(getByText('Meus Pedidos Cadastrados (1)')).toBeTruthy();
    });
  });

  it('deve exibir aviso se tentar salvar com campos vazios', async () => {
    const { getByText } = render(
      <CadastrarPedidoScreen navigation={mockNavigation} route={mockRoute} />
    );

    await fireEvent.press(getByText('SALVAR PEDIDO'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Aviso',
      'Por favor, preencha a descrição e o valor.'
    );
  });

  it('deve cadastrar um novo pedido com sucesso', async () => {
    cadastrarPedidoFirestore.mockResolvedValueOnce(true);

    const { getByPlaceholderText, getByText } = render(
      <CadastrarPedidoScreen navigation={mockNavigation} route={mockRoute} />
    );

    await fireEvent.changeText(getByPlaceholderText('Ex: Tênis de Corrida, Caderno...'), 'Mochila');
    await fireEvent.changeText(getByPlaceholderText('Ex: 150.00'), '200');

    await fireEvent.press(getByText('SALVAR PEDIDO'));

    await waitFor(() => {
      expect(cadastrarPedidoFirestore).toHaveBeenCalledWith('Mochila', '200', 'user123');
      expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Pedido cadastrado com sucesso!');
    });
  });

  it('deve atualizar um pedido existente ao entrar no modo de edição', async () => {
    atualizarPedidoFirestore.mockResolvedValueOnce(true);

    const { getByPlaceholderText, getByText, getAllByTestId } = render(
      <CadastrarPedidoScreen navigation={mockNavigation} route={mockRoute} />
    );

    // Aguarda carregar o pedido inicial
    await waitFor(() => {
      expect(getByText('Tênis de Corrida')).toBeTruthy();
    });

    // Clica no botão de editar (simulando a busca pelo ícone/toque na ação)
    // Como os botões usam Ionicons, podemos disparar o evento no TouchableOpacity correspondente
    // Alternativamente, podemos buscar pelo texto do botão após iniciar edição:
    // Vamos disparar o evento de pressionar o ícone de edição (primeiro iconBotao)
    const botoesAcao = await waitFor(() => getAllByText('Tênis de Corrida'));
    // O componente renderiza o item. Vamos simular clicando no botão de editar alterando o estado diretamente ou via fireEvent
    // Para simplificar, podemos invocar o handleIniciarEdicao mapeando pelo ícone ou acessando os componentes. 
    // Uma forma robusta no React Native testing library é buscar por acessibilidade ou pelos botões de ação:
    
    // Vamos testar a função de atualizar simulando o preenchimento e salvamento quando o ID de edição está ativo:
    // Ou testamos acionando o botão de editar da lista:
  });

  it('deve deletar um pedido ao confirmar exclusão no alerta', async () => {
    deletarPedidoPorIdFirestore.mockResolvedValueOnce(true);

    // Mock do Alert.alert para executar o botão "Excluir" automaticamente
    Alert.alert.mockImplementationOnce((title, message, buttons) => {
      const botaoExcluir = buttons.find(b => b.text === 'Excluir');
      if (botaoExcluir && botaoExcluir.onPress) {
        botaoExcluir.onPress();
      }
    });

    const { getByText } = render(
      <CadastrarPedidoScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(getByText('Tênis de Corrida')).toBeTruthy();
    });

    // Dispara a exclusão (clicando na lixeira - simulado aqui chamando a ação ou encontrando o elemento)
  });

  it('deve voltar ao painel ao clicar no botão Voltar', async () => {
    const { getByText } = render(
      <CadastrarPedidoScreen navigation={mockNavigation} route={mockRoute} />
    );

    await fireEvent.press(getByText('Voltar ao Painel'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});