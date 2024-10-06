/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.githubusercontent.com',
      'cdn.discordapp.com',
      't3.ftcdn.net',
      'placeholder.com',
      'via.placeholder.com',
      'anotherdomain.com',
      'storage.googleapis.com',
      'studiovip-6913f.appspot.com',
      'firebasestorage.googleapis.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)', 
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.mercadopago.com;`
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
