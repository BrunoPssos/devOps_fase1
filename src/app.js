const express = require('express');

function createApp() {
  const app = express();
  app.use(express.json());

  let tarefas = [];
  let proximoId = 1;

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
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

  return app;
}

module.exports = { createApp };
