import { createDecipheriv } from 'crypto';
import { WithImplicitCoercion } from 'node:buffer';


export const decryptSymmetric = (key: WithImplicitCoercion<string>, ciphertext: string, iv: WithImplicitCoercion<string>, tag: WithImplicitCoercion<string>) => {
	const decipher = createDecipheriv(
		"aes-256-gcm",
		Buffer.from(key, 'base64'),
		Buffer.from(iv, 'base64')
	);

	decipher.setAuthTag(Buffer.from(tag, 'base64'));

	let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
	plaintext += decipher.final('utf8');

	return plaintext;
}

//const plaintext = decryptSymmetric(key, ciphertext, iv, tag);