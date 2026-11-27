// Logs estruturados em JSON (uma linha por evento), fáceis de ler com
// `docker compose logs` e de enviar para qualquer agregador de logs.

function defaultLogger(entry) {
  if (process.env.NODE_ENV === 'test') return;
  console.log(JSON.stringify(entry));
}

function nivelPorStatus(status) {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
}

function requestLogger(log) {
  return (req, res, next) => {
    const inicio = process.hrtime.bigint();
    res.on('finish', () => {
      const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1e6;
      log({
        time: new Date().toISOString(),
        level: nivelPorStatus(res.statusCode),
        msg: 'request',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Math.round(duracaoMs * 100) / 100,
      });
    });
    next();
  };
}

module.exports = { defaultLogger, requestLogger, nivelPorStatus };
