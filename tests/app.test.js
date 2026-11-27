const request = require('supertest');
const { createApp } = require('../src/app');
const { nivelPorStatus } = require('../src/logger');

describe('API de tarefas', () => {
  let app;
  let logs;

  beforeEach(() => {
    logs = [];
    app = createApp({ logger: (entry) => logs.push(entry) });
  });

  test('GET /health retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime_s).toBe('number');
  });

  test('GET /tarefas retorna lista vazia inicialmente', async () => {
    const res = await request(app).get('/tarefas');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /tarefas cria uma tarefa', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: 'Estudar DevOps' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, titulo: 'Estudar DevOps', concluida: false });
  });

  test('POST /tarefas sem título retorna 400', async () => {
    const res = await request(app).post('/tarefas').send({});
    expect(res.status).toBe(400);
  });

  test('POST /tarefas com JSON inválido retorna 400 em JSON', async () => {
    const res = await request(app)
      .post('/tarefas')
      .set('Content-Type', 'application/json')
      .send('{titulo:');
    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/JSON inválido/);
  });

  test('PATCH /tarefas/:id/concluir marca como concluída', async () => {
    await request(app).post('/tarefas').send({ titulo: 'Configurar CI' });
    const res = await request(app).patch('/tarefas/1/concluir');
    expect(res.status).toBe(200);
    expect(res.body.concluida).toBe(true);
  });

  test('PATCH em tarefa inexistente retorna 404', async () => {
    const res = await request(app).patch('/tarefas/99/concluir');
    expect(res.status).toBe(404);
  });

  test('DELETE /tarefas/:id remove a tarefa', async () => {
    await request(app).post('/tarefas').send({ titulo: 'Escrever Terraform' });
    const del = await request(app).delete('/tarefas/1');
    expect(del.status).toBe(204);
    const lista = await request(app).get('/tarefas');
    expect(lista.body).toEqual([]);
  });

  test('DELETE em tarefa inexistente retorna 404', async () => {
    const res = await request(app).delete('/tarefas/42');
    expect(res.status).toBe(404);
  });
});

describe('Logs estruturados', () => {
  test('cada requisição gera uma entrada de log com método, caminho, status e duração', async () => {
    const logs = [];
    const app = createApp({ logger: (entry) => logs.push(entry) });
    await request(app).get('/health');
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'info',
      msg: 'request',
      method: 'GET',
      path: '/health',
      status: 200,
    });
    expect(typeof logs[0].duration_ms).toBe('number');
    expect(new Date(logs[0].time).toString()).not.toBe('Invalid Date');
  });

  test('respostas 4xx são registradas com nível warn', async () => {
    const logs = [];
    const app = createApp({ logger: (entry) => logs.push(entry) });
    await request(app).delete('/tarefas/7');
    expect(logs[0].level).toBe('warn');
    expect(logs[0].status).toBe(404);
  });

  test('nivelPorStatus mapeia os códigos HTTP corretamente', () => {
    expect(nivelPorStatus(200)).toBe('info');
    expect(nivelPorStatus(404)).toBe('warn');
    expect(nivelPorStatus(500)).toBe('error');
  });
});
