import { random, min, max, round, sin } from 'mathjs';

const TAMANHO_POPULACAO: number = 20;
const VALOR_MIN: number = 0;
const VALOR_MAX: number = 100;
const NUMERO_GERACOES: number = 50;
const K_TORNEIO: number = 2;
const PC: number = 0.8;
const PM: number = 0.1;

function calcularFitness(populacao: number[]): number[] {
    return populacao.map(x => round((x * sin(x)) as number, 4));
}

function torneio(fitness: number[], k: number): number {
    const candidatos: number[] = [];
    while (candidatos.length < k) {
        const idx = Math.floor(Math.random() * fitness.length);
        if (!candidatos.includes(idx)) candidatos.push(idx);
    }
    
    let vencedor = candidatos[0];
    for (const idx of candidatos.slice(1)) {
        if (fitness[idx] > fitness[vencedor]) vencedor = idx;
    }
    return vencedor;
}

function selecionarPais(populacao: number[], fitness: number[], k: number): [number[], number[]] {
    const pai1: number[] = [];
    const pai2: number[] = [];

    for (let i = 0; i < populacao.length; i++) {
        const p1 = torneio(fitness, k);
        let p2 = torneio(fitness, k);
        while (p2 === p1) p2 = torneio(fitness, k);
        
        pai1.push(p1);
        pai2.push(p2);
    }

    return [pai1, pai2];
}

function crossover(populacao: number[], pai1: number[], pai2: number[], pc: number): number[] {
    const filhos: number[] = [];

    for (let i = 0; i < populacao.length; i++) {
        const p1 = populacao[pai1[i]]!;
        const p2 = populacao[pai2[i]]!;

        if (Math.random() < pc) {
            const alpha = Math.random();
            let filho = alpha * p1 + (1 - alpha) * p2;
            filho = max(VALOR_MIN, min(VALOR_MAX, filho)) as number;
            filhos.push(filho);
        } else {
            filhos.push(p1);
        }
    }

    return filhos;
}

function mutacao(populacao: number[], pm: number): number[] {
    const mutados: number[] = [];
    const sigma = 0.05 * (VALOR_MAX - VALOR_MIN);

    for (const x of populacao) {
        if (Math.random() < pm) {
            const delta = random(-sigma, sigma) as number;
            let xMut = x + delta;
            xMut = max(VALOR_MIN, min(VALOR_MAX, xMut)) as number;
            mutados.push(xMut);
        } else {
            mutados.push(x);
        }
    }
    return mutados;
}

function aplicarElitismo(populacao: number[], elite: number): number[] {
    const fitness = calcularFitness(populacao);
    const piorFitness = min(...fitness) as number;
    const indicePior = fitness.indexOf(piorFitness);
    
    const novaPopulacao = [...populacao];
    novaPopulacao[indicePior] = elite;
    
    return novaPopulacao;
}

function evoluirComEtapas(comElitismo: boolean): [number, number] {
    let populacao = Array.from({ length: TAMANHO_POPULACAO }, () => 
        random(VALOR_MIN, VALOR_MAX) as number
    );

    const historicoMelhorFitness: number[] = [];
    const historicoMelhorIndividuo: number[] = [];
    
    console.log(`\nEvolucao ${comElitismo ? 'COM' : 'SEM'} Elitismo`);
    
    for (let g = 0; g < NUMERO_GERACOES; g++) {
        const fitness = calcularFitness(populacao);
        const melhorFitness = max(...fitness) as number;
        const indiceMelhor = fitness.indexOf(melhorFitness);
        const elite = populacao[indiceMelhor]!;
        
        historicoMelhorFitness.push(melhorFitness);
        historicoMelhorIndividuo.push(elite);

        if ((g + 1) % 10 === 0 || g === 0) {
            console.log(`Geracao ${String(g + 1).padStart(3, '0')}: Fitness = ${round(melhorFitness, 4)}`);
        }

        const [pai1, pai2] = selecionarPais(populacao, fitness, K_TORNEIO);

        const filhos = crossover(populacao, pai1, pai2, PC);

        const mutados = mutacao(filhos, PM);

        if (comElitismo) {
            populacao = aplicarElitismo(mutados, elite);
        } else {
            populacao = mutados;
        }
    }

    const melhorFitnessGeral = max(...historicoMelhorFitness) as number;
    const indiceGeral = historicoMelhorFitness.indexOf(melhorFitnessGeral);
    const melhorIndividuoGeral = historicoMelhorIndividuo[indiceGeral]!;

    return [round(melhorIndividuoGeral, 4) as number, round(melhorFitnessGeral, 4) as number];
}

function executarExperimento(): void {
    const numExecucoes = 4;
    
    console.log('EXPERIMENTO: COMPARAÇÃO COM E SEM ELITISMO');

    const resultadosCom: [number, number][] = [];
    for (let i = 0; i < numExecucoes; i++) {
        console.log(`\n>>> RODADA ${i + 1} COM ELITISMO <<<`);
        resultadosCom.push(evoluirComEtapas(true));
    }

    const resultadosSem: [number, number][] = [];
    for (let i = 0; i < numExecucoes; i++) {
        console.log(`\n>>> RODADA ${i + 1} SEM ELITISMO <<<`);
        resultadosSem.push(evoluirComEtapas(false));
    }

    console.log('\nRESULTADOS FINAIS');
    
    console.log('\nCOM ELITISMO:');
    resultadosCom.forEach(([indiv, fit], i) => {
        console.log(`  Rodada ${i + 1}: x = ${String(indiv).padEnd(8)} | f(x) = ${fit}`);
    });
    
    const mediaCom = resultadosCom.reduce((sum, [_, fit]) => sum + fit, 0) / numExecucoes;
    console.log(`Média: ${round(mediaCom, 4)}`);

    console.log('\n SEM ELITISMO:');
    resultadosSem.forEach(([indiv, fit], i) => {
        console.log(`Rodada ${i + 1}: x = ${String(indiv).padEnd(8)} | f(x) = ${fit}`);
    });
    
    const mediaSem = resultadosSem.reduce((sum, [_, fit]) => sum + fit, 0) / numExecucoes;
    console.log(`Média: ${round(mediaSem, 4)}`);

    console.log(`DIFERENÇA: ${round(mediaCom - mediaSem, 4)} (${mediaCom > mediaSem ? 'Elitismo melhor' : 'Sem elitismo melhor'})`);
}

executarExperimento();