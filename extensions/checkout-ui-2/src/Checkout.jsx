import {
  reactExtension,
  Checkbox,
  useApplyAttributeChange,
  useInstructions,
  useApplyDiscountCodeChange,
  View,
  Button,
  BlockSpacer,
  useEmail,
  Text,
  BlockStack,
} from "@shopify/ui-extensions-react/checkout";
import axios from "axios";
import { useState } from "react";
// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.reductions.render-after",
  () => <Extension />
);

function Extension() {
  const applyAttributeChange = useApplyAttributeChange();
  const instructions = useInstructions();
  const applyDiscountCodeChange = useApplyDiscountCodeChange();
  const userEmail = useEmail();
  const [discountMessage, setDiscountMessage] = useState("");
  const [loader, setLoader] = useState(false);

  const handleAddDiscount = async (code) => {
    const result = await applyDiscountCodeChange({
      type: "addDiscountCode",
      code: code, // Replace with your discount code
    });

    if (result.type === "success") {
      console.log("Discount applied successfully");
      // setDiscountMessage
    } else {
      setDiscountMessage(result.message);
      console.error("Failed to apply discount", result.message);
    }
  };

  const handlePostOrderDiscount = async () => {
    try {
      setLoader(true);
      const apiUrl = `https://multi-store-employee-discount-app.vercel.app/api/discount`;

      const payload = { employeeEmail: userEmail, employeeAssociation: "store-for-customer-account-test.myshopify.com" };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "api-key": `anb*3kW`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Convert the payload to JSON
      });

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON from the response
      console.log("is order discount created", data);
      // setDiscountCode(data.data.discount_code.code);
      if (!data.status) {
        setDiscountMessage(data.message);
      } else {
        await handleAddDiscount(data.data.discount_code.code);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.error("Error order discount create", error);
    }
  };

  // 2. Render a UI
  return (
    <View layout="fill">
      {userEmail !== undefined && (
        <BlockStack>
          <Button
            loading={loader}
            width="100%"
            onPress={handlePostOrderDiscount}
          >
            Apply Employee Discount
          </Button>
          <Text appearance="critical">{discountMessage}</Text>
        </BlockStack>
      )}
    </View>
  );

  async function onCheckboxChange(isChecked) {
    // 3. Check if the API is available
    if (!instructions.attributes.canUpdateAttributes) {
      console.error("Attributes cannot be updated in this checkout");
      return;
    }
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
}
