Estou criando um sistema web para gerenciamento de consultório.
Ele deve ser intuitivo e simples de usar. Armazenar as informações de maneira inteligente, de forma que seja possível projetar agendamentos para semanas futuras e, qualquer alteração feita em um data altere o conteúdo da semana especificada em diante.

A navegação deve ser intuitiva. Serão necessárias abas para gerenciar:
[Agenda], [Acompanhar], [Financeiro], [Estatísticas]
Também será necessário um botão de [Configuração], no canto oposto.

Ao abrir o sistema, após fazer login no serviço, o cliente terá acesso apenas aos seus próprios dados.
A primeira vez que ele abrir o sistema, será convidado a ir à aba [Configuração] preencher seus dados e configurar a plataforma.

Em [Configuração], o sistema deve ter seções para:
- Configurar serviços, onde é possível determinar uma duração (de 15 em 15 minutos, até 120, ou personalizado) para cada serviço, e um valor padrão. Isso deve ser apresentado em uma tabela de fácil visualização. Deve ser possível adicionar novos serviços. Por padrão, estão preenchidos: Atendimento individual, 60 minutos, 200 reais; Atendimento de casal, 75 minutos, 240 reais.
- Configurar a exibição da agenda, onde é possível determinar os intervalos de exibição dos blocos na agenda do sistema (a cada 10, 15, 30 ou 60 minutos), os dias de trabalho (de domingo a sábado, por padrão. Podendo ser desabilitados. Esses dias serão exibidos na agenda semanal). E os horários de trabalho (por padrão 24 horas), também serão exibidos na agenda.
- Configurar os meios de pagamento que aceita, e a taxa que cada um deles cobra. Por padrão: Dinheiro, 0%; Pix, 0%; Transferência, 0%; Crédito, 4,5%; Picpay, 3,99%. Isso calculará a taxa paga automaticamente, assim, caso o cliente faça alguma alteração, o sistema deve perguntar desde quando a taxa mudou e fazer a alteração apenas daquela data em diante, ainda fazendo os cálculos anteriores à data informada com os valores prévios.
- Configurar conta de banco: Inserir valores como banco, agência, conta, CPF ou CNPJ.
- Configurar dados pessoais: Inserir nome completo do usuário e seu CRP. Esse valor aparecerá em textos de notas fiscais, que geraremos automaticamente.

Em [Clientes], deve ser possível:
- Registrar novo cliente, com informações pessoais (CPF, telefone, Email, endereço, aniversario, sexo), serviço (da tabela de ajustes e, que ao preencher busca os dados de valor padrão), e o preço acordado (incluindo a opção de ser um valor fixo mensal ou um valor por sessão), que é buscado ao selecionar o serviço, mas pode ser alterado na hora.
- Esse novo cliente pode ser um cliente individual, casal, família, ou outra categoria. Assim, pode ser necessário incluir mais de um Nome/cpf/telefone por “cliente cadastrado”.
- Visualizar os clientes registrados. Deve ser possível buscar por um cliente específico. Deve ser possível exibir todos os clientes ou ocultar todos os clientes. Deve ser possível organizar os clientes em ordem alfabética, por ordem de entrada, por ordem de registro, por data de aniversário (sem considerar idade, apenas mês e dia).
- Editar os dados de um cliente registrado. Ao editar o valor acordado, o sistema deve perguntar desde quando e, novamente, manter os cálculos anterior à data informada com o valor prévio.

Em [Agenda] deve ser possível:
- Visualizar uma agenda semanal, com os dias e horários exibidos em blocos de acordo com a configuração em [Configuração]. Com a data e dia da semana, e um botão para alternar para a semana anterior ou próxima. Também deve haver um botão de calendário para selecionar um ano, mês, dia, e pular para aquela semana em específico.
- Exibir os agendamentos já realizados. Com nome do cliente legível, serviço com menor destaque, hora inicial – hora final.
- Ao clicar em um bloco VAZIO, deve exibir uma tela pedindo o nome do cliente, onde é possível selecionar entre os clientes registrados. Também deve haver um botão para registrar um cliente, conforme o registro em [Clientes]. Ao selecionar um cliente registrado, busca as informações de serviço e valor. Essas informações devem poder ser editadas nessa tela, sendo referentes ao serviço e valor daquele agendamento. Também deve pedir por uma frequência de repetição (Apenas esta consulta, toda semana, a cada duas semanas). Também deve pedir por número de consultas a serem agendadas, 10 por padrão, 32 no máximo. Abaixo deve haver os botões AGENDAR e CANCELAR. Ao clicar em Agendar, os agendamentos devem ser realizados conforme os dados informados: repetindo aquele cliente, com aquele serviço e preço, na frequência informada, o número de vezes informada. O bloco passa a ser exibido na agenda com outros agendamentos, de maneira que preencha os blocos equivalentes à duração (por exemplo, se os blocos de horario são de 15 minutos, um agendamento de sessão de 60 minutos deve ocupar o espaço de 4 blocos).
- Ao clicar em um bloco PREENCHIDO por um agendamento, deve abrir as informações do cliente, serviço, valor. Serviço e valor devem ser editáveis, e ao editar o sistema deve perguntar se o usuário deseja alterar isso apenas para essa consulta ou para todas as consultas a partir desta data (por exemplo, se o usuário negociou novo preço com o cliente. Todos os outros agendamentos devem ter esse preço). Também deve haver o botão cancelar consulta. O sistema deve perguntar se deseja cancelar apenas esta ou todas as consultas a partir desta data. Ao clicar em cancelar todas as consultar, deve ser armazenado no sistema que o cliente “encerrou os atendimentos” a partir da data do seu ultimo atendimento realizado.
- Deve ser possível arrastar os agendamentos entre os blocos. Se arrastar, deve ficar registrado que esse horário foi alterado nessa semana (será usado no cálculo final das estatísticas como reagendamento, ou “R”)

Esses agendamentos, quando anteriores à data atual, necessitam uma informação importante para calculo: Se o cliente compareceu (Presença, ou “P”), faltou com notificação prévia (Falta, ou “F”), faltou sem notificar (Falta Cobrada ou “FC”), se eles não foram realizados devido a uma um feriado, (Data Comemorativa, ou “D”), ou cancelados pelo próprio profissional (Cancelado pelo Terapeuta, ou “T”)
- Ao lado dos agendamentos que forem anteriores à data atual, na direita dos dados do agendamento, devem haver quatro opções pequenas para clicar: “P”, “F”, “FC”, “...”. Ao clicar em “...” deve surgir uma lista com todos os nomes (Presença, Falta Justificada, Falta Cobrada, Cancelado por Data Comemorativa, Cancelado pelo Terapeuta.
- Abaixo desses botões, deve haver um botão de “$”, levemente apagado. Ao clicar, ele fica verde claro. Clicar novamente retorna o botão ao estado levemente apagado. Quando verde, indicará que a sessão já foi paga.

Em [Acompanhar],
- Deve ser possível ver a lista de todos os clientes que estiverem agendados nesta semana. Caso algum cliente esteja agendado nas últimas duas semanas mas, não nesta semana.
- Deve ser possível organizar os clientes: 1. Pela ordem dos seus atendimentos na semana, por data e hora; 2. Em ordem alfabética;
- Ao lado do nome dos clientes, uma tabela deve mostrar as datas de dias de trabalho daquela semana. Ali, aparecem as informações de atendimentos “P”, “F”, “FC”, etc, conforme já preenchidas na agenda. Deve ser possível editar essas informações nessa tabela.
- Ao lado, também, o valor de cada sessão combinada com o cliente (variando de acordo com a semana, caso tenha sido alterado na agenda. E deve poder ser alterado nessa tela também)
- Ao lado, o símbolo de $, conforme em agendamento.
- Ao lado, um checkbox para marcar se uma NF foi emitida ou não.
- A divida total do cliente, somando as sessões realizadas e não pagas.

Em [Financeiro],
- Deve ser possível anotar as despesas da clinica, com data e valor.
- Também deve ser possível incluir outras fontes de receita, por exemplo, sublocações ou supervisão de outros profissionais.

Em [Estatísticas],
- Deve ser possível selecionar um mês e visualizar:
A produção total do mês (quanto foi produzido).
A receita total do mês (quanto foi recebido).
As despesas totais da empresa
O valor da média ponderada por atendimento realizado.
O valor da média ponderada por hora ocupada (contando as Faltas e os Reagendamentos).

- Também deve ser possível avaliar esses dados em um período (de 2 a 12 meses)


