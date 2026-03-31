import { Controller, Get, Post, Patch, Body, Param, Query, Inject, UseGuards } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IEmergencyService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { EntityNotFoundError } from '../../../../domain/errors';

@Controller('emergency')
export class EmergencyController {
  constructor(
    @Inject(INJECTION_TOKENS.EmergencyService) private readonly emergencyService: IEmergencyService,
  ) {}

  @Get('contacts')
  async getContacts() {
    return this.emergencyService.getContacts();
  }

  @Get('contacts/nearest')
  async getNearestContacts(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.emergencyService.getNearestContacts(parseFloat(lat), parseFloat(lng));
  }

  @Get('flyaway-protocol')
  async getFlyawayProtocol() {
    return this.emergencyService.getFlyawayProtocol();
  }

  @Post('events')
  @UseGuards(JwtAuthGuard)
  async triggerEvent(@Body() dto: any, @CurrentUser() user: CurrentUserPayload) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
    return this.emergencyService.triggerEvent(user.pilotId, dto);
  }

  @Patch('events/:id/actions')
  @UseGuards(JwtAuthGuard)
  async addAction(@Param('id') id: string, @Body() body: { actionText: string }) {
    await this.emergencyService.addAction(id, body.actionText);
    return { message: 'Accion registrada' };
  }

  @Patch('events/:id/resolve')
  @UseGuards(JwtAuthGuard)
  async resolveEvent(@Param('id') id: string) {
    return this.emergencyService.resolveEvent(id);
  }
}
