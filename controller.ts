import { pipe } from 'fp-ts/lib/pipeable';
import { tryCatch } from 'fp-ts/lib/Either';
import { Either, right, chain, fold } from 'fp-ts/lib/Either';

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
export const handler = async (step2: () => Promise<void>): Promise<string | ErrorResponse> => {
	const id = 'foo';
	return pipe(
		step1(),
		chain(() => tryCatch(() => step2(), error => new Error(`Error in step 2: ${error instanceof Error ? error.message : 'unknown'}`))),
		fold<Error, Promise<void>, string | ErrorResponse>(
			(error: Error) => ({
				errorType: error.name,
				message: 'Oops!',
			}),
			() => id,
		),
	);
};


const main = async () => {

	const result1 = await handler(() => Promise.resolve(undefined));
	console.log(result1); // Should be 'foo'

	const result2 = await handler(() => {
		throw new Error('Error in step2');
	});
	console.log(result2); // Should be an ErrorResponse
};

main();
