import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../../services/api";
import { COLORS } from "../../../../theme/colors";


type Props = {
  quoteId: string | null;
  data: any;
  onNext: (data?: any) => void;
  onBack?: () => void;
};


const DEFAULT_TERMS = `TERMS & CONDITIONS

1. SERVICES
The moving company (“We”) agrees to provide moving services as described in this quotation. Services are based on the information provided by the customer (“You”).

2. PRICING
All prices are estimates and may change if job conditions differ (extra stairs, long carries, additional items, etc.).

3. LIABILITY
We are responsible for loss or damage caused by our negligence. We are not responsible for items packed by the customer (PBO).

4. CUSTOMER RESPONSIBILITIES
You must ensure access to elevators, parking permits, and accurate inventory details.

5. PAYMENT
Full payment is due upon completion of the move unless otherwise agreed in writing.

These terms will appear on the final quotation PDF.`;


export default function Step7Terms({
  quoteId,
  data,
  onNext,
  onBack,
}: Props) {
  const CURRENT_STEP = 7;

  const [terms, setTerms] = useState(
    data.termsText || DEFAULT_TERMS
  );
  const [internalNotes, setInternalNotes] = useState(
    data.internalNotes || ""
  );
  const [validityDays, setValidityDays] = useState<number>(
    data.validityDays || 30
  );


 const handleNext = async () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + validityDays);

  const payload = {
    termsText: terms,
    internalNotes,
    validityDays,
    expiresAt,
  
  };

  const res = await api.patch(`/quotations/${quoteId}`, payload);
  const fullQuote = res.data;
onNext(fullQuote);
};


  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>New Quotation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepsContainer}>
        {Array.from({ length: 8 }).map((_, i) => {
          const step = i + 1;
          const filled = step <= CURRENT_STEP;
          return (
            <View key={step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  filled && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    filled && styles.stepNumberActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
              {step < 8 && (
                <View
                  style={[
                    styles.stepDivider,
                    filled && styles.stepDividerActive,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Terms & Conditions
          </Text>

          <TextInput
            value={terms}
            onChangeText={setTerms}
            multiline
            style={styles.termsBox}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.internalHeader}>
            <Text style={styles.sectionTitle}>
              Internal Notes
            </Text>

            <View style={styles.hiddenBadge}>
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={14}
                color="#C92A2A"
              />
              <Text style={styles.hiddenText}>
                Hidden from customer
              </Text>
            </View>
          </View>

          <TextInput
            placeholder="Private notes for operations team (not visible to customer)…"
            placeholderTextColor="#9CA3AF"
            value={internalNotes}
            onChangeText={setInternalNotes}
            multiline
            style={styles.textArea}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Quotation Validity
          </Text>

          <View style={styles.choiceRow}>
            {[15, 30, 45].map((d) => (
              <Pressable
                key={d}
                style={[
                  styles.validityBtn,
                  validityDays === d &&
                    styles.validityActive,
                ]}
                onPress={() => setValidityDays(d)}
              >
                <Text
                  style={[
                    styles.validityText,
                    validityDays === d && {
                      color: "#fff",
                    },
                  ]}
                >
                  {d} Days
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helperText}>
            Customer must approve the quotation before
            this period expires.
          </Text>
        </View>
      </ScrollView>

      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F8FA" },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },

  stepsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  stepNumberActive: { color: "#fff" },
  stepDivider: { width: 18, height: 2, backgroundColor: "#E5E7EB" },
  stepDividerActive: { backgroundColor: COLORS.primary },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },

  sectionTitle: { fontWeight: "800", marginBottom: 12 },

  termsBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    height: 200,
    fontSize: 12,
    lineHeight: 18,
  },

  internalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  hiddenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  hiddenText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C92A2A",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    height: 90,
  },

  choiceRow: {
    flexDirection: "row",
    gap: 10,
  },

  validityBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  validityActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  validityText: {
    fontWeight: "800",
    color: "#555",
  },

  helperText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 8,
  },

  nextBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  nextText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
