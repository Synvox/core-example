import "express-async-errors";
import { Request, Response, NextFunction } from "express";

import app from "./app";
import debug from "./debug";

app.use((_, res: Response) => res.sendStatus(404));
app.use(errorMiddleware);

export function start({ port = process.env.PORT || 3000 } = {}) {
  function onExit(callback: () => unknown) {
    async function exitHandler(exitProcess: boolean) {
      await Promise.resolve(callback());
      // eslint-disable-next-line no-process-exit
      if (exitProcess) process.exit();
    }

    process.on("exit", () => exitHandler(false));
    process.on("SIGINT", () => exitHandler(true));
    process.on("SIGUSR1", () => exitHandler(true));
    process.on("SIGUSR2", () => exitHandler(true));
    process.on("uncaughtException", () => exitHandler(true));
  }

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      debug.log(`App running on http://0.0.0.0:${port}`);
      onExit(() => server.close());
      resolve(server);
    });
  });
}

function errorMiddleware(
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    next(error);
  } else {
    debug.error(error);
    res.status(error.statusCode ?? 500);
    res.json({
      message: error.message,
      // we only add a `stack` property in non-production environments
      ...(process.env.NODE_ENV === "production"
        ? null
        : { stack: error.stack }),
    });
  }
}
