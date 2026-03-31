import { Controller, Post, Get, Body, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IAuthService } from '../../../../domain/ports/inbound';
import { IUserRepository, IPilotRepository } from '../../../../domain/ports/outbound';
import { RegisterDto } from '../../../../application/dto/auth/register.dto';
import { LoginDto } from '../../../../application/dto/auth/login.dto';
import { RefreshTokenDto } from '../../../../application/dto/auth/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(INJECTION_TOKENS.AuthService) private readonly authService: IAuthService,
    @Inject(INJECTION_TOKENS.UserRepository) private readonly userRepo: IUserRepository,
    @Inject(INJECTION_TOKENS.PilotRepository) private readonly pilotRepo: IPilotRepository,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: CurrentUserPayload) {
    const userData = await this.userRepo.findById(user.userId);
    const pilotData = await this.pilotRepo.findByUserId(user.userId);
    return {
      id: userData!.id,
      email: userData!.email,
      firstName: userData!.firstName,
      lastName: userData!.lastName,
      phone: userData!.phone,
      documentType: userData!.documentType,
      documentNumber: userData!.documentNumber,
      pilotId: pilotData?.id ?? null,
      pilotProfile: pilotData,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: CurrentUserPayload) {
    await this.authService.logout(user.userId);
    return { message: 'Sesion cerrada exitosamente' };
  }
}
