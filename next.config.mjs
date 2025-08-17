/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',         // меньше памяти на рантайме
  swcMinify: true,              // быстрее и экономнее
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },// отключаем sharp и heavy image-оптимизацию
  experimental: {
    workerThreads: false,       // не плодим воркеры
    cpus: 1,                    // 1 CPU хватит и экономнее по ОЗУ
  },
};

export default nextConfig;
