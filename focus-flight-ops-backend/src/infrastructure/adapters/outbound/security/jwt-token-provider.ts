import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { ITokenProvider, TokenPair, TokenPayload } from '../../../../domain/ports/outbound';
import { TokenExpiredError } from '../../../../domain/errors';

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    // Only include non-sensitive identifiers in the JWT payload.
    // Email is PII and must NOT be in the token since JWTs are base64-decodable.
    const accessToken = await this.jwtService.signAsync(
      { sub: payload.sub },
      { expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m') },
    );

    const refreshToken = randomUUID();

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return { sub: payload.sub };
    } catch {
      throw new TokenExpiredError();
    }
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
