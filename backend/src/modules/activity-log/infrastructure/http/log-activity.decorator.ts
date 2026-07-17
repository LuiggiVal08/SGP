import { SetMetadata } from '@nestjs/common';

export const LOG_ACTIVITY_KEY = 'log_activity';

export interface LogActivityMetadata {
  action: string;
  entityType: string;
}

export const LogActivity = (action: string, entityType: string) =>
  SetMetadata(LOG_ACTIVITY_KEY, {
    action,
    entityType,
  } satisfies LogActivityMetadata);
