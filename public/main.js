//const socket = io('ENDEREÇO E PORTA DO SERVIDOR');
//como é localhost(o cliente e o server estão na mesma rede), pode-se deixar em branco o parâmetro
const socket = io('localhost:3000');

let userName = '';
let userList = [];

let loginPage = document.querySelector('#loginPage'); 
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList() {
    let ul = document.querySelector('.userList');
    //limpar a lista, caso haja algum elemento filho
    ul.innerHTML='';

    userList.forEach(name => {
        ul.innerHTML += `<li>${name}</li>`;
    });
}

function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList');

    switch(type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${msg}</li>`;
            break;
        case 'msg':
            if (userName == user){
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}:</span> ${msg}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}:</span> ${msg}</li>`;
            }
            break;
    }

    //a tela de messagens acompanhará, sempre deixando visível a última mensagem recebida
    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    //keyCode 13 = ENTER
    if (e.keyCode === 13) {
        let name = loginInput.value.trim();
        if (name != ''){
            userName = name;
            document.title = `Chat (${userName})`;

            socket.emit('join-request', userName);
        }
    }
})

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';

        if (txt != '') {
            socket.emit('send-msg', txt);
        }
    }
})

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!');

    userList = [...list];
    renderUserList();
})

socket.on('list-update', (data) => {
    //se alguém está entrando no chat..
    if (data.joined) {
        addMessage('status', null, data.joined + ' entrou no chat.');
    }

    //se alguém está saindo do chat..
    if (data.left) {
        addMessage('status', null, data.left + ' saiu do chat.');
    }

    //atualiza a lista
    userList = [...data.list];
    renderUserList();
})

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

//quando o servidor cai ou cai a conexão do client
socket.on('disconnect', () => {
    addMessage('status', null, "Você foi desconectado!");
    userList = [];
    renderUserList();
});

//quando der disconnect, é possível verificando a tentativa de reconectar no servidor
socket.on('reconnect_error', () => {
    addMessage('status', null, "Tentando reconectar...");
});

//quando o client consegue se reconectar ao servidor, após a conexão ter sido perdida
socket.on('reconnect', () => {
    addMessage('status', null, "Reconectado!");

    if (username != '') {
        socket.emit('join-request', userName);
    }
});