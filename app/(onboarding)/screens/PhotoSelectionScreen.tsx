import React, { useState } from "react";
import { View, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedGestureHandler,
	runOnJS,
	withSpring,
} from "react-native-reanimated";
import {
	PanGestureHandler,
	State,
	PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";

interface PhotoItem {
	uri: string;
	id: string;
}

export default function PhotoSelectionScreen() {
	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const { updateProfile } = useOnboarding();

	const MAX_PHOTOS = 6;

	const requestPermissions = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"We need access to your photos to upload profile pictures.",
			);
			return false;
		}
		return true;
	};

	const pickImage = async () => {
		if (photos.length >= MAX_PHOTOS) {
			Alert.alert(
				"Photo Limit",
				`You can only upload up to ${MAX_PHOTOS} photos.`,
			);
			return;
		}

		const hasPermission = await requestPermissions();
		if (!hasPermission) return;

		try {
			setIsLoading(true);
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 5], // Dating app standard aspect ratio
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				const newPhoto: PhotoItem = {
					uri: result.assets[0].uri,
					id: Date.now().toString(),
				};
				setPhotos((prev) => [...prev, newPhoto]);
			}
		} catch (error) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "Failed to select image. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const removePhoto = (id: string) => {
		setPhotos((prev) => prev.filter((photo) => photo.id !== id));
	};

	const reorderPhotos = (fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return;

		const newPhotos = [...photos];
		const [removed] = newPhotos.splice(fromIndex, 1);
		newPhotos.splice(toIndex, 0, removed);
		setPhotos(newPhotos);
	};

	const handleNext = () => {
		if (photos.length === 0) {
			Alert.alert("Add Photos", "Please add at least one photo to continue.", [
				{ text: "OK" },
			]);
			return;
		}

		// Store photos as a bio field for now (we'll extend the profile type later)
		const photoData = {
			bio: JSON.stringify({
				photos: photos.map((photo, index) => ({
					uri: photo.uri,
					order: index + 1,
					isMain: index === 0, // First photo is main profile photo
				})),
			}),
		};

		updateProfile(photoData);
		console.log("Photos saved:", photoData);
		router.push("/(onboarding)/complete"); // Go to complete screen
	};

	const DraggablePhoto = ({
		photo,
		index,
		onRemove,
	}: {
		photo: PhotoItem;
		index: number;
		onRemove: () => void;
	}) => {
		const translateX = useSharedValue(0);
		const translateY = useSharedValue(0);
		const scale = useSharedValue(1);
		const opacity = useSharedValue(1);

		const gestureHandler = useAnimatedGestureHandler<
			PanGestureHandlerGestureEvent,
			{ startX: number; startY: number }
		>({
			onStart: (_, context) => {
				context.startX = translateX.value;
				context.startY = translateY.value;
				scale.value = withSpring(1.1);
				opacity.value = withSpring(0.8);
				runOnJS(setDraggedIndex)(index);
			},
			onActive: (event, context) => {
				translateX.value = context.startX + event.translationX;
				translateY.value = context.startY + event.translationY;
			},
			onEnd: () => {
				// Calculate drop position and reorder
				const itemWidth = 120; // Approximate width of each photo slot
				const itemsPerRow = 3;
				const newIndex = Math.min(
					Math.max(
						0,
						Math.floor(translateX.value / itemWidth) +
							Math.floor(translateY.value / 150) * itemsPerRow,
					),
					photos.length - 1,
				);

				if (newIndex !== index) {
					runOnJS(reorderPhotos)(index, newIndex);
				}

				// Reset position and scale
				translateX.value = withSpring(0);
				translateY.value = withSpring(0);
				scale.value = withSpring(1);
				opacity.value = withSpring(1);
				runOnJS(setDraggedIndex)(null);
			},
		});

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value },
				{ scale: scale.value },
			],
			opacity: opacity.value,
			zIndex: draggedIndex === index ? 1000 : 1,
		}));

		return (
			<PanGestureHandler onGestureEvent={gestureHandler}>
				<Animated.View
					style={[
						{
							width: "33%",
							aspectRatio: 4 / 5,
							marginBottom: 12,
							borderRadius: 8,
							borderWidth: 2,
							borderColor: "#e5e7eb",
						},
						animatedStyle,
					]}
				>
					<View className="flex-1 relative">
						<Image
							source={{ uri: photo.uri }}
							className="w-full h-full rounded-lg"
							resizeMode="cover"
						/>
						{index === 0 && (
							<View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded">
								<Text className="text-white text-xs font-semibold">Main</Text>
							</View>
						)}
						<TouchableOpacity
							className="absolute top-2 right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
							onPress={onRemove}
						>
							<Text className="text-white text-xs font-bold">×</Text>
						</TouchableOpacity>
						{/* Drag indicator */}
						<View className="absolute bottom-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded">
							<Text className="text-white text-xs">⋮⋮</Text>
						</View>
					</View>
				</Animated.View>
			</PanGestureHandler>
		);
	};

	const renderPhotoSlot = (index: number) => {
		const photo = photos[index];
		const isEmpty = !photo;

		if (!isEmpty) {
			return (
				<DraggablePhoto
					key={photo.id}
					photo={photo}
					index={index}
					onRemove={() => removePhoto(photo.id)}
				/>
			);
		}

		return (
			<TouchableOpacity
				key={index}
				className="w-[33%] aspect-[4/5] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
				onPress={pickImage}
				disabled={isLoading}
				style={{ marginBottom: 12 }}
			>
				<View className="flex-1 items-center justify-center">
					<Text className="text-6xl text-gray-400 mb-2">+</Text>
					<Text className="text-gray-500 text-center text-sm px-2">
						{index === 0 ? "Add main photo" : "Add photo"}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="flex-1 gap-6 py-40 web:m-4">
					<View className="gap-4">
						<H1 className="self-start">Add your photos</H1>
						<Muted className="flex">
							Choose up to {MAX_PHOTOS} photos that show your personality. Your
							first photo will be your main profile picture.
						</Muted>
					</View>

					<View className="gap-4">
						<View className="flex-row justify-between">
							<Text className="text-sm text-gray-600">
								{photos.length} of {MAX_PHOTOS} photos
							</Text>
						</View>

						{/* Photo Grid */}
						<View className="flex-row flex-wrap justify-between">
							{Array.from({ length: MAX_PHOTOS }, (_, index) =>
								renderPhotoSlot(index),
							)}
						</View>

						{photos.length > 0 && (
							<View className="bg-blue-50 p-4 rounded-lg mt-4">
								<Text className="text-sm text-blue-800 font-medium mb-1">
									💡 Photo Tips
								</Text>
								<Text className="text-sm text-blue-700">
									• Use high-quality, clear photos{"\n"}• Show your face clearly
									in your main photo{"\n"}• Include photos that show your
									interests{"\n"}• Smile and be yourself!{"\n"}• Drag photos to
									reorder them
								</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>

			<View className="gap-4 web:m-4 pt-4">
				<Button
					size="default"
					variant="default"
					onPress={handleNext}
					disabled={photos.length === 0 || isLoading}
				>
					<Text>
						{isLoading
							? "Loading..."
							: photos.length === 0
								? "Add photos to continue"
								: `Continue with ${photos.length} photo${
										photos.length > 1 ? "s" : ""
									}`}
					</Text>
				</Button>

				<Button
					size="default"
					variant="secondary"
					onPress={() => router.back()}
					disabled={isLoading}
				>
					<Text>Back</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
