// PROCESSAMENTO DO CSS
// Tailwind 4 runs only to compile @imagineapps-team/react (app/lib.css imports its theme, whose tailwind.css declares
// the lib's own class sources); the site's sheets stay CSS modules.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
