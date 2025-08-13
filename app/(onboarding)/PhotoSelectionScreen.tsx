import React, { useState } from "react";
import { View, Alert, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { supabase } from "@/config/supabase";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import Icon from "react-native-remix-icon";

interface PhotoItem {
	uri: string;
	id: string;
	blurhash?: string;
}

interface UploadedPhoto {
	uri: string;
	storagePath: string;
	order: number;
	isMain: boolean;
	fileSize?: number;
	blurhash?: string;
}

export default function PhotoSelectionScreen() {
	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const { updateProfile } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();
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
				mediaTypes: "images",
				allowsEditing: true,
				aspect: [4, 5],
				quality: 1,
			});

			if (!result.canceled && result.assets[0]) {
				// Process the image: resize to 1400px height and convert to PNG with compression
				let processedImage = await ImageManipulator.manipulateAsync(
					result.assets[0].uri,
					[
						{
							resize: {
								height: 1400,
							},
						},
					],
					{
						compress: 0.8, // Start with moderate compression
						format: ImageManipulator.SaveFormat.JPEG,
					},
				);

				// Check file size and compress further if needed
				const fileInfo = await FileSystem.getInfoAsync(processedImage.uri);
				const targetSizeBytes = 1.5 * 1024 * 1024; // 1.5MB in bytes

				if (fileInfo.exists && 'size' in fileInfo && fileInfo.size && fileInfo.size > targetSizeBytes) {
					console.log(
						`Image too large (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB), compressing further...`,
					);

					// Compress further with lower quality
					processedImage = await ImageManipulator.manipulateAsync(
						processedImage.uri,
						[], // No additional resizing
						{
							compress: 0.15, // More aggressive compression
							format: ImageManipulator.SaveFormat.PNG,
						},
					);

					const finalFileInfo = await FileSystem.getInfoAsync(processedImage.uri);
					console.log(
						`Final image size: ${('size' in finalFileInfo && finalFileInfo.size ? (finalFileInfo.size / 1024 / 1024).toFixed(2) : 'unknown')}MB`,
					);
				}

				// Generate blurhash for the processed image
				try {
					const blurhash = await Image.generateBlurhashAsync(processedImage.uri, [4, 3]);
					console.log(`🎨 Generated blurhash for photo: ${blurhash}`);
					
					const newPhoto: PhotoItem = {
						uri: processedImage.uri,
						id: Date.now().toString(),
						blurhash: blurhash, // Store blurhash for later use
					};
					setPhotos((prev) => [...prev, newPhoto]);
				} catch (blurhashError) {
					console.warn("⚠️ Failed to generate blurhash:", blurhashError);
					// Still add the photo even if blurhash generation fails
					const newPhoto: PhotoItem = {
						uri: processedImage.uri,
						id: Date.now().toString(),
					};
					setPhotos((prev) => [...prev, newPhoto]);
				}
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
	const uploadPhotoToStorage = async (
		photo: PhotoItem,
		index: number,
	): Promise<UploadedPhoto> => {
		try {
			// For React Native, we need to handle the file differently
			// The URI is a local file path, not a web URL
			// Since we're converting all images to PNG, use PNG extension and MIME type
			const mimeType = "image/jpeg";
			const fileName = `${Date.now()}_${index}_${Math.random()
				.toString(36)
				.substring(7)}.jpeg`;
			const storagePath = `user-photos/${fileName}`;

			console.log("Processing photo:", photo.uri);
			console.log("MIME type:", mimeType);
			console.log("Storage path:", storagePath);

			// For React Native, we need to read the file data using expo-file-system
			// This ensures we get the actual file content, not just metadata
			const fileInfo = await FileSystem.getInfoAsync(photo.uri);
			console.log("File info:", fileInfo);

			if (!fileInfo.exists || fileInfo.size === 0) {
				throw new Error(`File does not exist or is empty: ${photo.uri}`);
			}

			// Read the file as base64 string
			const base64Data = await FileSystem.readAsStringAsync(photo.uri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			console.log("File read successfully, size:", fileInfo.size, "bytes");

			// For React Native, we need to convert base64 to ArrayBuffer for Supabase
			// Convert base64 string to ArrayBuffer
			const binaryString = atob(base64Data);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			console.log("Binary data created, size:", bytes.length, "bytes");

			// Upload to Supabase Storage using the binary data
			const { data, error } = await supabase.storage
				.from("user-photos")
				.upload(storagePath, bytes, {
					cacheControl: "3600",
					upsert: false,
					contentType: mimeType,
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
				fileSize: fileInfo.size || 0,
				blurhash: undefined, // Will be set from the PhotoItem after blurhash generation
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
				// Add blurhash from the PhotoItem to the uploaded photo
				uploadedPhoto.blurhash = photos[i].blurhash;
				uploadedPhotos.push(uploadedPhoto);

				// Update progress
				const progress = ((i + 1) / photos.length) * 100;
				setUploadProgress(progress);

				// Small delay to show progress
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				throw new Error(`Failed to upload photo ${i + 1}: ${errorMessage}`);
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

			// Save photos to database
			const { data: user } = await supabase.auth.getUser();
			if (!user.user) {
				throw new Error("User not authenticated");
			}

			// Insert photos into database
			const photoInserts = uploadedPhotos.map((photo) => {
				console.log(`📸 Photo ${photo.order} blurhash:`, photo.blurhash);
				return {
					user_id: user.user.id,
					storage_path: photo.storagePath,
					public_url: photo.uri,
					photo_order: photo.order,
					is_main: photo.isMain,
					file_size: photo.fileSize || 0,
					mime_type: "image/jpeg",
					blurhash: photo.blurhash || null,
				};
			});

			const { error: insertError } = await supabase
				.from("user_photos")
				.insert(photoInserts);

			if (insertError) {
				console.error("Error saving photos to database:", insertError);
				throw new Error(`Failed to save photos: ${insertError.message}`);
			}

			// Store photo data in profile context for onboarding
			const photoData = {
				photos: uploadedPhotos.map((photo) => ({
					uri: photo.uri,
					storagePath: photo.storagePath,
					order: photo.order,
					isMain: photo.isMain,
				})),
			};

			updateProfile(photoData);
			console.log("Photos uploaded and saved to database:", photoData);

			// Navigate to next screen
			next();
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

	const PhotoItem = ({
		photo,
		index,
		onRemove,
	}: {
		photo: PhotoItem;
		index: number;
		onRemove: () => void;
	}) => {
		return (
			<View
				className="w-[33%] aspect-[4/5] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
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
					<Pressable
						className="absolute top-2 right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
						onPress={onRemove}
					>
						<Text className="text-white text-xs font-bold">×</Text>
					</Pressable>
				</View>
			</View>
		);
	};

	const renderPhotoSlot = (index: number) => {
		const photo = photos[index];
		const isEmpty = !photo;

		if (!isEmpty) {
			return (
				<PhotoItem
					key={photo.id}
					photo={photo}
					index={index}
					onRemove={() => removePhoto(photo.id)}
				/>
			);
		}

		return (
			<Pressable
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
			</Pressable>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["top", "left", "right"]}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="flex-1 gap-6 web:m-4">
					<View className="gap-4">
						<View className="gap-4 items-start">
							<Icon name="image-2-line" size={24} color="#212030" />
							<H1>Add your photos</H1>
							<Muted>
								{photos.length} of {MAX_PHOTOS} photos
							</Muted>
						</View>
					</View>

					<View className="gap-4">

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

			<View className="gap-4 web:m-4 pt-4 pb-6">
				<Button
					size="lg"
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
			</View>
		</SafeAreaView>
	);
}
