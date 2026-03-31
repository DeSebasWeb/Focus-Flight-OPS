import { Controller, Get, Post, Patch, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IFlightLogService, ITelemetryService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { StartFlightDto, EndFlightDto, RecordTelemetryDto } from '../../../../application/dto/flight-log/flight-log.dto';
import { EntityNotFoundError } from '../../../../domain/errors';

@Controller('flight-logs')
@UseGuards(JwtAuthGuard)
export class FlightLogController {
  constructor(
    @Inject(INJECTION_TOKENS.FlightLogService) private readonly flightLogService: IFlightLogService,
    @Inject(INJECTION_TOKENS.TelemetryService) private readonly telemetryService: ITelemetryService,
  ) {}

  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.flightLogService.findByPilotId(user.pilotId!);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.flightLogService.findById(id, user.pilotId!);
  }

  @Post('start')
  async startFlight(@Body() dto: StartFlightDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.flightLogService.startFlight(user.pilotId!, dto);
  }

  @Patch(':id/end')
  async endFlight(@Param('id') id: string, @Body() dto: EndFlightDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.flightLogService.endFlight(id, user.pilotId!, dto);
  }

  @Post(':id/telemetry')
  async recordTelemetry(@Param('id') id: string, @Body() dto: RecordTelemetryDto) {
    return this.telemetryService.recordPoint(id, dto);
  }

  @Get(':id/telemetry')
  async getTelemetry(@Param('id') id: string) {
    return this.telemetryService.findByFlightLogId(id);
  }

  private requirePilot(user: CurrentUserPayload) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
  }
}
