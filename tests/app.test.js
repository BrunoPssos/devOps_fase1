const request = require('supertest');
const { createApp } = require('../src/app');

describe('API de tarefas', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('GET /health retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
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
