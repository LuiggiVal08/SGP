import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { ActivityLogService } from '../../application/services/activity-log.service';
import {
  LOG_ACTIVITY_KEY,
  LogActivityMetadata,
} from './log-activity.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user?: JwtPayload;
  method: string;
  url: string;
  route?: { path?: string };
  params: Record<string, string | undefined>;
  body?: Record<string, any>;
  ip?: string;
  headers: Record<string, string | undefined>;
}

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly activityLogService: ActivityLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.getAllAndOverride<LogActivityMetadata>(
      LOG_ACTIVITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return next.handle();
    }

    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return next.handle();
    }

    const startTime = Date.now();
    const ip = request.ip ?? request.headers['x-forwarded-for'];
    const userAgent = request.headers['user-agent'] ?? null;

    return next.handle().pipe(
      tap({
        next: (responseBody: any) => {
          const entityId: string | null =
            request.params.id ??
            ((responseBody &&
            typeof responseBody === 'object' &&
            'id' in responseBody
              ? (responseBody as Record<string, any>).id
              : null) as string | null);

          const description = buildDescription(
            metadata.action,
            metadata.entityType,
            request,
            responseBody as Record<string, any>,
          );

          const details: Record<string, any> = {
            method: request.method,
            path: request.route?.path ?? request.url,
          };
          if (request.body && Object.keys(request.body).length > 0) {
            const sanitized = { ...request.body };
            if (sanitized.password) sanitized.password = '***';
            if (sanitized.currentPassword) sanitized.currentPassword = '***';
            if (sanitized.newPassword) sanitized.newPassword = '***';
            details.body = sanitized;
          }
          details.durationMs = Date.now() - startTime;

          this.activityLogService
            .log({
              userId: user.sub,
              action: metadata.action,
              entityType: metadata.entityType,
              entityId,
              description,
              details,
              ip: ip ?? null,
              userAgent,
            })
            .catch(() => {});
        },
      }),
    );
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
function buildDescription(
  action: string,
  entityType: string,
  request: {
    params: Record<string, string | undefined>;
    body?: Record<string, any>;
  },
  responseBody: Record<string, any> | undefined,
): string {
  const entityLabel = entityType.charAt(0) + entityType.slice(1).toLowerCase();

  switch (action) {
    case 'CREATE': {
      const name =
        responseBody?.title ?? responseBody?.name ?? responseBody?.email ?? '';
      return name
        ? `Creó ${/^[aeiou]/i.test(entityLabel) ? 'el' : 'la'} ${entityLabel} "${name}"`
        : `Creó ${/^[aeiou]/i.test(entityLabel) ? 'el' : 'la'} ${entityLabel}`;
    }
    case 'UPDATE': {
      const name =
        responseBody?.title ?? responseBody?.name ?? request.params.id ?? '';
      return name
        ? `Actualizó ${/^[aeiou]/i.test(entityLabel) ? 'el' : 'la'} ${entityLabel} "${name}"`
        : `Actualizó ${/^[aeiou]/i.test(entityLabel) ? 'el' : 'la'} ${entityLabel}`;
    }
    case 'DELETE':
      return `Eliminó ${/^[aeiou]/i.test(entityLabel) ? 'el' : 'la'} ${entityLabel}`;
    case 'STATUS_CHANGE': {
      const newStatus = request.body?.status ?? '';
      const projectTitle = responseBody?.title ?? '';
      return projectTitle
        ? `Cambió estado del proyecto "${projectTitle}" a ${newStatus}`
        : `Cambió estado del proyecto a ${newStatus}`;
    }
    case 'UPLOAD': {
      const fileName = responseBody?.fileName ?? '';
      return fileName
        ? `Subió archivo "${fileName}" al proyecto`
        : `Subió archivo(s) al proyecto`;
    }
    case 'TOGGLE_ACTIVE': {
      const isActive = responseBody?.isActive;
      if (isActive === true) return 'Activó al usuario';
      if (isActive === false) return 'Desactivó al usuario';
      return 'Cambió estado del usuario';
    }
    default:
      return `${action} ${entityLabel}`;
  }
}
