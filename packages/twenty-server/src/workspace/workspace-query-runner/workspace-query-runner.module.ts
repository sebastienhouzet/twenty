import { Module } from '@nestjs/common';

import { WorkspaceQueryBuilderModule } from 'src/workspace/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { WorkspacePreQueryHookModule } from 'src/workspace/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.module';
import { workspaceQueryRunnerFactories } from 'src/workspace/workspace-query-runner/factories';
import { RecordPositionListener } from 'src/workspace/workspace-query-runner/listeners/record-position.listener';
import { AuthModule } from 'src/core/auth/auth.module';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

@Module({
  imports: [
    WorkspaceQueryBuilderModule,
    WorkspaceDataSourceModule,
    WorkspacePreQueryHookModule,
    AuthModule,
  ],
  providers: [
    WorkspaceQueryRunnerService,
    ...workspaceQueryRunnerFactories,
    RecordPositionListener,
  ],
  exports: [WorkspaceQueryRunnerService],
})
export class WorkspaceQueryRunnerModule {}
