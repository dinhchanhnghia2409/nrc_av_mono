import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  error(message: string, trace?: string) {
    super.error(message, trace);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  log(message: string, context?: string) {
    super.log(message, context);
  }
}
