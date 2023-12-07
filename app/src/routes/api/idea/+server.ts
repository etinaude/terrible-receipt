import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import { promisify } from 'util';
import { env } from '$env/dynamic/private';
import OpenAI from 'openai';

export const GET: RequestHandler = async ({ url, request }) => {
	// Get OpenAI
	console.log(env);
	const openai = new OpenAI({
		apiKey: env.OPENAI_KEY,
		organization: env.OPENAI_ORG
	});

	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `Come up with a short, funny, terrible, and very unhinged idea for a project in the Terrible Ideas Hackathon. The idea could satirize an existing field or topic such as tech, science, art, writing, etc, or it could lean into absurdism.

						Ideas can be up to PG-13.
						
						Your response should be at most 140 characters and not include a name or any formatting. It should be original, not drawing from existing projects.
						
						Projects could be physical, digital, written, or some other form of art. Projects occasionally involve tech, but don't have to. This project is: physical and involves no tech.`
					}
				]
			}
		],
		model: 'gpt-4-1106-preview',
		max_tokens: 256
	});

	return new Response(JSON.stringify(chatCompletion.choices[0].message.content || ''));
};
