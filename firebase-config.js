// firebase-config.js - Configuração do Firebase

// Firebase configuration (suas credenciais)
const firebaseConfig = {
    apiKey: "AIzaSyA9ZmwCeOiZZ6zQHLlMk-lk5cHjRD8tDQo",
    authDomain: "acord-918da.firebaseapp.com",
    projectId: "acord-918da",
    storageBucket: "acord-918da.firebasestorage.app",
    messagingSenderId: "225286517086",
    appId: "1:225286517086:web:ea88ca0585446bf8b09fcf"
};

// Inicializar Firebase (será usado pelo script.js)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Inicializar app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Disponibilizar globalmente para o script.js
window.db = db;
window.firebaseHelpers = {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc
};

// Atualizar status da conexão
const statusElement = document.getElementById('statusTexto');
if (statusElement) {
    statusElement.innerHTML = '🟢 Firebase conectado!';
    statusElement.style.color = '#1f8a6e';
}

console.log('Firebase configurado com sucesso!');