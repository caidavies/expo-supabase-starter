import React, { useState, useCallback, useEffect } from "react";
import { View, Alert, ScrollView, Pressable, Modal, TextInput, ActivityIndicator, ActionSheetIOS, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { usePrompts, saveUserPrompts, fetchUserPrompts, type Prompt, type UserPrompt } from "@/app/hooks/usePrompts";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

// Local state interface for managing prompts during editing
interface LocalUserPrompt {
	id: string;
	promptId: string;
	answer: string;
	order: number;
}

export default function PromptsScreen() {
	const { session } = useAuth();
	const { prompts, loading, error, refetch } = usePrompts();
	const [userPrompts, setUserPrompts] = useState<LocalUserPrompt[]>([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [isAnswerMode, setIsAnswerMode] = useState(false);
	const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null);
	const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);
	const [editingAnswer, setEditingAnswer] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { updateProfile } = useOnboarding();

	// Load existing user prompts when component mounts
	useEffect(() => {
		const loadExistingPrompts = async () => {
			if (!session?.user?.id) return;

			try {
				// Get the user ID from the users table
				const { data: userData, error: userError } = await supabase
					.from("users")
					.select("id")
					.eq("auth_user_id", session.user.id)
					.single();

				if (userError || !userData) return;

				// Fetch existing prompts
				const existingPrompts = await fetchUserPrompts(userData.id);
				
				// Convert to local format
				const localPrompts: LocalUserPrompt[] = existingPrompts.map(p => ({
					id: p.id,
					promptId: p.prompt_id,
					answer: p.answer,
					order: p.order_index,
				}));

				setUserPrompts(localPrompts);
			} catch (error) {
				console.error("Error loading existing prompts:", error);
			}
		};

		loadExistingPrompts();
	}, [session?.user?.id]);

	// Handle loading state
	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" />
					<Text className="mt-4">Loading prompts...</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Handle error state
	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center p-6">
					<Text className="text-red-500 mb-3">Failed to load prompts</Text>
					<Button onPress={refetch}>
						<Text>Try Again</Text>
					</Button>
				</View>
			</SafeAreaView>
		);
	}

	const MAX_PROMPTS = 3;

	// Helper function to check if a prompt is incomplete (selected but no answer)
	const isPromptIncomplete = (index: number) => {
		const userPrompt = userPrompts.find(p => p.order === index);
		return userPrompt && !userPrompt.answer.trim();
	};

	const openPromptModal = (index: number) => {
		setSelectedPromptIndex(index);
		setModalVisible(true);
	};

	const closePromptModal = () => {
		// If user closes modal while in answer mode without answering, remove the prompt
		if (isAnswerMode && editingPromptIndex !== null && !editingAnswer.trim()) {
			setUserPrompts(prev => prev.filter(p => p.order !== editingPromptIndex));
		}
		
		setModalVisible(false);
		setSelectedPromptIndex(null);
		setIsAnswerMode(false);
		setEditingPromptIndex(null);
		setEditingAnswer("");
	};

	const selectPrompt = (prompt: Prompt) => {
		if (selectedPromptIndex === null) return;

		// Create the user prompt first
		const newUserPrompt: LocalUserPrompt = {
			id: Date.now().toString(),
			promptId: prompt.id,
			answer: "",
			order: selectedPromptIndex,
		};

		// Add the prompt to the list
		setUserPrompts(prev => {
			const updated = [...prev];
			// Remove any existing prompt at this order
			const filtered = updated.filter(p => p.order !== selectedPromptIndex);
			// Add the new prompt
			return [...filtered, newUserPrompt];
		});

		// Set up the answer input state within the same modal
		setEditingPromptIndex(selectedPromptIndex);
		setEditingAnswer("");
		setIsAnswerMode(true);
	};

	const removePrompt = (index: number) => {
		setUserPrompts(prev => prev.filter(p => p.order !== index));
	};

	const openAnswerModal = (index: number) => {
		const userPrompt = userPrompts.find(p => p.order === index);
		setEditingPromptIndex(index);
		setEditingAnswer(userPrompt?.answer || "");
		setIsAnswerMode(true);
		setModalVisible(true);
	};

	const saveAnswer = () => {
		if (editingPromptIndex === null) return;
		
		// Update the prompt with the answer
		setUserPrompts(prev => 
			prev.map(p => 
				p.order === editingPromptIndex ? { ...p, answer: editingAnswer } : p
			)
		);
		
		// Close the modal and return to main prompts screen
		setModalVisible(false);
		setSelectedPromptIndex(null);
		setIsAnswerMode(false);
		setEditingPromptIndex(null);
		setEditingAnswer("");
	};

	const handleBackToPrompts = () => {
		// If user goes back without answering, remove the prompt
		if (editingPromptIndex !== null && !editingAnswer.trim()) {
			setUserPrompts(prev => prev.filter(p => p.order !== editingPromptIndex));
		}
		
		// Reset the answer input state
		setIsAnswerMode(false);
		setEditingPromptIndex(null);
		setEditingAnswer("");
	};

	const handleExistingPromptPress = (index: number) => {
		if (Platform.OS === 'ios') {
			ActionSheetIOS.showActionSheetWithOptions(
				{
					options: ['Edit Answer', 'Replace Prompt', 'Cancel'],
					cancelButtonIndex: 2,
					destructiveButtonIndex: 1,
				},
				(buttonIndex) => {
					if (buttonIndex === 0) {
						// Edit Answer
						openAnswerModal(index);
					} else if (buttonIndex === 1) {
						// Replace Prompt
						removePrompt(index);
						setSelectedPromptIndex(index);
						setIsAnswerMode(false);
						setModalVisible(true);
					}
				}
			);
		} else {
			// For Android, we'll use a simple alert for now
			Alert.alert(
				'Prompt Options',
				'What would you like to do?',
				[
					{
						text: 'Edit Answer',
						onPress: () => openAnswerModal(index)
					},
					{
						text: 'Replace Prompt',
						onPress: () => {
							removePrompt(index);
							setSelectedPromptIndex(index);
							setIsAnswerMode(false);
							setModalVisible(true);
						},
						style: 'destructive'
					},
					{
						text: 'Cancel',
						style: 'cancel'
					}
				]
			);
		}
	};

	const canContinue = userPrompts.length >= 1 && !isSubmitting;

	const onContinue = async () => {
		if (!canContinue || !session?.user?.id) return;

		try {
			setIsSubmitting(true);
			
			// Get the user ID from the users table
			const { data: userData, error: userError } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (userError || !userData) {
				throw new Error("User profile not found");
			}

			// Convert local prompts to database format
			const dbPrompts = userPrompts.map(p => ({
				user_id: userData.id,
				prompt_id: p.promptId,
				answer: p.answer,
				order_index: p.order,
			}));

			// Save to database
			await saveUserPrompts(userData.id, dbPrompts);
			
			// Update onboarding context
			updateProfile({ prompts: userPrompts });
			
			// Navigate to next screen
			// router.push("/(onboarding)/next-screen");
			
			Alert.alert("Success!", "Your prompts have been saved!");
		} catch (error) {
			Alert.alert("Error", "Failed to save prompts. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderPromptArea = (index: number) => {
		const userPrompt = userPrompts.find(p => p.order === index);
		const prompt = userPrompt ? prompts.find(p => p.id === userPrompt.promptId) : null;

		if (userPrompt && prompt) {
			return (
				<Pressable
					key={index}
					onPress={() => handleExistingPromptPress(index)}
					className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:opacity-80"
					accessibilityRole="button"
					accessibilityLabel={`${prompt.question} - ${userPrompt.answer ? 'Tap to edit or replace' : 'Tap to add answer'}`}
				>
					<View className="flex-row justify-between items-start mb-2">
						<Text className="text-sm text-gray-500 font-medium">{prompt.category}</Text>
						<View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
							<Text className="text-gray-500 text-xs">⋯</Text>
						</View>
					</View>
					<Text className="text-base font-semibold mb-3">{prompt.question}</Text>
					<Text
						className="text-gray-600 text-sm leading-5"
						numberOfLines={3}
						ellipsizeMode="tail"
					>
						{userPrompt.answer || "No answer yet - tap to add your thoughts..."}
					</Text>
					{!userPrompt.answer && (
						<View className="mt-2">
							<Text className="text-orange-600 text-xs font-medium">Tap to add answer</Text>
						</View>
					)}
				</Pressable>
			);
		}

		return (
			<Pressable
				key={index}
				onPress={() => openPromptModal(index)}
				className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 items-center justify-center min-h-[120]"
				accessibilityRole="button"
				accessibilityLabel={`Add prompt ${index + 1}`}
			>
				<Text className="text-gray-400 text-4xl mb-2">+</Text>
				<Text className="text-gray-500 text-center font-medium">Add a prompt</Text>
				<Text className="text-gray-400 text-center text-sm mt-1">Tap to choose</Text>
			</Pressable>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 120 }}>
				<View className="mb-6">
					<H1>Add some conversation starters</H1>
					<Muted className="mt-2">
						Choose up to 3 prompts that will help others get to know you better
					</Muted>
				</View>

				<View className="space-y-4">
					{Array.from({ length: MAX_PROMPTS }, (_, index) => renderPromptArea(index))}
				</View>

				{userPrompts.length > 0 && (
					<View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
						<Text className="text-blue-800 text-sm">
							💡 Tip: Add personal, specific answers to make your profile stand out!
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Footer */}
			<View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200">
				<View className="flex-row items-center justify-between mb-3">
					<Text className="text-gray-600">
						Prompts: <Text className="font-semibold">{userPrompts.length}</Text> / {MAX_PROMPTS}
					</Text>
					{userPrompts.length === 0 && (
						<Text className="text-gray-500">Add at least 1 prompt</Text>
					)}
				</View>

				<Button
					onPress={onContinue}
					disabled={!canContinue}
					className="w-full"
				>
					{isSubmitting ? "Saving..." : "Continue"}
				</Button>
			</View>

			{/* Combined Modal for Prompt Selection and Answer Input */}
			<Modal
				visible={isModalVisible}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={closePromptModal}
			>
				<SafeAreaView className="flex-1 bg-background">
					<View className="flex-1 p-4">
						{/* Header */}
						<View className="flex-row justify-between items-center mb-6">
							<Text className="text-lg font-semibold">
								{isAnswerMode ? "Your Answer" : "Choose a prompt"}
							</Text>
							<Pressable onPress={closePromptModal} className="p-2">
								<Text className="text-gray-500 text-lg">✕</Text>
							</Pressable>
						</View>

						{/* Content - Show either prompt selection or answer input */}
						{!isAnswerMode ? (
							// Prompt Selection Mode
							<ScrollView className="flex-1">
								{prompts.map((prompt) => {
									const isSelected = userPrompts.some(up => up.promptId === prompt.id);
									return (
										<Pressable
											key={prompt.id}
											onPress={() => selectPrompt(prompt)}
											className={`p-4 border-b border-gray-100 ${
												isSelected ? "bg-blue-50" : ""
											}`}
											accessibilityRole="button"
											accessibilityLabel={`Select prompt: ${prompt.question}`}
										>
											<View className="flex-row justify-between items-start">
												<View className="flex-1">
													<Text className="text-xs text-gray-500 font-medium mb-1">
														{prompt.category}
													</Text>
													<Text className="text-base font-medium">{prompt.question}</Text>
												</View>
												{isSelected && (
													<Text className="text-blue-600 text-sm font-medium ml-2">
														✓ Selected
													</Text>
												)}
											</View>
										</Pressable>
									);
								})}
							</ScrollView>
						) : (
							// Answer Input Mode
							<View className="flex-1">
								{editingPromptIndex !== null && (
									<View className="mb-4">
										<Text className="text-sm text-gray-500 font-medium mb-2">
											{prompts.find(p => p.id === userPrompts.find(up => up.order === editingPromptIndex)?.promptId)?.category}
										</Text>
										<Text className="text-base font-medium mb-4">
											{prompts.find(p => p.id === userPrompts.find(up => up.order === editingPromptIndex)?.promptId)?.question}
										</Text>
										
										<TextInput
											value={editingAnswer}
											onChangeText={setEditingAnswer}
											placeholder="Share your thoughts..."
											multiline
											numberOfLines={6}
											className="border border-gray-300 rounded-lg p-3 text-base"
											textAlignVertical="top"
											autoFocus
										/>
									</View>
								)}

								<View className="mt-auto">
									<Button
										onPress={saveAnswer}
										disabled={!editingAnswer.trim()}
										className="w-full mb-3"
									>
										Save Answer
									</Button>
									<Button
										onPress={handleBackToPrompts}
										variant="outline"
										className="w-full"
									>
										Back to Prompts
									</Button>
								</View>
							</View>
						)}
					</View>
				</SafeAreaView>
			</Modal>


		</SafeAreaView>
	);
}
