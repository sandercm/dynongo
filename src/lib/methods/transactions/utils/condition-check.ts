import { QueryInput } from 'aws-sdk/clients/dynamodb';
import { Query } from '../../query';
import { keyParser } from './key-parser';
import { ConditionCheck } from '@aws-sdk/client-dynamodb';

/**
 * Generate a transaction `ConditionCheck` based on a `Query`.
 *
 * @param	query			Query to generate the check.
 */
export const generateConditionCheck = (query: Query): ConditionCheck => {
	const build: QueryInput = query.buildRawQuery();

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
