import { useFonts as useExpoFonts } from 'expo-font';

export function useFonts() {
	const [fontsLoaded, fontError] = useExpoFonts({
		'YoungSerif-Bold': require('../../assets/fonts/YoungSerif-Bold.otf'),
		'Inter': require('../../assets/fonts/Inter.ttf'),
	});

	return { fontsLoaded, fontError };
}