// 외부에서 접근 가능한 전역 캐시 객체
export let cachedVideoData = {};

// Category.jsx에서 데이터 저장 시 사용
export const setCachedVideoData = (data) => {
    cachedVideoData = data;
};
