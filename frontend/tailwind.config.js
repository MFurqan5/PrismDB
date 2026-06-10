/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a0f',
          card: 'rgba(13, 17, 23, 0.7)',
          cyan: '#00d4ff',
          purple: '#7c3aed',
          green: '#10b981',
          red: '#f43f5e',
          text: '#e2e8f0',
          muted: '#8b949e',
          border: 'rgba(255, 255, 255, 0.08)'
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 212, 255, 0.35)',
        'purple-glow': '0 0 15px rgba(124, 58, 237, 0.35)',
        'green-glow': '0 0 15px rgba(16, 185, 129, 0.35)'
      }
    },
  },
  plugins: [],
}
