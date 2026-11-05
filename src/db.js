import * as SQLite from 'expo-sqlite';

// Instância única de conexão com o arquivo .db
let dbPromise = null;

// Função para obter/abrir a conexão com o SQLite
export async function getDbConnection() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('usuariosApp.db');
  }
  return dbPromise;
}

// 1. Cria a tabela de usuários ao iniciar a aplicação
export async function initDb() {
  
  const db = await getDbConnection();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      nome TEXT NOT NULL,
      idade INTEGER NOT NULL,
      peso REAL NOT NULL,
      criado_em DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      data_pedido DATETIME NOT NULL,
      usuario_id INTEGER NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    );

  `);
}

// 2. Insere um novo usuário na tabela (INSERT)
export async function cadastrarUsuario(nome, email, senha, idade, peso, criado_em) {
  console.log(SQLite.defaultDatabaseDirectory);
  const db = await getDbConnection();
  
  // Trata tipos de dados antes de salvar no SQLite
  const idadeNum = parseInt(idade, 10);
  const pesoNum = parseFloat(peso.toString().replace(',', '.')); // Aceita vírgula ou ponto

  return await db.runAsync(
    'INSERT INTO usuarios (nome, email, senha, idade, peso, criado_em) VALUES (?, ?, ?, ?, ?, ?);',
    [nome.trim(), email.toLowerCase().trim(), senha, idadeNum, pesoNum, criado_em]
  );
}

// 3. Valida se o usuário existe na hora do Login (SELECT)
export async function buscarUsuario(email, senha) {
  const db = await getDbConnection();
  return await db.getFirstAsync(
    'SELECT * FROM usuarios WHERE email = ? AND senha = ?;',
    [email.toLowerCase().trim(), senha]
  );
}

// Retorna a lista completa de usuários cadastrados
export async function buscarTodosUsuarios() {
  const db = await getDbConnection();
  const todos = await db.getAllAsync('SELECT * FROM usuarios;');
  console.log('--- USUÁRIOS NO BANCO ---', todos);
  return todos;
}

// Busca um único usuário pela Chave Primária (ID)
export async function buscarUsuarioPorId(id) {
  const db = await getDbConnection();
  return await db.getFirstAsync(
    'SELECT * FROM usuarios WHERE id = ?;',
    [id]
  );
}


// Insere um novo pedido vinculado a um usuario (CREATE)
export async function cadastrarPedido(descricao, valor, usuario_id) {
  const db = await getDbConnection();
  const dataAtual = new Date().toISOString();
  const valorNum = parseFloat(valor.toString().replace(',', '.'));

  // 1. Executa o INSERT
  const resultado = await db.runAsync(
    'INSERT INTO pedidos (descricao, valor, data_pedido, usuario_id) VALUES (?, ?, ?, ?);',
    [descricao.trim(), valorNum, dataAtual, usuario_id]
  );

  // 2. Consulta todos os pedidos deste usuário
  const pedidosDoUsuario = await db.getAllAsync(
    'SELECT * FROM pedidos WHERE usuario_id = ?;',
    [usuario_id]
  );

  console.log(`--- PEDIDOS DO USUÁRIO ID #${usuario_id} NO BANCO ---`);
  console.table(pedidosDoUsuario); 

  return resultado;
}

// Busca todos os pedidos de um determinado usuário (READ com FK)
export async function buscarPedidosPorUsuario(usuario_id) {
  const db = await getDbConnection();
  return await db.getAllAsync(
    'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC;',
    [usuario_id]
  );
}

// Opcional: Consulta com JOIN para trazer o nome do usuário junto com o pedido
export async function buscarPedidosComUsuario() {
  const db = await getDbConnection();
  return await db.getAllAsync(`
    SELECT 
      pedidos.id AS pedido_id,
      pedidos.descricao,
      pedidos.valor,
      usuarios.nome AS nome_usuario,
      usuarios.email
    FROM pedidos
    INNER JOIN usuarios ON pedidos.usuario_id = usuarios.id;
  `);
}

// Remove um pedido pelo seu ID (DELETE)
export async function deletarPedidoPorId(id) {
  const db = await getDbConnection();
  return await db.runAsync(
    'DELETE FROM pedidos WHERE id = ?;',
    [id]
  );
}

// Atualiza um pedido pelo seu ID (UPDATE)
export async function atualizarPedido(id, descricao, valor) {
  const db = await getDbConnection();
  const valorNum = parseFloat(valor.toString().replace(',', '.'));
  return await db.runAsync(
    'UPDATE pedidos SET descricao = ?, valor = ? WHERE id = ?;',
    [descricao.trim(), valorNum, id]
  );
}