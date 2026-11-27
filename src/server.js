const { createApp } = require('./app');
const { defaultLogger } = require('./logger');

const PORT = process.env.PORT || 3000;

const server = createApp().listen(PORT, () => {
  defaultLogger({
    time: new Date().toISOString(),
    level: 'info',
    msg: 'servidor iniciado',
    port: Number(PORT),
    version: process.env.APP_VERSION || 'dev',
  });
});

// Encerramento limpo quando o Docker envia SIGTERM (docker stop / novo deploy).
function encerrar(sinal) {
  defaultLogger({ time: new Date().toISOString(), level: 'info', msg: 'encerrando', signal: sinal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
