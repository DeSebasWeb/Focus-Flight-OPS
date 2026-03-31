import { Controller, Get, Post, Delete, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { ICertificateService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreateCertificateDto } from '../../../../application/dto/certificate/create-certificate.dto';
import { EntityNotFoundError } from '../../../../domain/errors';

@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificateController {
  constructor(
    @Inject(INJECTION_TOKENS.CertificateService) private readonly certService: ICertificateService,
  ) {}

  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.certService.findByPilotId(user.pilotId!);
  }

  @Get('expiring')
  async checkExpiry(@CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.certService.checkExpiry(user.pilotId!);
  }

  @Post()
  async create(@Body() dto: CreateCertificateDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.certService.create(user.pilotId!, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    await this.certService.delete(id, user.pilotId!);
    return { message: 'Certificado eliminado' };
  }

  private requirePilot(user: CurrentUserPayload) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
  }
}
