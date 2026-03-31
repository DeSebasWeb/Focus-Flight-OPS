import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { ITokenProvider, IUserRepository, IPilotRepository } from '../../../../domain/ports/outbound';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(INJECTION_TOKENS.TokenProvider) private readonly tokenProvider: ITokenProvider,
    @Inject(INJECTION_TOKENS.UserRepository) private readonly userRepo: IUserRepository,
    @Inject(INJECTION_TOKENS.PilotRepository) private readonly pilotRepo: IPilotRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    const token = authHeader.substring(7);
    // Token only contains { sub: userId } - no PII
    const payload = await this.tokenProvider.verifyAccessToken(token);

    // Resolve email and pilotId from DB, not from token
    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const pilot = await this.pilotRepo.findByUserId(payload.sub);

    request.user = {
      userId: payload.sub,
      email: user.email,
      pilotId: pilot?.id ?? undefined,
    };

    return true;
  }
}
