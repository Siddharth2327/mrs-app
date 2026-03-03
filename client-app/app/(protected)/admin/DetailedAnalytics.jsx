import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Reuse your existing components (copy from AnalyticsSection)
const AnimatedNumber = ({ value, prefix = '', suffix = '', style }) => {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    animVal.setValue(0);
    Animated.timing(animVal, {
      toValue: value,
      duration: 900,
      useNativeDriver: false,
    }).start();
    const listener = animVal.addListener(({ value: v }) => {
      setDisplayed(Math.round(v));
    });
    return () => animVal.removeListener(listener);
  }, [value]);

  return (
    <Text style={style}>
      {prefix}{displayed.toLocaleString()}{suffix}
    </Text>
  );
};

const MiniBarChart = ({ data, color = '#1E3A5F', height = 56 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const anim = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      60,
      anim.map((a, i) =>
        Animated.spring(a, {
          toValue: data[i].value / max,
          tension: 60,
          friction: 8,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [data]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 4 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', height }}>
          <Animated.View
            style={{
              width: '100%',
              borderRadius: 3,
              backgroundColor: color,
              opacity: anim[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              height: anim[i].interpolate({
                inputRange: [0, 1],
                outputRange: [3, height],
              }),
            }}
          />
          {d.label ? (
            <Text style={styles.barLabel}>{d.label}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

const DetailedAnalytics = () => {
  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    totalOrders: 0,
    enterpriseOrders: 0,
    transportOrders: 0,
    avgOrderValue: 0,
    revenueByDay: [],
    revenueByMonth: [],
    topMaterials: [],
    topCustomers: [],
    statusBreakdown: [],
    hourlyRevenue: [],
    conversionRate: 0,
    repeatCustomerRate: 0,
    avgFulfillmentTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDetailedAnalytics = async () => {
    try {
      const ordersSnapshot = await firestore().collection('orders').get();
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Basic metrics (same as main page)
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenue = orders
        .filter(o => o.createdAt?.toDate?.() >= today)
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthRevenue = orders
        .filter(o => o.createdAt?.toDate?.() >= monthStart)
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Advanced metrics
      const enterpriseOrders = orders.filter(o => o.type === 'enterprise').length;
      const transportOrders = orders.filter(o => o.type === 'transport').length;
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // 7-day revenue
      const revenueByDay = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);
        const rev = orders
          .filter(o => {
            const od = o.createdAt?.toDate?.();
            return od && od >= d && od < nextD;
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        return { value: rev, label: days[d.getDay()] };
      });

      // Last 6 months revenue
      const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setDate(1);
        const nextMonth = new Date(d);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const rev = orders
          .filter(o => {
            const od = o.createdAt?.toDate?.();
            return od && od >= d && od < nextMonth;
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return { value: rev, label: d.toLocaleDateString('en-US', { month: 'short' }) };
      }).reverse();

      // Top 5 materials
      const materialSales = {};
      orders.filter(o => o.type === 'enterprise' && o.items).forEach(order => {
        order.items.forEach(item => {
          if (!materialSales[item.name]) {
            materialSales[item.name] = { name: item.name, totalQty: 0, totalRevenue: 0, orders: 0 };
          }
          materialSales[item.name].totalQty += item.quantity || 0;
          materialSales[item.name].totalRevenue += item.subtotal || 0;
          materialSales[item.name].orders += 1;
        });
      });
      const topMaterials = Object.values(materialSales)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);

      // Top 5 customers
      const customerSales = {};
      orders.forEach(order => {
        const customerId = order.customerId || order.customerEmail;
        if (!customerSales[customerId]) {
          customerSales[customerId] = { 
            id: customerId, 
            orders: 0, 
            revenue: 0,
            name: order.customerName || 'Customer'
          };
        }
        customerSales[customerId].orders += 1;
        customerSales[customerId].revenue += order.totalAmount || 0;
      });
      const topCustomers = Object.values(customerSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Status breakdown
      const statusCounts = {
        placed: orders.filter(o => o.status === 'placed').length,
        packed: orders.filter(o => o.status === 'packed').length,
        dispatched: orders.filter(o => o.status === 'dispatched').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      };
      const totalOrdersWithStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0);

      // Hourly revenue (today)
      const hourlyRevenue = Array.from({ length: 24 }, (_, i) => {
        const startHour = new Date(today);
        startHour.setHours(i, 0, 0, 0);
        const endHour = new Date(startHour);
        endHour.setHours(i + 1);
        const rev = orders
          .filter(o => {
            const od = o.createdAt?.toDate?.();
            return od && od >= startHour && od < endHour;
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return { value: rev, label: `${i}:00` };
      });

      // Conversion & repeat rates
      const uniqueCustomers = new Set(orders.map(o => o.customerId || o.customerEmail));
      const repeatCustomers = new Set();
      orders.forEach(o => {
        const customerId = o.customerId || o.customerEmail;
        const customerOrders = orders.filter(order => 
          (order.customerId || order.customerEmail) === customerId
        );
        if (customerOrders.length > 1) repeatCustomers.add(customerId);
      });
      const repeatCustomerRate = uniqueCustomers.size > 0 
        ? (repeatCustomers.size / uniqueCustomers.size) * 100 
        : 0;

      setAnalytics({
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        monthRevenue: Math.round(monthRevenue),
        totalOrders: orders.length,
        enterpriseOrders,
        transportOrders,
        avgOrderValue: Math.round(avgOrderValue),
        revenueByDay,
        revenueByMonth,
        topMaterials,
        topCustomers,
        statusBreakdown: Object.entries(statusCounts).map(([key, value]) => ({
          label: key.toUpperCase(),
          value,
          color: key === 'delivered' ? '#10B981' : 
                 key === 'dispatched' ? '#8B5CF6' : 
                 key === 'packed' ? '#F59E0B' : 
                 key === 'cancelled' ? '#EF4444' : '#3B82F6'
        })),
        hourlyRevenue,
        conversionRate: 85.2, // Placeholder
        repeatCustomerRate: Math.round(repeatCustomerRate),
        avgFulfillmentTime: 2.4, // Placeholder in days
      });

    } catch (error) {
      console.error('Error loading detailed analytics:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDetailedAnalytics(); }, []);
  const onRefresh = () => { setRefreshing(true); loadDetailedAnalytics(); };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text style={styles.loadingText}>Loading detailed analytics…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A5F']}
            tintColor="#1E3A5F"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Overview</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {[
            { label: 'Total Revenue', value: analytics.totalRevenue, prefix: '₹', color: '#1E3A5F' },
            { label: 'Total Orders', value: analytics.totalOrders, suffix: '', color: '#3B82F6' },
            { label: 'Avg Order Value', value: analytics.avgOrderValue, prefix: '₹', color: '#10B981' },
            { label: 'Repeat Customers', value: analytics.repeatCustomerRate, suffix: '%', color: '#8B5CF6' },
          ].map((kpi, i) => (
            <View key={kpi.label} style={[styles.kpiCard, { borderLeftColor: kpi.color }]}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <AnimatedNumber 
                value={kpi.value} 
                prefix={kpi.prefix} 
                suffix={kpi.suffix}
                style={styles.kpiValue}
              />
            </View>
          ))}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {['overview', 'revenue', 'orders', 'materials'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <View style={styles.chartCard}>
                <SectionHeader title="Today Hourly Revenue" />
                <MiniBarChart data={analytics.hourlyRevenue.slice(8, 20)} color="#1E3A5F" height={80} />
              </View>

              <View style={styles.chartCard}>
                <SectionHeader title="Order Status Breakdown" />
                {/* Status donut would go here */}
                <View style={styles.statusGrid}>
                  {analytics.statusBreakdown.map((status, i) => (
                    <View key={i} style={styles.statusItem}>
                      <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                      <Text style={styles.statusLabel}>{status.label}</Text>
                      <Text style={styles.statusValue}>{status.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <>
              <View style={styles.chartCard}>
                <SectionHeader title="7-Day Revenue Trend" />
                <MiniBarChart data={analytics.revenueByDay} color="#1E3A5F" height={72} />
              </View>

              <View style={styles.chartCard}>
                <SectionHeader title="6-Month Revenue" subtitle="Monthly performance" />
                <MiniBarChart data={analytics.revenueByMonth} color="#3B82F6" height={72} />
              </View>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              <View style={styles.chartCard}>
                <SectionHeader title="Order Types" />
                <View style={styles.typeBreakdown}>
                  <View style={styles.typeItem}>
                    <Text style={styles.typeValue}>{analytics.enterpriseOrders}</Text>
                    <Text style={styles.typeLabel}>Enterprise</Text>
                  </View>
                  <View style={styles.typeItem}>
                    <Text style={styles.typeValue}>{analytics.transportOrders}</Text>
                    <Text style={styles.typeLabel}>Transport</Text>
                  </View>
                </View>
              </View>

              <View style={styles.chartCard}>
                <SectionHeader title="Top 5 Customers" />
                {analytics.topCustomers.map((customer, i) => (
                  <View key={i} style={styles.customerRow}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <View style={styles.customerStats}>
                      <Text style={styles.customerOrders}>{customer.orders} orders</Text>
                      <Text style={styles.customerRevenue}>₹{Math.round(customer.revenue)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <>
              <View style={styles.chartCard}>
                <SectionHeader title="Top 5 Materials" />
                {analytics.topMaterials.map((material, i) => (
                  <View key={i} style={styles.materialRow}>
                    <Text style={styles.materialName}>{material.name}</Text>
                    <View style={styles.materialStats}>
                      <Text style={styles.materialQty}>{material.totalQty} units</Text>
                      <Text style={styles.materialRevenue}>₹{Math.round(material.totalRevenue)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <Text style={styles.footer}>
          Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Pull to refresh
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollView: { flex: 1 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#94A3B8' },

  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: { padding: 8 },
  backText: { fontSize: 13, color: '#1E3A5F', fontWeight: '600' },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1E293B', 
    flex: 1, 
    textAlign: 'center',
    marginLeft: -30,
  },

  // KPI Grid
  kpiGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    padding: 16,
    paddingBottom: 8,
  },
  kpiCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 48) / 2 - 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiLabel: { 
    fontSize: 10, 
    color: '#94A3B8', 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1E293B',
    letterSpacing: -0.5,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1E3A5F',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  // Content
  tabContent: { paddingBottom: 24 },
  
  // Section header (same as main page)
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, marginTop: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', letterSpacing: 0.2 },
  sectionSubtitle: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },

  // Chart card
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  barLabel: { fontSize: 8, color: '#94A3B8', marginTop: 4, fontWeight: '600' },

  // Status Grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 100,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Type breakdown
  typeBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  typeItem: {
    alignItems: 'center',
  },
  typeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E3A5F',
  },
  typeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Customer & Material rows
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  materialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  customerStats: {
    alignItems: 'flex-end',
  },
  materialStats: {
    alignItems: 'flex-end',
  },
  customerOrders: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  customerRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A5F',
    marginTop: 2,
  },
  materialQty: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  materialRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A5F',
    marginTop: 2,
  },

  footer: { 
    textAlign: 'center', 
    fontSize: 10, 
    color: '#CBD5E1', 
    fontWeight: '500', 
    paddingBottom: 32, 
    paddingTop: 8,
    paddingHorizontal: 16,
  },
});

export default DetailedAnalytics;
