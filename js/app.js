import { valida } from "./validacao.js";

const inputs = document.querySelectorAll('input')

inputs.forEach(input => {

    //Máscara Monetária - Simple mask-money para não ser necessário realizar validações no campo de preço https://github.com/codermarcos/simple-mask-money
    if (input.dataset.tipo === 'preco'){
        SimpleMaskMoney.setMask(input, {
            prefix: 'R$ ', //prefixo com R$
            fixed: true, //valor fixo
            fractionDigits: 2, //2 digitos depois da virgula
            decimalSeparator: ',', //valores decimais separados com virgula
            thousandsSeparator: '.', //separador de valor milhar com ponto
            cursor: 'end' //'end' adiciona os valores digitados a partir do final aparecendo da direita para a esquerda
        })
    }

    input.addEventListener('blur', (evento) => {
        valida(evento.target)
    })
})