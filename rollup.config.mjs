import typescript from '@rollup/plugin-typescript';

const config = [
  {
    input: 'index.js',
    output: {
      dir: 'react',
      format: 'module',
    },
    plugins: [typescript()],
    external: ['react']
  },
];

export default config;
