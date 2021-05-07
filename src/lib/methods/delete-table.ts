import delay from 'delay';
import { Method } from './method';
import { Executable } from './executable';
import { DynamoDB } from '../dynamodb';
import { Table } from '../table';
import { DeleteTableCommandOutput, DeleteTableInput } from '@aws-sdk/client-dynamodb';

export class DeleteTable extends Method implements Executable {

	private shouldWait = false;
	private waitMs: number = 1000;

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
	buildRawQuery(): DeleteTableInput {
		return {
			...this.params,
			TableName: (this.table !).name
		};
	}

	/**
	 * This method will execute the delete table request that was built up.
	 */
	exec(): Promise<DeleteTableCommandOutput> {
		const db = this.dynamodb.raw;

		if (!db) {
			return Promise.reject(new Error('Call .connect() before executing queries.'));
		}

		return db.deleteTable(this.buildRawQuery())
			.then((out) => {
				if (out.TableDescription && this.shouldWait) {
					// If await is true, start polling
					return this.poll();
				}
			})
			.catch(err => {
				if (err && err.name !== 'ResourceNotFoundException') {
					throw err;
				}
			});
	}

	private async poll() {
		await this.pollHelper();

		try {
			return await this.poll();
		} catch (error) {
			if (error.name !== 'ResourceNotFoundException') {
				// If the error is not a ResourceNotFoundException, throw it further down the chain
				throw error;
			}

			return;
		}
	}

	private async pollHelper() {
		const db = this.dynamodb.raw !;

		await delay(this.waitMs);

		return await db.describeTable({TableName: (this.table !).name});
	}
}
