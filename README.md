# Algoritmo Genético para Otimização Contínua

## Visão Geral

Grupo: Saulo Rodrigues Brilhante e Daniel Victor 

Este projeto implementa um **Algoritmo Genético (AG)** completo utilizando **TypeScript** e **Node.js** para resolver um problema clássico de otimização contínua.

O objetivo é **maximizar** o valor da função $f(x)$ no espaço de busca $x \in [0, 100]$. O algoritmo simula a **seleção natural** para encontrar a solução de maior aptidão (fitness) ao longo de gerações.

### Função Objetivo (Fitness)

```math
f(x) = x \cdot \sin(x)
```

O ponto ótimo global esperado para esta função no intervalo $[0, 100]$ está próximo de $x \approx 95.8$, onde a função atinge seu valor máximo.

---

## Análise Matemática dos Parâmetros

Os Algoritmos Genéticos (AGs) são **heurísticas** que dependem da calibração de parâmetros para um desempenho eficiente. Ajustar esses valores afeta o equilíbrio entre a **exploração** (busca por novas soluções) e a **explotação** (refinar soluções boas já encontradas).

### 1. Efeito da Probabilidade de Mutação ($P_m$)

A mutação é uma pequena alteração aleatória aplicada a um indivíduo. No nosso caso, é uma **mutação aritmética** onde um valor $\delta$ (delta) aleatório no intervalo $[-\sigma, \sigma]$ é somado ao indivíduo.

* **Alto $P_m$ (Ex: 0.8):** Se a probabilidade de mutação for muito alta, a população se torna **instável**. A mutação excessiva destrói os genes (características) bons transmitidos pelo crossover, transformando o AG em uma **busca aleatória** (perde o foco na explotação).

* **Baixo $P_m$ (Ex: 0.001):** Se for muito baixa, o AG corre o risco de **convergir prematuramente** para um **ótimo local**. A mutação é essencial para introduzir diversidade e permitir que a população "salte" para fora de picos de baixa qualidade no gráfico.

### 2. Efeito da Probabilidade de Crossover ($P_c$)

O crossover (cruzamento) é o principal motor de **explotação** (combinação de soluções boas).

* **Alto $P_c$ (Ex: 0.95):** Prioriza a combinação de características dos pais. Geralmente, valores altos de $P_c$ (entre 0.8 e 0.95) são usados em problemas contínuos para garantir que os bons traços sejam misturados rapidamente.

* **Baixo $P_c$ (Ex: 0.5):** Se for muito baixo, a maioria dos indivíduos da nova geração será cópia exata dos pais, atrasando a convergência e o refinamento da solução.

---

## Estrutura do Código em TypeScript

O código é modularizado em funções claras, refletindo as etapas do ciclo de evolução do Algoritmo Genético.

### Parâmetros Principais

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `TAMANHO_POPULACAO` | 20 | Número de soluções em cada geração |
| `VALOR_MIN`, `VALOR_MAX` | 0, 100 | Limites do espaço de busca |
| `PC` | 0.8 | Probabilidade de Crossover |
| `PM` | 0.1 | Probabilidade de Mutação |
| `K_TORNEIO` | 2 | Número de competidores na Seleção por Torneio |
| `NUMERO_GERACOES` | 50 | Número de gerações para evolução |

---

## Funções Detalhadas

### 1. `calcularFitness(populacao: number[]): number[]`

**Propósito:** Avaliação da População

**Como funciona:**
```typescript
function calcularFitness(populacao: number[]): number[] {
    return populacao.map(x => round((x * sin(x)) as number, 4));
}
```

- Recebe um array de indivíduos (números)
- Para cada indivíduo `x`, calcula $f(x) = x \cdot \sin(x)$
- Arredonda o resultado para 4 casas decimais
- Retorna um array com o fitness de cada indivíduo
- Quanto maior o fitness, melhor o indivíduo

---

### 2. `torneio(fitness: number[], k: number): number`

**Propósito:** Selecionar um vencedor através de competição

**Como funciona:**
```typescript
function torneio(fitness: number[], k: number): number {
    const candidatos: number[] = [];
    
    // Sorteia k índices distintos
    while (candidatos.length < k) {
        const idx = Math.floor(Math.random() * fitness.length);
        if (!candidatos.includes(idx)) candidatos.push(idx);
    }
    
    // Encontra o candidato com maior fitness
    let vencedor = candidatos[0];
    for (const idx of candidatos.slice(1)) {
        if (fitness[idx] > fitness[vencedor]) vencedor = idx;
    }
    return vencedor;
}
```

**Passo a passo:**
1. Cria um array vazio para armazenar os candidatos
2. Sorteia `k` índices aleatórios e distintos da população
3. Compara o fitness de todos os candidatos
4. Retorna o índice do candidato com **maior fitness**
5. Este será um dos pais da próxima geração

---

### 3. `selecionarPais(populacao, fitness, k): [number[], number[]]`

**Propósito:** Seleção dos Pais via Torneio

**Como funciona:**
```typescript
function selecionarPais(populacao: number[], fitness: number[], k: number): [number[], number[]] {
    const pai1: number[] = [];
    const pai2: number[] = [];

    // Para cada posição da nova geração
    for (let i = 0; i < populacao.length; i++) {
        const p1 = torneio(fitness, k);        // Primeiro pai
        let p2 = torneio(fitness, k);          // Segundo pai
        while (p2 === p1) p2 = torneio(fitness, k);  // Garante pais diferentes
        
        pai1.push(p1);
        pai2.push(p2);
    }

    return [pai1, pai2];
}
```

**Passo a passo:**
1. Cria dois arrays vazios: `pai1` e `pai2`
2. Para cada posição da próxima geração (loop de tamanho da população):
   - Realiza um torneio para selecionar o primeiro pai
   - Realiza outro torneio para selecionar o segundo pai
   - Se os pais forem iguais, sorteia novamente até serem diferentes
3. Retorna dois arrays com os índices dos pais selecionados
4. Estes índices serão usados no crossover

---

### 4. `crossover(populacao, pai1, pai2, pc): number[]`

**Propósito:** Cruzamento Aritmético

**Como funciona:**
```typescript
function crossover(populacao: number[], pai1: number[], pai2: number[], pc: number): number[] {
    const filhos: number[] = [];

    for (let i = 0; i < populacao.length; i++) {
        const p1 = populacao[pai1[i]]!;  // Valor do primeiro pai
        const p2 = populacao[pai2[i]]!;  // Valor do segundo pai

        // Ocorre crossover com probabilidade pc
        if (Math.random() < pc) {
            const alpha = Math.random();  // Peso aleatório entre 0 e 1
            let filho = alpha * p1 + (1 - alpha) * p2;  // Combinação linear
            filho = max(VALOR_MIN, min(VALOR_MAX, filho)) as number;  // Limita aos bounds
            filhos.push(filho);
        } else {
            filhos.push(p1);  // Sem crossover, copia o primeiro pai
        }
    }

    return filhos;
}
```

**Fórmula do Crossover Aritmético:**
```math
\text{Filho} = \alpha \cdot \text{Pai}_1 + (1 - \alpha) \cdot \text{Pai}_2
```

**Passo a passo:**
1. Para cada par de pais:
   - Pega os valores reais dos pais usando os índices
   - Gera um número aleatório entre 0 e 1
   - Se este número for menor que `pc` (probabilidade de crossover):
     - Gera um peso aleatório $\alpha$ entre 0 e 1
     - Calcula o filho como combinação linear dos pais
     - Garante que o filho está dentro dos limites [0, 100]
   - Caso contrário, copia o primeiro pai
2. Retorna a nova população de filhos

---

### 5. `mutacao(populacao, pm): number[]`

**Propósito:** Introduzir Diversidade Genética

**Como funciona:**
```typescript
function mutacao(populacao: number[], pm: number): number[] {
    const mutados: number[] = [];
    const sigma = 0.05 * (VALOR_MAX - VALOR_MIN);  // 5% do espaço de busca

    for (const x of populacao) {
        // Ocorre mutação com probabilidade pm
        if (Math.random() < pm) {
            const delta = random(-sigma, sigma) as number;  // Perturbação aleatória
            let xMut = x + delta;  // Aplica a perturbação
            xMut = max(VALOR_MIN, min(VALOR_MAX, xMut)) as number;  // Limita aos bounds
            mutados.push(xMut);
        } else {
            mutados.push(x);  // Sem mutação, mantém o valor original
        }
    }
    return mutados;
}
```

**Cálculo da Mutação:**
```math
x_{mutado} = x + \delta, \quad \text{onde} \quad \delta \in [-\sigma, \sigma]
```

**Passo a passo:**
1. Calcula $\sigma$ como 5% do espaço de busca (neste caso, 5)
2. Para cada indivíduo:
   - Gera um número aleatório entre 0 e 1
   - Se este número for menor que `pm` (probabilidade de mutação):
     - Gera uma perturbação aleatória $\delta$ entre $[-\sigma, \sigma]$
     - Adiciona esta perturbação ao indivíduo
     - Garante que o resultado está dentro dos limites [0, 100]
   - Caso contrário, mantém o valor original
3. Retorna a população mutada

---

### 6. `aplicarElitismo(populacao, elite): number[]`

**Propósito:** Preservar a Melhor Solução

**Como funciona:**
```typescript
function aplicarElitismo(populacao: number[], elite: number): number[] {
    const fitness = calcularFitness(populacao);  // Avalia a nova população
    const piorFitness = min(...fitness) as number;  // Encontra o pior fitness
    const indicePior = fitness.indexOf(piorFitness);  // Encontra sua posição
    
    const novaPopulacao = [...populacao];  // Cria uma cópia
    novaPopulacao[indicePior] = elite;  // Substitui o pior pelo elite
    
    return novaPopulacao;
}
```

**Passo a passo:**
1. Calcula o fitness de todos os indivíduos da nova população
2. Identifica qual indivíduo tem o **pior fitness**
3. Encontra a posição (índice) deste pior indivíduo
4. Cria uma cópia da população
5. Substitui o pior indivíduo pelo **elite** (melhor da geração anterior)
6. Retorna a população com o elite preservado

**Por quê?** Isso garante que a melhor solução encontrada nunca seja perdida entre gerações.

---

### 7. `evoluirComEtapas(comElitismo): [number, number]`

**Propósito:** Loop Evolutivo Principal

**Fluxo de Execução:**

```typescript
function evoluirComEtapas(comElitismo: boolean): [number, number] {
    // 1. Inicializa população aleatória
    let populacao = Array.from({ length: TAMANHO_POPULACAO }, () => 
        random(VALOR_MIN, VALOR_MAX) as number
    );

    const historicoMelhorFitness: number[] = [];
    const historicoMelhorIndividuo: number[] = [];
    
    // 2. Loop de evolução
    for (let g = 0; g < NUMERO_GERACOES; g++) {
        // 2.1 Avaliação
        const fitness = calcularFitness(populacao);
        const melhorFitness = max(...fitness) as number;
        const indiceMelhor = fitness.indexOf(melhorFitness);
        const elite = populacao[indiceMelhor]!;
        
        // 2.2 Armazena histórico
        historicoMelhorFitness.push(melhorFitness);
        historicoMelhorIndividuo.push(elite);

        // 2.3 Seleção
        const [pai1, pai2] = selecionarPais(populacao, fitness, K_TORNEIO);

        // 2.4 Cruzamento
        const filhos = crossover(populacao, pai1, pai2, PC);

        // 2.5 Mutação
        const mutados = mutacao(filhos, PM);

        // 2.6 Elitismo (se ativo)
        if (comElitismo) {
            populacao = aplicarElitismo(mutados, elite);
        } else {
            populacao = mutados;
        }
    }

    // 3. Retorna a melhor solução global
    const melhorFitnessGeral = max(...historicoMelhorFitness) as number;
    const indiceGeral = historicoMelhorFitness.indexOf(melhorFitnessGeral);
    const melhorIndividuoGeral = historicoMelhorIndividuo[indiceGeral]!;

    return [round(melhorIndividuoGeral, 4) as number, round(melhorFitnessGeral, 4) as number];
}
```

**Ciclo Evolutivo:**

```
Geração 0: População Aleatória
           ↓
      ┌────────────────┐
      │  1. FITNESS    │ → Avalia todos os indivíduos
      └────────────────┘
           ↓
      ┌────────────────┐
      │  2. SELEÇÃO    │ → Escolhe pais por torneio
      └────────────────┘
           ↓
      ┌────────────────┐
      │  3. CROSSOVER  │ → Gera filhos combinando pais
      └────────────────┘
           ↓
      ┌────────────────┐
      │  4. MUTAÇÃO    │ → Introduz variação aleatória
      └────────────────┘
           ↓
      ┌────────────────┐
      │  5. ELITISMO   │ → Preserva o melhor (se ativo)
      └────────────────┘
           ↓
      (Volta ao passo 1 até completar NUMERO_GERACOES)
```

---

## Experimento: Comparação COM e SEM Elitismo

```typescript
function executarExperimento(): void {
    const numExecucoes = 4;
    
    // Executa 4 rodadas COM elitismo
    const resultadosCom: [number, number][] = [];
    for (let i = 0; i < numExecucoes; i++) {
        resultadosCom.push(evoluirComEtapas(true));
    }

    // Executa 4 rodadas SEM elitismo
    const resultadosSem: [number, number][] = [];
    for (let i = 0; i < numExecucoes; i++) {
        resultadosSem.push(evoluirComEtapas(false));
    }

    // Calcula e exibe as médias
    const mediaCom = resultadosCom.reduce((sum, [_, fit]) => sum + fit, 0) / numExecucoes;
    const mediaSem = resultadosSem.reduce((sum, [_, fit]) => sum + fit, 0) / numExecucoes;
}
```

**O que é testado:**
- **COM Elitismo:** O melhor indivíduo sempre é preservado
- **SEM Elitismo:** A população evolui sem garantia de preservar o melhor

**Resultado Esperado:**
- Elitismo geralmente produz melhores resultados e maior estabilidade
- Sem elitismo pode explorar mais, mas pode perder boas soluções

---

## Como Executar

```bash
# Instalar dependências
npm install mathjs

# Executar o código
npx ts-node algoritmo-genetico.ts
```

---

## Referências

- Goldberg, D. E. (1989). *Genetic Algorithms in Search, Optimization, and Machine Learning*
- Mitchell, M. (1998). *An Introduction to Genetic Algorithms*
- Eiben, A. E., & Smith, J. E. (2015). *Introduction to Evolutionary Computing*
