// script.js - Gerenciamento completo com Firebase (sem dados.json)

let acordoAtual = null;
let pagamentosAtuais = [];

// Elementos DOM
const elementos = {
    codigoCoop: document.getElementById('codigoCoop'),
    nomeCoop: document.getElementById('nomeCoop'),
    numeroProcesso: document.getElementById('numeroProcesso'),
    nomeParte: document.getElementById('nomeParte'),
    cpf: document.getElementById('cpf'),
    dataAjuizamento: document.getElementById('dataAjuizamento'),
    comarca: document.getElementById('comarca'),
    tipoAcao: document.getElementById('tipoAcao'),
    numContrato: document.getElementById('numContrato'),
    tipoOperacao: document.getElementById('tipoOperacao'),
    valorCausa: document.getElementById('valorCausa'),
    qtdParcelas: document.getElementById('qtdParcelas'),
    valorParcela: document.getElementById('valorParcela'),
    valorDebito: document.getElementById('valorDebito'),
    totalPago: document.getElementById('totalPago'),
    qtdParcelasResumo: document.getElementById('qtdParcelasResumo'),
    valorParcelaResumo: document.getElementById('valorParcelaResumo'),
    saldoDevedor: document.getElementById('saldoDevedor'),
    tbodyPagamentos: document.getElementById('tbodyPagamentos'),
    proximaInfo: document.getElementById('proximaParcelaInfo'),
    observacoes: document.getElementById('observacoes'),
    mesReferencia: document.getElementById('mesReferencia'),
    valorPagoMes: document.getElementById('valorPagoMes'),
    btnRegistrar: document.getElementById('btnRegistrarPagamento'),
    btnBuscar: document.getElementById('btnBuscar'),
    btnNovoAcordo: document.getElementById('btnNovoAcordo'),
    buscaProcesso: document.getElementById('buscaProcesso'),
    btnHistorico: document.getElementById('btnHistorico')
};

// Função para carregar acordo do Firebase
async function carregarAcordo(numeroProcesso) {
    try {
        const { doc, getDoc } = window.firebaseHelpers;
        const docRef = doc(window.db, 'acordos', numeroProcesso);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            acordoAtual = data.acordo;
            pagamentosAtuais = data.pagamentos || [];
            
            // Preenche formulário
            elementos.codigoCoop.value = acordoAtual.cooperativa?.codigo || '';
            elementos.nomeCoop.value = acordoAtual.cooperativa?.nome || '';
            elementos.numeroProcesso.value = acordoAtual.numeroProcesso || '';
            elementos.nomeParte.value = acordoAtual.parte?.nome || '';
            elementos.cpf.value = acordoAtual.parte?.cpf || '';
            elementos.dataAjuizamento.value = acordoAtual.dataAjuizamento || '';
            elementos.comarca.value = acordoAtual.comarca || '';
            elementos.tipoAcao.value = acordoAtual.tipoAcao || '';
            elementos.numContrato.value = acordoAtual.numeroContrato || '';
            elementos.tipoOperacao.value = acordoAtual.tipoOperacao || '';
            elementos.valorCausa.value = acordoAtual.valorCausa || 0;
            elementos.qtdParcelas.value = acordoAtual.quantidadeParcelas || 0;
            elementos.valorParcela.value = acordoAtual.valorParcela || 0;
            elementos.observacoes.value = data.observacoes || '';
            
            atualizarInterface();
            document.getElementById('statusTexto').innerHTML = `🟢 Acordo carregado: ${numeroProcesso}`;
            return true;
        } else {
            alert('Acordo não encontrado! Crie um novo acordo.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao carregar acordo:', error);
        alert('Erro ao carregar dados do Firebase');
        return false;
    }
}

// Função para salvar acordo no Firebase
async function salvarAcordo() {
    if (!acordoAtual) {
        alert('Nenhum acordo carregado');
        return false;
    }
    
    try {
        const { doc, setDoc } = window.firebaseHelpers;
        const docRef = doc(window.db, 'acordos', acordoAtual.numeroProcesso);
        
        const dadosParaSalvar = {
            acordo: acordoAtual,
            pagamentos: pagamentosAtuais,
            observacoes: elementos.observacoes.value,
            ultimaAtualizacao: new Date().toISOString()
        };
        
        await setDoc(docRef, dadosParaSalvar);
        document.getElementById('statusTexto').innerHTML = `✅ Acordo salvo em: ${new Date().toLocaleTimeString()}`;
        setTimeout(() => {
            document.getElementById('statusTexto').innerHTML = `🟢 Acordo ativo: ${acordoAtual.numeroProcesso}`;
        }, 2000);
        return true;
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar no Firebase');
        return false;
    }
}

// Criar novo acordo
function novoAcordo() {
    const numeroProcesso = prompt('Digite o número do processo para o novo acordo:');
    if (!numeroProcesso) return;
    
    acordoAtual = {
        cooperativa: {
            codigo: '',
            nome: ''
        },
        numeroProcesso: numeroProcesso,
        parte: {
            nome: '',
            cpf: ''
        },
        dataAjuizamento: '',
        comarca: '',
        tipoAcao: '',
        numeroContrato: '',
        tipoOperacao: '',
        valorCausa: 0,
        quantidadeParcelas: 0,
        valorParcela: 0
    };
    
    pagamentosAtuais = [];
    
    // Limpa formulário
    elementos.codigoCoop.value = '';
    elementos.nomeCoop.value = '';
    elementos.numeroProcesso.value = numeroProcesso;
    elementos.nomeParte.value = '';
    elementos.cpf.value = '';
    elementos.dataAjuizamento.value = '';
    elementos.comarca.value = '';
    elementos.tipoAcao.value = '';
    elementos.numContrato.value = '';
    elementos.tipoOperacao.value = '';
    elementos.valorCausa.value = '';
    elementos.qtdParcelas.value = '';
    elementos.valorParcela.value = '';
    elementos.observacoes.value = '';
    
    atualizarInterface();
    document.getElementById('statusTexto').innerHTML = `🟡 Novo acordo criado: ${numeroProcesso} (preencha os dados)`;
    alert('Novo acordo criado. Preencha os dados e eles serão salvos automaticamente.');
}

// Atualizar interface com dados atuais
function atualizarInterface() {
    if (!acordoAtual) return;
    
    const totalPago = pagamentosAtuais
        .filter(p => p.status === 'pago')
        .reduce((acc, p) => acc + p.valorPago, 0);
    
    const saldoAtual = acordoAtual.valorCausa - totalPago;
    
    elementos.valorDebito.innerText = `R$ ${acordoAtual.valorCausa.toFixed(2).replace('.', ',')}`;
    elementos.totalPago.innerText = `R$ ${totalPago.toFixed(2).replace('.', ',')}`;
    elementos.qtdParcelasResumo.innerText = acordoAtual.quantidadeParcelas || 0;
    elementos.valorParcelaResumo.innerText = `R$ ${(acordoAtual.valorParcela || 0).toFixed(2).replace('.', ',')}`;
    elementos.saldoDevedor.innerText = `R$ ${saldoAtual.toFixed(2).replace('.', ',')}`;
    
    renderizarTabela();
    
    // Próxima parcela
    const proximaPendente = pagamentosAtuais.find(p => p.status === 'pendente');
    if (proximaPendente) {
        elementos.proximaInfo.innerHTML = `⏳ Próxima parcela prevista: ${proximaPendente.mesReferencia} (Parcela ${proximaPendente.parcela}) - Valor: R$ ${(acordoAtual.valorParcela || 0).toFixed(2)}`;
    } else if (pagamentosAtuais.length > 0) {
        elementos.proximaInfo.innerHTML = '✅ Todas as parcelas quitadas! Acordo encerrado.';
    } else {
        elementos.proximaInfo.innerHTML = '📌 Nenhuma parcela registrada ainda. Preencha a quantidade de parcelas.';
    }
}

// Renderizar tabela de pagamentos
function renderizarTabela() {
    if (!acordoAtual) return;
    
    elementos.tbodyPagamentos.innerHTML = '';
    let saldoCorrente = acordoAtual.valorCausa;
    
    for (let p of pagamentosAtuais) {
        const row = document.createElement('tr');
        const dataRegistro = p.dataRegistro ? p.dataRegistro : '—';
        const statusClass = p.status === 'pago' ? 'status-badge status-pago' : 'status-badge';
        const statusText = p.status === 'pago' ? 'Pago' : 'Pendente';
        
        if (p.status === 'pago') {
            saldoCorrente -= p.valorPago;
        }
        
        row.innerHTML = `
            <td>${p.parcela}</td>
            <td>${p.mesReferencia}</td>
            <td>${dataRegistro}</td>
            <td>R$ ${p.valorPago.toFixed(2).replace('.', ',')}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>R$ ${saldoCorrente.toFixed(2).replace('.', ',')}</td>
        `;
        elementos.tbodyPagamentos.appendChild(row);
    }
    
    if (pagamentosAtuais.length === 0) {
        elementos.tbodyPagamentos.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum pagamento registrado</td></tr>';
    }
}

// Registrar pagamento
async function registrarPagamento() {
    if (!acordoAtual) {
        alert('Carregue ou crie um acordo primeiro!');
        return;
    }
    
    const mesRef = elementos.mesReferencia.value;
    if (!mesRef) {
        alert('Selecione o mês/ano de referência.');
        return;
    }
    
    const valorPago = parseFloat(elementos.valorPagoMes.value);
    if (isNaN(valorPago) || valorPago <= 0) {
        alert('Informe um valor válido maior que zero.');
        return;
    }
    
    const parcelaPendente = pagamentosAtuais.find(p => p.status === 'pendente');
    if (!parcelaPendente) {
        alert('Não há parcelas pendentes ou acordo finalizado!');
        return;
    }
    
    const hoje = new Date();
    const dataRegistro = `${hoje.getDate().toString().padStart(2,'0')}/${(hoje.getMonth()+1).toString().padStart(2,'0')}/${hoje.getFullYear()}`;
    
    parcelaPendente.status = 'pago';
    parcelaPendente.valorPago = valorPago;
    parcelaPendente.dataRegistro = dataRegistro;
    
    // Criar próxima parcela se necessário
    const ultimaParcela = Math.max(...pagamentosAtuais.map(p => p.parcela));
    if (ultimaParcela < acordoAtual.quantidadeParcelas) {
        const proximaNum = ultimaParcela + 1;
        const [ano, mes] = mesRef.split('-');
        const dataProxima = new Date(parseInt(ano), parseInt(mes), 1);
        dataProxima.setMonth(dataProxima.getMonth() + 1);
        const proximoMesRef = `${dataProxima.getFullYear()}/${(dataProxima.getMonth()+1).toString().padStart(2,'0')}`;
        
        const novaParcela = {
            parcela: proximaNum,
            mesReferencia: proximoMesRef,
            dataRegistro: null,
            valorPago: 0,
            status: "pendente"
        };
        pagamentosAtuais.push(novaParcela);
    }
    
    await salvarAcordo();
    atualizarInterface();
    elementos.valorPagoMes.value = '0.00';
    alert(`Pagamento da parcela ${parcelaPendente.parcela} registrado com sucesso!`);
}

// Buscar acordo
async function buscarAcordo() {
    const numProcesso = elementos.buscaProcesso.value.trim();
    if (!numProcesso) {
        alert('Digite o número do processo para buscar.');
        return;
    }
    
    // Salvar alterações do acordo atual antes de buscar outro
    if (acordoAtual && acordoAtual.numeroProcesso !== numProcesso) {
        const salvar = confirm('Deseja salvar o acordo atual antes de buscar outro?');
        if (salvar) {
            await salvarAcordo();
        }
    }
    
    await carregarAcordo(numProcesso);
}

// Atualizar dados do acordo nos campos editáveis
function atualizarDadosAcordo() {
    if (!acordoAtual) return;
    
    acordoAtual.cooperativa = {
        codigo: elementos.codigoCoop.value,
        nome: elementos.nomeCoop.value
    };
    acordoAtual.numeroProcesso = elementos.numeroProcesso.value;
    acordoAtual.parte = {
        nome: elementos.nomeParte.value,
        cpf: elementos.cpf.value
    };
    acordoAtual.dataAjuizamento = elementos.dataAjuizamento.value;
    acordoAtual.comarca = elementos.comarca.value;
    acordoAtual.tipoAcao = elementos.tipoAcao.value;
    acordoAtual.numeroContrato = elementos.numContrato.value;
    acordoAtual.tipoOperacao = elementos.tipoOperacao.value;
    acordoAtual.valorCausa = parseFloat(elementos.valorCausa.value) || 0;
    acordoAtual.quantidadeParcelas = parseInt(elementos.qtdParcelas.value) || 0;
    acordoAtual.valorParcela = parseFloat(elementos.valorParcela.value) || 0;
    
    // Se não tem parcelas e quantidade foi definida, criar a primeira
    if (pagamentosAtuais.length === 0 && acordoAtual.quantidadeParcelas > 0 && acordoAtual.valorParcela > 0) {
        const dataAtual = new Date();
        const mesAtual = `${dataAtual.getFullYear()}/${(dataAtual.getMonth()+1).toString().padStart(2,'0')}`;
        pagamentosAtuais.push({
            parcela: 1,
            mesReferencia: mesAtual,
            dataRegistro: null,
            valorPago: 0,
            status: "pendente"
        });
    }
}

// Ver histórico completo
function verHistorico() {
    if (!acordoAtual) {
        alert('Nenhum acordo carregado');
        return;
    }
    
    let historico = `HISTÓRICO COMPLETO - Acordo: ${acordoAtual.numeroProcesso}\n\n`;
    historico += `Valor Total: R$ ${acordoAtual.valorCausa.toFixed(2)}\n`;
    historico += `Total Pago: R$ ${pagamentosAtuais.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.valorPago, 0).toFixed(2)}\n`;
    historico += `Saldo Devedor: R$ ${(acordoAtual.valorCausa - pagamentosAtuais.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.valorPago, 0)).toFixed(2)}\n`;
    historico += `\n📋 DETALHES DAS PARCELAS:\n`;
    historico += `━`.repeat(50) + `\n`;
    
    pagamentosAtuais.forEach(p => {
        historico += `Parcela ${p.parcela}: ${p.mesReferencia} - R$ ${p.valorPago.toFixed(2)} - ${p.status}\n`;
        if (p.dataRegistro) historico += `   └─ Registrado em: ${p.dataRegistro}\n`;
    });
    
    alert(historico);
}

// Eventos
function setupEventListeners() {
    elementos.btnBuscar.addEventListener('click', buscarAcordo);
    elementos.btnNovoAcordo.addEventListener('click', novoAcordo);
    elementos.btnRegistrar.addEventListener('click', registrarPagamento);
    elementos.btnHistorico.addEventListener('click', verHistorico);
    
    // Salvar automaticamente ao perder foco dos campos
    const camposParaSalvar = ['codigoCoop', 'nomeCoop', 'numeroProcesso', 'nomeParte', 'cpf', 'dataAjuizamento', 'comarca', 'tipoAcao', 'numContrato', 'tipoOperacao', 'valorCausa', 'qtdParcelas', 'valorParcela', 'observacoes'];
    
    camposParaSalvar.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento) {
            elemento.addEventListener('change', () => {
                atualizarDadosAcordo();
                if (acordoAtual && acordoAtual.numeroProcesso) {
                    salvarAcordo();
                    atualizarInterface();
                }
            });
        }
    });
}

// Inicialização
function init() {
    setupEventListeners();
    // Carregar último acordo do localStorage se existir
    const ultimoProcesso = localStorage.getItem('ultimoAcordo');
    if (ultimoProcesso) {
        elementos.buscaProcesso.value = ultimoProcesso;
        carregarAcordo(ultimoProcesso);
    }
}

// Salvar último processo buscado
window.addEventListener('beforeunload', () => {
    if (acordoAtual && acordoAtual.numeroProcesso) {
        localStorage.setItem('ultimoAcordo', acordoAtual.numeroProcesso);
        if (acordoAtual.numeroProcesso) {
            salvarAcordo();
        }
    }
});

// Aguardar Firebase carregar
setTimeout(() => {
    init();
}, 500);