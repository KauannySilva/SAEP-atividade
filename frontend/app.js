
const $ = (seletor) => document.querySelector(seletor);

const $$ = (seletor) => [...document.querySelectorAll(seletor)];

const state = {
    produtos: [],
    estoque: [],
    movimentacoes: []
};

const moeda = (valor) =>
    Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

const numero = (valor) =>
    Number(valor || 0).toLocaleString('pt-BR', {
        maximumFractionDigits: 2
    });

const escapar = (valor) =>
    String(valor ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);

const normalizar = (valor) =>
    String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

function mostrarToast(mensagem, tipo = 'success') {
    const toast = $('#toast');

    toast.textContent = mensagem;
    toast.className = `toast show ${tipo}`;

    clearTimeout(mostrarToast.timer);

    mostrarToast.timer = setTimeout(() => {
        toast.className = 'toast';
    }, 3500);
}

function atualizarConexao(conectado) {
    $('#connectionText').textContent = conectado
        ? 'API conectada'
        : 'API desconectada';

    $('.status-dot').classList.toggle('offline', !conectado);
}

function mostrarPagina(pagina) {
    if (!$(`#page-${pagina}`)) return;

    $$('.page').forEach(secao => {
        secao.classList.toggle(
            'active',
            secao.id === `page-${pagina}`
        );
    });

    $$('.nav-link').forEach(botao => {
        botao.classList.toggle(
            'active',
            botao.dataset.page === pagina
        );
    });

    const titulos = {
        inicio: 'Início',
        produtos: 'Produtos',
        estoque: 'Estoque atual',
        movimentacoes: 'Movimentações'
    };

    $('#breadcrumbTitle').textContent = titulos[pagina];

    $('#sidebar').classList.remove('open');

    if (pagina === 'inicio') carregarInicio();

    if (pagina === 'produtos') carregarProdutos();

    if (pagina === 'estoque') carregarEstoque();

    if (pagina === 'movimentacoes') {
        carregarMovimentacoes();
        preencherProdutos();
    }
}

$$('[data-page]').forEach(botao => {
    botao.addEventListener('click', evento => {
        evento.preventDefault();
        mostrarPagina(botao.dataset.page);
    });
});

$('#mobileMenu').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
});

function renderizarProdutos(produtos, destino, comId = true) {
    if (!produtos.length) {
        destino.innerHTML = `
            <tr>
                <td colspan="${comId ? 6 : 4}" class="empty-cell">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;
        return;
    }

    destino.innerHTML = produtos.map(produto => {
        const quantidade = Number(produto.quantidade || 0);

        let classe = 'pill-success';

        if (quantidade <= 0) {
            classe = 'pill-danger';
        } else if (quantidade <= 5) {
            classe = 'pill-warning';
        }

        return `
            <tr>
                ${comId ? `
                    <td class="id-cell">#${escapar(produto.id)}</td>
                ` : ''}

                <td>
                    <div class="product-name">
                        <span class="product-avatar">
                            ${escapar(String(produto.nome || 'P').slice(0, 1).toUpperCase())}
                        </span>
                        <strong>${escapar(produto.nome || 'Sem nome')}</strong>
                    </div>
                </td>

                <td>${escapar(produto.categoria || '—')}</td>

                <td>
                    <span class="quantity-pill ${classe}">
                        ${numero(quantidade)}
                    </span>
                </td>

                <td>${moeda(produto.valor)}</td>

                ${comId ? `
                    <td>${escapar(produto.unidade_medida || '—')}</td>
                ` : ''}
            </tr>
        `;
    }).join('');
}

async function carregarProdutos() {

    console.log('A função carregarProdutos foi executada');
    const tabela = $('#productsTable');

    tabela.innerHTML = `
        <tr>
            <td colspan="6" class="empty-cell">
                Carregando produtos...
            </td>
        </tr>
    `;

    try {
        state.produtos = await buscarProdutos();

        console.log('Produtos recebidos da API:', state.produtos);

        atualizarConexao(true);
        renderizarTabelaProdutos();
        renderizarProdutosInicio();
        atualizarIndicadores();
        preencherProdutos();

    } catch (erro) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell error-text">
                    ${escapar(erro.message)}
                </td>
            </tr>
        `;

        atualizarConexao(false);
        mostrarToast(erro.message, 'error');
    }
}

function renderizarTabelaProdutos() {
    const busca = normalizar($('#productSearch').value);

    const filtrados = state.produtos.filter(produto =>
        normalizar([
            produto.id,
            produto.nome,
            produto.categoria,
            produto.unidade_medida
        ].join(' ')).includes(busca)
    );

    renderizarProdutos(filtrados, $('#productsTable'), true);

    $('#productsCount').textContent =
        `${state.produtos.length} produto(s) cadastrado(s)`;

    $('#productsFooter').textContent =
        `Exibindo ${filtrados.length} de ${state.produtos.length} produto(s)`;
}

function renderizarProdutosInicio() {
    const recentes = [...state.produtos].slice(-5).reverse();
    const tabela = $('#homeProducts');

    if (!recentes.length) {
        tabela.innerHTML = `
            <tr>
                <td colspan="4" class="empty-cell">
                    Nenhum produto cadastrado. Use “Novo produto” para começar.
                </td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = recentes.map(produto => {
        const quantidade = Number(produto.quantidade || 0);

        let classe = 'pill-success';

        if (quantidade <= 0) {
            classe = 'pill-danger';
        } else if (quantidade <= 5) {
            classe = 'pill-warning';
        }

        return `
            <tr>
                <td>
                    <div class="product-name">
                        <span class="product-avatar">
                            ${escapar(String(produto.nome || 'P').slice(0, 1).toUpperCase())}
                        </span>
                        <strong>${escapar(produto.nome || 'Sem nome')}</strong>
                    </div>
                </td>
                <td>${escapar(produto.categoria || '—')}</td>
                <td>
                    <span class="quantity-pill ${classe}">
                        ${numero(quantidade)}
                    </span>
                </td>
                <td>${moeda(produto.valor)}</td>
            </tr>
        `;
    }).join('');
}

function atualizarIndicadores() {
    const produtos = state.produtos;

    const unidades = produtos.reduce(
        (total, produto) => total + Number(produto.quantidade || 0),
        0
    );

    const valorTotal = produtos.reduce(
        (total, produto) =>
            total +
            Number(produto.quantidade || 0) *
            Number(produto.valor || 0),
        0
    );

    const zerados = produtos.filter(
        produto => Number(produto.quantidade || 0) <= 0
    ).length;

    $('#statProdutos').textContent = produtos.length;
    $('#statUnidades').textContent = numero(unidades);
    $('#statValor').textContent = moeda(valorTotal);
    $('#statZerados').textContent = zerados;
}

async function carregarInicio() {
    try {
        state.produtos = await buscarProdutos();

        atualizarConexao(true);
        renderizarProdutosInicio();
        atualizarIndicadores();

    } catch (erro) {
        atualizarConexao(false);

        $('#homeProducts').innerHTML = `
            <tr>
                <td colspan="4" class="empty-cell error-text">
                    ${escapar(erro.message)}
                </td>
            </tr>
        `;

        $('#statProdutos').textContent = '—';
        $('#statUnidades').textContent = '—';
        $('#statValor').textContent = '—';
        $('#statZerados').textContent = '—';
    }
}

function mostrarFormularioProduto(mostrar) {
    $('#productFormPanel').hidden = !mostrar;

    if (mostrar) {
        $('#productFormPanel').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

$('#openProductForm').addEventListener('click', () => {
    mostrarFormularioProduto(true);
});

$('#closeProductForm').addEventListener('click', () => {
    mostrarFormularioProduto(false);
});

$('#cancelProduct').addEventListener('click', () => {
    mostrarFormularioProduto(false);
});

$('#productSearch').addEventListener('input', renderizarTabelaProdutos);

$('#refreshProducts').addEventListener('click', carregarProdutos);

$('#productForm').addEventListener('submit', async evento => {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);

    const produto = {
        nome: String(dados.get('nome')).trim(),
        categoria: String(dados.get('categoria')).trim(),
        quantidade: Number(dados.get('quantidade')),
        valor: Number(dados.get('valor')),
        unidade_medida: String(dados.get('unidade_medida')).trim()
    };

    const mensagem = $('#productMessage');

    if (
        !produto.nome ||
        !produto.categoria ||
        !produto.unidade_medida ||
        produto.valor <= 0 ||
        produto.quantidade < 0
    ) {
        mensagem.textContent =
            'Confira os campos. O valor deve ser maior que zero.';

        mensagem.className = 'form-message error-text';
        return;
    }

    const botao = formulario.querySelector('[type="submit"]');

    botao.disabled = true;
    botao.textContent = 'Salvando...';
    mensagem.textContent = '';

    try {
        await cadastrarProduto(produto);

        formulario.reset();
        mostrarFormularioProduto(false);

        mostrarToast('Produto cadastrado com sucesso!');

        await carregarProdutos();

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = 'form-message error-text';

    } finally {
        botao.disabled = false;
        botao.textContent = 'Salvar produto';
    }
});

async function carregarEstoque() {
    const cabecalho = $('#stockHead');
    const tabela = $('#stockTable');

    cabecalho.innerHTML = '<tr><th>Carregando...</th></tr>';
    tabela.innerHTML = `
        <tr><td class="empty-cell">Carregando estoque...</td></tr>
    `;

    try {
        state.estoque = await buscarEstoque();

        atualizarConexao(true);
        renderizarEstoque();

    } catch (erro) {
        cabecalho.innerHTML = '<tr><th>Estoque atual</th></tr>';

        tabela.innerHTML = `
            <tr>
                <td class="empty-cell error-text">
                    ${escapar(erro.message)}
                </td>
            </tr>
        `;

        atualizarConexao(false);
    }
}

function renderizarEstoque() {
    const busca = normalizar($('#stockSearch').value);

    const filtrados = state.estoque.filter(item =>
        normalizar(Object.values(item).join(' ')).includes(busca)
    );

    const colunas = state.estoque.length
        ? Object.keys(state.estoque[0])
        : ['Informação'];

    $('#stockHead').innerHTML = `
        <tr>
            ${colunas.map(coluna => `
                <th>${escapar(coluna.replace(/_/g, ' '))}</th>
            `).join('')}
        </tr>
    `;

    if (!filtrados.length) {
        $('#stockTable').innerHTML = `
            <tr>
                <td colspan="${colunas.length}" class="empty-cell">
                    ${state.estoque.length
                        ? 'Nenhum resultado para sua busca.'
                        : 'A view não retornou registros.'}
                </td>
            </tr>
        `;
    } else {
        $('#stockTable').innerHTML = filtrados.map(item => `
            <tr>
                ${colunas.map(coluna => {
                    const valor = item[coluna];

                    if (valor === null || valor === undefined || valor === '') {
                        return '<td>—</td>';
                    }

                    if (/status/i.test(coluna)) {
                        let classe = 'pill-success';

                        if (/critico|zerado|baixo/i.test(String(valor))) {
                            classe = 'pill-danger';
                        } else if (/alerta/i.test(String(valor))) {
                            classe = 'pill-warning';
                        }

                        return `
                            <td>
                                <span class="quantity-pill ${classe}">
                                    ${escapar(valor)}
                                </span>
                            </td>
                        `;
                    }

                    if (/valor|preco|custo/i.test(coluna)) {
                        return `<td>${moeda(valor)}</td>`;
                    }

                    if (/quantidade|saldo|estoque/i.test(coluna)) {
                        return `<td><strong>${escapar(valor)}</strong></td>`;
                    }

                    return `<td>${escapar(valor)}</td>`;
                }).join('')}
            </tr>
        `).join('');
    }

    $('#stockFooter').textContent =
        `Exibindo ${filtrados.length} de ${state.estoque.length} registro(s)`;
}

$('#stockSearch').addEventListener('input', renderizarEstoque);

$('#refreshStock').addEventListener('click', carregarEstoque);

async function preencherProdutos() {
    const select = $('#movementProduct');

    try {
        if (!state.produtos.length) {
            state.produtos = await buscarProdutos();
        }

        if (!state.produtos.length) {
            select.innerHTML =
                '<option value="">Cadastre um produto primeiro</option>';
            return;
        }

        select.innerHTML = `
            <option value="">Selecione um produto</option>
            ${state.produtos.map(produto => `
                <option value="${escapar(produto.id)}">
                    ${escapar(produto.nome)} (ID ${escapar(produto.id)})
                </option>
            `).join('')}
        `;

    } catch {
        select.innerHTML =
            '<option value="">Não foi possível carregar os produtos</option>';
    }
}

function mostrarFormularioMovimentacao(mostrar) {
    $('#movementFormPanel').hidden = !mostrar;

    if (mostrar) {
        preencherProdutos();

        $('#movementFormPanel').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

$('#openMovementForm').addEventListener('click', () => {
    mostrarFormularioMovimentacao(true);
});

$('#closeMovementForm').addEventListener('click', () => {
    mostrarFormularioMovimentacao(false);
});

$('#cancelMovement').addEventListener('click', () => {
    mostrarFormularioMovimentacao(false);
});

$('#movementFilter').addEventListener('change', renderizarMovimentacoes);

$('#movementSearch').addEventListener('input', renderizarMovimentacoes);

$('#refreshMovements').addEventListener('click', carregarMovimentacoes);

$('#movementForm').addEventListener('submit', async evento => {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);

    const movimentacao = {
        id_produtos: Number(dados.get('id_produtos')),
        tipo: String(dados.get('tipo')),
        quantidade: Number(dados.get('quantidade'))
    };

    const mensagem = $('#movementMessage');

    if (
        !movimentacao.id_produtos ||
        movimentacao.quantidade <= 0
    ) {
        mensagem.textContent =
            'Selecione um produto e informe uma quantidade maior que zero.';

        mensagem.className = 'form-message error-text';
        return;
    }

    const botao = formulario.querySelector('[type="submit"]');

    botao.disabled = true;
    botao.textContent = 'Salvando...';
    mensagem.textContent = '';

    try {
        await registrarMovimentacao(movimentacao);

        formulario.reset();
        mostrarFormularioMovimentacao(false);

        mostrarToast('Movimentação registrada com sucesso!');

        await carregarMovimentacoes();
        await carregarInicio();

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = 'form-message error-text';

    } finally {
        botao.disabled = false;
        botao.textContent = 'Salvar movimentação';
    }
});

async function carregarMovimentacoes() {
    const tabela = $('#movementsTable');

    tabela.innerHTML = `
        <tr>
            <td colspan="5" class="empty-cell">
                Carregando movimentações...
            </td>
        </tr>
    `;

    try {
        state.movimentacoes = await buscarMovimentacoes();

        atualizarConexao(true);
        renderizarMovimentacoes();

    } catch (erro) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell error-text">
                    ${escapar(erro.message)}
                </td>
            </tr>
        `;

        atualizarConexao(false);
    }
}

function renderizarMovimentacoes() {
    const busca = normalizar($('#movementSearch').value);
    const filtro = $('#movementFilter').value;

    const filtradas = state.movimentacoes.filter(movimentacao => {
        const tipo = normalizar(movimentacao.tipo);

        const correspondeTipo =
            filtro === 'todas' || tipo === filtro;

        const correspondeBusca = normalizar([
            movimentacao.id,
            movimentacao.data_movimentacoes,
            movimentacao.id_produtos,
            movimentacao.tipo,
            movimentacao.quantidade
        ].join(' ')).includes(busca);

        return correspondeTipo && correspondeBusca;
    });

    if (!filtradas.length) {
        $('#movementsTable').innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    Nenhuma movimentação encontrada.
                </td>
            </tr>
        `;
    } else {
        $('#movementsTable').innerHTML = [...filtradas].reverse().map(m => {
            const tipo = normalizar(m.tipo);

            const nomeTipo = tipo === 'entrada'
                ? 'Entrada'
                : tipo === 'saida'
                    ? 'Saída'
                    : m.tipo || '—';

            const data = m.data_movimentacoes
                ? new Date(
                    `${String(m.data_movimentacoes).slice(0, 10)}T00:00:00`
                ).toLocaleDateString('pt-BR')
                : '—';

            const classe = tipo === 'entrada'
                ? 'type-in'
                : tipo === 'saida'
                    ? 'type-out'
                    : '';

            return `
                <tr>
                    <td class="id-cell">#${escapar(m.id)}</td>
                    <td>${escapar(data)}</td>
                    <td>Produto #${escapar(m.id_produtos)}</td>
                    <td>
                        <span class="movement-type ${classe}">
                            ${escapar(nomeTipo)}
                        </span>
                    </td>
                    <td><strong>${numero(m.quantidade)}</strong></td>
                </tr>
            `;
        }).join('');
    }

    $('#movementsFooter').textContent =
        `Exibindo ${filtradas.length} de ${state.movimentacoes.length} movimentação(ões)`;
}


document.addEventListener('DOMContentLoaded', () => {
    carregarInicio();
    carregarProdutos();
});
