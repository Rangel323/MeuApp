import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc,
  getDoc,
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

// ==========================================
// 👤 FUNÇÕES DE USUÁRIOS
// ==========================================

// 1. CADASTRAR USUÁRIO
export async function cadastrarUsuarioFirestore(nome, email, senha, idade, peso) {
  const emailTratado = email.trim().toLowerCase();

  // Verifica se o e-mail já existe na coleção 'usuarios'
  const q = query(collection(db, 'usuarios'), where('email', '==', emailTratado));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error('EMAIL_EXISTS');
  }

  const idadeNum = parseInt(idade, 10) || 0;
  const pesoNum = parseFloat(peso.toString().replace(',', '.')) || 0;

  // Salva na coleção 'usuarios' no Firestore
  return await addDoc(collection(db, 'usuarios'), {
    nome: nome.trim(),
    email: emailTratado,
    senha: senha,
    idade: idadeNum,
    peso: pesoNum,
    criadoEm: new Date().toISOString()
  });
}

// 2. BUSCAR TODOS OS USUÁRIOS (Para testes/listagem)
export async function buscarTodosUsuariosFirestore() {
  const querySnapshot = await getDocs(collection(db, 'usuarios'));
  const listaUsuarios = [];

  querySnapshot.forEach((documento) => {
    listaUsuarios.push({
      id: documento.id,
      ...documento.data()
    });
  });

  return listaUsuarios;
}


// BUSCAR USUÁRIO POR ID NO FIRESTORE
export async function buscarUsuarioPorIdFirestore(idDoc) {
  const userRef = doc(db, 'usuarios', idDoc);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }

  return null;
}


// 3. AUTENTICAR USUÁRIO (LOGIN)
export async function autenticarUsuarioFirestore(email, senha) {
  const emailTratado = email.trim().toLowerCase();
  
  const q = query(
    collection(db, 'usuarios'), 
    where('email', '==', emailTratado),
    where('senha', '==', senha)
  );
  
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null; // Usuário não encontrado ou senha incorreta
  }

  // Retorna os dados do primeiro usuário encontrado com seu ID do Firestore
  const docSnap = querySnapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}


// ==========================================
// 📦 FUNÇÕES DE PEDIDOS
// ==========================================

// 1. CADASTRAR PEDIDO
export async function cadastrarPedidoFirestore(descricao, valor, usuarioId) {
  const valorNum = parseFloat(valor.toString().replace(',', '.')) || 0;

  return await addDoc(collection(db, 'pedidos'), {
    descricao: descricao.trim(),
    valor: valorNum,
    usuarioId: usuarioId,
    criadoEm: new Date().toISOString()
  });
}

// 2. BUSCAR PEDIDOS DO USUÁRIO
export async function buscarPedidosPorUsuarioFirestore(usuarioId) {
  const q = query(
    collection(db, 'pedidos'),
    where('usuarioId', '==', usuarioId)
  );

  const querySnapshot = await getDocs(q);
  const listaPedidos = [];

  querySnapshot.forEach((documento) => {
    listaPedidos.push({
      id: documento.id,
      ...documento.data()
    });
  });

  return listaPedidos;
}

// 3. ATUALIZAR PEDIDO
export async function atualizarPedidoFirestore(idDoc, descricao, valor) {
  const valorNum = parseFloat(valor.toString().replace(',', '.')) || 0;
  const pedidoRef = doc(db, 'pedidos', idDoc);

  return await updateDoc(pedidoRef, {
    descricao: descricao.trim(),
    valor: valorNum
  });
}

// 4. DELETAR PEDIDO
export async function deletarPedidoPorIdFirestore(idDoc) {
  const pedidoRef = doc(db, 'pedidos', idDoc);
  return await deleteDoc(pedidoRef);
}