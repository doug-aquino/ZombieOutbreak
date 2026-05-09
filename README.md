# 🧟‍♂️ Resgate Zumbi: Pathfinding & IA (Arcade Edition)

Uma aplicação web interativa desenvolvida com JavaScript puro (Vanilla JS) para simular, visualizar e comparar algoritmos clássicos de busca em Inteligência Artificial (Pathfinding) aplicados a um cenário de apocalipse zumbi.

O projeto apresenta uma interface temática de fliperama retrô (CRT/Biohazard) onde o usuário posiciona agentes e analisa como diferentes algoritmos e heurísticas se comportam ao traçar rotas de fuga em terrenos com custos variados.

## 🎮 Como Funciona

O sistema gera um labirinto (grid 30x30) com obstáculos de diferentes níveis de perigo (custos). O objetivo é deslocar o Ponto A (Humano/Sobrevivente) até o Ponto B (Extração) utilizando o caminho mais otimizado ou o mais rápido, dependendo da estratégia matemática selecionada.

### Tipos de Terreno (Custos)
*   ⬛ **Asfalto (Custo 1):** Caminho livre e rápido.
*   🟫 **Sangue/Lama (Custo 2):** Atrasa o movimento.
*   🪙 **Escombros (Custo 3):** Terreno difícil.
*   🟦 **Cratera (Custo 5):** Alto risco e grande penalidade de tempo.
*   🟥 **Horda Zumbi (Custo Infinito):** Bloqueio total (parede intransponível).

## 🧠 Algoritmos Implementados

O motor lógico do jogo foi construído para demonstrar a diferença prática entre buscas informadas ótimas e buscas gulosas.

### 1. Busca A* (A-Estrela Tático)
Garante sempre a melhor rota possível (menor custo final). Ele calcula o custo real gasto até o momento ($g$) somado à estimativa heurística até o destino ($h$).
*   **Vantagem:** Rota 100% segura e otimizada.
*   **Desvantagem:** Exige mais tempo de processamento e expande mais nós (setores vasculhados).

### 2. Busca Gulosa (Greedy Search)
Toma decisões baseadas *exatamente* e *apenas* na heurística, ignorando o perigo/custo real do chão. Ele sempre tenta dar o passo que o deixa geometricamente mais perto do destino.
*   **Vantagem:** Extremamente rápido, processamento quase instantâneo.
*   **Desvantagem:** Pode criar rotas perigosas e ineficientes por não avaliar o terreno.

## 🧭 Heurísticas (O Radar)

Duas heurísticas foram modeladas matematicamente para atuar como o "radar" do agente:

*   **Radar Forte (Distância de Manhattan):** 
    Calcula a distância em ângulos retos ($|x_1 - x_2| + |y_1 - y_2|$). Como o agente só se move em 4 direções, esta heurística é uma estimativa muito precisa e admissível, guiando o algoritmo A* perfeitamente.
    
*   **Radar Fraco (Distância Euclidiana Distorcida):** 
    Utiliza o Teorema de Pitágoras para traçar uma linha reta, mas sofre um fator de distorção (desconto de $0.8$ ou $80\%$). Isso força o radar a subestimar gravemente a distância, obrigando o algoritmo A* a explorar muitos caminhos errados (becos sem saída) antes de encontrar a solução.

## 📊 Análise de Desempenho

A aplicação conta com integração à biblioteca **Chart.js**, permitindo ao usuário rodar todas as combinações (Algoritmo + Heurística) simultaneamente. 
Os resultados são compilados em uma "Janela de Relatório", gerando tabelas e gráficos comparativos de:
1.  **Perigo Total:** O custo somado da rota de fuga.
2.  **Setores Vasculhados:** Quantidade de nós processados na memória.
3.  **Tempo (ms):** Velocidade computacional em milissegundos para fechar o cálculo.

## 🚀 Como Executar Localmente

Como o projeto é construído totalmente no front-end e sem dependências de frameworks pesados, a execução é imediata:

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/resgate-zumbi-algoritmos.git](https://github.com/SEU-USUARIO/resgate-zumbi-algoritmos.git)

2. Navegue até a pasta do projeto.

3.Dê um duplo clique no arquivo index.html para abri-lo diretamente no seu navegador padrão.   
