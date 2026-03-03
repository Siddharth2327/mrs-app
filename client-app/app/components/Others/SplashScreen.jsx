import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreenAlt = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false, // Changed to false for scaleX transform
      }),
    ]).start();

    // Pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ripple animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 2.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto finish
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      
      {/* Background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Ripple */}
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          },
        ]}
      />

      {/* Logo section */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <Text style={styles.appName}>RISWANA</Text>
        {/* <View style={styles.logoBox}> */}
          <Image
            source={require('../../../assets/komban-logo-blue.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        {/* </View> */}
      </Animated.View>

      {/* Subtitle */}
      <Animated.View
        style={[
          styles.subtitleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.line} />
        <Text style={styles.subtitle}>
          CONSTRUCTION AND ENTERPRISES
        </Text>
        <View style={styles.line} />
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.loadingContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bgCircle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(54, 137, 255, 0.08)',
    top: -width * 0.5,
    left: -width * 0.3,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(54, 137, 255, 0.05)',
    bottom: -width * 0.4,
    right: -width * 0.2,
  },

  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#3689FF',
  },

  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  appName: {
    fontSize: 52,
    fontWeight: '800',
    color: '#1E3A5F',
    letterSpacing: 6,
    marginBottom: 12,
    textShadowColor: 'rgba(30, 58, 95, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textTransform: 'uppercase',
  },

//   logoBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     paddingHorizontal: 30,
//     paddingVertical: 20,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: '#3689FF',
//     shadowColor: '#3689FF',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.4,
//     shadowRadius: 15,
//     elevation: 10,
//   },

  logoImage: {
    height: 100,
    width: 220,
  },

  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
  },

  line: {
    width: 40,
    height: 1,
    backgroundColor: '#3689FF',
    marginHorizontal: 10,
  },

  subtitle: {
    fontSize: 12,
    color: '#000',
    letterSpacing: 3,
    fontWeight: '600',
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.6,
  },

  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#3689FF',
    borderRadius: 2,
  },
});

export default SplashScreenAlt;