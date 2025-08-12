import { router, Stack } from "expo-router";
import { Settings2, CircleQuestionMark } from "lucide-react-native";
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
                    headerLargeTitle: true,
                    headerRight: () => (
                        <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.push("/modal")}
                            className="mr-4  w-10 h-10"
                        >
                            <Settings2 size={20} color="#000000" />
                        </Pressable>
                        <Pressable
                            onPress={() => router.push("/faq")}
                            className="mr-4  w-10 h-10"
                        >
                            <CircleQuestionMark size={20} color="#000000" />
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