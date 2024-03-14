import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import isEmpty from 'lodash.isempty';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/workspace/workspace-query-builder/interfaces/record.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DeleteManyResolverArgs,
  DeleteOneResolverArgs,
  FindDuplicatesResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceQueryBuilderFactory } from 'src/workspace/workspace-query-builder/workspace-query-builder.factory';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
  CallWebhookJobsJobOperation,
} from 'src/workspace/workspace-query-runner/jobs/call-webhook-jobs.job';
import { parseResult } from 'src/workspace/workspace-query-runner/utils/parse-result.util';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
import { ObjectRecordDeleteEvent } from 'src/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordCreateEvent } from 'src/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/integrations/event-emitter/types/object-record-update.event';
import { WorkspacePreQueryHookService } from 'src/workspace/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { NotFoundError } from 'src/filters/utils/graphql-errors.util';
import { QueryRunnerArgsFactory } from 'src/workspace/workspace-query-runner/factories/query-runner-args.factory';
import { TokenService } from 'src/core/auth/services/token.service';

import { WorkspaceQueryRunnerOptions } from './interfaces/query-runner-option.interface';
import {
  PGGraphQLMutation,
  PGGraphQLResult,
} from './interfaces/pg-graphql.interface';
import { computePgGraphQLError } from './utils/compute-pg-graphql-error.util';

@Injectable()
export class WorkspaceQueryRunnerService {
  private readonly logger = new Logger(WorkspaceQueryRunnerService.name);

  constructor(
    private readonly workspaceQueryBuilderFactory: WorkspaceQueryBuilderFactory,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly queryRunnerArgsFactory: QueryRunnerArgsFactory,
    @Inject(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly workspacePreQueryHookService: WorkspacePreQueryHookService,
    private readonly environmentService: EnvironmentService,
    private readonly tokenService: TokenService,
  ) {}

  async findMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<Record> | undefined> {
    const { workspaceId, userId, objectMetadataItem } = options;
    const start = performance.now();

    const query = await this.workspaceQueryBuilderFactory.findMany(
      args,
      options,
    );

    await this.workspacePreQueryHookService.executePreHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'findMany',
      args,
    );

    const result = await this.execute(query, workspaceId);
    const end = performance.now();

    this.logger.log(
      `query time: ${end - start} ms on query ${
        options.objectMetadataItem.nameSingular
      }`,
    );

    // console.log('result', result);

    const returnValue = this.parseResult<IConnection<Record>>(
      result,
      objectMetadataItem,
      '',
    );

    // console.log('returnValue', returnValue);

    return returnValue;
  }

  async findOne<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new BadRequestException('Missing filter argument');
    }
    const { workspaceId, userId, objectMetadataItem } = options;
    const query = await this.workspaceQueryBuilderFactory.findOne(
      args,
      options,
    );

    await this.workspacePreQueryHookService.executePreHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'findOne',
      args,
    );

    const result = await this.execute(query, workspaceId);
    const parsedResult = this.parseResult<IConnection<Record>>(
      result,
      objectMetadataItem,
      '',
    );

    return parsedResult?.edges?.[0]?.node;
  }

  async findDuplicates<TRecord extends IRecord = IRecord>(
    args: FindDuplicatesResolverArgs<TRecord>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<TRecord> | undefined> {
    if (!args.data && !args.id) {
      throw new BadRequestException(
        'You have to provide either "data" or "id" argument',
      );
    }

    if (!args.id && isEmpty(args.data)) {
      throw new BadRequestException(
        'The "data" condition can not be empty when ID input not provided',
      );
    }

    const { workspaceId, userId, objectMetadataItem } = options;

    let existingRecord: Record<string, unknown> | undefined;

    if (args.id) {
      const existingRecordQuery =
        this.workspaceQueryBuilderFactory.findDuplicatesExistingRecord(
          args.id,
          options,
        );

      const existingRecordResult = await this.execute(
        existingRecordQuery,
        workspaceId,
      );

      const parsedResult = this.parseResult<Record<string, unknown>>(
        existingRecordResult,
        objectMetadataItem,
        '',
      );

      existingRecord = parsedResult?.edges?.[0]?.node;

      if (!existingRecord) {
        throw new NotFoundError(`Object with id ${args.id} not found`);
      }
    }

    const query = await this.workspaceQueryBuilderFactory.findDuplicates(
      args,
      options,
      existingRecord,
    );

    await this.workspacePreQueryHookService.executePreHooks(
      userId,
      workspaceId,
      objectMetadataItem.nameSingular,
      'findDuplicates',
      args,
    );

    const result = await this.execute(query, workspaceId);

    return this.parseResult<IConnection<TRecord>>(
      result,
      objectMetadataItem,
      '',
    );
  }

  async createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { workspaceId, objectMetadataItem } = options;
    const computedArgs = await this.queryRunnerArgsFactory.create(
      args,
      options,
    );

    const query = await this.workspaceQueryBuilderFactory.createMany(
      computedArgs,
      options,
    );

    const result = await this.execute(query, workspaceId);

    const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
      result,
      objectMetadataItem,
      'insertInto',
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.create,
      options,
    );

    parsedResults.forEach((record) => {
      this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.created`, {
        workspaceId,
        createdRecord: this.removeNestedProperties(record),
        createdObjectMetadata: {
          nameSingular: objectMetadataItem.nameSingular,
          isCustom: objectMetadataItem.isCustom,
        },
      } satisfies ObjectRecordCreateEvent<any>);
    });

    return parsedResults;
  }

  async createOne<Record extends IRecord = IRecord>(
    args: CreateOneResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const results = await this.createMany({ data: [args.data] }, options);

    return results?.[0];
  }

  async updateOne<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const { workspaceId, objectMetadataItem } = options;

    const existingRecord = await this.findOne(
      { filter: { id: { eq: args.id } } } as FindOneResolverArgs,
      options,
    );

    const query = await this.workspaceQueryBuilderFactory.updateOne(
      args,
      options,
    );

    const result = await this.execute(query, workspaceId);

    const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
      result,
      objectMetadataItem,
      'update',
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.update,
      options,
    );

    this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.updated`, {
      workspaceId,
      previousRecord: this.removeNestedProperties(existingRecord as Record),
      updatedRecord: this.removeNestedProperties(parsedResults?.[0]),
    } satisfies ObjectRecordUpdateEvent<any>);

    return parsedResults?.[0];
  }

  async updateMany<Record extends IRecord = IRecord>(
    args: UpdateManyResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { workspaceId, objectMetadataItem } = options;
    const maximumRecordAffected =
      this.environmentService.getMutationMaximumRecordAffected();
    const query = await this.workspaceQueryBuilderFactory.updateMany(args, {
      ...options,
      atMost: maximumRecordAffected,
    });

    const result = await this.execute(query, workspaceId);

    const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
      result,
      objectMetadataItem,
      'update',
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.update,
      options,
    );

    return parsedResults;
  }

  async deleteMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: DeleteManyResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { workspaceId, objectMetadataItem } = options;
    const maximumRecordAffected =
      this.environmentService.getMutationMaximumRecordAffected();
    const query = await this.workspaceQueryBuilderFactory.deleteMany(args, {
      ...options,
      atMost: maximumRecordAffected,
    });

    const result = await this.execute(query, workspaceId);

    const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
      result,
      objectMetadataItem,
      'deleteFrom',
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.delete,
      options,
    );

    parsedResults.forEach((record) => {
      this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.deleted`, {
        workspaceId,
        deletedRecord: [this.removeNestedProperties(record)],
      } satisfies ObjectRecordDeleteEvent<any>);
    });

    return parsedResults;
  }

  async deleteOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const { workspaceId, objectMetadataItem } = options;
    const query = await this.workspaceQueryBuilderFactory.deleteOne(
      args,
      options,
    );
    const result = await this.execute(query, workspaceId);

    const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
      result,
      objectMetadataItem,
      'deleteFrom',
    )?.records;

    await this.triggerWebhooks<Record>(
      parsedResults,
      CallWebhookJobsJobOperation.delete,
      options,
    );

    this.eventEmitter.emit(`${objectMetadataItem.nameSingular}.deleted`, {
      workspaceId,
      deletedRecord: this.removeNestedProperties(parsedResults?.[0]),
    } satisfies ObjectRecordDeleteEvent<any>);

    return parsedResults?.[0];
  }

  private removeNestedProperties<Record extends IRecord = IRecord>(
    record: Record,
  ) {
    if (!record) {
      return;
    }
    const sanitizedRecord = {};

    for (const [key, value] of Object.entries(record)) {
      if (value && typeof value === 'object' && value['edges']) {
        continue;
      }

      sanitizedRecord[key] = value;
    }

    return sanitizedRecord;
  }

  async execute(
    query: string,
    workspaceId: string,
  ): Promise<PGGraphQLResult | undefined> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource?.query(`
        SET search_path TO ${this.workspaceDataSourceService.getSchemaName(
          workspaceId,
        )};
      `);

    const results = await workspaceDataSource?.query<PGGraphQLResult>(`
        SELECT graphql.resolve($$
          ${query}
        $$);
      `);

    return results;
  }

  private parseResult<Result>(
    graphqlResult: PGGraphQLResult | undefined,
    objectMetadataItem: ObjectMetadataInterface,
    command: string,
  ): Result {
    const entityKey = `${command}${computeObjectTargetTable(
      objectMetadataItem,
    )}Collection`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];
    const errors = graphqlResult?.[0]?.resolve?.errors;

    if (!result) {
      this.logger.log(
        `No result found for ${entityKey}, graphqlResult: ` +
          JSON.stringify(graphqlResult, null, 3),
      );
    }

    if (
      result &&
      ['update', 'deleteFrom'].includes(command) &&
      !result.affectedCount
    ) {
      throw new BadRequestException('No rows were affected.');
    }

    if (errors && errors.length > 0) {
      const error = computePgGraphQLError(
        command,
        objectMetadataItem.nameSingular,
        errors,
      );

      throw error;
    }

    const computedResult = this.applyGetters(result, objectMetadataItem);

    return parseResult(computedResult);
  }

  applyGetters<Result>(
    result: Result,
    objectMetadataItem: ObjectMetadataInterface,
  ): Result {
    switch (objectMetadataItem.nameSingular) {
      case 'attachment':
        console.log('getting attachment', result);

        return this.applyAttachmentGetters(result);
      default:
        return result;
    }
  }

  applyAttachmentGetters<Result>(attachments: any): Result {
    if (!attachments || !attachments.edges) {
      return attachments;
    }

    const mappedEdges = attachments.edges.map((attachment: any) => {
      if (attachment?.node?.fullPath) {
        const expirationDate = addMilliseconds(
          new Date().getTime(),
          ms('1m'),
        ).toISOString();

        attachment.node.fullPath = `${
          attachment.node.fullPath
        }?expiration_date=${expirationDate}&token=${this.tokenService.encodePayload(
          {
            expiration_date: expirationDate,
          },
        )}`;
      }

      return attachment;
    });

    console.log('applyAttachmentGetters', mappedEdges);

    return {
      ...attachments,
      edges: mappedEdges,
    } as any;
  }

  async executeAndParse<Result>(
    query: string,
    objectMetadataItem: ObjectMetadataInterface,
    command: string,
    workspaceId: string,
  ): Promise<Result> {
    const result = await this.execute(query, workspaceId);

    return this.parseResult(result, objectMetadataItem, command);
  }

  async triggerWebhooks<Record>(
    jobsData: Record[] | undefined,
    operation: CallWebhookJobsJobOperation,
    options: WorkspaceQueryRunnerOptions,
  ) {
    if (!Array.isArray(jobsData)) {
      return;
    }
    jobsData.forEach((jobData) => {
      this.messageQueueService.add<CallWebhookJobsJobData>(
        CallWebhookJobsJob.name,
        {
          record: jobData,
          workspaceId: options.workspaceId,
          operation,
          objectMetadataItem: options.objectMetadataItem,
        },
        { retryLimit: 3 },
      );
    });
  }
}
