import { Controller, Get, Post, Put, Patch, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IMissionService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreateMissionDto, UpdateMissionStatusDto } from '../../../../application/dto/mission/create-mission.dto';
import { EntityNotFoundError } from '../../../../domain/errors';
import { PrismaService } from '../../outbound/persistence/prisma.service';

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionController {
  constructor(
    @Inject(INJECTION_TOKENS.MissionService) private readonly missionService: IMissionService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('purposes')
  async getPurposes() {
    return this.prisma.missionPurpose.findMany({ orderBy: { nameEs: 'asc' } });
  }

  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.missionService.findByPilotId(user.pilotId!);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.missionService.findById(id, user.pilotId!);
  }

  @Post()
  async create(@Body() dto: CreateMissionDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.missionService.create(user.pilotId!, dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateMissionDto>, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.missionService.update(id, user.pilotId!, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateMissionStatusDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.missionService.updateStatus(id, user.pilotId!, dto.status);
  }

  private requirePilot(user: CurrentUserPayload) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
  }
}
