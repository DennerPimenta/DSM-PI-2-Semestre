// credenciais de demonstração
const USUARIO_DEMO = 'admin@erp.com';
const SENHA_DEMO   = '123456';

const form       = document.getElementById('loginForm');
const inputEmail = document.getElementById('usuario');
const inputSenha = document.getElementById('senha');
const btnEntrar  = document.getElementById('btnEntrar');
const spinner    = document.getElementById('spinner');
const alerta     = document.getElementById('alertaLogin');

// valida formato de e-mail
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// aplica estilo de erro ou sucesso no campo
function marcarCampo(input, msgEl, temErro) {
    if (temErro) {
        input.classList.add('invalido');
        input.classList.remove('valido');
        msgEl.style.display = 'block';
    } else {
        input.classList.remove('invalido');
        input.classList.add('valido');
        msgEl.style.display = 'none';
    }
}

// validação ao sair do campo
inputEmail.addEventListener('blur', function () {
    marcarCampo(this, document.getElementById('erroEmail'), !emailValido(this.value.trim()));
});

inputSenha.addEventListener('blur', function () {
    marcarCampo(this, document.getElementById('erroSenha'), this.value.length < 6);
});

// limpa alerta ao digitar
inputEmail.addEventListener('input', () => alerta.style.display = 'none');
inputSenha.addEventListener('input', () => alerta.style.display = 'none');

// link esqueceu a senha
document.getElementById('linkEsqueceu').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Para redefinir sua senha, entre em contato com o administrador do sistema.');
});

// submit do formulário
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputSenha.value;
    let temErro = false;

    if (!emailValido(email)) {
        marcarCampo(inputEmail, document.getElementById('erroEmail'), true);
        temErro = true;
    }

    if (senha.length < 6) {
        marcarCampo(inputSenha, document.getElementById('erroSenha'), true);
        temErro = true;
    }

    if (temErro) return;

    // ativa loading
    btnEntrar.disabled = true;
    spinner.style.display = 'inline-block';
    alerta.style.display = 'none';

    // simula tempo de autenticação
    setTimeout(function () {
        if (email === USUARIO_DEMO && senha === SENHA_DEMO) {

            const lembrar  = document.getElementById('lembrarMe').checked;
            const storage  = lembrar ? localStorage : sessionStorage;
            storage.setItem('usuarioLogado', JSON.stringify({ email, nome: 'Administrador' }));

            window.location.href = 'dashboard.html';

        } else {
            alerta.style.display = 'block';
            btnEntrar.disabled   = false;
            spinner.style.display = 'none';

            // animação de shake no erro
            const caixa = document.querySelector('.caixa-login');
            caixa.style.animation = 'none';
            caixa.offsetHeight;
            caixa.style.animation = 'shake 0.4s ease';
        }
    }, 1200);
});