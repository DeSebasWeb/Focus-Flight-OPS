import { Controller, Get, Post, Patch, Body, Param, Inject, UseGuards, Query } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { IChecklistService } from '../../../../domain/ports/inbound';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { StartChecklistDto, CheckItemDto } from '../../../../application/dto/checklist/checklist.dto';
import { EntityNotFoundError } from '../../../../domain/errors';

@Controller('checklists')
@UseGuards(JwtAuthGuard)
export class ChecklistController {
  constructor(
    @Inject(INJECTION_TOKENS.ChecklistService) private readonly checklistService: IChecklistService,
  ) {}

  @Get('templates')
  async getTemplates() {
    return this.checklistService.getTemplates();
  }

  @Get('templates/:type')
  async getTemplateByType(@Param('type') type: string) {
    return this.checklistService.getTemplateByType(type);
  }

  @Post('executions')
  async startExecution(@Body() dto: StartChecklistDto, @CurrentUser() user: CurrentUserPayload) {
    this.requirePilot(user);
    return this.checklistService.startExecution({
      ...dto,
      pilotId: user.pilotId!,
    });
  }

  @Patch('executions/:executionId/items/:itemId')
  async checkItem(
    @Param('executionId') executionId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CheckItemDto,
  ) {
    await this.checklistService.checkItem(executionId, itemId, dto);
    return { message: 'Item actualizado' };
  }

  @Patch('executions/:id/finalize')
  async finalizeExecution(@Param('id') id: string) {
    return this.checklistService.finalizeExecution(id);
  }

  @Get('missions/:missionId')
  async getByMission(@Param('missionId') missionId: string) {
    return this.checklistService.findExecutionsByMission(missionId);
  }

  private requirePilot(user: CurrentUserPayload) {
    if (!user.pilotId) throw new EntityNotFoundError('Pilot', user.userId);
  }
}
