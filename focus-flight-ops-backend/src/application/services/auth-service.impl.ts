import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import {
  IUserRepository,
  IPilotRepository,
  IRefreshTokenRepository,
  ITokenProvider,
  IPasswordHasher,
} from '../../domain/ports/outbound';
import { IAuthService, RegisterInput, AuthResult } from '../../domain/ports/inbound';
import {
  DuplicateEmailError,
  DuplicateDocumentError,
  InvalidCredentialsError,
  TokenExpiredError,
} from '../../domain/errors';

@Injectable()
export class AuthServiceImpl implements IAuthService {
  constructor(
    @Inject(INJECTION_TOKENS.UserRepository) private readonly userRepo: IUserRepository,
    @Inject(INJECTION_TOKENS.PilotRepository) private readonly pilotRepo: IPilotRepository,
    @Inject(INJECTION_TOKENS.RefreshTokenRepository) private readonly refreshTokenRepo: IRefreshTokenRepository,
    @Inject(INJECTION_TOKENS.TokenProvider) private readonly tokenProvider: ITokenProvider,
    @Inject(INJECTION_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async register(data: RegisterInput): Promise<AuthResult> {
    const existingEmail = await this.userRepo.findByEmail(data.email);
    if (existingEmail) throw new DuplicateEmailError(data.email);

    const existingDoc = await this.userRepo.findByDocumentNumber(data.documentNumber);
    if (existingDoc) throw new DuplicateDocumentError(data.documentNumber);

    const passwordHash = await this.passwordHasher.hash(data.password);

    const user = await this.userRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
    });

    const tokens = await this.tokenProvider.generateTokenPair({
      sub: user.id,
      email: user.email,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tokens,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    const valid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError();

    const pilot = await this.pilotRepo.findByUserId(user.id);

    const tokens = await this.tokenProvider.generateTokenPair({
      sub: user.id,
      email: user.email,
      pilotId: pilot?.id,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tokens,
      pilotId: pilot?.id,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const hash = this.tokenProvider.hashRefreshToken(refreshToken);
    const stored = await this.refreshTokenRepo.findByTokenHash(hash);

    if (!stored || stored.expiresAt < new Date()) {
      throw new TokenExpiredError();
    }

    await this.refreshTokenRepo.revokeByTokenHash(hash);

    const user = await this.userRepo.findById(stored.userId);
    if (!user) throw new InvalidCredentialsError();

    const pilot = await this.pilotRepo.findByUserId(user.id);

    const tokens = await this.tokenProvider.generateTokenPair({
      sub: user.id,
      email: user.email,
      pilotId: pilot?.id,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tokens,
      pilotId: pilot?.id,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepo.revokeByUserId(userId);
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const hash = this.tokenProvider.hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.refreshTokenRepo.create({ userId, tokenHash: hash, expiresAt });
  }
}
