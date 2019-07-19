import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Either';
import { Either, right } from 'fp-ts/lib/Either';

export type ErrorResponse = {
	errorType: string
	message: string
}

// This function returns a proper monad
const step1 = (): Either<Error, string> => {
	return right('some value');
};


/**
 * This function should return either a string on success
 * or an ErrorResponse on failure
 *
 * @param step2 This is a "classical" error-throwing method (like from aws-sdk)
 */
export const handler = async (step2: () => Promise<void>): Promise<string | ErrorResponse> =>
	pipe(
		// First step that could fail
		step1(),
		fold(
			error => Promise.resolve(({
				errorType: error.name,
				message: 'Step 1 failed',
			})) as Promise<string | ErrorResponse>, // FIXME: Why do I need this?!
			async () => {
				const id = 'foo'; // handler should return this on success
				// FIXME: Turn this into a monad. On success return id, else return ErrorResponse
				await step2();
				return id;
			},
		),
	);

const main = async () => {

	const result1 = await handler(() => Promise.resolve(undefined));
	console.log(result1); // Should be 'foo'

	const result2 = await handler(() => {
		throw new Error('Error in step2');
	});
	console.log(result2); // Should be an ErrorResponse
};

main();
