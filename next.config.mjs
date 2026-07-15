// GitHub Pages(정적 호스팅)용 설정.
// - output: "export"  → 서버 없이 순수 정적 파일로 빌드 (out/)
// - basePath          → 프로젝트 페이지 경로. jjazzking.github.io/CareerPath 이므로 "/CareerPath".
//                       로컬 개발 시엔 비워두려고 환경변수로 받는다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
