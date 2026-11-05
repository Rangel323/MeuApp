import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import CadastroScreen from '../CadastroScreen';
import { cadastrarUsuarioFirestore } from '../../firebaseDb';



// 1. Mock do serviço do Firebase
jest.mock('../../firebaseDb', () => ({
  cadastrarUsuarioFirestore: jest.fn(),
}));

// 2. Spy na função Alert.alert do React Native
jest.spyOn(Alert, 'alert');

describe('Tela de Cadastro (CadastroScreen)', () => {
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir alerta de aviso quando algum campo estiver vazio', async () => {
    const { getByText } = await render(<CadastroScreen navigation={mockNavigation} />);

    await fireEvent.press(getByText('CADASTRAR'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Aviso',
      'Por favor, preencha todos os campos.'
    );
  });

  it('deve exibir alerta de erro quando as senhas não coincidirem', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <CadastroScreen navigation={mockNavigation} />
    );

    await fireEvent.changeText(getByPlaceholderText('João'), 'Carlos');
    await fireEvent.changeText(getByPlaceholderText('exemplo@email.com'), 'carlos@email.com');
    await fireEvent.changeText(getByPlaceholderText('Digite a sua idade'), '25');
    await fireEvent.changeText(getByPlaceholderText('Ex: 70.5'), '75');
    await fireEvent.changeText(getByPlaceholderText('Crie uma senha'), '123456');
    await fireEvent.changeText(getByPlaceholderText('Digite a senha novamente'), '654321');

    await fireEvent.press(getByText('CADASTRAR'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro',
      'As senhas digitadas não coincidem.'
    );
  });

  it('deve cadastrar usuário com sucesso ao preencher formulário corretamente', async () => {
    cadastrarUsuarioFirestore.mockResolvedValueOnce(true);

    const { getByPlaceholderText, getByText } = await render(
      <CadastroScreen navigation={mockNavigation} />
    );

    await fireEvent.changeText(getByPlaceholderText('João'), 'Carlos');
    await fireEvent.changeText(getByPlaceholderText('exemplo@email.com'), 'carlos@email.com');
    await fireEvent.changeText(getByPlaceholderText('Digite a sua idade'), '25');
    await fireEvent.changeText(getByPlaceholderText('Ex: 70.5'), '75');
    await fireEvent.changeText(getByPlaceholderText('Crie uma senha'), '123456');
    await fireEvent.changeText(getByPlaceholderText('Digite a senha novamente'), '123456');

    await fireEvent.press(getByText('CADASTRAR'));

    await waitFor(() => {
      expect(cadastrarUsuarioFirestore).toHaveBeenCalledWith(
        'Carlos',
        'carlos@email.com',
        '123456',
        '25',
        '75'
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Sucesso',
        'Conta cadastrada no Firestore com sucesso!',
        expect.any(Array)
      );
    });
  });

  it('deve tratar o erro de e-mail já existente', async () => {
    cadastrarUsuarioFirestore.mockRejectedValueOnce(new Error('EMAIL_EXISTS'));

    const { getByPlaceholderText, getByText } = await render(
      <CadastroScreen navigation={mockNavigation} />
    );

    await fireEvent.changeText(getByPlaceholderText('João'), 'Carlos');
    await fireEvent.changeText(getByPlaceholderText('exemplo@email.com'), 'existente@email.com');
    await fireEvent.changeText(getByPlaceholderText('Digite a sua idade'), '25');
    await fireEvent.changeText(getByPlaceholderText('Ex: 70.5'), '75');
    await fireEvent.changeText(getByPlaceholderText('Crie uma senha'), '123456');
    await fireEvent.changeText(getByPlaceholderText('Digite a senha novamente'), '123456');

    await fireEvent.press(getByText('CADASTRAR'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erro',
        'Este e-mail já está cadastrado.'
      );
    });
  });
});