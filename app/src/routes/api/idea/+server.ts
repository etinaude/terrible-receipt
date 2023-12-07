import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import { promisify } from 'util';
import { env } from '$env/dynamic/private';
import OpenAI from 'openai';

const project_types = [
	'physical',
	'digital',
	'written',
	'art',
	'performance',
	'video',
	'game',
	'interactive',
	'political',
	'other',
	'wet',
	'explosive',
	'dangerous',
	'unethical',
	'about New Zealand',
	'exceptionally weird'
];
const tech_amounts = [
	'no tech',
	'some tech',
	'lots of tech',
	'way too much tech',
	'just a little tech',
	'not enough tech',
	'just the right amount of tech'
];

export const GET: RequestHandler = async ({ url, request }) => {
	// Get OpenAI
	const openai = new OpenAI({
		apiKey: env.OPENAI_KEY,
		organization: env.OPENAI_ORG
	});
	let project_type = project_types[Math.floor(Math.random() * project_types.length)];
	let tech_amount = tech_amounts[Math.floor(Math.random() * tech_amounts.length)];

	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content: `You are a helpful assistant`
			},
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: `
Come up with a 140 character unhinged idea for a thing that could be made in four days by a clever person. The idea could satirize an existing field or topic such as tech, science, art, writing, etc, or it could lean into absurdism.

Ideas can be up to PG-13. Your response should be at most 140 characters and not include a name or any formatting. It should be original, not drawing from existing projects.
						
Projects could be physical, digital, written, or some other form of art. This project is: ${project_type} and involves ${tech_amount}.

IMPORTANT: the idea should be TERRIBLE! Silly, reckless, and unhinged.

Here are some examples of previous ideas:
- Electric Scooter + Green Screen + Zoom = Classroom Commute
- Alexa powered toilet
- Bluetooth gumboots
- Invisible ink clock
- Automatic bed wetting
- Pyramid Scheme Pyramid Scheme
- Instant noodles milkshake
- Leaner Canvas / Fat Canvas
- Leaky home simulator 2004
- Hand desanitizer
- Artisanal stained carpet
- Enterprise-ready socks
- Social Distance Whip
- Piazza question generator
- Hamilton in 60 seconds
- Bike helmet airbag
- IOT tissue box
- Mi goreng automatic feeder robot
- ~~Lunchbox~~ Laptop riser made of mi goreng
- DRM for seatbelts (subscription model)
- Confirmation prompts for airbags
- Pay-per-use paywave pedestrian crossing buttons
- Halter for humans
- Leg Pong
- Twenty sided dice
    - Every side has 20 on it,
    - As heavily weighted as possible to the 1
- Automatic different movie subtitle downloader (chooses random subtitles to download)
    - Could pick subtitles from "opposite" genre?
    - Could sync with original subtitles so speech aligns
- Vending machine / Honesty box that shoots you with nerf bullets if you don't pay
- Sidewalk Paywave drone tolls
- Petrol powered face mask
- Lullaby alarm clock
- Two-sided pushpin
- AirBnB for cars (sleep in cars)
- Pre-popup popups that warn you a popup is incoming
- BLT Shortbread (SBLT)
- Leather socks
- Alarm clock variations:
    - Silent alarm clock (notifies police)
    - Self-snoozing alarm clock
- Surprise! fireworks! (randomly exploding fireworks)
- RFID wall - take one if you dare, chance of reward or punishment`
					}
				]
			}
		],
		model: 'gpt-4-1106-preview',
		max_tokens: 256
	});

	console.log({
		project_type,
		tech_amount,
		desc: chatCompletion.choices[0].message
	});

	return new Response(JSON.stringify(chatCompletion.choices[0].message.content || ''));
};
