import {strictEqual, throws} from 'node:assert';
import {test} from 'node:test';
import {suffixHTML, suffixMarkdown, suffixMarkdownV2} from './identifier.js';

await test('messageSuffixMarkdown', () => {
	strictEqual(
		suffixMarkdown('unicorns', undefined),
		'[\u200C](http://t.me/#unicorns#)',
	);
});

await test('messageSuffixMarkdown with additional state', () => {
	strictEqual(
		suffixMarkdown('unicorns', 'explode'),
		'[\u200C](http://t.me/#unicorns#explode)',
	);
});

await test('messageSuffixMarkdown additional state gets url encoded correctly', () => {
	strictEqual(
		suffixMarkdown('unicorns', 'foo bar'),
		'[\u200C](http://t.me/#unicorns#foo%20bar)',
	);
});

await test('messageSuffixMarkdown throws on ) in identifier', () => {
	throws(() => suffixMarkdown('uni)orns', undefined), {
		message: /bracket.+\)/,
	});
});

await test('messageSuffixMarkdown throws on ) in additionalState', () => {
	throws(() => suffixMarkdown('unicorns', 'b)a'), {message: /bracket.+\)/});
});

await test('messageSuffixMarkdownV2', () => {
	strictEqual(
		suffixMarkdownV2('unicorns', undefined),
		'[\u200C](http://t.me/#unicorns#)',
	);
});

await test('messageSuffixMarkdownV2 with additional state', () => {
	strictEqual(
		suffixMarkdownV2('unicorns', 'explode'),
		'[\u200C](http://t.me/#unicorns#explode)',
	);
});

await test('messageSuffixMarkdownV2 additional state gets url encoded correctly', () => {
	strictEqual(
		suffixMarkdownV2('unicorns', 'foo bar'),
		'[\u200C](http://t.me/#unicorns#foo%20bar)',
	);
});

await test('messageSuffixMarkdownV2 with ) escapes correctly', () => {
	strictEqual(
		suffixMarkdownV2('uni)orns', 'exp)ode'),
		'[\u200C](http://t.me/#uni\\)orns#exp\\)ode)',
	);
});

await test('messageSuffixHTML', () => {
	strictEqual(
		suffixHTML('unicorns', undefined),
		'<a href="http://t.me/#unicorns#">\u200C</a>',
	);
});

await test('messageSuffixHTML with additional state', () => {
	strictEqual(
		suffixHTML('unicorns', 'explode'),
		'<a href="http://t.me/#unicorns#explode">\u200C</a>',
	);
});

await test('messageSuffixHTML additional state gets url encoded correctly', () => {
	strictEqual(
		suffixHTML('unicorns', 'foo bar'),
		'<a href="http://t.me/#unicorns#foo%20bar">\u200C</a>',
	);
});
