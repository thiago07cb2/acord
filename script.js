// script.js - Gerenciamento completo com Firebase

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
    btnHistorico: document.getElementById('btnHistorico'),
    statusTexto: document.getElementById('statusTexto')
};

// Aguardar Firebase carregar
function aguardarFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseHelpers && window.db) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.firebaseHelpers && window.db) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// Atualizar status bar (com verificação de segurança)
function atualizarStatusBar(mensagem, cor = '#1f8a6e') {
    if (elementos.statusTexto) {
        elementos.statusTexto.innerHTML = mensagem;
        elementos.statusTexto.style.color = cor;
    } else {
        console.log('Status:', mensagem);
    }
}

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
            if (elementos.codigoCoop) elementos.codigoCoop.value = acordoAtual.cooperativa?.codigo || '';
            if (elementos.nomeCoop) elementos.nomeCoop.value = acordoAtual.cooperativa?.nome || '';
            if (elementos.numeroProcesso) elementos.numeroProcesso.value = acordoAtual.numeroProcesso || '';
            if (elementos.nomeParte) elementos.nomeParte.value = acordoAtual.parte?.nome || '';
            if (elementos.cpf) elementos.cpf.value = acordoAtual.parte?.cpf || '';
            if (elementos.dataAjuizamento) elementos.dataAjuizamento.value = acordoAtual.dataAjuizamento || '';
            if (elementos.comarca) elementos.comarca.value = acordoAtual.comarca || '';
            if (elementos.tipoAcao) elementos.tipoAcao.value = acordoAtual.tipoAcao || '';
            if (elementos.numContrato) elementos.numContrato.value = acordoAtual.numeroContrato || '';
            if (elementos.tipoOperacao) elementos.tipoOperacao.value = acordoAtual.tipoOperacao || '';
            if (elementos.valorCausa) elementos.valorCausa.value = acordoAtual.valorCausa || 0;
            if (elementos.qtdParcelas) elementos.qtdParcelas.value = acordoAtual.quantidadeParcelas || 0;
            if (elementos.valorParcela) elementos.valorParcela.value = acordoAtual.valorParcela || 0;
            if (elementos.observacoes) elementos.observacoes.value = data.observacoes || '';
            
            atualizarInterface();
            atualizarStatusBar(`🟢 Acordo carregado: ${numeroProcesso}`);
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
        return false;
    }
    
    try {
        const { doc, setDoc } = window.firebaseHelpers;
        const docRef = doc(window.db, 'acordos', acordoAtual.numeroProcesso);
        
        const dadosParaSalvar = {
            acordo: acordoAtual,
            pagamentos: pagamentosAtuais,
            observacoes: elementos.observacoes ? elementos.observacoes.value : '',
            ultimaAtualizacao: new Date().toISOString()
        };
        
        await setDoc(docRef, dadosParaSalvar);
        atualizarStatusBar(`✅ Acordo salvo em: ${new Date().toLocaleTimeString()}`, '#28a745');
        setTimeout(() => {
            atualizarStatusBar(`🟢 Acordo ativo: ${acordoAtual.numeroProcesso}`);
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
    if (elementos.codigoCoop) elementos.codigoCoop.value = '';
    if (elementos.nomeCoop) elementos.nomeCoop.value = '';
    if (elementos.numeroProcesso) elementos.numeroProcesso.value = numeroProcesso;
    if (elementos.nomeParte) elementos.nomeParte.value = '';
    if (elementos.cpf) elementos.cpf.value = '';
    if (elementos.dataAjuizamento) elementos.dataAjuizamento.value = '';
    if (elementos.comarca) elementos.comarca.value = '';
    if (elementos.tipoAcao) elementos.tipoAcao.value = '';
    if (elementos.numContrato) elementos.numContrato.value = '';
    if (elementos.tipoOperacao) elementos.tipoOperacao.value = '';
    if (elementos.valorCausa) elementos.valorCausa.value = '';
    if (elementos.qtdParcelas) elementos.qtdParcelas.value = '';
    if (elementos.valorParcela) elementos.valorParcela.value = '';
    if (elementos.observacoes) elementos.observacoes.value = '';
    
    atualizarInterface();
    atualizarStatusBar(`🟡 Novo acordo criado: ${numeroProcesso} (preencha os dados)`, '#ffc107');
    alert('Novo acordo criado. Preencha os dados e eles serão salvos automaticamente.');
}

// Atualizar interface com dados atuais
function atualizarInterface() {
    if (!acordoAtual) return;
    
    const totalPago = pagamentosAtuais
        .filter(p => p.status === 'pago')
        .reduce((acc, p) => acc + p.valorPago, 0);
    
    const saldoAtual = acordoAtual.valorCausa - totalPago;
    
    if (elementos.valorDebito) elementos.valorDebito.innerText = `R$ ${acordoAtual.valorCausa.toFixed(2).replace('.', ',')}`;
    if (elementos.totalPago) elementos.totalPago.innerText = `R$ ${totalPago.toFixed(2).replace('.', ',')}`;
    if (elementos.qtdParcelasResumo) elementos.qtdParcelasResumo.innerText = acordoAtual.quantidadeParcelas || 0;
    if (elementos.valorParcelaResumo) elementos.valorParcelaResumo.innerText = `R$ ${(acordoAtual.valorParcela || 0).toFixed(2).replace('.', ',')}`;
    if (elementos.saldoDevedor) elementos.saldoDevedor.innerText = `R$ ${saldoAtual.toFixed(2).replace('.', ',')}`;
    
    renderizarTabela();
    
    // Próxima parcela
    const proximaPendente = pagamentosAtuais.find(p => p.status === 'pendente');
    if (elementos.proximaInfo) {
        if (proximaPendente) {
            elementos.proximaInfo.innerHTML = `⏳ Próxima parcela prevista: ${proximaPendente.mesReferencia} (Parcela ${proximaPendente.parcela}) - Valor: R$ ${(acordoAtual.valorParcela || 0).toFixed(2)}`;
        } else if (pagamentosAtuais.length > 0) {
            elementos.proximaInfo.innerHTML = '✅ Todas as parcelas quitadas! Acordo encerrado.';
        } else {
            elementos.proximaInfo.innerHTML = '📌 Nenhuma parcela registrada ainda. Preencha a quantidade de parcelas.';
        }
    }
}

// Renderizar tabela de pagamentos
function renderizarTabela() {
    if (!acordoAtual || !elementos.tbodyPagamentos) return;
    
    elementos.tbodyPagamentos.innerHTML = '';
    let saldoCorrente = acordoAtual.valorCausa;
    
    if (pagamentosAtuais.length === 0) {
        elementos.tbodyPagamentos.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum pagamento registrado</td></tr>';
        return;
    }
    
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
}

// Registrar pagamento
async function registrarPagamento() {
    if (!acordoAtual) {
        alert('Carregue ou crie um acordo primeiro!');
        return;
    }
    
    if (!elementos.mesReferencia || !elementos.valorPagoMes) {
        alert('Elementos do formulário não encontrados');
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
    if (elementos.valorPagoMes) elementos.valorPagoMes.value = '0.00';
    alert(`Pagamento da parcela ${parcelaPendente.parcela} registrado com sucesso!`);
}

// Buscar acordo
async function buscarAcordo() {
    if (!elementos.buscaProcesso) return;
    
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
        codigo: elementos.codigoCoop ? elementos.codigoCoop.value : '',
        nome: elementos.nomeCoop ? elementos.nomeCoop.value : ''
    };
    acordoAtual.numeroProcesso = elementos.numeroProcesso ? elementos.numeroProcesso.value : '';
    acordoAtual.parte = {
        nome: elementos.nomeParte ? elementos.nomeParte.value : '',
        cpf: elementos.cpf ? elementos.cpf.value : ''
    };
    acordoAtual.dataAjuizamento = elementos.dataAjuizamento ? elementos.dataAjuizamento.value : '';
    acordoAtual.comarca = elementos.comarca ? elementos.comarca.value : '';
    acordoAtual.tipoAcao = elementos.tipoAcao ? elementos.tipoAcao.value : '';
    acordoAtual.numeroContrato = elementos.numContrato ? elementos.numContrato.value : '';
    acordoAtual.tipoOperacao = elementos.tipoOperacao ? elementos.tipoOperacao.value : '';
    acordoAtual.valorCausa = elementos.valorCausa ? parseFloat(elementos.valorCausa.value) || 0 : 0;
    acordoAtual.quantidadeParcelas = elementos.qtdParcelas ? parseInt(elementos.qtdParcelas.value) || 0 : 0;
    acordoAtual.valorParcela = elementos.valorParcela ? parseFloat(elementos.valorParcela.value) || 0 : 0;
    
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
    if (elementos.btnBuscar) elementos.btnBuscar.addEventListener('click', buscarAcordo);
    if (elementos.btnNovoAcordo) elementos.btnNovoAcordo.addEventListener('click', novoAcordo);
    if (elementos.btnRegistrar) elementos.btnRegistrar.addEventListener('click', registrarPagamento);
    if (elementos.btnHistorico) elementos.btnHistorico.addEventListener('click', verHistorico);
    
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
async function init() {
    await aguardarFirebase();
    setupEventListeners();
    
    // Carregar último acordo do localStorage se existir
    const ultimoProcesso = localStorage.getItem('ultimoAcordo');
    if (ultimoProcesso && elementos.buscaProcesso) {
        elementos.buscaProcesso.value = ultimoProcesso;
        await carregarAcordo(ultimoProcesso);
    }
    
    atualizarStatusBar('🟢 Sistema pronto!');
}

// Salvar último processo buscado
window.addEventListener('beforeunload', () => {
    if (acordoAtual && acordoAtual.numeroProcesso) {
        localStorage.setItem('ultimoAcordo', acordoAtual.numeroProcesso);
        salvarAcordo();
    }
});

// Iniciar aplicação
init();
