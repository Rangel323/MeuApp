import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import LoginScreen from '../src/LoginScreen';
import { autenticarUsuarioFirestore as buscarUsuario } from '../firebaseDb';

jest.mock('../firebaseDb', () => ({
  autenticarUsuarioFirestore: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('Tela de Login (LoginScreen)', () => {
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir alerta de aviso quando e-mail ou senha estiverem vazios', async () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.press(getByText('Entrar'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Aviso',
      'Por favor, informe o e-mail e a senha.'
    );
  });

  it('deve exibir alerta de erro de autenticação quando as credenciais forem incorretas', async () => {
    buscarUsuario.mockResolvedValueOnce(null);

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('exemplo@email.com'), 'errado@email.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senhaerrada');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(buscarUsuario).toHaveBeenCalledWith('errado@email.com', 'senhaerrada');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erro de Autenticação',
        'E-mail ou senha incorretos.'
      );
    });
  });

  it('deve realizar o login com sucesso, exibir boas-vindas e navegar para a Home', async () => {
    const usuarioMock = { id: '1', nome: 'Ana', email: 'ana@email.com' };
    buscarUsuario.mockResolvedValueOnce(usuarioMock);

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('exemplo@email.com'), 'ana@email.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), '123456');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(buscarUsuario).toHaveBeenCalledWith('ana@email.com', '123456');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Sucesso',
        'Bem-vindo(a), Ana!'
      );
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home', { usuario: usuarioMock });
    });
  });

  it('deve tratar exceções/erros vindos do banco de dados remoto', async () => {
    buscarUsuario.mockRejectedValueOnce(new Error('Erro de conexão'));

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('exemplo@email.com'), 'teste@email.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), '123456');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erro',
        'Ocorreu um erro ao consultar o banco de dados remoto.'
      );
    });
  });

  it('deve navegar para a tela de Cadastro ao clicar no botão secundário', async () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.press(getByText('Não tem uma conta? Cadastre-se'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Cadastro');
  });
});