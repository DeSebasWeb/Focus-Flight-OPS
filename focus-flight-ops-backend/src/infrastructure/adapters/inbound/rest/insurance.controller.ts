import { Controller, Get, Post, Put, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IInsuranceService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreateInsuranceDto, UpdateInsuranceDto } from '../../../../application/dto/insurance/create-insurance.dto';
import { EntityNotFoundError } from '../../../../domain/errors';

@Controller('insurance')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(
    @Inject(INJECTION_TOKENS.InsuranceService) private readonly insuranceService: IInsuranceService,
  ) {}

  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.insuranceService.findByPilotId(user.pilotId!);
  }

  @Get('active')
  async getActive(@CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.insuranceService.findActive(user.pilotId!);
  }

  @Post()
  async create(@Body() dto: CreateInsuranceDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.insuranceService.create(user.pilotId!, dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    this.requirePilot(user);
    return this.insuranceService.update(id, user.pilotId!, dto);
  }

  private requirePilot(user: CurrentUserPayload) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
  }
}
