import { Method } from '../../method';
import { Executable } from '../../executable';
import { DynamoDB } from '../../../dynamodb';
import { Query } from '../../query';
import { TransactQuery } from './transact-query';
import { TransactGetItemsCommandInput } from '@aws-sdk/client-dynamodb';

export type ReadItem = Query;

export class TransactRead extends Method  implements Executable {

	constructor(
		dynamodb: DynamoDB,
		private readonly actions: ReadItem[]
	) {
		super(null, dynamodb);
	}

	/**
	 * Builds and returns the raw DynamoDB query object.
	 */
	buildRawQuery(): TransactGetItemsCommandInput {
		const items = this.actions.map(action => {
			if (action instanceof Query) {
				return new TransactQuery(action);
			}

			throw new Error('Unknown TransactRead action provided');
		});

		return {
			TransactItems: [
				...items.map(item => item.buildRawQuery())
			]
		};
	}

	/**
	 * Execute the get transaction.
	 */
	async exec(): Promise<any[] | undefined> {
		const db = this.dynamodb.raw !;

		const query = this.buildRawQuery();

		if (query.TransactItems && query.TransactItems.length > 25) {
			throw new Error(`Number of transaction items should be less than or equal to \`25\`, got \`${query.TransactItems.length}\``);
		}

		const result = await db.transactGetItems(query);

		return result.Responses;
	}
}
