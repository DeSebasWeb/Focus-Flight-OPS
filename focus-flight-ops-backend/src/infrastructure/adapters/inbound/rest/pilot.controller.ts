import { Controller, Get, Post, Put, Body, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IPilotService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreatePilotDto, UpdatePilotDto } from '../../../../application/dto/pilot/create-pilot.dto';
import { EntityNotFoundError } from '../../../../domain/errors';

@Controller('pilots')
@UseGuards(JwtAuthGuard)
export class PilotController {
  constructor(
    @Inject(INJECTION_TOKENS.PilotService) private readonly pilotService: IPilotService,
  ) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    const pilot = await this.pilotService.findByUserId(user.userId);
    if (!pilot) throw new EntityNotFoundError('Pilot', user.userId);
    return pilot;
  }

  @Post()
  async createProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePilotDto,
  ) {
    return this.pilotService.create(user.userId, dto);
  }

  @Put('me')
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdatePilotDto,
  ) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
    return this.pilotService.update(user.pilotId, dto);
  }
}
