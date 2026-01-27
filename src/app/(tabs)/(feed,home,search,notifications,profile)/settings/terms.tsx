import { WebWrapper } from "@/components/WebWrapper";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";

function RouteComponent() {
	return (
		<ScrollView>
			<WebWrapper>
				<View className="gap-8 p-4">
					<Stack.Screen
						options={{
							title: "Terms of Use",
						}}
					/>
					<Text variant="h1">Terms and Conditions of Use</Text>
					<Text>
						By accessing and using recordscratch.app and any RecordScratch services, you
						acknowledge that you have read, understood, and agree to comply with the
						following terms and conditions. If you do not agree with these terms, please
						refrain from using our service.
					</Text>

					<Text variant="h3">Use</Text>
					<Text>
						You may only use RecordScratch in accordance with these Terms. All rights
						not expressly granted to you in these Terms are reserved by us.
					</Text>

					<Text variant="h3">User Accounts</Text>
					<Text>
						You will be responsible for all activity that occurs as a result of your use
						of RecordScratch. We disclaim any and all liability (including for
						negligence) for the content, opinions, statements or other information
						posted to, or use of, RecordScratch by its users.
					</Text>

					<Text variant="h3">Community Policy</Text>
					<Text>
						You must be courteous and respectful of others’ opinions, and you must not
						post unwelcome, aggressive, suggestive or otherwise inappropriate remarks
						directed at another member of RecordScratch.
					</Text>

					<Text variant="h3">No Malicious Use</Text>
					<Text>
						You agree to access RecordScratch through the interface we provide. You must
						not use RecordScratch for any malicious means, or abuse, harass, threaten,
						intimidate or impersonate any other user of the Service or any RecordScratch
						employee.
					</Text>

					<Text variant="h3">No Illegal Use</Text>
					<Text>
						You must not use RecordScratch for any unlawful purpose, or post any
						information that is in breach of any confidentiality obligation, copyright,
						trade mark or other intellectual property or proprietary rights of any
						person.
					</Text>

					<Text variant="h3">Removal of Content</Text>
					<Text>
						We reserve the right to remove any content posted to RecordScratch that we
						consider (in our absolute discretion) to be offensive, objectionable,
						unlawful, explicit, graphic or otherwise in breach of these Terms.
					</Text>

					<Text variant="h3">Intellectual Property</Text>
					<Text>
						You agree that we own all of the intellectual property rights on
						RecordScratch. Any content you post to RecordScratch should be original and
						must not infringe anyone else's intellectual property rights.
					</Text>

					<Text variant="h3">Prohibited Actions</Text>
					<Text>
						Users may not steal, copy, reproduce, or otherwise unauthorizedly access any
						belonging to any users or RecordScratch.
					</Text>

					<Text variant="h3">Amendments</Text>
					<Text>
						We reserve the right to amend these Terms at any time and may add new
						features that will be subject to these Terms. Termination or Suspension of
						Accounts
					</Text>
					<Text>
						If you do not abide by these Terms, we may suspend or terminate your
						account.
					</Text>

					<Text variant="h3">Governing Law and Jurisdiction</Text>
					<Text>
						All users of the Service agree that the laws of Canada shall govern and
						apply to these Terms and each user’s use of the Service, and all users
						submit to the exclusive jurisdiction of the Canadian courts for any matter
						or dispute arising in relation to these Terms.
					</Text>
				</View>
			</WebWrapper>
		</ScrollView>
	);
}

export default RouteComponent;
