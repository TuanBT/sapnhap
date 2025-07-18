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

// Tạo search keywords từ text (ưu tiên cụm từ liên tiếp)
export function createSearchKeywords(text: string): string[] {
    const normalized = normalizeForSearch(text);
    const words = normalized.split(' ').filter(word => word.length > 0);

    const keywords = new Set<string>();

    // Thêm toàn bộ text (ưu tiên cao nhất)
    keywords.add(normalized);

    // Thêm cụm từ liên tiếp (2-5 từ) - ưu tiên cao
    for (let len = 2; len <= Math.min(5, words.length); len++) {
        for (let i = 0; i <= words.length - len; i++) {
            const phrase = words.slice(i, i + len).join(' ');
            if (phrase.length >= 5) { // Chỉ lấy cụm từ có ít nhất 5 ký tự
                keywords.add(phrase);
            }
        }
    }

    // Thêm từng từ riêng lẻ (ưu tiên thấp, chỉ từ có ý nghĩa)
    words.forEach(word => {
        if (word.length >= 3) { // Chỉ lấy từ có ít nhất 3 ký tự
            keywords.add(word);
        }
    });

    return Array.from(keywords);
}

// Tính độ tương đồng giữa query và text (chỉ cho exact phrase)
export function calculateSimilarity(query: string, text: string): number {
    const normalizedQuery = normalizeForSearch(query);
    const normalizedText = normalizeForSearch(text);

    // Exact match
    if (normalizedText === normalizedQuery) return 100;

    // Contains exact phrase
    if (normalizedText.includes(normalizedQuery)) return 90;

    // Starts with exact phrase
    if (normalizedText.startsWith(normalizedQuery)) return 85;

    // Ends with exact phrase
    if (normalizedText.endsWith(normalizedQuery)) return 80;

    // Không tìm kiếm từ riêng lẻ nữa - chỉ tìm exact phrase
    return 0;
}