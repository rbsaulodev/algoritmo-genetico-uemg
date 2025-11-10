# Algoritmo Genético (AG) para Otimização Contínua

## Visão Geral

[cite_start]Este projeto implementa um **Algoritmo Genético (AG)** [cite: 113, 167, 180, 681] completo utilizando **TypeScript** e **Node.js** para resolver um problema clássico de otimização contínua.

[cite_start]O objetivo é **maximizar** o valor da função $f(x)$ [cite: 12] [cite_start]no espaço de busca $x \in [0, 100]$[cite: 13, 263, 374, 513]. [cite_start]O algoritmo simula a **seleção natural** [cite: 168, 173] para encontrar a solução de maior aptidão (fitness) ao longo de gerações.

### Função Objetivo (Fitness)

[cite_start]$$f(x) = x \sin(x)$$ [cite: 11, 263, 374, 511]

O ponto ótimo global esperado para esta função no intervalo $[0, 100]$ está próximo do valor de $x$ em que $\sin(x) \approx 1$ e $x$ é máximo, ou seja, próximo de $x \approx 95.8$ (onde $x$ maximiza a função).

---

## Análise Matemática dos Parâmetros

[cite_start]Os Algoritmos Genéticos (AGs) são **heurísticas** [cite: 157, 733] que dependem da calibração de parâmetros para um desempenho eficiente. Ajustar esses valores afeta o equilíbrio entre a **exploração** (busca por novas soluções) e a **explotação** (refinar soluções boas já encontradas).

### 1. Efeito da Probabilidade de Mutação ($P_m$)

[cite_start]A mutação é uma pequena alteração aleatória aplicada a um indivíduo[cite: 177, 186, 301]. [cite_start]No nosso caso, é uma **mutação aritmética** [cite: 319, 322] [cite_start]onde um valor $\delta$ (delta) aleatório no intervalo $[-\sigma, \sigma]$ é somado ao indivíduo[cite: 319].

* [cite_start]**Alto $P_m$ (Ex: $0.8$):** Se a probabilidade de mutação for muito alta, a população se torna **instável**[cite: 346]. A mutação excessiva destrói os *genes* (características) bons transmitidos pelo crossover, transformando o AG em uma **busca aleatória** (perde o foco na explotação).
* [cite_start]**Baixo $P_m$ (Ex: $0.001$):** Se for muito baixa, o AG corre o risco de **convergir prematuramente** [cite: 302] [cite_start]para um **ótimo local**[cite: 347, 349]. [cite_start]A mutação é essencial para introduzir diversidade e permitir que a população "salte" para fora de picos de baixa qualidade no gráfico[cite: 349].

### 2. Efeito da Probabilidade de Crossover ($P_c$)

[cite_start]O crossover (cruzamento) é o principal motor de **explotação** (combinação de soluções boas)[cite: 185, 300].

* **Alto $P_c$ (Ex: $0.95$):** Prioriza a combinação de características dos pais. [cite_start]Geralmente, valores altos de $P_c$ (entre $0.8$ e $0.95$ [cite: 37, 281]) são usados em problemas contínuos para garantir que os bons traços sejam misturados rapidamente.
* **Baixo $P_c$ (Ex: $0.5$):** Se for muito baixo, a maioria dos indivíduos da nova geração será cópia exata dos pais, atrasando a convergência e o refinamento da solução.

---

## Estrutura do Código em TypeScript

[cite_start]O código é modularizado em funções claras, refletindo as etapas do ciclo de evolução do Algoritmo Genético[cite: 15, 191, 503, 568].

| Parâmetro | Valor | Descrição |
| :---: | :---: | :--- |
| `TAMANHO_POPULACAO` | 20 | [cite_start]Número de soluções em cada geração[cite: 524]. |
| `VALOR_MIN`, `VALOR_MAX` | 0, 100 | [cite_start]Limites do espaço de busca[cite: 525]. |
| `PC` | 0.8 | [cite_start]Probabilidade de Crossover[cite: 37, 281]. |
| `PM` | 0.1 | [cite_start]Probabilidade de Mutação[cite: 313]. |
| `K_TORNEIO` | 2 | [cite_start]Número de competidores na Seleção por Torneio[cite: 24, 784]. |

### `1. calcularFitness(populacao)`

* [cite_start]**Função:** Avaliação da População[cite: 229, 500].
* [cite_start]**Propósito:** Recebe a lista de indivíduos ($x$) e retorna a **aptidão** (fitness) de cada um, que é o valor da função $f(x) = x \sin(x)$[cite: 11]. Como buscamos a **maximização**, um fitness maior é melhor.
* **Tecnologia:** Utiliza `math.sin(x)` e `math.round()` para precisão.

### `2. torneio(fitness, k)`

* **Função:** Auxiliar de Seleção.
* **Propósito:** Simula um único torneio com $k$ competidores. [cite_start]Sorteia $k$ índices distintos da população e retorna o índice daquele com o **maior fitness** (maximização)[cite: 787, 788, 795, 797].

### `3. selecionarPais(populacao, fitness, k)`

* [cite_start]**Função:** Seleção dos Pais[cite: 22, 272].
* [cite_start]**Propósito:** Aplica o método de **Seleção por Torneio** [cite: 273, 784] para preencher a próxima geração.
* **Implementação em TypeScript:**
    * O *loop* executa $N$ vezes (tamanho da população).
    * Dentro do *loop*, ele chama `torneio(fitness, k)` duas vezes para obter os índices do **Pai 1 (`p1`)** e do **Pai 2 (`p2`)**.
    * [cite_start]A estrutura `while (p2 === p1)` é crucial e garante que os pais sejam **indivíduos distintos**[cite: 793, 802], um requisito da seleção por torneio.
    * Retorna os vetores de índices (`pai1`, `pai2`) que serão usados no crossover.

### `4. crossover(populacao, pai1, pai2, pc)`

* [cite_start]**Função:** Cruzamento (Crossover Aritmético)[cite: 26, 276].
* [cite_start]**Propósito:** Gera a nova população de filhos, combinando as características de dois pais com uma chance de $P_c$[cite: 27, 34, 281].
* [cite_start]**Fórmula:** Se ocorrer crossover, o filho é gerado por $\text{Filho} = (\alpha \times \text{Pai 1}) + ((1 - \alpha) \times \text{Pai 2})$[cite: 39].
* [cite_start]**Saturação:** Utiliza `max(VALOR_MIN, min(VALOR_MAX, filho))` para garantir que o novo indivíduo **respeite os limites** $[0, 100]$[cite: 291, 321].

### `5. mutacao(populacao, pm)`

* [cite_start]**Função:** Mutação[cite: 251, 296].
* [cite_start]**Propósito:** Introduz variação aleatória para manter a **diversidade** e **evitar ótimos locais**[cite: 302, 349]. [cite_start]Ocorre com uma chance de $P_m$[cite: 308].
* [cite_start]**Cálculo:** O indivíduo recebe um ajuste $\delta$ (delta)[cite: 319], onde $\delta$ é um valor aleatório no intervalo de $\pm 5\%$ do espaço de busca.

### `6. aplicarElitismo(populacao, elite)`

* [cite_start]**Função:** Elitismo[cite: 377, 571].
* **Propósito:** Preserva o **melhor indivíduo** (`elite`) da geração anterior.
* [cite_start]**Mecanismo:** Na nova população (após mutação), ele identifica o indivíduo com o **pior fitness** e o substitui pela cópia do `elite`[cite: 582]. [cite_start]Isso garante que a qualidade da melhor solução **nunca piore** entre as gerações[cite: 380, 583].

### `7. evoluirComEtapas(comElitismo)`

* [cite_start]**Função:** O **Loop Evolutivo Principal**[cite: 586].
* [cite_start]**Propósito:** Orquestra todo o processo do AG por `NUMERO_GERACOES`[cite: 587].
* **Fluxo de Execução:** `População Inicial` $\rightarrow$ Repete: [`calcularFitness` $\rightarrow$ `selecionarPais` $\rightarrow$ `crossover` $\rightarrow$ `mutacao` $\rightarrow$ `aplicarElitismo` (se ativo)] $\rightarrow$ Fim.