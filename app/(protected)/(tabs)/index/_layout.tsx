import { router, Stack } from "expo-router";
import Icon from "react-native-remix-icon";
import { Pressable, View } from "react-native";

export default function IndexTabLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerLargeTitle: false,
				headerLargeTitleShadowVisible: false,
                headerBackButtonDisplayMode: "minimal",
                headerTintColor: "#000000",
				headerStyle: {
					backgroundColor: "#FFFFFF",
				},
			}}
		>
			<Stack.Screen 
				name="index"
    				options={{
					headerTitle: "Home",
					headerLargeTitleStyle: {
						fontFamily: "YoungSerif-Bold",
						fontSize: 40,
						fontWeight: "bold",
						color: "#000000",
					},
					headerTitleStyle: {
						fontFamily: "YoungSerif-Bold",
						fontSize: 20,
						fontWeight: "bold",
						color: "#000000",
					},
                    headerLargeTitle: true,
                    headerRight: () => (
                        <View className="flex-row">
                        <Pressable
                            onPress={() => router.push("/modal")}
                            className="mr-4"
                        >
                            <Icon name="equalizer-2-line" size={20} color="#000000" />
                        </Pressable>
                        <Pressable
                            onPress={() => router.push("/faq")}
                            className="mr-4"
                        >
                            <Icon name="question-line" size={20} color="#000000" />
                        </Pressable>    
                        </View> 
                    ),
				}}
			/>  
			<Stack.Screen 
				name="faq"
				options={{  
					headerTitle: "FAQ",
				}}
			/>
			<Stack.Screen 
				name="modal"
				options={{
					presentation: "modal",
					title: "Modal",
				}}
			/>
		</Stack>
	);
}