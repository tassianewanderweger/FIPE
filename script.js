//______________ CONFIGURACAO E ELEMENTOS DA PAGINA

const API = "https://fipe.parallelum.com.br/api/v2";
//versao 2 da API: dominio novo e rotas em ingles (cars/brands/models/years)

//getElementById = os ids criados no HTML puxam o elemento e guardam numa variavel
const selectMarca = document.getElementById("marca");
const selectModelo = document.getElementById("modelo");
const selectAno = document.getElementById("ano");
//guarda os selects de marca, modelo e ano em variaveis

const botao = document.getElementById("consultar");
const erro = document.getElementById("erro");

const carregando = document.getElementById("carregando");
const carregandoTexto = document.getElementById("carregando-texto");
//indicador de requisicao em andamento (circulo girando + texto)

const areaResultado = document.getElementById("resultado");
const resValor = document.getElementById("res-valor");
const resCodigo = document.getElementById("res-codigo");
const resCombustivel = document.getElementById("res-combustivel");
const resMes = document.getElementById("res-mes");


//______________ FUNCOES GERAIS

function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.classList.remove("hidden");
}
//funcao para escrever o texto no parágrafo de erro (e remover a classe hidden do Tailwind, tornando o erro visivel)

function esconderErro() {
    erro.classList.add("hidden");
}
//devolve a classe hidden e some com a mensagem,
// quando o usuário troca a marca, para não ficar erro antigo na tela.

function resetarSelect(select, textoPadrao) {
    select.innerHTML = `<option value="">${textoPadrao}</option>`;
    select.disabled = true;
}
//LIMPA O SELECT E DESABILITA O CAMPO "TRAVANDO" NOVAMENTE

function limparResultado() {
    areaResultado.classList.add("hidden");
    botao.disabled = true;
}
//esconde o resultado anterior e trava o botao

function mostrarCarregando(texto) {
    carregandoTexto.textContent = texto;
    carregando.classList.remove("hidden");
}
//escreve o texto da etapa atual e torna o indicador visivel

function esconderCarregando() {
    carregando.classList.add("hidden");
}
//esconde o indicador quando a requisicao termina


//______________ SELECAO DE MARCAS

async function carregarMarcas() {
    mostrarCarregando("Carregando marcas...");
    try {
        const resposta = await fetch(`${API}/cars/brands`);
        if (!resposta.ok) throw new Error("Falha ao buscar marcas");
        //funcao assincrona que espera (await) a resposta da API para continuar e exibe erro caso nao acesse

        const marcas = await resposta.json();
        // recebe a lista de marcas da API em JSON e converte para uma lista de objetos js (const marcas)


        marcas.forEach(marca => {
            const option = document.createElement("option"); //transforma a lista de marcas em um box de opções
            option.value = marca.code;
            option.textContent = marca.name;
            selectMarca.appendChild(option);
            // para cada marca da lista, recebe o código, nome e coloca a opção no select
            // na v2 da API os campos se chamam code e name

        });
    } catch (e) {
        mostrarErro("Não foi possível carregar as marcas. Tente novamente.");
        //retorna mensagem de erro para qualquer coisa que de errado dentro do try
    } finally {
        esconderCarregando();
        //finally roda sempre (com sucesso ou erro), entao o indicador nunca fica preso na tela
    }
}

//limpa mensagens antigas, esvazia e trava modelo e ano (some com selecoes anteriores)
selectMarca.addEventListener("change", () => {
    esconderErro();
    limparResultado();
    resetarSelect(selectModelo, "Selecione o modelo");
    resetarSelect(selectAno, "Selecione o ano");

    // só busca modelos se uma marca válida for escolhida
    if (selectMarca.value) {
        carregarModelos(selectMarca.value);
    }
});


//_______________________ SELECAO DE MODELOS

async function carregarModelos(codigoMarca) {
    mostrarCarregando("Carregando modelos...");
    try {
        const resposta = await fetch(`${API}/cars/brands/${codigoMarca}/models`);
        if (!resposta.ok) throw new Error("Falha ao buscar modelos");
        // monta a url inserindo o codigo da marca escolhida, mostrando erro caso nao encontre

        const modelos = await resposta.json();
        // na v2 a resposta e uma lista direta (nao existe mais dados.modelos)

        modelos.forEach(modelo => {
            const option = document.createElement("option");
            option.value = modelo.code;
            option.textContent = modelo.name;
            selectModelo.appendChild(option);
        });

        selectModelo.disabled = false;
    } catch (e) {
        mostrarErro("Não foi possível carregar os modelos. Tente novamente.");
    } finally {
        esconderCarregando();
    }
}

//reage a escolha do modelo limpando mensagens antigas/esvazia e trava o ano
selectModelo.addEventListener("change", () => {
    esconderErro();
    limparResultado();
    resetarSelect(selectAno, "Selecione o ano");

    //se o modelo for valido, carrega os anos considerando marca e modelo
    if (selectModelo.value) {
        carregarAnos(selectMarca.value, selectModelo.value);
    }
});


//____________________________SELECAO DO ANO

async function carregarAnos(codigoMarca, codigoModelo) {
    mostrarCarregando("Carregando anos...");
    try {
        const resposta = await fetch(
            `${API}/cars/brands/${codigoMarca}/models/${codigoModelo}/years`
        );
        if (!resposta.ok) throw new Error("Falha ao buscar anos");
        //monta a URL com o codigo de marca e modelo

        const anos = await resposta.json();

        anos.forEach(ano => {
            const option = document.createElement("option");
            option.value = ano.code;
            option.textContent = ano.name;
            selectAno.appendChild(option);
        });

        selectAno.disabled = false; //libera o select depois de preenchido
    } catch (e) {
        mostrarErro("Não foi possível carregar os anos. Tente novamente.");
    } finally {
        esconderCarregando();
    }
}

//ao escolher o ano, esconde erros e resultado antigos e libera o botao
selectAno.addEventListener("change", () => {
    esconderErro();
    areaResultado.classList.add("hidden");
    botao.disabled = !selectAno.value;
});


//____________________SCRIPT RESULTADO

async function consultarValor() {
    mostrarCarregando("Consultando valor...");
    try {
        const resposta = await fetch(
            `${API}/cars/brands/${selectMarca.value}/models/${selectModelo.value}/years/${selectAno.value}`
        );
        if (!resposta.ok) throw new Error("Falha ao consultar valor");
        //monta a URL com marca, modelo e ano escolhidos (o ano usa o codigo completo, ex: 2020-1)

        const dados = await resposta.json();

        resValor.textContent = dados.price;
        resCodigo.textContent = dados.codeFipe;
        resCombustivel.textContent = dados.fuel;
        resMes.textContent = dados.referenceMonth.trim();
        //na v2 os campos vem em ingles: price, codeFipe, fuel, referenceMonth

        areaResultado.classList.remove("hidden");
    } catch (e) {
        mostrarErro("Não foi possível consultar o valor. Tente novamente.");
    } finally {
        esconderCarregando();
    }
}

botao.addEventListener("click", () => {
    esconderErro();
    consultarValor();
});


//____________________INICIO

carregarMarcas();
//carrega as marcas assim que a pagina abre