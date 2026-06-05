import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks', // Use forks pool instead of threads to avoid rolldown
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
