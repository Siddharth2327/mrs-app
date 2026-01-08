import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import OrdersHeader from './components/OrdersPage/OrdersHeader';
import OrdersLocation from './components/OrdersPage/OrdersLocation';
import OrderFilterTabs from './components/OrdersPage/OrderFilterTabs';
import OrderCard from './components/OrdersPage/OrderCard';
import BottomNavigation from './components/Navigation/BottomNavigation';

export default function OrdersPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('All');

    // Realistic orders from planner [file:1]
    const allOrders = [
        {
            id: 1,
            type: 'transport',
            title: 'Tempo - Madhapur to Gachibowli',
            orderId: 'RTE-00123',
            date: 'Dec 20, 2024',
            status: 'Delivered',
            price: 450,
            stages: ['Placed', 'Packed', 'Dispatched', 'Delivered'],
            vehicle: 'Tempo',
            trackingUrl: 'https://maps.google.com',
        },
        {
            id: 2,
            type: 'enterprise',
            title: 'UltraTech Cement × 10 bags',
            orderId: 'RTE-00122',
            date: 'Dec 19, 2024',
            status: 'Dispatched',
            price: 4956,
            materials: ['Cement × 10 bags'],
        },
        {
            id: 3,
            type: 'transport',
            title: 'Car - HITEC City to Kukatpally',
            orderId: 'RTE-00121',
            date: 'Dec 18, 2024',
            status: 'Packed',
            price: 280,
            stages: ['Placed', 'Packed'],
        },
        {
            id: 4,
            type: 'combined',
            title: 'Sand 50 cu.ft + Bricks 1000',
            orderId: 'RTE-00120',
            date: 'Dec 17, 2024',
            status: 'Placed',
            price: 3500,
            materials: ['River Sand 50 cu.ft', 'Red Bricks 1000 pcs'],
        },
    ];

    const filteredOrders = allOrders.filter((order) => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Transport') return order.type === 'transport';
        if (activeFilter === 'Enterprise') return order.type === 'enterprise';
        if (activeFilter === 'Combined') return order.type === 'combined';
        return true;
    });

    const handleOrderPress = useCallback((order) => {
        router.push(`/orders/${order.id}`);
    }, [router]);

    const handleFilterChange = useCallback((filter) => {
        setActiveFilter(filter);
    }, []);

    const hasOrders = filteredOrders.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <OrdersHeader
                onNotificationPress={() => router.push('/notifications')}
                onMemberPress={() => router.push('/profile')}
            />

            <OrdersLocation
                location="Chennai, Tamil Nadu 600001"
                onChangeLocation={() => router.push('/location-picker')}
            />

            <OrderFilterTabs
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.ordersContainer}>
                    {hasOrders ? (
                        filteredOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onPress={() => handleOrderPress(order)}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="clipboard-outline" size={80} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No orders {activeFilter.toLowerCase()}</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeFilter === 'All'
                                    ? 'Your orders will appear here'
                                    : `No ${activeFilter.toLowerCase()} orders yet`}
                            </Text>
                            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/enterprises')}>
                                <Text style={styles.emptyButtonText}>Start Ordering</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            <BottomNavigation activeTab="Orders" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    ordersContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    emptyButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomPadding: {
        height: 120,
    },
});
