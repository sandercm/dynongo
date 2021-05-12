import { Method } from './method';
import { Executable } from './executable';
import { DynamoDB } from '../dynamodb';
import { Table } from '../table';
import { DeleteTableCommandInput } from '@aws-sdk/client-dynamodb';
import delay from 'delay';

export class DeleteTable extends Method implements Executable {

	private shouldWait = false;
	private waitMs: number = 1000;
	private db = this.dynamodb.raw;

	constructor(table: Table, dynamodb: DynamoDB) {
		super(table, dynamodb);
	}

	/**
	 * Make sure the exec method returns when the table is deleted entirely.
	 *
	 * @param	ms		The number of milliseconds the poll mechanism should wait. Default is 1000ms.
	 */
	wait(ms?: number) {
		this.shouldWait = true;
		this.waitMs = ms || 1000;

		// Return the object so that it can be chained
		return this;
	}

	/**
	 * Builds and returns the raw DynamoDB query object.
	 */
	buildRawQuery(): DeleteTableCommandInput {
		return {
			...this.params,
			TableName: (this.table !).name
		};
	}

	/**
	 * This method will execute the delete table request that was built up.
	 */
	async exec(): Promise<void> {

		if (!this.db) {
			return Promise.reject(new Error('Call .connect() before executing queries.'));
		}
		try {
			const command = await this.db.deleteTable(this.buildRawQuery());
			if (command.TableDescription && this.shouldWait) {
				return this.poll();
			}
		} catch (err) {
			if (err && err.name !== 'ResourceNotFoundException') {
				throw err;
			}
			throw err;
		}
	}

	private async poll() {
		if (!this.db) {
			return Promise.reject(new Error('Call .connect() before executing queries.'));
		}
		try {
			await delay(this.waitMs);
			const response = await this.db.describeTable({TableName: (this.table !).name});
			if (response.Table?.TableStatus === 'DELETING') {
				return this.poll();
			}
		} catch (err) {
			if (err && err.name !== 'ResourceNotFoundException') {
				return;
			}
			throw err;
		}
	}
}
