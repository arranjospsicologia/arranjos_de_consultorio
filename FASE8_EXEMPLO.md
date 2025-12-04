# EXEMPLO DE USO - FASE 8

## Demonstração das Funcionalidades de UX Implementadas

### 1. Sistema de Notificações (Toast)

```javascript
import toast from 'react-hot-toast';

// Sucesso
toast.success('Cliente salvo com sucesso!');

// Erro
toast.error('Erro ao salvar cliente');

// Loading
const loadingToast = toast.loading('Carregando...');
// ... após carregamento
toast.dismiss(loadingToast);
toast.success('Dados carregados!');

// Custom
toast('Informação importante', {
  icon: 'ℹ️',
  duration: 3000
});
```

### 2. Modal de Confirmação

```javascript
import ConfirmModal from '../components/ConfirmModal';
import { useState } from 'react';

function MinhaPage() {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDelete = (id) => {
    setItemToDelete(id);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/clientes/${itemToDelete}`);
      toast.success('Cliente excluído com sucesso!');
      setConfirmModalOpen(false);
      carregarDados();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  return (
    <>
      <button onClick={() => handleDelete(123)}>Excluir</button>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Deseja realmente excluir este cliente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
}
```

### 3. Loading Skeleton

```javascript
import { TableSkeleton, CardSkeleton, ListSkeleton, Spinner } from '../components/LoadingSkeleton';

function MinhaPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div>
        {/* Skeleton de tabela */}
        <TableSkeleton rows={5} columns={5} />

        {/* Skeleton de cards */}
        <div className="grid grid-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Skeleton de lista */}
        <ListSkeleton items={5} />

        {/* Spinner inline */}
        <Spinner size="md" />
      </div>
    );
  }

  return <div>Conteúdo carregado</div>;
}
```

### 4. Validação de CPF

```javascript
import { validarCPF, formatarCPF, validarEmail, validarTelefone, validarCampoObrigatorio } from '../utils/validations';

function FormularioCliente() {
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState('');

  const handleCpfChange = (e) => {
    const valor = e.target.value;
    setCpf(formatarCPF(valor));

    if (valor && !validarCPF(valor)) {
      setErro('CPF inválido');
    } else {
      setErro('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos
    if (!validarCampoObrigatorio(nome)) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (cpf && !validarCPF(cpf)) {
      toast.error('CPF inválido');
      return;
    }

    if (email && !validarEmail(email)) {
      toast.error('Email inválido');
      return;
    }

    // Salvar...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={cpf}
        onChange={handleCpfChange}
        placeholder="000.000.000-00"
        maxLength={14}
      />
      {erro && <span className="error">{erro}</span>}
    </form>
  );
}
```

### 5. Exportação de Dados

```javascript
import { exportarParaCSV, exportarFinanceiroParaCSV, exportarClientesParaCSV } from '../utils/exportUtils';
import toast from 'react-hot-toast';

function PaginaFinanceiro() {
  const [registros, setRegistros] = useState([]);

  const handleExportar = () => {
    try {
      exportarFinanceiroParaCSV(registros);
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dados');
    }
  };

  return (
    <div>
      <button onClick={handleExportar} className="btn btn-secondary">
        📥 Exportar CSV
      </button>
    </div>
  );
}

function PaginaClientes() {
  const [clientes, setClientes] = useState([]);

  const handleExportar = () => {
    try {
      exportarClientesParaCSV(clientes);
      toast.success('Clientes exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar clientes');
    }
  };

  return (
    <div>
      <button onClick={handleExportar} className="btn btn-secondary">
        📥 Exportar Clientes
      </button>
    </div>
  );
}
```

### 6. Exemplo Completo - Página com Todas as Melhorias

```javascript
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { validarCPF, formatarCPF, validarEmail } from '../utils/validations';
import { exportarClientesParaCSV } from '../utils/exportUtils';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, clienteId: null });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
      toast.success('Clientes carregados!');
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = (id) => {
    setConfirmModal({ isOpen: true, clienteId: id });
  };

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/clientes/${confirmModal.clienteId}`);
      toast.success('Cliente excluído com sucesso!');
      setConfirmModal({ isOpen: false, clienteId: null });
      carregarClientes();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleExportar = () => {
    try {
      exportarClientesParaCSV(clientes);
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dados');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h2>Clientes</h2>
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h2>Clientes</h2>
        <div className="actions">
          <button onClick={handleExportar} className="btn btn-secondary">
            📥 Exportar CSV
          </button>
          <button className="btn btn-primary">+ Novo Cliente</button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.nome}</td>
              <td>{cliente.email}</td>
              <td>{cliente.telefone}</td>
              <td>
                <span className={`badge badge-${cliente.status}`}>
                  {cliente.status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleExcluir(cliente.id)}
                  aria-label={`Excluir ${cliente.nome}`}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, clienteId: null })}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        message="Deseja realmente excluir este cliente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ClientesPage;
```

### 7. Acessibilidade (ARIA)

```javascript
// Botões com labels
<button aria-label="Excluir cliente" onClick={handleDelete}>
  🗑️
</button>

// Inputs com labels associados
<label htmlFor="nome">Nome:</label>
<input id="nome" type="text" name="nome" />

// Modais com role e aria-labelledby
<div role="dialog" aria-labelledby="modal-title" aria-describedby="modal-desc">
  <h2 id="modal-title">Título do Modal</h2>
  <p id="modal-desc">Descrição do modal</p>
</div>

// Status de loading
<div role="status" aria-label="Carregando dados">
  <Spinner />
</div>

// Navegação por teclado
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Ação
</button>
```

## Checklist de Implementação

- ✅ Sistema de notificações toast
- ✅ Loading states e skeletons
- ✅ Validações de formulário (CPF, email, telefone)
- ✅ Confirmações de ações destrutivas
- ✅ Exportação de dados (CSV)
- ✅ Atributos ARIA para acessibilidade
- ✅ Feedback visual de erros
- ✅ Navegação por teclado
- ✅ Spinners para ações assíncronas

## Boas Práticas Aplicadas

1. **Sempre use toast ao invés de alert()**
2. **Sempre use ConfirmModal ao invés de window.confirm()**
3. **Valide dados do lado do cliente antes de enviar**
4. **Mostre loading skeleton durante carregamentos**
5. **Forneça feedback visual para todas as ações**
6. **Use aria-labels para elementos interativos**
7. **Formate dados de entrada automaticamente (CPF, telefone)**
8. **Trate erros de forma elegante**
