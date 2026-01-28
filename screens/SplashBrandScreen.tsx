import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  StatusBar,
  Animated,
} from 'react-native';

const SplashBrandScreen = ({ navigation }: any) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    startLoadingFlow();
  }, []);

  const startLoadingFlow = async () => {
    await animateTo(0.3, 800);
    await animateTo(0.6, 1000);
    await animateTo(0.85, 900);
    await animateTo(1, 600);

navigation.replace('Onboarding');
  };

  const animateTo = (value: number, duration: number) => {
    return new Promise(resolve => {
      Animated.timing(progressAnim, {
        toValue: value,
        duration,
        useNativeDriver: false,
      }).start(() => {
        setProgress(value);
        resolve(true);
      });
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <Image
        source={require('../assets/images/splash_brand.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>
        Moving and Storage Solution
      </Text>

      <View style={styles.progressWrapper}>
        <Animated.View
          style={[styles.progressBar, { width: progressWidth }]}
        />
      </View>

      <Text style={styles.version}>v1.0.2</Text>
    </View>
  );
};

export default SplashBrandScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 170,
    height: 170,
    marginBottom: 18,
  },

  subtitle: {
    fontSize: 16,              
    color: '#C8A36A',
    marginTop: 6,
    marginBottom: 44,
    letterSpacing: 0.3,        
  },

  progressWrapper: {
    width: 200,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#C8A36A',
  },

  version: {
    position: 'absolute',
    bottom: 26,
    fontSize: 12,
    color: '#C8A36A',
  },
});
