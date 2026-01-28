import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";

export default function PublicQuotationScreen({ route }: any) {
  const { token } = route.params;
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    api
      .get(`/public/quotation/${token}`)
      .then(res => setQuote(res.data))
      .catch(() =>
        Alert.alert("Error", "Quotation expired or invalid")
      );
  }, [token]);

  if (!quote) return <Text>Loading...</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>
        Quote #{quote.quoteNumber}
      </Text>

      <Text>Prepared for {quote.customer.fullName}</Text>

      <Text style={{ marginTop: 16, fontWeight: "700" }}>
        Move Itinerary
      </Text>
      <Text>{quote.pickupAddress}</Text>
      <Text>{quote.dropoffAddress}</Text>

      <Text style={{ marginTop: 16, fontWeight: "700" }}>
        Estimated Total
      </Text>
      <Text style={{ fontSize: 22 }}>
        ${quote.total}
      </Text>

      <Pressable
        style={{
          marginTop: 30,
          backgroundColor: "#E2B17E",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "800" }}>
          Tap to Sign Quote
        </Text>
      </Pressable>
    </ScrollView>
  );
}
