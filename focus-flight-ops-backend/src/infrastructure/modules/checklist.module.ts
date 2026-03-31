import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { AuthModule } from './auth.module';
import { PrismaChecklistRepository } from '../adapters/outbound/persistence/prisma-checklist.repository';
import { ChecklistServiceImpl } from '../../application/services/checklist-service.impl';
import { ChecklistController } from '../adapters/inbound/rest/checklist.controller';

@Module({
  imports: [AuthModule],
  controllers: [ChecklistController],
  providers: [
    { provide: INJECTION_TOKENS.ChecklistRepository, useClass: PrismaChecklistRepository },
    { provide: INJECTION_TOKENS.ChecklistService, useClass: ChecklistServiceImpl },
  ],
  exports: [INJECTION_TOKENS.ChecklistRepository, INJECTION_TOKENS.ChecklistService],
})
export class ChecklistModule {}
