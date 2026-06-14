import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../assets/logo.png";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#f0f7ff" },
  card: { padding: 20, backgroundColor: "#ffffff", borderRadius: 10 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: { width: 50, height: 50, marginRight: 10 },
  brandName: { fontSize: 24, color: "#1e3a5f", fontWeight: "bold" },
  header: {
    fontSize: 22,
    color: "#1e3a5f",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 12,
    color: "#2dd4bf",
    marginTop: 15,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  text: { fontSize: 10, color: "#475569", marginBottom: 2 },
  total: { fontSize: 14, color: "#1e3a5f", marginTop: 20, fontWeight: "bold" },
});

export const InvoicePDF = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.card}>
        {/* BRAND HEADER */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src={logo} />
          <Text style={styles.brandName}>Smart Health Care</Text>
        </View>

        <Text style={styles.header}>Medical Invoice</Text>

        <Text style={styles.sectionTitle}>Patient Details</Text>
        <Text style={styles.text}>Name: {data.patient_id?.name}</Text>
        <Text style={styles.text}>Contact: {data.patient_id?.contact}</Text>

        <Text style={styles.sectionTitle}>Doctor Details</Text>
        <Text style={styles.text}>Dr. {data.doctor_id?.name}</Text>
        <Text style={styles.text}>Fee: ₹{data.doctor_id?.fee}</Text>

        <Text style={styles.total}>Total Amount: ₹{data.totalAmount}</Text>
      </View>
    </Page>
  </Document>
);
