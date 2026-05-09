// Constantes e Variáveis Globais
const TAMANHO_MATRIZ = 30;
const TABELA_CUSTOS = {
    normal: 1,
    sangue: 2,
    escombros: 3,
    buraco: 5,
    zumbi: Infinity
};

let matrizElementosDOM = [];
let matrizCustos = [];
let posicaoHumano = null; 
let posicaoSobrevivente = null; 
let estadoSelecaoClique = 'selecionarHumano'; 
let instanciaGrafico = null;

const esperarPausa = (milisegundos) => new Promise(resolver => setTimeout(resolver, milisegundos));

function obterAtrasoAnimacao() {
    const valorBarra = document.getElementById('velocidade').value;
    return 201 - valorBarra;
}

function inicializarTabuleiro() {
    const elementoTabuleiro = document.getElementById('tabuleiro');
    elementoTabuleiro.innerHTML = '';
    matrizElementosDOM = [];
    matrizCustos = [];
    posicaoHumano = null;
    posicaoSobrevivente = null;
    estadoSelecaoClique = 'selecionarHumano';
    limparEstatisticas();

    for (let linha = 0; linha < TAMANHO_MATRIZ; linha++) {
        let linhaElementosDOM = [];
        let linhaCustos = [];
        for (let coluna = 0; coluna < TAMANHO_MATRIZ; coluna++) {
            const celulaDOM = document.createElement('div');
            celulaDOM.classList.add('celula', 'normal');
            celulaDOM.addEventListener('click', () => processarCliqueCelula(linha, coluna));
            elementoTabuleiro.appendChild(celulaDOM);
            linhaElementosDOM.push(celulaDOM);
            linhaCustos.push('normal');
        }
        matrizElementosDOM.push(linhaElementosDOM);
        matrizCustos.push(linhaCustos);
    }
}

function processarCliqueCelula(linha, coluna) {
    if (matrizCustos[linha][coluna] === 'zumbi') return;
    
    if (estadoSelecaoClique === 'selecionarHumano') {
        if (posicaoHumano) matrizElementosDOM[posicaoHumano.linha][posicaoHumano.coluna].classList.remove('ponto-a');
        posicaoHumano = { linha: linha, coluna: coluna };
        matrizElementosDOM[linha][coluna].classList.add('ponto-a');
        estadoSelecaoClique = 'selecionarSobrevivente';
    } else if (estadoSelecaoClique === 'selecionarSobrevivente') {
        if (linha === posicaoHumano.linha && coluna === posicaoHumano.coluna) return;
        if (posicaoSobrevivente) matrizElementosDOM[posicaoSobrevivente.linha][posicaoSobrevivente.coluna].classList.remove('ponto-b');
        posicaoSobrevivente = { linha: linha, coluna: coluna };
        matrizElementosDOM[linha][coluna].classList.add('ponto-b');
        estadoSelecaoClique = 'bloqueado';
    } else {
        limparRastroVisuais();
        if(posicaoHumano) matrizElementosDOM[posicaoHumano.linha][posicaoHumano.coluna].classList.remove('ponto-a');
        if(posicaoSobrevivente) matrizElementosDOM[posicaoSobrevivente.linha][posicaoSobrevivente.coluna].classList.remove('ponto-b');
        posicaoHumano = { linha: linha, coluna: coluna };
        posicaoSobrevivente = null;
        matrizElementosDOM[linha][coluna].classList.add('ponto-a');
        estadoSelecaoClique = 'selecionarSobrevivente';
    }
}

function gerarLabirintoAleatorio() {
    inicializarTabuleiro();
    const listaTipos = [
        { tipo: 'normal', probabilidade: 0.55 }, 
        { tipo: 'sangue', probabilidade: 0.15 },
        { tipo: 'escombros', probabilidade: 0.10 }, 
        { tipo: 'buraco', probabilidade: 0.05 },
        { tipo: 'zumbi', probabilidade: 0.15 }
    ];
    for (let linha = 0; linha < TAMANHO_MATRIZ; linha++) {
        for (let coluna = 0; coluna < TAMANHO_MATRIZ; coluna++) {
            let numeroSorteado = Math.random();
            let somaProbabilidade = 0;
            let tipoSelecionado = 'normal';
            for (let item of listaTipos) {
                somaProbabilidade += item.probabilidade;
                if (numeroSorteado <= somaProbabilidade) { 
                    tipoSelecionado = item.tipo; 
                    break; 
                }
            }
            matrizCustos[linha][coluna] = tipoSelecionado;
            matrizElementosDOM[linha][coluna].className = `celula ${tipoSelecionado}`;
        }
    }
}

function limparRastroVisuais() {
    for (let linha = 0; linha < TAMANHO_MATRIZ; linha++) {
        for (let coluna = 0; coluna < TAMANHO_MATRIZ; coluna++) {
            matrizElementosDOM[linha][coluna].classList.remove('visitado', 'caminho');
        }
    }
    document.getElementById('mensagem-alerta').innerText = "";
}

function limparEstatisticas() {
    document.getElementById('texto-nos-expandidos').innerText = "0";
    document.getElementById('texto-custo-caminho').innerText = "0";
    document.getElementById('texto-tempo-processamento').innerText = "0";
}

function calcularHeuristicaForte(origem, destino) { 
    return Math.abs(origem.linha - destino.linha) + Math.abs(origem.coluna - destino.coluna); 
}

function calcularHeuristicaFraca(origem, destino) { 
    return Math.sqrt(Math.pow((origem.linha - destino.linha), 2) + Math.pow((origem.coluna - destino.coluna), 2)) * 0.3; 
}

function pegarVizinhos(noAtual) {
    const listaVizinhos = [];
    const listaDirecoes = [{linha: -1, coluna: 0}, {linha: 1, coluna: 0}, {linha: 0, coluna: -1}, {linha: 0, coluna: 1}];
    
    for (let direcao of listaDirecoes) {
        let novaLinha = noAtual.linha + direcao.linha;
        let novaColuna = noAtual.coluna + direcao.coluna;
        
        if (novaLinha >= 0 && novaLinha < TAMANHO_MATRIZ && novaColuna >= 0 && novaColuna < TAMANHO_MATRIZ) {
            let tipoTerreno = matrizCustos[novaLinha][novaColuna];
            if (TABELA_CUSTOS[tipoTerreno] !== Infinity) {
                listaVizinhos.push({ linha: novaLinha, coluna: novaColuna, custoPasso: TABELA_CUSTOS[tipoTerreno] });
            }
        }
    }
    return listaVizinhos;
}

async function executarAlgoritmoBusca(tipoAlgoritmo, tipoHeuristica, deveAnimar) {
    if (!posicaoHumano || !posicaoSobrevivente) return null;
    
    const tempoInicio = performance.now();
    let quantidadeNosExpandidos = 0;
    let listaAberta = [];
    let matrizVisitados = Array.from({length: TAMANHO_MATRIZ}, () => Array(TAMANHO_MATRIZ).fill(false));
    let mapaVeioDe = new Map();
    let mapaCustoG = new Map();
    
    const criarChave = (linha, coluna) => `${linha}-${coluna}`;
    const chaveInicio = criarChave(posicaoHumano.linha, posicaoHumano.coluna);
    const chaveDestino = criarChave(posicaoSobrevivente.linha, posicaoSobrevivente.coluna);
    
    mapaCustoG.set(chaveInicio, 0);
    listaAberta.push({ linha: posicaoHumano.linha, coluna: posicaoHumano.coluna, custoG: 0, custoF: 0 });

    while (listaAberta.length > 0) {
        listaAberta.sort((noA, noB) => noA.custoF - noB.custoF);
        let noAtual = listaAberta.shift();
        let chaveAtual = criarChave(noAtual.linha, noAtual.coluna);

        if (matrizVisitados[noAtual.linha][noAtual.coluna]) continue;
        matrizVisitados[noAtual.linha][noAtual.coluna] = true;
        quantidadeNosExpandidos++;

        if (deveAnimar) {
            if (chaveAtual !== chaveInicio && chaveAtual !== chaveDestino) {
                matrizElementosDOM[noAtual.linha][noAtual.coluna].classList.add('visitado');
                await esperarPausa(obterAtrasoAnimacao());
            }
            document.getElementById('texto-nos-expandidos').innerText = quantidadeNosExpandidos;
        }

        if (chaveAtual === chaveDestino) {
            let caminhoFinal = [];
            let passoAtual = chaveDestino;
            while (mapaVeioDe.has(passoAtual)) { 
                caminhoFinal.push(passoAtual); 
                passoAtual = mapaVeioDe.get(passoAtual); 
            }
            return { 
                sucesso: true, 
                caminhoTrilha: caminhoFinal.reverse(), 
                quantidadeNos: quantidadeNosExpandidos, 
                custoTotal: mapaCustoG.get(chaveDestino), 
                tempoProcessamento: performance.now() - tempoInicio, 
                matrizVisitas: matrizVisitados 
            };
        }

        for (let vizinho of pegarVizinhos(noAtual)) {
            let chaveVizinho = criarChave(vizinho.linha, vizinho.coluna);
            if (matrizVisitados[vizinho.linha][vizinho.coluna]) continue;
            
            let custoGProvisorio = mapaCustoG.get(chaveAtual) + vizinho.custoPasso;
            let custoGConhecido = mapaCustoG.has(chaveVizinho) ? mapaCustoG.get(chaveVizinho) : Infinity;

            if (tipoAlgoritmo === 'gulosa' || custoGProvisorio < custoGConhecido) {
                mapaVeioDe.set(chaveVizinho, chaveAtual);
                mapaCustoG.set(chaveVizinho, custoGProvisorio);
                
                let valorHeuristica = (tipoHeuristica === 'forte') ? calcularHeuristicaForte(vizinho, posicaoSobrevivente) : calcularHeuristicaFraca(vizinho, posicaoSobrevivente);
                let calculoCustoF = (tipoAlgoritmo === 'a-estrela') ? custoGProvisorio + valorHeuristica : valorHeuristica;
                
                listaAberta.push({ linha: vizinho.linha, coluna: vizinho.coluna, custoG: custoGProvisorio, custoF: calculoCustoF });
            }
        }
    }
    return { sucesso: false, quantidadeNos: quantidadeNosExpandidos, tempoProcessamento: performance.now() - tempoInicio };
}

async function iniciarResgate() {
    if (!posicaoHumano || !posicaoSobrevivente) return alert("INSIRA A FICHA: Posicione A e B primeiro!");
    
    limparRastroVisuais();
    const selecionadoAlgoritmo = document.getElementById('selecao-algoritmo').value;
    const selecionadoHeuristica = document.getElementById('selecao-heuristica').value;

    let resultadoBusca = await executarAlgoritmoBusca(selecionadoAlgoritmo, selecionadoHeuristica, true);

    if (resultadoBusca.sucesso) {
        for (let pontoTrilha of resultadoBusca.caminhoTrilha) {
            let partesCoordenada = pontoTrilha.split('-');
            let linhaTrilha = Number(partesCoordenada[0]);
            let colunaTrilha = Number(partesCoordenada[1]);
            
            if (!(linhaTrilha === posicaoSobrevivente.linha && colunaTrilha === posicaoSobrevivente.coluna)) {
                matrizElementosDOM[linhaTrilha][colunaTrilha].classList.add('caminho');
                await esperarPausa(obterAtrasoAnimacao());
            }
        }
        document.getElementById('texto-custo-caminho').innerText = resultadoBusca.custoTotal;
        document.getElementById('texto-tempo-processamento').innerText = resultadoBusca.tempoProcessamento.toFixed(2);
    } else {
        document.getElementById('mensagem-alerta').innerText = "GAME OVER: Caminho Bloqueado!";
    }
}

function abrirJanelaRelatorio() {
    document.getElementById('fundo-modal').classList.remove('oculto');
}

function fecharJanelaRelatorio() {
    document.getElementById('fundo-modal').classList.add('oculto');
}

async function compararAlgoritmos() {
    if (!posicaoHumano || !posicaoSobrevivente) return alert("INSIRA A FICHA: Posicione A e B primeiro!");
    
    const cenariosComparacao = [
        { idAlgoritmo: 'a-estrela', idHeuristica: 'forte', nomeApresentacao: 'A* Forte' }, 
        { idAlgoritmo: 'a-estrela', idHeuristica: 'fraca', nomeApresentacao: 'A* Fraca' },
        { idAlgoritmo: 'gulosa', idHeuristica: 'forte', nomeApresentacao: 'Gulosa Forte' }, 
        { idAlgoritmo: 'gulosa', idHeuristica: 'fraca', nomeApresentacao: 'Gulosa Fraca' }
    ];
    
    const elementoCorpoTabela = document.getElementById('corpo-tabela-comparacao');
    elementoCorpoTabela.innerHTML = '';
    
    let listaRotulosGrafico = []; 
    let listaCustosGrafico = []; 
    let listaNosGrafico = [];

    for (let cenario of cenariosComparacao) {
        let resultadoAnalise = await executarAlgoritmoBusca(cenario.idAlgoritmo, cenario.idHeuristica, false);
        
        let textoCusto = resultadoAnalise.sucesso ? resultadoAnalise.custoTotal : 'FALHA';
        let textoTempo = resultadoAnalise.tempoProcessamento.toFixed(2);
        
        elementoCorpoTabela.innerHTML += `<tr>
            <td>${cenario.idAlgoritmo.toUpperCase()}</td>
            <td>${cenario.idHeuristica.toUpperCase()}</td>
            <td>${textoCusto}</td>
            <td>${resultadoAnalise.quantidadeNos}</td>
            <td>${textoTempo}</td>
        </tr>`;
        
        listaRotulosGrafico.push(cenario.nomeApresentacao); 
        listaCustosGrafico.push(resultadoAnalise.sucesso ? resultadoAnalise.custoTotal : 0); 
        listaNosGrafico.push(resultadoAnalise.quantidadeNos);
    }
    
    abrirJanelaRelatorio();
    renderizarGraficoAnalise(listaRotulosGrafico, listaCustosGrafico, listaNosGrafico);
}

function renderizarGraficoAnalise(rotulos, dadosCusto, dadosNos) {
    const contextoCanvas = document.getElementById('grafico-comparacao').getContext('2d');
    if (instanciaGrafico) instanciaGrafico.destroy();
    
    Chart.defaults.color = '#0ff'; // Fonte Neon para o gráfico
    Chart.defaults.font.family = "'Press Start 2P', cursive";
    Chart.defaults.font.size = 8;

    instanciaGrafico = new Chart(contextoCanvas, {
        type: 'bar',
        data: {
            labels: rotulos,
            datasets: [
                { 
                    label: 'CUSTO TOTAL', 
                    data: dadosCusto, 
                    backgroundColor: 'rgba(255, 0, 127, 0.8)', 
                    borderColor: '#ff007f',
                    borderWidth: 2,
                    yAxisID: 'eixoEsquerdo' 
                },
                { 
                    label: 'NOS EXPANDIDOS', 
                    data: dadosNos, 
                    backgroundColor: 'rgba(0, 255, 255, 0.8)', 
                    borderColor: '#0ff',
                    borderWidth: 2,
                    yAxisID: 'eixoDireito' 
                }
            ]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                eixoEsquerdo: { 
                    type: 'linear', position: 'left',
                    grid: { color: '#333' }
                }, 
                eixoDireito: { 
                    type: 'linear', position: 'right', 
                    grid: { drawOnChartArea: false } 
                },
                x: { grid: { color: '#333' } }
            } 
        }
    });
}

function zerarEstatisticas() {
    const elementoCorpoTabela = document.getElementById('corpo-tabela-comparacao');
    elementoCorpoTabela.innerHTML = '';
    
    if (instanciaGrafico) {
        instanciaGrafico.destroy();
        instanciaGrafico = null; // Limpa a variável
    }

    limparEstatisticas();
}
window.onload = inicializarTabuleiro;