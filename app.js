const express = require('express');
const { defaultLogger, requestLogger } = require('./logger');

function createApp({ logger = defaultLogger } = {}) {
  const app = express();
  app.use(requestLogger(logger));
  app.use(express.json());

  let tarefas = [];
  let proximoId = 1;

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime_s: Math.round(process.uptime()) });
  });

  app.get('/tarefas', (req, res) => {
    res.status(200).json(tarefas);
  });

  app.post('/tarefas', (req, res) => {
    const { titulo } = req.body || {};
    if (typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O campo "titulo" é obrigatório.' });
    }
    const tarefa = { id: proximoId++, titulo: titulo.trim(), concluida: false };
    tarefas.push(tarefa);
    return res.status(201).json(tarefa);
  });

  app.patch('/tarefas/:id/concluir', (req, res) => {
    const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }
    tarefa.concluida = true;
    return res.status(200).json(tarefa);
  });

  app.delete('/tarefas/:id', (req, res) => {
    const id = Number(req.params.id);
    const existe = tarefas.some((t) => t.id === id);
    if (!existe) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }
    tarefas = tarefas.filter((t) => t.id !== id);
    return res.status(204).send();
  });

  // JSON inválido no corpo da requisição devolve 400 em vez de uma página HTML de erro.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
    }
    logger({
      time: new Date().toISOString(),
      level: 'error',
      msg: 'erro não tratado',
      error: err.message,
    });
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  });

  return app;
}

module.exports = { createApp };
