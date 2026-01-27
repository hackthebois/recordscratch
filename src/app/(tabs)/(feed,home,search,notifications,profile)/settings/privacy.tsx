import { Page } from "@/components/Page";
import { WebWrapper } from "@/components/WebWrapper";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { ScrollView, View } from "react-native";

function RouteComponent() {
	return (
		<Page title="Privacy Policy">
			<ScrollView>
				<WebWrapper>
					<View className="gap-8 p-4">
						<Text variant="h1">Privacy Policy</Text>
						<Text>
							By accessing and using recordscratch.app and any
							RecordScratch services, you acknowledge that you
							have read, understood, and agree to comply with the
							following privacy policy. If you do not agree with
							this policy, please refrain from using our service.
						</Text>

						<Text variant="h3">Information We Collect</Text>
						<Text>
							We only collect personal information that is
							voluntarily provided by you. We collect the
							following information:
						</Text>
						<Text>• Email address</Text>
						<Text>
							• User generated content (e.g., comments, ratings,
							reviews, profile, etc.)
						</Text>
						<Text>
							• Usage data (e.g., pages visited, number of
							ratings)
						</Text>

						<Text variant="h3">Use of Your Information</Text>
						<Text>
							The information we collect is used for the following
							purposes:
						</Text>
						<Text>• To provide and maintain our services</Text>
						<Text>
							• To notify you about changes to our services
						</Text>
						<Text>
							• To allow you to participate in interactive
							features of our services
						</Text>
						<Text>• To provide customer support</Text>
						<Text>
							• To gather analysis or valuable information so that
							we can improve our services
						</Text>
						<Text>• To monitor the usage of our services</Text>

						<Text variant="h3">Disclosure of Your Information</Text>
						<Text>
							We may disclose your personal information in certain
							situations, such as:
						</Text>
						<Text>• To comply with legal obligations</Text>
						<Text>
							• To protect and defend our rights or property
						</Text>
						<Text>
							• To prevent or investigate possible wrongdoing in
							connection with our services
						</Text>
						<Text>
							• To protect the personal safety of users of our
							services or the public
						</Text>

						<Text variant="h3">Security of Your Information</Text>
						<Text>
							We take the security of your information seriously
							and use appropriate technical and organizational
							measures to protect it. However, please be aware
							that no method of transmission over the internet or
							electronic storage is 100% secure, and we cannot
							guarantee the absolute security of your information.
						</Text>

						<Text variant="h3">Changes to This Privacy Policy</Text>
						<Text>
							We may update our Privacy Policy from time to time.
							We will notify you of any changes by posting the new
							Privacy Policy on this page. You are advised to
							review this Privacy Policy periodically for any
							changes.
						</Text>

						<Text variant="h3">Contact Us</Text>
						<Text>
							If you have any questions or concerns about this
							Privacy Policy, please contact us at
							recordscratchapp@gmail.com.
						</Text>
					</View>
				</WebWrapper>
			</ScrollView>
		</Page>
	);
}

export default RouteComponent;
