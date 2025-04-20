import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import b1 from './assets/barbeiro/eu.jpg';
import axios from 'axios';

// Função para gerar os próximos 7 dias
const gerarProximos7Dias = () => {
  const proximos7Dias = [];
  for (let i = 0; i < 7; i++) {
    const data = new Date();
    data.setDate(data.getDate() + i);
    const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(data);
    const diaMes = data.getDate();
    proximos7Dias.push({
      valor: data.toISOString().split('T')[0],
      label: `${diaSemana}, ${diaMes}`,
    });
  }
  return proximos7Dias;
};

// Função para obter horários disponíveis (simulado)
const obterHorariosDisponiveis = () => {
  return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: 'Olá, tudo bem? Sou a assistente virtual do(a) Oficina Do Corte e cuido do agendamento dos serviços dos profissionais dele(a), ok?',
      sender: 'bot',
    },
  ]);
  const [step, setStep] = useState(1);
  const [input, setInput] = useState('');
  const [nome, setNome] = useState('');
  const [servico, setServico] = useState('');
  const [horario, setHorario] = useState('');
  const [barbeiro, setBarbeiro] = useState('');
  const [data, setData] = useState('');
  const chatBoxRef = useRef(null);
  const chatContainerRef = useRef(null); // Referência para o container principal

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: 'Por gentileza, Digite seu nome e sobrenome', sender: 'bot' },
      ]);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const newUserMessage = { text: trimmedInput, sender: 'user' };
    let newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput('');

    switch (step) {
      case 1:
        setNome(trimmedInput);
        newMessages.push({ text: `Prazer, ${trimmedInput}! Qual serviço deseja?`, sender: 'bot' });
        newMessages.push({
          tipo: 'opcoes',
          opcoes: [
            { nome: 'Corte & Barba', preco: 'R$ 40,00', duracao: '1hr' },
            { nome: 'Corte', preco: 'R$ 25,00', duracao: '40min' },
            { nome: 'Barba', preco: 'R$ 15,00', duracao: '30min' },
            { nome: 'Sobrancelha', preco: 'R$ 5,00', duracao: '10min' },
            { nome: 'Corte Social', preco: 'R$ 20,00', duracao: '30min' },
            { nome: 'Skin Care | Limpeza Facial', preco: 'R$ 30,00', duracao: '30min' },
            { nome: 'Luzes', preco: 'R$ 50,00', duracao: '1hr' },
            { nome: 'Nevou', preco: 'R$ 70,00', duracao: '1hr' },
            { nome: 'Depilação Nasal', preco: 'R$ 25,00', duracao: '30min' },
            { nome: 'Pezinho', preco: 'R$ 10,00', duracao: '10min' },
            { nome: 'Barboterapia', preco: 'R$ 25,00', duracao: '30min' },
            { nome: 'Corte Navalhado', preco: 'R$ 30,00', duracao: '40min' },
          ],
          sender: 'bot',
        });
        setStep(2);
        break;
      default:
        break;
    }
  };

  const handleOpcaoClick = (opcao) => {
    let mensagensAtualizadas = messages.filter(
      (msg) => msg.tipo !== 'opcoes' && msg.tipo !== 'barbeiros' && msg.tipo !== 'datas'
    );
    setMessages([...mensagensAtualizadas, { text: opcao?.nome || opcao?.label || opcao, sender: 'user' }]);

    switch (step) {
      case 2:
        setServico(opcao.nome);
        setMessages((prev) => [
          ...prev,
          { text: 'Ótimo! Agora selecione a data:', sender: 'bot' },
          { tipo: 'datas', opcoes: gerarProximos7Dias(), sender: 'bot' },
        ]);
        setStep(3);
        break;
      case 3:
        setData(opcao);
        const dataSelecionada = new Date(opcao).toLocaleDateString('pt-BR');
        setMessages((prev) => [
          ...prev,
          { text: dataSelecionada, sender: 'user' },
          { text: 'Horários disponíveis para esta data:', sender: 'bot' },
          { tipo: 'horarios', opcoes: obterHorariosDisponiveis(), sender: 'bot' },
        ]);
        setStep(4);
        break;
      case 5:
        setBarbeiro(opcao?.nome || '');
        const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
        const mensagemConfirmacao = `🎉 Agendamento confirmado!\n\n👤 Cliente: ${nome}\n💈 Serviço: ${servico}\n📅 Data: ${dataFormatada}\n⏰ Horário: ${horario}\n✂️ Barbeiro: ${opcao?.nome || 'Não informado'}\n\nAguarde enquanto salvamos seus dados...`;

        setMessages((prev) => [
          ...prev,
          { text: mensagemConfirmacao, sender: 'bot' },
        ]);
        setStep(6);

        const agendamento = {
          nome: nome,
          barbeiro: opcao?.nome || '',
          servico: servico,
          data_hora: `${data} ${horario}:00`,
        };

        axios
          .post('http://localhost:3001/agendar', agendamento)
          .then((response) => {
            setMessages((prev) => [
              ...prev,
              { text: '✅ Dados salvos com sucesso no servidor! Até logo! 👋', sender: 'bot' },
            ]);
          })
          .catch((error) => {
            console.error('Erro ao enviar agendamento:', error);
            setMessages((prev) => [
              ...prev,
              { text: '❌ Ocorreu um erro ao salvar os dados. Tente novamente mais tarde.', sender: 'bot' },
            ]);
          });
        break;
      default:
        break;
    }
  };

  const handleOpcaoClickServico = (opcao) => {
    let mensagensAtualizadas = messages.filter(
      (msg) => msg.tipo !== 'opcoes' && msg.tipo !== 'barbeiros' && msg.tipo !== 'datas'
    );
    setMessages([...mensagensAtualizadas, { text: opcao.nome, sender: 'user' }]);
    setServico(opcao.nome);
    setMessages((prev) => [
      ...prev,
      { text: 'Ótimo! Agora selecione a data:', sender: 'bot' },
      { tipo: 'datas', opcoes: gerarProximos7Dias(), sender: 'bot' },
    ]);
    setStep(3);
  };

  const handleOpcaoClickData = (opcao) => {
    setData(opcao);
    const dataSelecionada = new Date(opcao).toLocaleDateString('pt-BR');
    setMessages((prev) => [
      ...prev.filter((msg) => msg.tipo !== 'datas'),
      { text: dataSelecionada, sender: 'user' },
      { text: 'Horários disponíveis para esta data:', sender: 'bot' },
      { tipo: 'horarios', opcoes: obterHorariosDisponiveis(), sender: 'bot' },
    ]);
    setStep(4);
  };

  const handleOpcaoClickHorario = (opcao) => {
    setHorario(opcao);
    setMessages((prev) => [
      ...prev.filter((msg) => msg.tipo !== 'horarios'),
      { text: opcao, sender: 'user' },
      {
        tipo: 'barbeiros',
        opcoes: [
          { nome: 'Lucas', imagem: b1 },
          { nome: 'João', imagem: b1 },
          { nome: 'Carlos', imagem: b1 },
        ],
        sender: 'bot',
      },
    ]);
    setStep(5);
  };

  const handleOpcaoClickBarbeiro = (opcao) => {
    setBarbeiro(opcao?.nome || '');
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
    const mensagemConfirmacao = `🎉 Agendamento confirmado!\n\n👤 Cliente: ${nome}\n💈 Serviço: ${servico}\n📅 Data: ${dataFormatada}\n⏰ Horário: ${horario}\n✂️ Barbeiro: ${opcao?.nome || 'Não informado'}\n\nAguarde enquanto salvamos seus dados...`;

    setMessages((prev) => [
      ...prev,
      { text: mensagemConfirmacao, sender: 'bot' },
    ]);
    setStep(6);

    const agendamento = {
      nome: nome,
      barbeiro: opcao?.nome || '',
      servico: servico,
      data_hora: `${data} ${horario}:00`,
    };

    axios
      .post('http://localhost:3001/agendar', agendamento)
      .then((response) => {
        setMessages((prev) => [
          ...prev,
          { text: '✅ Dados salvos com sucesso no servidor! Até logo! 👋', sender: 'bot' },
        ]);
      })
      .catch((error) => {
        console.error('Erro ao enviar agendamento:', error);
        setMessages((prev) => [
          ...prev,
          { text: '❌ Ocorreu um erro ao salvar os dados. Tente novamente mais tarde.', sender: 'bot' },
        ]);
      });
  };

  const renderOpcoes = () => {
    const msgOpcoes = messages.find((msg) => msg.tipo);
    if (!msgOpcoes) return null;

    switch (msgOpcoes.tipo) {
      case 'opcoes':
        return (
          <div className="opcoes">
            {msgOpcoes.opcoes.map((op, index) => (
              <button
                key={index}
                onClick={() => handleOpcaoClickServico(op)}
                className="botao-opcao servico"
              >
                <strong>{op.nome}</strong>
                <br />
                <span>{op.preco} • {op.duracao}</span>
              </button>
            ))}
          </div>
        );
      case 'datas':
        return (
          <div className="opcoes">
            {msgOpcoes.opcoes.map((dia, index) => (
              <button
                key={index}
                onClick={() => handleOpcaoClickData(dia.valor)}
                className="botao-opcao data"
              >
                {dia.label}
              </button>
            ))}
          </div>
        );
      case 'horarios':
        return (
          <div className="horarios-container">
            <div className="grid-horarios">
              {msgOpcoes.opcoes.map((horario, index) => (
                <button
                  key={index}
                  onClick={() => handleOpcaoClickHorario(horario)}
                  className="botao-opcao horario"
                >
                  {horario}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setMessages((prev) => [
                  ...prev.filter((msg) => msg.tipo !== 'horarios'),
                  { text: 'Vamos tentar outra data. Quando você prefere?', sender: 'bot' },
                  { tipo: 'datas', opcoes: gerarProximos7Dias(), sender: 'bot' },
                ]);
                setStep(3);
              }}
              className="botao-voltar"
            >
              ↻ Ver outras datas
            </button>
          </div>
        );
      case 'barbeiros':
        return (
          <div className="barbeiros">
            {msgOpcoes.opcoes.map((barbeiro, index) => (
              <button
                key={index}
                onClick={() => handleOpcaoClickBarbeiro(barbeiro)}
                className="botao-opcao barbeiros barbeiro-card"
              >
                <img src={barbeiro.imagem} alt={barbeiro.nome} className="barbeiro-img" />
                <span>{barbeiro.nome}</span>
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };


  useEffect(() => {
    const inputElement = document.querySelector('.chat-input input');

    const handleFocus = () => {
      if (chatContainerRef.current) {
        // Ajuste a altura do container para deixar espaço para o teclado
        chatContainerRef.current.style.maxHeight = '60vh'; // Experimente diferentes valores
      }
    };

    const handleBlur = () => {
      if (chatContainerRef.current) {
        // Restaura a altura original
        chatContainerRef.current.style.maxHeight = '100vh';
      }
    };

    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  return (
    <div className="chat-container" ref={chatContainerRef}>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, i) =>
          msg.text ? (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text.split('\n').map((line, idx) => (
                <span key={idx}>{line}</span>
              ))}
            </div>
          ) : null
        )}
      </div>

      <div className="opcoes-container">{renderOpcoes()}</div>

      <form onSubmit={handleSend} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Chatbot;