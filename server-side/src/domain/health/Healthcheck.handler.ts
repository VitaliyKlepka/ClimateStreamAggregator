
export class HealthCheckHandler {

  public static exportMetadata(): Record<string, any>[] {
    return [
      { method: 'GET', path: '/health', handler: (request: any, reply: any) => ({ status: 'ok' }) },
    ];
  }
}
