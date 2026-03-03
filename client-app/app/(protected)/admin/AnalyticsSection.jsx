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
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ─── Tiny animated number counter ────────────────────────────────────────────
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

// ─── Mini bar chart (pure RN, no dependencies) ───────────────────────────────
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

// ─── Donut chart (pure RN SVG-free) ─────────────────────────────────────────
// Uses stacked arcs via border tricks — lightweight and native
const DonutSegment = ({ segments, size = 80 }) => {
  // segments: [{ value, color }]
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = size / 2;
  const strokeWidth = size * 0.18;
  const innerRadius = radius - strokeWidth;

  // Render as layered views using conic-gradient-like rotation hack
  // We'll use a simpler approach: stacked bordered circles for visual effect
  let cumulativeDeg = -90;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {segments.map((seg, i) => {
        const deg = (seg.value / total) * 360;
        const startDeg = cumulativeDeg;
        cumulativeDeg += deg;

        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: seg.color,
              opacity: seg.value === 0 ? 0 : 1,
              transform: [{ rotate: `${startDeg}deg` }],
              // Clip half
              overflow: 'hidden',
            }}
          />
        );
      })}
      {/* Center hole */}
      <View
        style={{
          position: 'absolute',
          top: strokeWidth,
          left: strokeWidth,
          width: innerRadius * 2,
          height: innerRadius * 2,
          borderRadius: innerRadius,
          backgroundColor: '#F8FAFC',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B' }}>
          {total}
        </Text>
        <Text style={{ fontSize: 8, color: '#94A3B8', fontWeight: '600' }}>ORDERS</Text>
      </View>
    </View>
  );
};

// ─── Horizontal progress bar ─────────────────────────────────────────────────
const ProgressBar = ({ label, value, max, color, fadeAnim }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = max > 0 ? value / max : 0;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: pct,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [value, max]);

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressMeta}>
        <View style={[styles.progressDot, { backgroundColor: color }]} />
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

// ─── Stat Chip ────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, accent, fadeAnim, index }) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statChip,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
          borderTopColor: accent,
        },
      ]}
    >
      <Text style={[styles.statChipValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statChipLabel}>{label}</Text>
    </Animated.View>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    totalOrders: 0,
    enterpriseOrders: 0,
    transportOrders: 0,
    placedOrders: 0,
    packedOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    lowStockMaterials: 0,
    outOfStockMaterials: 0,
    lowStockVehicles: 0,
    outOfStockVehicles: 0,
    topMaterial: null,
    averageOrderValue: 0,
    revenueByDay: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const heroAnim = useRef(new Animated.Value(0)).current;

  const loadRealAnalytics = async () => {
    try {
      const ordersSnapshot = await firestore().collection('orders').get();
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

      // Last 7 days revenue for bar chart
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

      const enterpriseOrders = orders.filter(o => o.type === 'enterprise').length;
      const transportOrders = orders.filter(o => o.type === 'transport').length;
      const placedOrders = orders.filter(o => o.status === 'placed').length;
      const packedOrders = orders.filter(o => o.status === 'packed').length;
      const dispatchedOrders = orders.filter(o => o.status === 'dispatched').length;
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      const materialSales = {};
      orders.filter(o => o.type === 'enterprise' && o.items).forEach(order => {
        order.items.forEach(item => {
          if (!materialSales[item.name]) {
            materialSales[item.name] = { name: item.name, totalQty: 0, totalRevenue: 0 };
          }
          materialSales[item.name].totalQty += item.quantity || 0;
          materialSales[item.name].totalRevenue += item.subtotal || 0;
        });
      });
      const topMaterial = Object.values(materialSales).sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || null;

      const materialsSnapshot = await firestore()
        .collection('materials')
        .where('isDeleted', '==', false)
        .get();
      const materials = materialsSnapshot.docs.map(d => d.data());
      const lowStockMaterials = materials.filter(m => m.stock > 0 && m.stock <= m.lowStockThreshold).length;
      const outOfStockMaterials = materials.filter(m => m.stock === 0).length;

      const vehiclesSnapshot = await firestore()
        .collection('vehicles')
        .where('isDeleted', '==', false)
        .get();
      const vehicles = vehiclesSnapshot.docs.map(d => d.data());
      const lowStockVehicles = vehicles.filter(v => v.stock > 0 && v.stock <= v.lowStockThreshold).length;
      const outOfStockVehicles = vehicles.filter(v => v.stock === 0).length;

      setAnalytics({
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        monthRevenue: Math.round(monthRevenue),
        totalOrders: orders.length,
        enterpriseOrders,
        transportOrders,
        placedOrders,
        packedOrders,
        dispatchedOrders,
        deliveredOrders,
        lowStockMaterials,
        outOfStockMaterials,
        lowStockVehicles,
        outOfStockVehicles,
        topMaterial,
        averageOrderValue: Math.round(averageOrderValue),
        revenueByDay,
      });

      Animated.spring(heroAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRealAnalytics(); }, []);
  const onRefresh = () => { setRefreshing(true); loadRealAnalytics(); };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text style={styles.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  const totalStatusOrders =
    analytics.placedOrders + analytics.packedOrders +
    analytics.dispatchedOrders + analytics.deliveredOrders || 1;

  const statusData = [
    { label: 'Placed', value: analytics.placedOrders, color: '#3B82F6' },
    { label: 'Packed', value: analytics.packedOrders, color: '#F59E0B' },
    { label: 'Dispatched', value: analytics.dispatchedOrders, color: '#8B5CF6' },
    { label: 'Delivered', value: analytics.deliveredOrders, color: '#10B981' },
  ];

  return (
    <ScrollView
      style={styles.container}
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
      {/* ── Hero Revenue Card ──────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.heroCard,
          {
            opacity: heroAnim,
            transform: [{ scale: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
          },
        ]}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Total Revenue</Text>
            <AnimatedNumber
              value={analytics.totalRevenue}
              prefix="₹"
              style={styles.heroValue}
            />
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>ALL TIME</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => {
            router.push('/admin/DetailedAnalytics');
          }}

        >
          <Text style={styles.viewMoreText}>View More Analytics →</Text>
        </TouchableOpacity>

        <View style={styles.heroDivider} />

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>TODAY</Text>
            <AnimatedNumber value={analytics.todayRevenue} prefix="₹" style={styles.heroStatValue} />
          </View>
          <View style={styles.heroStatSep} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>THIS MONTH</Text>
            <AnimatedNumber value={analytics.monthRevenue} prefix="₹" style={styles.heroStatValue} />
          </View>
          <View style={styles.heroStatSep} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>AVG ORDER</Text>
            <AnimatedNumber value={analytics.averageOrderValue} prefix="₹" style={styles.heroStatValue} />
          </View>
        </View>
      </Animated.View>

      <View style={styles.body}>
        {/* ── Revenue Trend ────────────────────────────────────────────────── */}
        <View style={styles.chartCard}>
          <SectionHeader title="7-Day Revenue" subtitle="Daily breakdown" />
          <MiniBarChart
            data={analytics.revenueByDay.length > 0
              ? analytics.revenueByDay
              : Array.from({ length: 7 }, (_, i) => ({
                value: 0,
                label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i],
              }))}
            color="#1E3A5F"
            height={72}
          />
        </View>

        {/* ── Order Summary Row ─────────────────────────────────────────────── */}
        <SectionHeader title="Orders" />
        <View style={styles.chipRow}>
          {[
            { label: 'Total', value: analytics.totalOrders, accent: '#1E3A5F' },
            { label: 'Enterprise', value: analytics.enterpriseOrders, accent: '#3B82F6' },
            { label: 'Transport', value: analytics.transportOrders, accent: '#8B5CF6' },
          ].map((s, i) => (
            <StatChip key={s.label} {...s} index={i} />
          ))}
        </View>

        {/* ── Order Status ─────────────────────────────────────────────────── */}
        <View style={styles.chartCard}>
          <SectionHeader title="Order Status" subtitle="Active pipeline" />

          {/* Mini donut + legend side by side */}
          <View style={styles.statusLayout}>
            <DonutSegment
              segments={statusData.map(s => ({ value: s.value, color: s.color }))}
              size={88}
            />
            <View style={styles.statusBars}>
              {statusData.map(s => (
                <ProgressBar
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  max={totalStatusOrders}
                  color={s.color}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── Inventory ────────────────────────────────────────────────────── */}
        <SectionHeader title="Inventory" />
        <View style={styles.inventoryRow}>
          <View style={[styles.inventoryCard, { borderLeftColor: '#EF4444' }]}>
            <Text style={styles.inventoryCardTitle}>Out of Stock</Text>
            <AnimatedNumber
              value={analytics.outOfStockMaterials + analytics.outOfStockVehicles}
              style={[styles.inventoryCardValue, { color: '#EF4444' }]}
            />
            <Text style={styles.inventoryCardSub}>
              {analytics.outOfStockMaterials} mat · {analytics.outOfStockVehicles} veh
            </Text>
          </View>
          <View style={[styles.inventoryCard, { borderLeftColor: '#F59E0B' }]}>
            <Text style={styles.inventoryCardTitle}>Low Stock</Text>
            <AnimatedNumber
              value={analytics.lowStockMaterials + analytics.lowStockVehicles}
              style={[styles.inventoryCardValue, { color: '#F59E0B' }]}
            />
            <Text style={styles.inventoryCardSub}>
              {analytics.lowStockMaterials} mat · {analytics.lowStockVehicles} veh
            </Text>
          </View>
        </View>

        {/* ── Top Selling Material ─────────────────────────────────────────── */}
        {analytics.topMaterial && (
          <>
            <SectionHeader title="Top Seller" />
            <View style={styles.topCard}>
              <View style={styles.topCardLeft}>
                <View style={styles.trophyBadge}>
                  <Text style={styles.trophyEmoji}>🏆</Text>
                </View>
                <View>
                  <Text style={styles.topCardName}>{analytics.topMaterial.name}</Text>
                  <Text style={styles.topCardSub}>Best performing material</Text>
                </View>
              </View>
              <View style={styles.topCardStats}>
                <View style={styles.topCardStat}>
                  <Text style={styles.topCardStatValue}>
                    {analytics.topMaterial.totalQty.toLocaleString()}
                  </Text>
                  <Text style={styles.topCardStatLabel}>UNITS</Text>
                </View>
                <View style={styles.topCardStatDivider} />
                <View style={styles.topCardStat}>
                  <Text style={styles.topCardStatValue}>
                    ₹{Math.round(analytics.topMaterial.totalRevenue / 1000)}K
                  </Text>
                  <Text style={styles.topCardStatLabel}>REVENUE</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <Text style={styles.footer}>
          Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Pull to refresh
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#94A3B8' },

  // Hero
  heroCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#1E3A5F',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  heroValue: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  heroBadgeText: { fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 1 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  heroStats: { flexDirection: 'row' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroStatLabel: { fontSize: 8, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
  heroStatValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Body
  body: { padding: 16, paddingTop: 14 },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, marginTop: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', letterSpacing: 0.2 },
  sectionSubtitle: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },

  // Chart card
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  barLabel: { fontSize: 8, color: '#94A3B8', marginTop: 4, fontWeight: '600' },

  // Stat chips
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderTopWidth: 3,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statChipValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statChipLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Status layout
  statusLayout: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  statusBars: { flex: 1, gap: 8 },
  progressRow: { gap: 4 },
  progressMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressDot: { width: 6, height: 6, borderRadius: 3 },
  progressLabel: { flex: 1, fontSize: 11, color: '#64748B', fontWeight: '600' },
  progressValue: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  progressTrack: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },

  // view more button
  viewMoreButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Inventory
  inventoryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inventoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inventoryCardTitle: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inventoryCardValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  inventoryCardSub: { fontSize: 9, color: '#CBD5E1', fontWeight: '600', marginTop: 4 },

  // Top card
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  topCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trophyBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyEmoji: { fontSize: 18 },
  topCardName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  topCardSub: { fontSize: 10, color: '#94A3B8', fontWeight: '500', marginTop: 2 },
  topCardStats: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  topCardStat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  topCardStatDivider: { width: 1, backgroundColor: '#E2E8F0' },
  topCardStatValue: { fontSize: 16, fontWeight: '800', color: '#1E3A5F' },
  topCardStatLabel: { fontSize: 8, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.8, marginTop: 2, textTransform: 'uppercase' },

  // Footer
  footer: { textAlign: 'center', fontSize: 10, color: '#CBD5E1', fontWeight: '500', paddingBottom: 24, paddingTop: 8 },
});

export default AnalyticsSection;