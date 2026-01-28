import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";


const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#ADB5BD",
  SENT: "#4D96FF",
  SIGNED: "#2ECC71",
  REJECTED: "#E74C3C",
  EXPIRED: "#F39C12",
};

export default function QuotationDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<any>>();
  const { id } = route.params as any;

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    try {
      const res = await api.get(`/quotations/${id}`);
      setQuote(res.data);
    } catch {
      Alert.alert("Error", "Failed to load quotation");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Quotation",
      "Are you sure you want to permanently delete this quotation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteQuote,
        },
      ]
    );
  };

const deleteQuote = async () => {
  try {
    setDeleting(true);

    await api.delete(`/quotations/${id}`);

    Alert.alert("Deleted", "Quotation removed successfully", [
      {
        text: "OK",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "QuotationsList" }],
          });
        },
      },
    ]);
  } catch (e) {
    Alert.alert("Error", "Failed to delete quotation");
    setDeleting(false);
  }
};

const sendQuote = async () => {
  try {
    Alert.alert(
      "Send Quotation",
      "This will send the quotation to the customer.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            await api.post(`/quotations/${id}/send`);

            Alert.alert(
              "Sent",
              "Quotation sent to customer successfully"
            );

            loadQuote(); 
          },
        },
      ]
    );
  } catch (e: any) {
    Alert.alert(
      "Error",
      e?.response?.data?.message ||
        "Failed to send quotation"
    );
  }
};



  const createJob = async () => {
    await api.post(`/jobs/from-quotation/${id}`);
    Alert.alert("Success", "Job created");
    navigation.navigate("Calendar");
  };

  const renderActions = () => {
  switch (quote.status) {
    case "DRAFT":
      return (
        <ActionRow>
          <ActionBtn
            text="Edit"
            onPress={() =>
              navigation.navigate("CreateQuote", { quote })
            }
          />
          <ActionBtn
            text="Send"
            primary
            onPress={sendQuote}
          />
        </ActionRow>
      );

    case "SENT":
      return (
        <ActionRow>
          <ActionBtn
            text="Reminder"
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Reminder feature will be available in Pro plan"
              )
            }
          />
          <ActionBtn
            text="Edit"
            onPress={() =>
              navigation.navigate("CreateQuote", { quote })
            }
          />
          <ActionBtn
            text="Duplicate"
            onPress={() =>
              Alert.alert("Duplicate", "Duplicate logic coming next")
            }
          />
        </ActionRow>
      );

    case "SIGNED":
      return (
        <ActionRow>
          <ActionBtn
            text="Create Job"
            primary
            onPress={createJob}
          />
          <ActionBtn
            text="Bill"
            onPress={() =>
              Alert.alert("Billing", "Invoice module coming next")
            }
          />
        </ActionRow>
      );

    case "REJECTED":
      return (
        <ActionRow>
          <ActionBtn
            text="Archive"
            onPress={() =>
              Alert.alert("Archive", "Archive logic coming next")
            }
          />
          <ActionBtn
            text="Duplicate"
            onPress={() =>
              Alert.alert("Duplicate", "Duplicate logic coming next")
            }
          />
        </ActionRow>
      );

    case "EXPIRED":
      return (
        <ActionRow>
          <ActionBtn
            text="Renew"
            primary
            onPress={() =>
              Alert.alert("Renew", "Renew logic coming next")
            }
          />
          <ActionBtn
            text="Archive"
            onPress={() =>
              Alert.alert("Archive", "Archive logic coming next")
            }
          />
        </ActionRow>
      );

    default:
      return null;
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.appBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#fff"
          />
        </Pressable>

        <Text style={styles.appBarTitle}>
          Quote #{quote.quoteNumber}
        </Text>
{quote.status === "DRAFT" && (
  <Pressable onPress={confirmDelete}>
    <MaterialCommunityIcons
      name="delete-outline"
      size={24}
      color="#fff"
    />
  </Pressable>
)}

      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[quote.status] },
            ]}
          >
            <Text style={styles.statusText}>
              {quote.status}
            </Text>
          </View>
        </View>

        <Section title="Customer">
          <Info label="Name" value={quote.customer?.fullName} />
          <Info label="Phone" value={quote.customer?.phone} />
          <Info label="Email" value={quote.customer?.email} />
        </Section>

        <Section title="Move Details">
          <Info label="Service" value={quote.serviceType} />
          <Info label="Workers" value={quote.workers} />
          <Info label="Trucks" value={quote.trucks} />
          <Info
            label="Date"
            value={
              quote.movingDate
                ? new Date(quote.movingDate).toDateString()
                : "—"
            }
          />
        </Section>

        <Section title="Pricing">
          <Info label="Method" value={quote.pricingMethod} />

          {quote.pricingMethod === "HOURLY" ? (
            <>
              <Info
                label="Hourly Rate"
                value={`$${quote.hourlyRate}`}
              />
              <Info
                label="Hours"
                value={quote.estimatedHours}
              />
            </>
          ) : (
            <Info
              label="Fixed Price"
              value={`$${quote.fixedPrice}`}
            />
          )}

          <Text style={styles.total}>
            Total: ${quote.total}
          </Text>
        </Section>

        {quote.notes ? (
          <Section title="Special Terms">
            <Text style={styles.notes}>{quote.notes}</Text>
          </Section>
        ) : null}

        <View style={{ marginTop: 20 }}>
          {renderActions()}
        </View>
      </ScrollView>
    </View>
  );
}


const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Info = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? "—"}</Text>
  </View>
);

const ActionRow = ({ children }: any) => (
  <View style={styles.actionRow}>{children}</View>
);

const ActionBtn = ({ text, onPress, primary }: any) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.actionBtn,
      primary && { backgroundColor: COLORS.primary },
    ]}
  >
    <Text
      style={[
        styles.actionText,
        primary && { color: "#fff" },
      ]}
    >
      {text}
    </Text>
  </Pressable>
);


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F8FA" },

  appBar: {
    height: 56,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  appBarTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  container: {
    padding: 20,
    backgroundColor: "#F7F8FA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  statusRow: {
    alignItems: "flex-end",
    marginBottom: 10,
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontWeight: "800",
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  infoLabel: { color: "#777" },
  infoValue: { fontWeight: "600" },

  total: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  notes: { color: "#444", lineHeight: 20 },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  actionText: {
    fontWeight: "800",
    color: COLORS.primary,
  },
});


