import { CommandFactory } from 'nest-commander';

import { filterException } from 'src/engine/filters/utils/global-exception-handler.util';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { LoggerService } from 'src/engine/integrations/logger/logger.service';

import { CommandModule } from './command.module';

async function bootstrap() {
  const errorHandler = (err: Error) => {
    loggerService.error(err?.message, err?.name);

    if (filterException(err)) {
      return;
    }

    exceptionHandlerService.captureExceptions([err]);
  };

  const app = await CommandFactory.createWithoutRunning(CommandModule, {
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    errorHandler,
    serviceErrorHandler: errorHandler,
  });
  const loggerService = app.get(LoggerService);
  const exceptionHandlerService = app.get(ExceptionHandlerService);

  // Inject our logger
  app.useLogger(loggerService);

  await CommandFactory.runApplication(app);

  app.close();
}
bootstrap();
