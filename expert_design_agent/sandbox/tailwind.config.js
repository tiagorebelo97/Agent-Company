/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'hub-black': '#000000',
                'hub-card': '#121212',
                'hub-blue': '#2B81FF',
                'hub-gray-muted': '#1F1F1F',
                'hub-text-secondary': '#8A8A8A',
            },
        },
    },
    plugins: [],
}
