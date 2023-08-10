export function valida(input){
    const tipoDeInput = input.dataset.tipo; //dataset acessa os data atributtes de um elemento. E após o ponto é definido qual o datatributte será selecionado que no caso é o "tipo"

    if(validadores[tipoDeInput]){
        validadores[tipoDeInput](input);
    }

    if(input.validity.valid){//Condição if que verifica se no elemento input e no validity dele o valor de "valid" é true, que indica se o que foi digitado é um conjunto de caracteres valido 
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else{
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input)
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
];

//Tratando mensagens de erros para cada tipo de validação realizada:
const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo de nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo de email não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido.'
    },
    senha: {
        valueMissing: 'O campo de senha não pode estar vazio.',
        patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.'
    },
    dataNascimento: {
        valueMissing: 'O campo de data de nascimento não pode estar vazio.',
        customError: 'Você deve ser maior que 18 anos para se cadastrar.'
    },
    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio.',
        customError: 'O CPF digitado não é válido.'
    },
    cep: {
        valueMissing: 'O campo de CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é valido.',
        customError: 'Não foi possível buscar o CEP'
    },
    logradouro: {
        valueMissing: 'O campo de Logradouro não pode estar vazio.'
    },
    cidade: {
        valueMissing: 'O campo de Cidade não pode estar vazio.'
    },
    estado: {
        valueMissing: 'O campo de Estado não pode estar vazio.'
    },
    preco: {
        valueMissing: 'O campo de Preço não pode estar vazio.'
    }
};

//Objeto que vai conter os varios tipos de validação personalizadas:
const validadores = {
    dataNascimento:input => validaDataNascimento(input),
    cpf:input => validaCPF(input),
    cep:input => recuperarCEP(input)
};

function mostraMensagemDeErro(tipoDeInput, input){
    let mensagem = '';
    tiposDeErro.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro]
        }
    });
    
    return mensagem;
}

function validaDataNascimento(input){
    const dataRecebida = new Date(input.value);
    let mensagem = '';

    if(!maiorQue18(dataRecebida)) {
        mensagem = 'Você deve ser maior que 18 anos para se cadastrar.';
    }

    input.setCustomValidity(mensagem);
    //a propriedade setCustomValidity faz a validação do campo para o navegador entender que existe um erro no campo
};

function maiorQue18(data){
    const dataAtual = new Date();
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate());

    return dataMais18 <= dataAtual;
};

function validaCPF(input){
    const cpfFormatado = input.value.replace(/\D/g, '');

    let mensagem = ''

    if(!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)){
        mensagem = 'O CPF digitado não é válido.'
    }

    input.setCustomValidity(mensagem)
}

function checaCPFRepetido(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]
    let cpfValido = true;

    valoresRepetidos.forEach(valor => {
        if(valor ==cpf){
            cpfValido = false;
        }
    })

    return cpfValido;
}

function checaEstruturaCPF(cpf){
    const multiplicador = 10

    return checaDigitoVerificador(cpf, multiplicador)
}

function checaDigitoVerificador(cpf, multiplicador){
    if (multiplicador >= 12) {
        return true;
    }

    let multiplicadorInicial = multiplicador;
    let soma = 0;
    const cpfSemDigitos = cpf.substr(0, multiplicador-1).split('');
    const digitoVerificador = cpf.charAt(multiplicador - 1);
    for(let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--){
        soma += cpfSemDigitos[contador] * multiplicadorInicial;
        contador++;
    }


    if(digitoVerificador == confirmaDigito(soma)){
        return checaDigitoVerificador(cpf, multiplicador + 1);
    }

    return false
}

function confirmaDigito(soma){
    return 11 - (soma % 11);
}

function recuperarCEP(input){
    const cep = input.value.replace(/\D/g,'');
    const url = `https://viacep.com.br/ws/${cep}/json`;
    const options = {
        method: 'GET', //tipo de requisição que será feita [method - Como queremos]
        mode: 'cors', //cors indica que a comunicação será feita entre aplicações diferentes [mode - opcional, mas ela é necessária para chamadas entre aplicações diferentes]
        headers: {
            'content-type': 'application/json;charset=utf-8' //define como as informações da API devem ser recebidas [header - O que queremos]
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url,options).then(
            response => response.json()
        ).then(
            data => {
                if(data.erro){
                    input.setCustomValidity('Não foi possível buscar o CEP');
                    return;
                }
                input.setCustomValidity('')
                preenchaCamposComCEP(data);
                return;
            }
        )
        //requisição que manda uma resposta que é transformada no tipo Json
    }
}

function preenchaCamposComCEP(data){
    const logradouro = document.querySelector('[data-tipo="logradouro"]');
    const cidade = document.querySelector('[data-tipo="cidade"]');
    const estado = document.querySelector('[data-tipo="estado"]');

    logradouro.value = data.logradouro;
    cidade.value = data.localidade;
    estado.value = data.uf;
}