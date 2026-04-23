/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Warm palette — pink, peach, rose */
        blush:   "#FADADD",
        peach:   "#FFD5B8",
        rose:    { 50:"#fff1f2", 100:"#ffe4e6", 200:"#fecdd3", 300:"#fda4af", 400:"#fb7185", 500:"#f43f5e" },
        petal:   "#FDE8EC",
        cream:   "#FFF8F0",
        /* Keep soft blue as complementary accent only */
        skyblue: "#DDEBFF",
      },
      backgroundImage: {
        'wellness':        "url('/background.png')",
        'gradient-warm':   "linear-gradient(135deg, #fda4af, #f9a8d4, #fdba74)",
        'gradient-hero':   "linear-gradient(135deg, rgba(253,164,175,0.80), rgba(249,168,212,0.75), rgba(253,186,116,0.65))",
        'gradient-soft':   "linear-gradient(160deg, #fff1f2, #fde8ec, #fff8f0)",
      },
      animation: {
        'float':      'float 8s ease-in-out infinite',
        'float-2':    'floatSlow 11s ease-in-out infinite',
        'float-3':    'float 14s ease-in-out infinite reverse',
        'fade-in':    'fadeIn 0.55s ease-out both',
        'slide-up':   'slideUp 0.4s ease-out',
        'emoji-bounce':'emojiBounce 2.5s ease-in-out infinite',
        'emoji-wiggle':'emojiWiggle 2s ease-in-out infinite',
        'emoji-pulse': 'emojiPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float:      { '0%,100%': { transform:'translateY(0) scale(1)' }, '50%': { transform:'translateY(-18px) scale(1.02)' } },
        floatSlow:  { '0%,100%': { transform:'translateY(0) translateX(0)' }, '33%': { transform:'translateY(-14px) translateX(8px)' }, '66%': { transform:'translateY(6px) translateX(-5px)' } },
        fadeIn:     { '0%': { opacity:'0', transform:'translateY(14px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        slideUp:    { '0%': { opacity:'0', transform:'translateY(20px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        emojiBounce:{ '0%,100%': { transform:'translateY(0) rotate(0deg) scale(1)' }, '25%': { transform:'translateY(-5px) rotate(-5deg) scale(1.1)' }, '75%': { transform:'translateY(-3px) rotate(4deg) scale(1.05)' } },
        emojiWiggle:{ '0%,100%': { transform:'rotate(0deg)' }, '20%': { transform:'rotate(-10deg)' }, '40%': { transform:'rotate(10deg)' }, '60%': { transform:'rotate(-6deg)' }, '80%': { transform:'rotate(6deg)' } },
        emojiPulse: { '0%,100%': { transform:'scale(1)' }, '50%': { transform:'scale(1.18)' } },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-glow':  '0 0 0 1px rgba(253,164,175,0.3), 0 8px 40px rgba(251,113,133,0.22)',
        'warm-sm':    '0 4px 16px rgba(253,164,175,0.18)',
        'warm-card':  '0 4px 24px rgba(251,113,133,0.08)',
      },
    },
  },
  plugins: [],
};
