import { TransactMethod } from '../transact-method';
import { Query } from '../../query';
import { keyParser } from '../utils/key-parser';
import { TransactGetItem } from '@aws-sdk/client-dynamodb';

export class TransactQuery extends TransactMethod {

	constructor(
		private readonly query: Query
	) {
		super();
	}

	/**
	 * Builds and returns the raw DynamoDB query object.
	 */
	buildRawQuery(): TransactGetItem {
		const build = this.query.buildRawQuery();

		if (build.IndexName) {
			throw new Error('Can not use a Global Secondary Index in a read transaction');
		}

		if (build.FilterExpression) {
			throw new Error('Can not use a where clause in a read transaction');
		}

		const key = keyParser(build);

		return {
			Get: {
				TableName: build.TableName,
				Key: key.Key,
				ExpressionAttributeNames: key.AttributeNames,
				ProjectionExpression: build.ProjectionExpression
			}
		};
	}
}
