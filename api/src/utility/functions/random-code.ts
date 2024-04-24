export function generateRandomCode(length: number = 15): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const vowels = 'aeiouAEIOU';
  const consonants = characters.replace(vowels, '');
  const numbers = '0123456789';

  let result = '';

  // Ensure at least one vowel, consonant, and number
  result += vowels[Math.floor(Math.random() * vowels.length)];
  result += consonants[Math.floor(Math.random() * consonants.length)];
  result += numbers[Math.floor(Math.random() * numbers.length)];

  // Fill remaining characters with random selection from all categories
  for (let i = 3; i < length; i++) {
    const category = Math.floor(Math.random() * 3); // 0: vowels, 1: consonants, 2: numbers
    switch (category) {
      case 0:
        result += vowels[Math.floor(Math.random() * vowels.length)];
        break;
      case 1:
        result += consonants[Math.floor(Math.random() * consonants.length)];
        break;
      case 2:
        result += numbers[Math.floor(Math.random() * numbers.length)];
        break;
    }
  }

  return result;
}