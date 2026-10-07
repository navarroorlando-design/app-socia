/* ------------------------------------------------------------------ */
/* Textos do tutorial: tour de boas-vindas, dicas de primeira vez e    */
/* perguntas comuns. Ficam aqui, sem React, para a IA também ler       */
/* (src/ia/motor.js) e responder "como faço…" com as mesmas palavras.  */
/* ------------------------------------------------------------------ */

// Tour de boas-vindas: um assunto por cartão. A miniatura de cada um é montada em src/telas/Ajuda.jsx.
const PASSOS_TOUR = [
  {
    id: "inicio",
    titulo: "Tudo começa no Início",
    texto: "O cartão escuro mostra quanto está bloqueado hoje em todos os clientes. Logo abaixo ficam o passivo da carteira e quatro atalhos: Bloqueios, Sigo, Buscar e Perguntar.",
  },
  {
    id: "os",
    titulo: "Cada cliente, por contrato",
    texto: "Na aba OS, toque num cliente. A tela abre pelo passivo de cada contrato de gestão e, depois, pelos bloqueios e pelos processos.",
  },
  {
    id: "ia",
    titulo: "Pergunte com suas palavras",
    texto: "Na aba IA, escreva como falaria com um colega ou toque numa sugestão. A IA monta relatórios com gráficos, e os números vêm sempre dos sistemas do escritório.",
  },
  {
    id: "pessoal",
    titulo: "Anotações e avisos só seus",
    texto: "Em um processo ou contrato, você pode segui-lo, escrever uma anotação que só você vê e tocar em “Avisar se…” para receber um alerta.",
  },
  {
    id: "perfil",
    titulo: "Do seu jeito",
    texto: "Em Perfil, você aumenta a letra, liga o botão Ouvir e escolhe o que aparece no Início. Esta explicação fica lá, em “Como usar o app”.",
  },
];

// Dicas de primeira vez: aparecem uma vez em cada tela, até a sócia tocar em "Entendi".
const DICAS = {
  inicio: "Os atalhos levam direto aos bloqueios, aos processos que você segue, à busca e à IA. Para mudar o que aparece aqui, use Perfil → Personalizar Início.",
  osLista: "Toque num cliente para ver o passivo de cada contrato de gestão, os bloqueios e os processos dele.",
  osPerfil: "Comece por Contratos de gestão: lá está o passivo de cada contrato, que é o que o cliente costuma perguntar.",
  contrato: "Aqui você gera o PDF do passivo para enviar ao cliente e pode pedir um aviso se o passivo passar de um valor.",
  processo: "Toque em Seguir processo para receber as movimentações novas. “Contar a história do processo” pede à IA um resumo por fases.",
  ia: "Escreva como falaria com um colega. A IA consulta os números do escritório e monta gráficos. Toque num gráfico para ver o valor exato.",
};

// Perguntas comuns (Perfil → Como usar o app). `destino` é a tela aberta pelo botão "Me leve lá".
const PERGUNTAS = [
  {
    id: "passivo",
    pergunta: "O que é o passivo estimado?",
    resposta: "É a soma do valor em discussão nos processos ativos de um contrato de gestão, separada pelo prognóstico do escritório: provável, possível e remoto. Os bloqueios aparecem à parte, porque são dinheiro que já saiu da conta.",
    destino: "carteira", rotuloDestino: "Ver o passivo da carteira",
  },
  {
    id: "contrato",
    pergunta: "Onde vejo o passivo de cada contrato de gestão?",
    passos: ["Toque em OS, na barra de baixo.", "Escolha o cliente.", "Toque em Contratos de gestão, o primeiro cartão."],
    destino: "os", rotuloDestino: "Abrir a aba OS",
  },
  {
    id: "relatorio",
    pergunta: "Como mando o relatório de passivo ao cliente?",
    passos: ["Abra o cliente na aba OS e toque em Contratos de gestão.", "Toque em Relatório para o cliente (PDF).", "Confira a prévia, marque a conferência e gere o PDF."],
    destino: "contratos", rotuloDestino: "Abrir os contratos de gestão",
  },
  {
    id: "alerta",
    pergunta: "Como peço para ser avisada?",
    resposta: "Toque em “Avisar se…” num processo (parado há tantos dias), num contrato (passivo acima de um valor) ou nos bloqueios de um cliente (bloqueado acima de um valor). Também dá para pedir à IA: “Me avise se o bloqueado da AFNE passar de R$ 500 mil”. Quando o limite é passado, chega uma notificação.",
    destino: "alertas", rotuloDestino: "Ver meus alertas",
  },
  {
    id: "seguir",
    pergunta: "Como sigo um processo?",
    resposta: "Abra o processo e toque em Seguir processo. Os que você segue ficam no atalho Sigo, no Início, e as movimentações novas chegam como notificação.",
    destino: "acompanhando", rotuloDestino: "Ver os que eu sigo",
  },
  {
    id: "anotacao",
    pergunta: "Como faço uma anotação só minha?",
    resposta: "Num processo, contrato ou cliente, toque em Adicionar anotação pessoal. Ela fica num bloco bege no alto da tela. Só você vê: não vai para o Legal One nem para a equipe.",
    destino: "org", rotuloDestino: "Abrir um cliente",
  },
  {
    id: "ia",
    pergunta: "Como pergunto à IA? Posso confiar nos números?",
    resposta: "Na aba IA, escreva a pergunta como falaria com um colega ou toque numa sugestão. A IA não inventa números: ela consulta os dados do escritório, e o app desenha os gráficos com esses dados. Toque num gráfico para ver o valor exato. Para guardar uma resposta, toque em Fixar: ela vai para Perfil → Relatórios fixados.",
    destino: "ia", rotuloDestino: "Abrir a IA",
  },
  {
    id: "leitura",
    pergunta: "Como aumento a letra ou ouço os textos?",
    resposta: "Em Perfil → Leitura, escolha Maior ou Muito maior. Ligue “Ouvir os resumos da IA” para aparecer o botão Ouvir nas respostas.",
    destino: "perfil", rotuloDestino: "Abrir Perfil",
  },
  {
    id: "personalizar",
    pergunta: "Como mudo o que aparece no Início?",
    resposta: "Em Perfil → Personalizar Início, mostre, esconda ou mude a ordem dos blocos. A saudação fica sempre no alto, e o primeiro bloco aparece em destaque, em carvão.",
    destino: "personalizar", rotuloDestino: "Personalizar o Início",
  },
  {
    id: "buscar",
    pergunta: "Como acho um processo pelo número?",
    resposta: "No Início, toque em Buscar e digite parte do número, o nome do cliente ou uma palavra da descrição.",
    destino: "busca", rotuloDestino: "Abrir a busca",
  },
  {
    id: "seguranca",
    pergunta: "Como protejo o app se perder o celular?",
    resposta: "Em Perfil → Segurança, ligue Abrir com Face ID. O app passa a pedir o rosto sempre que abre. Ali também dá para sair da conta.",
    destino: "seguranca", rotuloDestino: "Abrir Segurança",
  },
  {
    id: "dados",
    pergunta: "De onde vêm os dados?",
    resposta: "Dos relatórios do Legal One e do Log de Bloqueios do escritório, atualizados todos os dias, e das movimentações do DataJud. O app só mostra: nada do que você faz aqui muda os sistemas. Neste protótipo, os dados são de exemplo.",
  },
];

// Texto corrido de uma pergunta (para ouvir e para a IA)
const textoDaPergunta = (p) => [p.resposta, ...(p.passos || []).map((s, i) => `${i + 1}. ${s}`)].filter(Boolean).join(" ");

export { DICAS, PASSOS_TOUR, PERGUNTAS, textoDaPergunta };
