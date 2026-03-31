import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';

// Adapters - Persistence
import { PrismaService } from '../adapters/outbound/persistence/prisma.service';
import { PrismaUserRepository } from '../adapters/outbound/persistence/prisma-user.repository';
import { PrismaRefreshTokenRepository } from '../adapters/outbound/persistence/prisma-refresh-token.repository';
import { PrismaPilotRepository } from '../adapters/outbound/persistence/prisma-pilot.repository';

// Adapters - Security
import { BcryptPasswordHasher } from '../adapters/outbound/security/bcrypt-password-hasher';
import { JwtTokenProvider } from '../adapters/outbound/security/jwt-token-provider';

// Adapters - Inbound
import { AuthController } from '../adapters/inbound/rest/auth.controller';
import { PilotController } from '../adapters/inbound/rest/pilot.controller';
import { JwtAuthGuard } from '../adapters/inbound/guards/jwt-auth.guard';

// Application Services
import { AuthServiceImpl } from '../../application/services/auth-service.impl';
import { PilotServiceImpl } from '../../application/services/pilot-service.impl';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRATION', '15m') },
      }),
    }),
  ],
  controllers: [AuthController, PilotController],
  providers: [
    PrismaService,
    JwtAuthGuard,
    // Outbound adapters -> Port interfaces
    { provide: INJECTION_TOKENS.UserRepository, useClass: PrismaUserRepository },
    { provide: INJECTION_TOKENS.RefreshTokenRepository, useClass: PrismaRefreshTokenRepository },
    { provide: INJECTION_TOKENS.PilotRepository, useClass: PrismaPilotRepository },
    { provide: INJECTION_TOKENS.PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: INJECTION_TOKENS.TokenProvider, useClass: JwtTokenProvider },
    // Application services -> Inbound port interfaces
    { provide: INJECTION_TOKENS.AuthService, useClass: AuthServiceImpl },
    { provide: INJECTION_TOKENS.PilotService, useClass: PilotServiceImpl },
  ],
  exports: [
    PrismaService,
    JwtAuthGuard,
    INJECTION_TOKENS.TokenProvider,
    INJECTION_TOKENS.UserRepository,
    INJECTION_TOKENS.PilotRepository,
    INJECTION_TOKENS.AuthService,
    INJECTION_TOKENS.PilotService,
  ],
})
export class AuthModule {}
