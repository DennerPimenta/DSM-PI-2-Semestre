// ============================================================
// ERP SISTEMA — JAVASCRIPT FUNCIONAL
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

    // ── VERIFICAÇÃO DE ROTA ──────────────────────────────────

    var paginaAtual = window.location.pathname;
    var temSessao = localStorage.getItem('erp_usuario') ||
                    sessionStorage.getItem('erp_usuario');

    // se tá no login e tem sessão, vai pro dashboard
    if (paginaAtual.includes('index.html') && temSessao) {
        window.location.href = 'dashboard.html';
    }

    // ── LOGIN ────────────────────────────────────────────────

    var formLogin = document.getElementById('loginForm');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();

            var email = document.getElementById('usuario').value.trim();
            var senha = document.getElementById('password').value;

            if (!email || !senha) {
                alert('Preencha todos os campos!');
                return;
            }

            // salva sessão (qualquer e-mail/senha funciona na demo)
            var lembrar = document.querySelector('.lembrar input').checked;
            var storage = lembrar ? localStorage : sessionStorage;

            storage.setItem('erp_usuario', JSON.stringify({
                nome:   'Administrador',
                email:  email,
                perfil: 'admin',
                login:  new Date().toLocaleString('pt-BR')
            }));

            // feedback visual
            var btn = formLogin.querySelector('button');
            btn.textContent = '✓ Entrando...';
            btn.disabled = true;

            setTimeout(function() {
                window.location.href = 'dashboard.html';
            }, 600);
        });
    }

    // ── LOGOUT ───────────────────────────────────────────────

    var btnSair = document.querySelector('.usuario-cabecalho');
    if (btnSair) {
        btnSair.addEventListener('click', function() {
            if (confirm('Deseja sair do sistema?')) {
                localStorage.removeItem('erp_usuario');
                sessionStorage.removeItem('erp_usuario');
                window.location.href = 'index.html';
            }
        });
    }

});
// ── PÁGINA: COMPRAS ──────────────────────────────────────────

if (window.location.pathname.includes('compras.html')) {
    
    var CHAVE_COMPRAS = 'erp_compras';

    var dadosPadraoCompras = [
        { numero: 'PO-2026-001', fornecedor: 'TechDistribuidora Ltda',      data: '2026-04-10', itens: 12, valor: 34500.00, status: 'Pendente'   },
        { numero: 'PO-2026-002', fornecedor: 'Eletrônicos Brasil S.A.',      data: '2026-04-15', itens: 8,  valor: 12800.00, status: 'Pendente'   },
        { numero: 'PO-2026-003', fornecedor: 'KaBuM! Eletrônicos',           data: '2026-04-20', itens: 25, valor: 18800.00, status: 'Finalizado' },
        { numero: 'PO-2026-004', fornecedor: 'Terabyte Shop',                data: '2026-04-22', itens: 10, valor: 11000.00, status: 'Finalizado' },
        { numero: 'PO-2026-005', fornecedor: 'Pichau Informática',           data: '2026-04-28', itens: 5,  valor: 29800.00, status: 'Aprovado'   },
        { numero: 'PO-2026-006', fornecedor: 'Magazine Luiza Distribuidora', data: '2026-05-01', itens: 18, valor: 47300.00, status: 'Pendente'   }
    ];

    function carregarCompras() {
        var raw = localStorage.getItem(CHAVE_COMPRAS);
        return raw ? JSON.parse(raw) : dadosPadraoCompras;
    }

    function salvarCompras(dados) {
        localStorage.setItem(CHAVE_COMPRAS, JSON.stringify(dados));
    }

    var pedidos = carregarCompras();

    // helpers
    function moeda(v) {
        return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatarData(s) {
        if (!s) return '—';
        var p = s.split('-');
        return p[2] + '/' + p[1] + '/' + p[0];
    }

    function badgeStatus(s) {
        var cores = {
            'Pendente':   'etiqueta-atencao',
            'Aprovado':   'etiqueta-azul',
            'Finalizado': 'etiqueta-verde',
            'Cancelado':  'etiqueta-vermelha'
        };
        return '<span class="' + (cores[s] || 'etiqueta-azul') + '">' + s + '</span>';
    }

    // atualiza KPIs
    function atualizarKPIs() {
        var pendentes   = pedidos.filter(function(p) { return p.status === 'Pendente'; });
        var aprovados   = pedidos.filter(function(p) { return p.status === 'Aprovado'; });
        var finalizados = pedidos.filter(function(p) { return p.status === 'Finalizado'; });
        var totalMes    = pedidos.reduce(function(s, p) { return s + Number(p.valor); }, 0);

        document.getElementById('kdPendentes').textContent   = pendentes.length + ' pedido(s)';
        document.getElementById('kdAprovados').textContent   = aprovados.length + ' pedido(s)';
        document.getElementById('kdFinalizados').textContent = finalizados.length + ' pedido(s)';
        document.getElementById('kdTotalMes').textContent    = moeda(totalMes);
    }

    // renderiza tabela
    function renderizarTabela(lista) {
        var tb = document.getElementById('tbCompras');
        tb.innerHTML = '';

        if (lista.length === 0) {
            tb.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#aaa">Nenhum pedido encontrado.</td></tr>';
            document.getElementById('rodapeCompras').textContent = '';
            return;
        }

        for (var i = 0; i < lista.length; i++) {
            var p = lista[i];
            var acoes = '';

            if (p.status === 'Pendente') {
                acoes =
                    '<button class="btn-acao btn-aprovar" data-idx="' + i + '">✅ Aprovar</button> ' +
                    '<button class="btn-acao btn-cancelar-ped" data-idx="' + i + '">❌</button>';
            } else if (p.status === 'Aprovado') {
                acoes =
                    '<button class="btn-acao btn-finalizar" data-idx="' + i + '">📋 Finalizar</button>';
            } else {
                acoes = '<span style="color:#aaa;font-size:12px">' + p.status + '</span>';
            }

            tb.innerHTML +=
                '<tr>' +
                '<td><strong>' + p.numero + '</strong></td>' +
                '<td>' + p.fornecedor + '</td>' +
                '<td>' + formatarData(p.data) + '</td>' +
                '<td>' + p.itens + '</td>' +
                '<td class="texto-azul">' + moeda(p.valor) + '</td>' +
                '<td>' + badgeStatus(p.status) + '</td>' +
                '<td>' + acoes + '</td>' +
                '</tr>';
        }

        var totalFiltrado = lista.reduce(function(s, p) { return s + Number(p.valor); }, 0);
        document.getElementById('rodapeCompras').innerHTML =
            '<strong>' + lista.length + '</strong> pedido(s) &nbsp;|&nbsp; Total: <strong>' + moeda(totalFiltrado) + '</strong>';

        // eventos dos botões
        document.querySelectorAll('.btn-aprovar').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var p = lista[parseInt(this.dataset.idx)];
                var idx = pedidos.indexOf(p);
                if (confirm('Aprovar pedido ' + p.numero + '?')) {
                    pedidos[idx].status = 'Aprovado';
                    salvarCompras(pedidos);
                    atualizarKPIs();
                    filtrarERenderizar();
                }
            });
        });

        document.querySelectorAll('.btn-finalizar').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var p = lista[parseInt(this.dataset.idx)];
                var idx = pedidos.indexOf(p);
                if (confirm('Marcar pedido ' + p.numero + ' como finalizado?')) {
                    pedidos[idx].status = 'Finalizado';
                    salvarCompras(pedidos);
                    atualizarKPIs();
                    filtrarERenderizar();
                }
            });
        });

        document.querySelectorAll('.btn-cancelar-ped').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var p = lista[parseInt(this.dataset.idx)];
                var idx = pedidos.indexOf(p);
                if (confirm('Cancelar pedido ' + p.numero + '?')) {
                    pedidos[idx].status = 'Cancelado';
                    salvarCompras(pedidos);
                    atualizarKPIs();
                    filtrarERenderizar();
                }
            });
        });
    }

    // filtrar + renderizar
    function filtrarERenderizar() {
        var busca   = document.getElementById('campoBusca').value.toLowerCase().trim();
        var status  = document.getElementById('filtroStatus').value;

        var lista = pedidos.filter(function(p) {
            var matchBusca  = !busca  || p.numero.toLowerCase().indexOf(busca) >= 0 || p.fornecedor.toLowerCase().indexOf(busca) >= 0;
            var matchStatus = !status || p.status === status;
            return matchBusca && matchStatus;
        });

        renderizarTabela(lista);
    }

    document.getElementById('campoBusca').addEventListener('input', filtrarERenderizar);
    document.getElementById('filtroStatus').addEventListener('change', filtrarERenderizar);

    // modal
    var modalOverlay = document.getElementById('modalOverlay');
    document.getElementById('mData').value = new Date().toISOString().split('T')[0];

    document.getElementById('btnNovoPedido').addEventListener('click', function() {
        modalOverlay.style.display = 'flex';
    });

    function fecharModal() { modalOverlay.style.display = 'none'; }

    document.getElementById('modalFechar').addEventListener('click', fecharModal);
    document.getElementById('btnCancelar').addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) fecharModal();
    });

    document.getElementById('btnSalvar').addEventListener('click', function() {
        var forn  = document.getElementById('mFornecedor').value.trim();
        var data  = document.getElementById('mData').value;
        var itens = parseInt(document.getElementById('mItens').value);
        var valor = parseFloat(document.getElementById('mValor').value);
        var stat  = document.getElementById('mStatus').value;

        if (!forn || !data || isNaN(itens) || isNaN(valor)) {
            alert('Preencha todos os campos corretamente.');
            return;
        }

        var num = 'PO-2026-' + String(pedidos.length + 1).padStart(3, '0');

        pedidos.push({
            numero: num, fornecedor: forn, data: data,
            itens: itens, valor: valor, status: stat
        });

        salvarCompras(pedidos);
        fecharModal();
        atualizarKPIs();
        filtrarERenderizar();

        document.getElementById('mFornecedor').value = '';
        document.getElementById('mItens').value = '';
        document.getElementById('mValor').value = '';
        document.getElementById('mData').value = new Date().toISOString().split('T')[0];
    });

    // inicializa
    atualizarKPIs();
    filtrarERenderizar();
}