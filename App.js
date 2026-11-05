import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import Routes from './src/routes';
import { initDb } from './src/db';

export default function App() {

useEffect(() => {
    // Executa a criação da tabela quando o app carrega
    initDb().catch((err) => console.error('Erro ao inicializar o banco:', err));
  }, []);

  return (
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
  );
}