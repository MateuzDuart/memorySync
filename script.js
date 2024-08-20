
const messageElement = document.getElementById('message');
const memoria1 = document.getElementById('memoria1');
const memoria2 = document.getElementById('memoria2');
const groupMemoriaRelativa1 = document.getElementById('groupMemoriaRelativa1');
const groupMemoriaRelativa2 = document.getElementById('groupMemoriaRelativa2');
const memoriaRelativa1 = document.getElementById('memoriaRelativa1');
const memoriaRelativa2 = document.getElementById('memoriaRelativa2');

let entryAddress1 = undefined
let entryAddress2 = undefined


// Função para validar o endereço de memória em HEX
function isValidHex(value) {
    return /^[0-9A-Fa-f]+$/i.test(value.replace("0x", ""));
}

function isInputValid(Inputelement) {
    const ContainerInput = Inputelement.parentElement
    const inputName = ContainerInput.querySelector("label").innerHTML.replace(":", "")

    if (!Inputelement.value.trim()) {
        ContainerInput.classList.add('enabled');
        messageElement.textContent = `Preencha o campo ${inputName} com um endereço de memória em HEX.`;
        return false;
    }

    if (!isValidHex(Inputelement.value)) {
        ContainerInput.classList.remove('success');
        ContainerInput.classList.add('error');
        messageElement.textContent = `O valor inserido em ${inputName} não é um endereço HEX válido.`;
        return false;
    }


    ContainerInput.classList.remove('error');
    ContainerInput.classList.add('success');

    return true
}

// Função para atualizar o status dos inputs
function getMainMemories() {
    messageElement.style.color = "#d32f2f";
    messageElement.style.background = null;
    messageElement.style.borderRadius = null;
    
    memoriaRelativa1.disabled = true;
    memoriaRelativa2.disabled = true;
    
    if (!isInputValid(memoria1)) { return }
    entryAddress1 = parseInt(memoria1.value, 16)
    memoria2.classList.add('enabled');
    if (!isInputValid(memoria2)) { return }
    entryAddress2 = parseInt(memoria2.value, 16)
    
    groupMemoriaRelativa1.classList.add('enabled');
    groupMemoriaRelativa2.classList.add('enabled');
    memoriaRelativa1.disabled = false;
    memoriaRelativa2.disabled = false;
    
    
    messageElement.textContent = "Agora preencha um dos campos relativos!";
    messageElement.style.color = "#ffed50";
    messageElement.style.background = "rgba(0,0,0,0.7)";
    messageElement.style.borderRadius = "12px";
}

function calcMemory(element1, element2) {
    element1.parentElement.classList.remove('enabled');
    element2.parentElement.classList.remove('enabled');
    element1.parentElement.classList.remove('calculed');
    element2.parentElement.classList.remove('calculed');
    element1.parentElement.classList.remove('success');
    element2.parentElement.classList.remove('success');
    
    element2.parentElement.classList.add('enabled');
    element1.parentElement.classList.add('enabled');

    if(!entryAddress1 || !entryAddress2) { 
        messageElement.style.background = null;
        messageElement.style.borderRadius = null;    
        messageElement.style.color = "#d32f2f";
        messageElement.textContent = "Os endereços de memorias não foram enviado corretamente";
        return
    }
    const diference = Math.abs(entryAddress1 - entryAddress2)
    
    if(!isInputValid(element1) && !isInputValid(element2)) { return }
    
    const memoryAddress1 = parseInt(element1.value, 16)
    
    let relativeAddress = undefined
    if(entryAddress1 > entryAddress2) {
        console.log(element1.id)
        if (element1.id === "memoriaRelativa1") { console.log("aaaa"); relativeAddress = memoryAddress1 - diference }
        else { relativeAddress = memoryAddress1 + diference }
    } else if (entryAddress1 < entryAddress2) {
        if (element1.id === "memoriaRelativa1") { relativeAddress = memoryAddress1 + diference }
        else { relativeAddress = memoryAddress1 - diference }
        
    } else {
        messageElement.style.background = null;
        messageElement.style.borderRadius = null;    
        messageElement.style.color = "#d32f2f";
        messageElement.textContent = "Os endereços de memorias já são iguais, não precisa de calculo.";
    }
    
    element2.value = relativeAddress.toString(16)
    element1.classList.remove('enabled');
    element1.classList.add('success');
    element2.parentElement.classList.remove('enabled');
    element2.parentElement.classList.add('calculed');

}

memoria1.addEventListener('input', getMainMemories);
memoria2.addEventListener('input', getMainMemories);
memoriaRelativa1.addEventListener('input', () => calcMemory(memoriaRelativa1, memoriaRelativa2));
memoriaRelativa2.addEventListener('input', () => calcMemory(memoriaRelativa2, memoriaRelativa1));

// Inicializa o primeiro input
document.getElementById('groupMemoria1').classList.add('enabled');
