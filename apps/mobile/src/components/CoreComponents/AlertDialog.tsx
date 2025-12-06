import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

type AlertDialogProps = {
	trigger: React.ReactNode;
	visible?: boolean;
	onClose?: () => void;
	onConfirm: (_: any) => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
};

const AlertDialog: React.FC<AlertDialogProps> = ({
	visible = true,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
}) => {
	return (
		<Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
			<View className="flex-1 items-center justify-center bg-gray-900 bg-opacity-50">
				<View className="w-4/5 rounded-lg bg-white p-6">
					<Text className="mb-4 font-bold text-xl">{title}</Text>
					<Text className="mb-4 text-center text-base">{description}</Text>
					<View className="flex-row justify-between">
						<TouchableOpacity
							onPress={onClose}
							className="mr-2 flex-1 rounded-lg bg-gray-200 p-3">
							<Text className="text-center text-gray-800">{cancelText}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={onConfirm}
							className="flex-1 rounded-lg bg-blue-600 p-3">
							<Text className="text-center text-white">{confirmText}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default AlertDialog;
