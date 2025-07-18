// Utility để normalize text cho search
export function normalizeForSearch(text: string): string {
    if (!text) return '';

    return text
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/đ/g, 'd') // Replace đ with d
        .replace(/Đ/g, 'd') // Replace Đ with d
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .trim();
}

// Tạo search keywords từ text
export function createSearchKeywords(text: string): string[] {
    const normalized = normalizeForSearch(text);
    const words = normalized.split(' ').filter(word => word.length > 0);

    // Tạo combination của các từ
    const keywords = new Set<string>();

    // Thêm từng từ riêng lẻ
    words.forEach(word => {
        if (word.length >= 2) { // Chỉ lấy từ có ít nhất 2 ký tự
            keywords.add(word);
        }
    });

    // Thêm cụm từ (2-3 từ liên tiếp)
    for (let i = 0; i < words.length - 1; i++) {
        keywords.add(words[i] + ' ' + words[i + 1]);
        if (i < words.length - 2) {
            keywords.add(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
        }
    }

    // Thêm toàn bộ text
    keywords.add(normalized);

    return Array.from(keywords);
}

// Tính độ tương đồng giữa query và text
export function calculateSimilarity(query: string, text: string): number {
    const normalizedQuery = normalizeForSearch(query);
    const normalizedText = normalizeForSearch(text);

    // Exact match
    if (normalizedText === normalizedQuery) return 100;

    // Starts with
    if (normalizedText.startsWith(normalizedQuery)) return 90;

    // Contains
    if (normalizedText.includes(normalizedQuery)) return 80;

    // Word match
    const queryWords = normalizedQuery.split(' ');
    const textWords = normalizedText.split(' ');

    let matchedWords = 0;
    queryWords.forEach(qWord => {
        if (textWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
            matchedWords++;
        }
    });

    if (matchedWords > 0) {
        return 70 * (matchedWords / queryWords.length);
    }

    // Partial character match
    let matchedChars = 0;
    for (let i = 0; i < Math.min(normalizedQuery.length, normalizedText.length); i++) {
        if (normalizedQuery[i] === normalizedText[i]) {
            matchedChars++;
        } else {
            break;
        }
    }

    if (matchedChars >= 2) {
        return 50 * (matchedChars / normalizedQuery.length);
    }

    return 0;
}