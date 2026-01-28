import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../../services/api";
import { COLORS } from "../../../theme/colors";
import { useFocusEffect, useRoute } from "@react-navigation/native";
const formatLocalDate = (dateStr?: string) => {
  if (!dateStr) return "—";

  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);

  const date = new Date(y, m - 1, d); 

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};


const FILTERS = [
  { key: "ALL", label: "All", icon: "layers-outline" },
  { key: "DRAFT", label: "Draft", icon: "file-edit-outline" },
  { key: "SENT", label: "Sent", icon: "send-outline" },
  { key: "SIGNED", label: "Signed", icon: "check-circle-outline" },
  { key: "REJECTED", label: "Rejected", icon: "close-circle-outline" },
  { key: "EXPIRED", label: "Expired", icon: "clock-alert-outline" },
];

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; icon: string }
> = {
  DRAFT: { bg: "#F1F3F5", text: "#495057", icon: "file-edit-outline" },
  SENT: { bg: "#E7F1FF", text: "#1C7ED6", icon: "send-outline" },
  SIGNED: { bg: "#E6FCF5", text: "#0CA678", icon: "check-circle-outline" },
  REJECTED: { bg: "#FFF5F5", text: "#E03131", icon: "close-circle-outline" },
  EXPIRED: { bg: "#FFF4E6", text: "#F76707", icon: "clock-alert-outline" },
};

const formatDateSafe = (isoString: string) => {
  const d = new Date(isoString);
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  ).toDateString();
};

export default function QuotationsList({ navigation }: any) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const route = useRoute<any>();


  const loadQuotes = async () => {
    try {
      const res = await api.get("/quotations");
      setQuotes(res.data || []);
    } catch (e) {
      console.log("Failed to load quotations", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadQuotes();
    }, [])
  );

  useEffect(() => {
    if (route.params?.updatedQuote) {
      const updated = route.params.updatedQuote;
      setQuotes((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q))
      );
    }
  }, [route.params?.updatedQuote]);

  const onRefresh = () => {
    setRefreshing(true);
    loadQuotes();
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesFilter =
        activeFilter === "ALL" || q.status === activeFilter;

      const haystack = `${q.quoteNumber} ${
        q.customer?.fullName ?? ""
      } ${q.status}`.toLowerCase();

      const matchesSearch = haystack.includes(
        search.toLowerCase()
      );

      return matchesFilter && matchesSearch;
    });
  }, [quotes, search, activeFilter]);

  const renderItem = ({ item }: any) => {
    const status = STATUS_STYLES[item.status] || STATUS_STYLES.DRAFT;

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          navigation.navigate("QuotationDetails", { id: item.id })
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.quoteNo}>#Q-{item.quoteNumber}</Text>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: status.bg },
            ]}
          >
            <MaterialCommunityIcons
              name={status.icon}
              size={13}
              color={status.text}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.statusText,
                { color: status.text },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.customerName}>
          {item.customer?.fullName ?? "No customer"}
        </Text>

        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={14}
            color="#868E96"
          />
          <Text style={styles.metaText}>
            Move on{" "}
            {item.movingDate
              ? new Date(item.movingDate).toDateString()
              : "—"}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.price}>
              ${Number(item.total || 0).toFixed(2)}
            </Text>
          </View>

        <Text style={styles.createdText}>
  Created {formatLocalDate(item.createdAt)}
</Text>

        </View>
      </Pressable>
    );
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
          />
        </Pressable>
        <Text style={styles.appBarTitle}>Quotations</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBox}>
        <MaterialCommunityIcons
          name="magnify"
          size={18}
          color="#868E96"
        />
        <TextInput
          placeholder="Search by name, ID or status..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#868E96"
        />
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const active = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterPill,
                active && styles.filterActive,
              ]}
            >
              <MaterialCommunityIcons
                name={f.icon}
                size={14}
                color={active ? "#fff" : "#495057"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filteredQuotes.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="file-search-outline"
            size={42}
            color="#ADB5BD"
          />
          <Text style={styles.emptyTitle}>
            No quotations found
          </Text>
          <Text style={styles.emptyText}>
            Try adjusting your search or filters.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredQuotes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7F9" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  appBar: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#212529",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchInput: { flex: 1, marginLeft: 8 },

  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F3F5",
  },
  filterActive: {
    backgroundColor: "#212529",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#495057",
  },
  filterTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  quoteNo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4C6EF5",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: "700" },

  customerName: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#212529",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#868E96",
    marginLeft: 6,
  },

  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  totalLabel: {
    fontSize: 10,
    color: "#868E96",
    fontWeight: "700",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F08C00",
  },

  createdText: {
    fontSize: 11,
    color: "#ADB5BD",
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#495057",
  },
  emptyText: {
    marginTop: 4,
    fontSize: 12,
    color: "#868E96",
    textAlign: "center",
  },
});
