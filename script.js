const formElement = document.getElementById('myForm');
const messageElement = document.getElementById('message');

function isValidHex(value) {
    return /^[0-9A-Fa-f]+$/i.test(value.replace("0x", ""));
}

function isInputValid(Inputelement) {
    const inputName = Inputelement.parentElement.querySelector("label").innerHTML.replace(":", " ")

    if (!Inputelement.value.trim()) {
        throw new Error(`Preencha o campo ${inputName} com um endereço de memória HEX.`)
    }
    if (!isValidHex(Inputelement.value)) {
        throw new Error(`O valor inserido em ${inputName} não é um endereço HEX válido.`)
    }

    return true
}

function calculateMemory () {

}

class MemoryPool {
    static poolCount = 1
    static pools = [new MemoryPool(0), new MemoryPool(0)]
    
    constructor(entryPointAddress) {
        this.entryPointAddress = entryPointAddress
        this.relativeMemory = null
        this.ID = MemoryPool.poolCount
        MemoryPool.poolCount++
    }

    init() {

        let div = document.createElement("div");
        div.classList.add('input-group')
        div.id = `poolMemory-${this.ID}`
        div.innerHTML = `
        <div class="input-container"><label for="memory-${this.ID}">Memória ${this.ID}:</label><input type="text" id="memory-${this.ID}" name="memory-${this.ID}" placeholder="Digite a memória ${this.ID}"></div>
        <div class="input-container"><label for="relativeMemory-${this.ID}">Memória Relativa ${this.ID}:</label><input type="text" id="relativeMemory-${this.ID}" name="relativeMemory-${this.ID}" placeholder="Digite a memória ${this.ID}" disabled></div>`
        formElement.appendChild(div)
        const input = formElement.querySelector(`#memory-${this.ID}`)
        this.setInputContainer(input.parentElement)
        
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer); 
            debounceTimer = setTimeout(() => {
                this.setEntrypoint(input);
            }, 200);
        })
    }

    setEntrypoint(Inputelement) {
        MemoryPool.removeEntrypointClasses(this)
        
        try {
            isInputValid(Inputelement)
        } catch (error) {
            messageElement.innerHTML = error.message
            this.setEntrypointError()
            this.entryPointAddress = 0
            if(MemoryPool.pools[this.ID]) { MemoryPool.removeEntrypointClasses(MemoryPool.pools[this.ID]) }
            this.unsetRelativeMemoryEnable()
            return MemoryPool.removeSuccessState(this)
            
        }
        
        this.setEntrypointSuccess()
        const nextMemoryPool = MemoryPool.pools[this.ID]
        if(nextMemoryPool && nextMemoryPool.entryPointAddress === 0) { MemoryPool.pools[this.ID].setEntrypointEnable() }
        this.setParcialSuccess()
        this.entryPointAddress = Inputelement.value
        const successfulPools = MemoryPool.pools.filter(pool => pool.entryPointAddress !== 0);

        if(successfulPools.length >= 2) {
            successfulPools.forEach((pool) => {
                pool.initRelativeMemory()
            })
            messageElement.innerHTML = ""
        }
    }

    setRelativeMemory(Inputelement) {
        try {
            isInputValid(Inputelement)
        } catch (error) {
            messageElement.innerHTML = error.message
            this.setRelativeMemoryError()
            this.relativeMemory = null
            return this.setRelativeMemoryError()
        }
        
        this.relativeMemory = Inputelement.value
        this.setRelativeMemorySuccess()
        
        const otherPools = MemoryPool.pools.filter((pool) => pool.ID != this.ID)
        
        const difference = this.getDifference()
        otherPools.forEach((pool) => {
            pool.setRelativeMemoryCalculated()
            pool.setCalculatedSuccess()
            pool.updateRelativeMemory(difference)

            messageElement.style.color = "#00796b";
            messageElement.textContent = "Cálculo realizado com sucesso";
        })
        this.setFullySuccess()
    }

    initRelativeMemory() {
        MemoryPool.removeEntrypointClasses(this)
        this.setRelativeMemoryEnable()


        const input = this.inputContainer.parentElement.querySelector("div:nth-child(2) > input")
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer); 
            debounceTimer = setTimeout(() => {
                this.setRelativeMemory(input);
            }, 200);
        })
        
    }
    
    setEntrypointEnable() {
        MemoryPool.removeEntrypointClasses(this)
        this.inputContainer.classList.add("enabled")
    }
    
    setEntrypointSuccess() {
        MemoryPool.removeEntrypointClasses(this)
        this.inputContainer.classList.add("success")
        
    }
    
    setEntrypointError() {
        MemoryPool.removeEntrypointClasses(this)
        this.inputContainer.classList.add("error")

    }
    
    unsetRelativeMemoryEnable() {
        MemoryPool.removeRelativeMemoryClasses(this)
        
        const input = this.inputContainer.parentElement.querySelector("div:nth-child(2) > input")
        input.disabled = true

        let debounceTimer;
        input.removeEventListener('input', () => {
            clearTimeout(debounceTimer); 
            debounceTimer = setTimeout(() => {
                this.setRelativeMemory(input);
            }, 200);
        })
    }
    
    setRelativeMemoryEnable() {
        MemoryPool.removeRelativeMemoryClasses(this)
        const inputGroupElement = this.inputContainer.parentElement.querySelector("div:nth-child(2)")
        inputGroupElement.classList.add("enabled")
        inputGroupElement.querySelector("input").disabled = false
    }

    setRelativeMemorySuccess() {
        MemoryPool.removeRelativeMemoryClasses(this)
        this.inputContainer.parentElement.querySelector("div:nth-child(2)").classList.add("success")  
    }
    
    setRelativeMemoryError() {
        MemoryPool.removeRelativeMemoryClasses(this)
        MemoryPool.removeSuccessState(this)
        this.setParcialSuccess()
        this.inputContainer.parentElement.querySelector("div:nth-child(2)").classList.add("error")
    }

    setRelativeMemoryCalculated() {
        MemoryPool.removeRelativeMemoryClasses(this)
        this.inputContainer.parentElement.querySelector("div:nth-child(2)").classList.add("calculated")
    }
    
    setInputContainer (inputElement) {
        this.inputContainer = inputElement
    } 
    
    setParcialSuccess() {
        MemoryPool.removeRelativeMemoryClasses(this)
        MemoryPool.removeSuccessState(this)
        this.inputContainer.parentElement.classList.add("parcial-success")
    }

    setFullySuccess() {
        MemoryPool.removeRelativeMemoryClasses(this)
        MemoryPool.removeSuccessState(this)
        this.inputContainer.parentElement.classList.add("fully-success")
    }

    setCalculatedSuccess() {
        MemoryPool.removeSuccessState(this)
        this.inputContainer.parentElement.classList.add("calculated-success")
    }
    
    getDifference() {
        return parseInt(this.relativeMemory, 16) - parseInt(this.entryPointAddress, 16)
    }

    updateRelativeMemory(difference) {
        const input = this.inputContainer.parentElement.querySelector("div:nth-child(2) > input")
        input.value = "0x" + (parseInt(this.entryPointAddress, 16) + difference).toString(16)
    }

    static removeEntrypointClasses(pool) {
        if(!pool.inputContainer) { return }
        pool.inputContainer.classList.remove("enabled")
        pool.inputContainer.classList.remove("success")
        pool.inputContainer.classList.remove("error")
    }

    static removeSuccessState(pool) {
        if(!pool.inputContainer) { return }
        pool.inputContainer.parentElement.classList.remove("parcial-success")
        pool.inputContainer.parentElement.classList.remove("fully-success")
        pool.inputContainer.parentElement.classList.remove("calculated-success")
    }

    static removeRelativeMemoryClasses(pool) {
        if(!pool.inputContainer) { return }
        pool.inputContainer.parentElement.querySelector("div:nth-child(2)").classList.remove("enabled")
        pool.inputContainer.parentElement.querySelector("div:nth-child(2)").classList.remove("success")
        pool.inputContainer.parentElement.querySelector("div:nth-child(2)").classList.remove("error")
        pool.inputContainer.parentElement.querySelector("div:nth-child(2)").classList.remove("calculated")
    }

    static renderPools() {
        for (const pool of this.pools) {
            pool.init()
            
            if(pool.ID === 1) {
                pool.setEntrypointEnable()
            }

            
        }
    }

    
    
}



MemoryPool.renderPools()