let indexAtual = ""

const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close(){
        // Fechar o modal
        // Remover a class active do modal
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
    }
}

const ModalView = {
    close(){
        // Fechar o modal
        // Remover a class active do modal
        document
        .querySelector('.modal-overlay-view')
        .classList
        .remove('active')
    }
}

const ModalEdit = {
    close(){
        // Fechar o modal
        // Remover a class active do modal
        document
        .querySelector('.modal-overlay-edit')
        .classList
        .remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
        []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    editValue(transaction) {
        // Transaction.all.push(transaction)
        Transaction.all[indexAtual] = transaction
        console.log(Transaction.all[indexAtual])
        console.log(transaction)
        App.reload()
    },

    view(index) {
        document.querySelector('.modal-overlay-view').classList.add('active')
        let viewingData = Transaction.all[index]
        document.querySelector('#description-view').value = viewingData.description
        document.querySelector('#amount-view').value = viewingData.amount
        document.querySelector('#date-view').value = viewingData.date
        console.log(viewingData)
    },

    edit(index) {
        document.querySelector('.modal-overlay-edit').classList.add('active')
        let viewingData = Transaction.all[index]
        document.querySelector('#description-edit').value = viewingData.description
        document.querySelector('#amount-edit').value = viewingData.amount / 100
        viewingDataEdit = Utils.formatDateEdit(viewingData.date)
        document.querySelector('#date-edit').value = viewingDataEdit
        console.log(indexAtual)
        indexAtual = index
        console.log(indexAtual)
        console.log(viewingData)
        console.log(viewingDataEdit)
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        // Pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if( transaction.amount > 0 ) {
                // somar a uma variável e retornar a variável
                // income = income + transaction.amount;
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <button onclick="Transaction.view(${index})">Visualizar</button>
            </td>
            <td>
                <button onclick="Transaction.edit(${index})">Editar</button>
            </td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}


const Utils = {
    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatDateEdit(date) {
        const splittedDate = date.split("/")
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`

    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFilds() {
        const { description, amount, date } = Form.getValues()

        if ( 
            description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos.")
            }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // Verificar se todas as informações foram preenchidas
            Form.validateFilds()
            // Formatar os dados para salvar
            const transaction = Form.formatValues()
            // Salvar
            Transaction.add(transaction)
            // Apagar os dados do formulário
            Form.clearFields()
            // Modal feche
            Modal.close()

        } catch (error) {
            alert(error.message)
        }
    }
}

const FormEdit = {
    description: document.querySelector('input#description-edit'),
    amount: document.querySelector('input#amount-edit'),
    date: document.querySelector('input#date-edit'),

    getValues() {
        return {
            description: FormEdit.description.value,
            amount: FormEdit.amount.value,
            date: FormEdit.date.value
        }
    },

    validateFilds() {
        const { description, amount, date } = FormEdit.getValues()

        if ( 
            description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos.")
            }
    },

    formatValues() {
        let { description, amount, date } = FormEdit.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        FormEdit.description.value = ""
        FormEdit.amount.value = ""
        FormEdit.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // Verificar se todas as informações foram preenchidas
            FormEdit.validateFilds()
            // Formatar os dados para salvar
            const transaction = FormEdit.formatValues()
            // Salvar
            Transaction.editValue(transaction)
            // Apagar os dados do formulário
            FormEdit.clearFields()
            // Modal feche
            ModalEdit.close()

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

// Crtl + A => Selecionar tudo
// Ctrl + K ... Ctrl + 1 +> fecha tudo no primeiro nível
// Seleciona todos novamente:
// Ctrl + k ... Ctrl + 2 => Fecha tudo no segundo nível
