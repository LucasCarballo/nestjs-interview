// Minimal mock for @nestjs/jwt used in tests. sign()/verifyAsync() round-trip
// through an in-memory token map so the JwtAuthGuard can authenticate the
// tokens that AuthService issues.
const tokens = new Map<string, { sub: number; email: string }>();
let counter = 0;

export class JwtService {
  private readonly secret: string;
  private readonly signOptions: { expiresIn?: string } = {};

  constructor(options?: { secret?: string; signOptions?: { expiresIn?: string } }) {
    this.secret = options?.secret ?? 'mocked-secret';
    this.signOptions = options?.signOptions ?? {};
  }

  sign(payload: { sub: number; email: string }): string {
    counter += 1;
    const token = `mock.jwt.${counter}`;
    tokens.set(token, payload);
    return token;
  }

  async verifyAsync(token: string): Promise<{ sub: number; email: string }> {
    return this.verify(token);
  }

  verify(token: string): { sub: number; email: string } {
    const payload = tokens.get(token);
    if (!payload) {
      throw new Error('invalid token');
    }
    return payload;
  }
}

// Minimal stand-in for the real JwtModule that supports registerAsync() with
// the same provider shape NestJS expects, but yields our JwtService.
export class JwtModule {
  static register(options: Record<string, unknown>) {
    return {
      module: JwtModule,
      providers: [
        { provide: JwtService, useValue: new JwtService(options as never) },
      ],
      exports: [JwtService],
      ...options,
    };
  }

  static registerAsync(options: {
    useFactory: (...args: unknown[]) => unknown;
    inject?: unknown[];
    imports?: unknown[];
  }) {
    return {
      module: JwtModule,
      providers: [
        {
          provide: JwtService,
          useFactory: (...args: unknown[]) => {
            const cfg = options.useFactory(...args) as
              | { secret?: string; signOptions?: { expiresIn?: string } }
              | undefined;
            return new JwtService(cfg ?? {});
          },
          inject: options.inject ?? [],
        },
      ],
      exports: [JwtService],
      imports: options.imports ?? [],
    };
  }

  static forFeature() {
    return {
      module: JwtModule,
      providers: [{ provide: JwtService, useValue: new JwtService() }],
      exports: [JwtService],
    };
  }
}
