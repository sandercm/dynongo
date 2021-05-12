import { Query } from '../../query';
import { keyParser } from './key-parser';
import { ConditionCheck } from '@aws-sdk/client-dynamodb';
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

/**
 * Generate a transaction `ConditionCheck` based on a `Query`.
 *
 * @param	query			Query to generate the check.
 */
export const generateConditionCheck = (query: Query): ConditionCheck => {
	const build: QueryCommandInput = query.buildRawQuery();

	if (!build.FilterExpression) {
		// A `ConditionCheck` requires a `FilterExpression`
		throw new Error('No `where` clause provided in transaction ConditionCheck');
	}

	const result = keyParser(build);

	return {
		TableName: build.TableName,
		Key: result.Key,
		ConditionExpression: build.FilterExpression,
		ExpressionAttributeNames: result.AttributeNames,
		ExpressionAttributeValues: result.AttributeValues
	};
};
