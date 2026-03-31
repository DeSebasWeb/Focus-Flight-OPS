import { Controller, Get, Post, Put, Delete, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IDroneService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreateDroneDto, UpdateDroneDto } from '../../../../application/dto/drone/create-drone.dto';
import { EntityNotFoundError } from '../../../../domain/errors';
import { PrismaService } from '../../outbound/persistence/prisma.service';

@Controller('drones')
@UseGuards(JwtAuthGuard)
export class DroneController {
  constructor(
    @Inject(INJECTION_TOKENS.DroneService) private readonly droneService: IDroneService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('models')
  async getModels() {
    return this.prisma.droneModel.findMany({
      include: { manufacturer: true },
      orderBy: [{ manufacturer: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.droneService.findByPilotId(user.pilotId!);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.droneService.findById(id, user.pilotId!);
  }

  @Post()
  async create(@Body() dto: CreateDroneDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.droneService.create(user.pilotId!, dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDroneDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.requirePilot(user);
    return this.droneService.update(id, user.pilotId!, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    await this.droneService.delete(id, user.pilotId!);
    return { message: 'Drone desactivado exitosamente' };
  }

  private requirePilot(user: CurrentUserPayload) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
  }
}
