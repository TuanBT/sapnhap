// Simple và nhanh - normalize text cho search
export function normalizeForSearch(text: string): string {
    if (!text) return '';

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, ' ')
        .trim();
}

// Tạo search keywords đơn giản hơn
export function createSearchKeywords(text: string): string[] {
    const normalized = normalizeForSearch(text);
    const words = normalized.split(' ').filter(word => word.length > 0);

    const keywords = new Set<string>();

    // Thêm toàn bộ text
    keywords.add(normalized);

    // Thêm từng từ
    words.forEach(word => {
        if (word.length >= 2) {
            keywords.add(word);
        }
    });

    // Thêm cụm từ 2-3 từ
    for (let len = 2; len <= Math.min(3, words.length); len++) {
        for (let i = 0; i <= words.length - len; i++) {
            const phrase = words.slice(i, i + len).join(' ');
            keywords.add(phrase);
        }
    }

    return Array.from(keywords);
}

// Tính điểm simple và nhanh
export function calculateSimilarity(query: string, text: string): number {
    const normalizedQuery = normalizeForSearch(query);
    const normalizedText = normalizeForSearch(text);

    // Exact match
    if (normalizedText === normalizedQuery) return 100;

    // Contains exact phrase
    if (normalizedText.includes(normalizedQuery)) return 90;

    // Starts with
    if (normalizedText.startsWith(normalizedQuery)) return 85;

    // Ends with
    if (normalizedText.endsWith(normalizedQuery)) return 80;

    return 0;
}