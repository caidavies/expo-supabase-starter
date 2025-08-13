import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";

export default function HomeScreen() {
	return (
		<SafeAreaView className="flex-1 bg-[#FFFDFC]">
			<ScrollView className="flex-1 px-5 py-32">
				<View className="flex-1 flex-row">
					<View className="flex w-full bg-white rounded-lg p-4 border border-gray-200 max-h-80">
						<Image source={require("@/assets/images/avatar-1.jpg")} className="w-full max-h-64 object-cover rounded-lg"/>
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Text className="text-lg font-bold">John Doe</Text>	
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}