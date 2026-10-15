
const API_URL = '';

async function apiRequest(path, options = {}) {
    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                ...(options.body ? {
                    'Content-Type': 'application/json'
                } : {}),
                ...(options.headers || {})
            }
        });
    } catch {
        throw new Error(
            'Não foi possível conectar à API. Confira se o servidor está rodando na porta 3000.'
        );
    }

    const contentType = response.headers.get('content-type') || '';

    const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message = typeof data === 'object' && data
            ? data.erro || data.error || data.message || 'Ocorreu um erro na API.'
            : 'Ocorreu um erro na API.';

        throw new Error(message);
    }

    return data;
}

function buscarProdutos() {
    return apiRequest('/produtos');
}

function buscarEstoque() {
    return apiRequest('/produtos/vw_estoque');
}

function buscarMovimentacoes() {
    return apiRequest('/movimentacoes');
}

function cadastrarProduto(produto) {
    return apiRequest('/produtos', {
        method: 'POST',
        body: JSON.stringify(produto)
    });
}

function registrarMovimentacao(movimentacao) {
    return apiRequest('/movimentacoes', {
        method: 'POST',
        body: JSON.stringify(movimentacao)
    });
}
