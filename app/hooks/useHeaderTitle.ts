import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";

export function useHeaderTitle(title: string) {
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: title,
		});
	}, [navigation, title]);
}