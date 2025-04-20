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
  const chatbotContainerRef = useRef(null); // Referência para o container principal

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
      (msg) => msg.tipo !== 'opcoes' && msg.tipo !== 'barbeiros' && msg.tipo !== 'datas' && msg.tipo !== 'horarios'
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
      case 4:
        setHorario(opcao);
        setMessages((prev) => [
          ...prev,
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
          .then(() => {
            setMessages((prev) => [
              ...prev,
              { text: '✅ Dados salvos com sucesso no servidor! Até logo! 👋', sender: 'bot' },
            ]);
          })
          .catch(() => {
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

  const renderOpcoes = (mensagem) => {
    if (mensagem.tipo === 'opcoes') {
      return (
        <div className="opcoes">
          {mensagem.opcoes.map((opcao, idx) => (
            <button key={idx} onClick={() => handleOpcaoClick(opcao)} className="botao-opcao servico">
              <strong>{opcao.nome}</strong>
              <br />
              <span>{opcao.preco} • {opcao.duracao}</span>
            </button>
          ))}
        </div>
      );
    } else if (mensagem.tipo === 'datas') {
      return (
        <div className="opcoes">
          {mensagem.opcoes.map((opcao, idx) => (
            <button key={idx} onClick={() => handleOpcaoClick(opcao.valor)} className="botao-opcao data">
              {opcao.label}
            </button>
          ))}
        </div>
      );
    } else if (mensagem.tipo === 'horarios') {
      return (
        <div className="horarios-container">
          <div className="grid-horarios">
            {mensagem.opcoes.map((opcao, idx) => (
              <button key={idx} onClick={() => handleOpcaoClick(opcao)} className="botao-opcao horario">
                {opcao}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const mensagensFiltradas = messages.filter((msg) => msg.tipo !== 'horarios');
              setMessages([...mensagensFiltradas, { text: 'Vamos tentar outra data. Quando você prefere?', sender: 'bot' }, { tipo: 'datas', opcoes: gerarProximos7Dias(), sender: 'bot' }]);
              setStep(3);
            }}
            className="botao-voltar"
          >
            ↻ Ver outras datas
          </button>
        </div>
      );
    } else if (mensagem.tipo === 'barbeiros') {
      return (
        <div className="barbeiros">
          {mensagem.opcoes.map((opcao, idx) => (
            <button key={idx} onClick={() => handleOpcaoClick(opcao)} className="botao-opcao barbeiros barbeiro-card">
              <img src={opcao.imagem} alt={opcao.nome} className="barbeiro-img" />
              <span>{opcao.nome}</span>
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const inputElement = document.querySelector('.input-area input');

    const handleFocus = () => {
      if (chatbotContainerRef.current) {
        chatbotContainerRef.current.style.maxHeight = '60vh'; // Ajuste conforme necessário
      }
    };

    const handleBlur = () => {
      if (chatbotContainerRef.current) {
        chatbotContainerRef.current.style.maxHeight = '100vh';
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
    <div className="chatbot-container" ref={chatbotContainerRef}>
      <div className="chatbox" ref={chatBoxRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.text && <p>{msg.text}</p>}
            {renderOpcoes(msg)}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          placeholder="Digite aqui..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Chatbot;