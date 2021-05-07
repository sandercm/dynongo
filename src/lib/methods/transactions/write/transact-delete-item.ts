import { TransactMethod } from '../transact-method';
import { DeleteItem } from '../../delete-item';
import { TransactWriteItem } from '@aws-sdk/client-dynamodb';

export class TransactDeleteItem extends TransactMethod {

	constructor(
		private readonly query: DeleteItem
	) {
		super();
	}

	/**
	 * Builds and returns the raw DynamoDB query object.
	 */
	buildRawQuery(): TransactWriteItem {
		const result = this.query.buildRawQuery();

		return {
			Delete: {
				TableName: result.TableName,
				Key: result.Key,
				ConditionExpression: result.ConditionExpression,
				ExpressionAttributeNames: result.ExpressionAttributeNames,
				ExpressionAttributeValues: result.ExpressionAttributeValues ? result.ExpressionAttributeValues : undefined
			}
		};
	}
}
