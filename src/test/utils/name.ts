import test from 'ava';
import * as name from '../../lib/utils/name';

// #generateKeyName
test('Simple name should generate correct result', t => {
	const result = name.generateKeyName('foo');

	t.is(result.Expression, '#k_foo');
	t.deepEqual(result.ExpressionAttributeNames, {'#k_foo': 'foo'});
});

test('foo.bar should generate two expression attribute names', t => {
	const result = name.generateKeyName('foo.bar');

	t.is(result.Expression, '#k_foo.#k_bar');
	t.deepEqual(result.ExpressionAttributeNames, {'#k_foo': 'foo', '#k_bar': 'bar'});
});

test('foo.bar.baz should generate three expression attribute names', t => {
	const result = name.generateKeyName('foo.bar.baz');

	t.is(result.Expression, '#k_foo.#k_bar.#k_baz');
	t.deepEqual(result.ExpressionAttributeNames, {'#k_foo': 'foo', '#k_bar': 'bar', '#k_baz': 'baz'});
});

test('Array name should generate correct result', t => {
	const result = name.generateKeyName('foo[0]');

	t.is(result.Expression, '#k_foo[0]');
	t.deepEqual(result.ExpressionAttributeNames, {'#k_foo': 'foo'});
});

test('Non alphanumeric characters should be replaced with underscore', t => {
	const result = name.generateKeyName('@foo');

	t.is(result.Expression, '#k__foo');
	t.deepEqual(result.ExpressionAttributeNames, {'#k__foo': '@foo'});
});

// #generateValueName
test('throw error', t => {
	t.throws(() => name.generateValueName('key', undefined), Error);
});

test('Should generate a correct result name of it does not yet exist', t => {
	const result = name.generateValueName('foo', 'bar');

	t.is(result.Expression, ':v_foo');
	t.deepEqual(result.ExpressionAttributeValues, {':v_foo': 'bar'});
});

test('Non alphanumeric characters should be replaced with underscare for values', t => {
	const result = name.generateValueName('@foo', 'bar');

	t.is(result.Expression, ':v__foo');
	t.deepEqual(result.ExpressionAttributeValues, {':v__foo': 'bar'});
});

test('Should generate a correct result name of it already exists, and the value is not the same', t => {
	const result = name.generateValueName('foo', 'bar', {':v_foo': 'baz'});

	t.is(result.Expression, ':v_foo_1');
	t.deepEqual(result.ExpressionAttributeValues, {':v_foo_1': 'bar'});
});

test('Should generate a correct result if the key refers to an array element', t => {
	const result = name.generateValueName('foo[0]', 'bar');

	t.is(result.Expression, ':v_foo_0_');
	t.deepEqual(result.ExpressionAttributeValues, {':v_foo_0_': 'bar'});
});

test('Should generate a correct result if the value is an array', t => {
	const result = name.generateValueName('foo', ['bar', 'baz']);

	t.deepEqual(result.Expression, [':v_foo_0', ':v_foo_1']);
	t.deepEqual(result.ExpressionAttributeValues, {':v_foo_0': 'bar', ':v_foo_1': 'baz'});
});

test('Should generate a correct result if the key refers to an array element and the value is an array', t => {
	const result = name.generateValueName('foo[0]', ['bar', 'baz']);

	t.deepEqual(result.Expression, [':v_foo_0__0', ':v_foo_0__1']);
	t.deepEqual(result.ExpressionAttributeValues, {':v_foo_0__0': 'bar', ':v_foo_0__1': 'baz'});
});

test('indexify', t => {
	const result = name.generateValueName('foo', 'bar', {':v_foo': 'baz', ':v_foo_1': 'baz_1'});

	t.is(result.Expression, ':v_foo_2');
	t.deepEqual(result.ExpressionAttributeValues, {':v_foo_2': 'bar'});
});
