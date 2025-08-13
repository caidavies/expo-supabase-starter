/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	darkMode: "class",
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				DEFAULT: ["Inter", "sans-serif"],
				serif: ["YoungSerif-Bold", "serif"],
				sans: ["Inter", "sans-serif"],
			},
			colors: {
				'spring-wood': {
				'50': '#fbf8f1',
				'100': '#f6efde',
				'200': '#ebddbd',
				'300': '#dfc492',
				'400': '#d1a566',
				'500': '#c78e48',
				'600': '#b97a3d',
				'700': '#9a6134',
				'800': '#7c4e30',
				'900': '#64412a',
				'950': '#362114',
			},
			'steel-gray': {
				'50': '#f4f5fa',
				'100': '#e6e8f3',
				'200': '#d3d6ea',
				'300': '#b5bcdb',
				'400': '#929ac8',
				'500': '#856AF0',
				'600': '#6567ab',
				'700': '#5c5a9b',
				'800': '#504d80',
				'900': '#424167',
				'950': '#212030',
			},

				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "#fbf8f1",
				backgroundDark: "#212030",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "#212030",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
		},
	},
	plugins: [],
};
