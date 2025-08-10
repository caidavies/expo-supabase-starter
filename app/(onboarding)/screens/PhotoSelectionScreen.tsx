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
import { supabase } from "@/config/supabase";

interface PhotoItem {
	uri: string;
	id: string;
}

interface UploadedPhoto {
	uri: string;
	storagePath: string;
	order: number;
	isMain: boolean;
}

export default function PhotoSelectionScreen() {
	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
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

	const uploadPhotoToStorage = async (
		photo: PhotoItem,
		index: number,
	): Promise<UploadedPhoto> => {
		try {
			// For React Native, we need to handle the file differently
			// The URI is a local file path, not a web URL
			const fileExt = photo.uri.split(".").pop() || "jpg";
			const fileName = `${Date.now()}_${index}_${Math.random()
				.toString(36)
				.substring(7)}.${fileExt}`;
			const storagePath = `user-photos/${fileName}`;

			// Convert local URI to blob using a different approach
			let blob: Blob;
			try {
				// First try the fetch approach
				const response = await fetch(photo.uri);
				if (!response.ok) {
					throw new Error(`Fetch failed: ${response.status}`);
				}
				blob = await response.blob();

				// Check if blob is empty
				if (blob.size === 0) {
					throw new Error("Blob is empty");
				}
			} catch (fetchError) {
				console.warn(
					"Fetch approach failed, trying alternative method:",
					fetchError,
				);

				// Alternative: create a file object from the URI
				// This is more reliable for React Native
				const formData = new FormData();
				formData.append("file", {
					uri: photo.uri,
					type: `image/${fileExt}`,
					name: fileName,
				} as any);

				// For now, let's use the original approach but with better error handling
				const response = await fetch(photo.uri);
				blob = await response.blob();

				if (blob.size === 0) {
					throw new Error("Image file appears to be empty or corrupted");
				}
			}

			console.log(
				`Uploading photo ${index + 1}, blob size: ${blob.size} bytes`,
			);

			// Upload to Supabase Storage
			const { data, error } = await supabase.storage
				.from("user-photos")
				.upload(storagePath, blob, {
					cacheControl: "3600",
					upsert: false,
				});

			if (error) {
				console.error("Upload error details:", error);
				throw new Error(`Upload failed: ${error.message}`);
			}

			// Log the upload response data for debugging
			console.log("Upload successful, response data:", data);
			console.log("Storage path:", storagePath);

			// Get public URL
			const { data: urlData } = supabase.storage
				.from("user-photos")
				.getPublicUrl(storagePath);

			console.log("Public URL data:", urlData);

			return {
				uri: urlData.publicUrl,
				storagePath,
				order: index + 1,
				isMain: index === 0,
			};
		} catch (error) {
			console.error(`Error uploading photo ${index + 1}:`, error);
			throw error;
		}
	};

	const uploadAllPhotos = async (): Promise<UploadedPhoto[]> => {
		const uploadedPhotos: UploadedPhoto[] = [];

		for (let i = 0; i < photos.length; i++) {
			try {
				const uploadedPhoto = await uploadPhotoToStorage(photos[i], i);
				uploadedPhotos.push(uploadedPhoto);

				// Update progress
				const progress = ((i + 1) / photos.length) * 100;
				setUploadProgress(progress);

				// Small delay to show progress
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				throw new Error(
					`Failed to upload photo ${i + 1}: ${errorMessage}`,
				);
			}
		}

		return uploadedPhotos;
	};

	const handleNext = async () => {
		if (photos.length === 0) {
			Alert.alert("Add Photos", "Please add at least one photo to continue.", [
				{ text: "OK" },
			]);
			return;
		}

		try {
			setIsUploading(true);
			setUploadProgress(0);

			// Upload all photos to Supabase Storage
			const uploadedPhotos = await uploadAllPhotos();

			// Store photo data in profile context
			const photoData = {
				photos: uploadedPhotos.map((photo) => ({
					uri: photo.uri,
					storagePath: photo.storagePath,
					order: photo.order,
					isMain: photo.isMain,
				})),
			};

			updateProfile(photoData);
			console.log("Photos uploaded and saved:", photoData);

			// Navigate to next screen
			router.push("/(onboarding)/complete");
		} catch (error) {
			console.error("Error uploading photos:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			Alert.alert(
				"Upload Failed",
				`Failed to upload photos: ${errorMessage}. Please check your connection and try again.`,
				[{ text: "OK" }],
			);
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
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
				disabled={isLoading || isUploading}
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

						{/* Upload Progress */}
						{isUploading && (
							<View className="bg-green-50 p-4 rounded-lg mt-4">
								<Text className="text-sm text-green-800 font-medium mb-2">
									📤 Uploading photos... {Math.round(uploadProgress)}%
								</Text>
								<View className="w-full bg-green-200 rounded-full h-2">
									<View
										className="bg-green-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${uploadProgress}%` }}
									/>
								</View>
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
					disabled={photos.length === 0 || isLoading || isUploading}
				>
					<Text>
						{isLoading
							? "Loading..."
							: isUploading
								? `Uploading... ${Math.round(uploadProgress)}%`
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
					disabled={isLoading || isUploading}
				>
					<Text>Back</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
