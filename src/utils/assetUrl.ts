/**
 * Trả về URL đầy đủ cho file trong thư mục `public/`, có tính đến `base` của Vite.
 * Khi build cho GitHub Pages, site nằm ở /sapnhap/ nên không thể dùng đường dẫn tuyệt đối "/file".
 */
export const assetUrl = (path: string): string =>
    import.meta.env.BASE_URL + path.replace(/^\//, '');
