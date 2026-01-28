import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Simplify Your Move',
    description:
      'Manage your inventory, schedule pickups,\nand track storage in one place',
    image: require('../../assets/images/onboarding1.jpg'),
  },
  {
    id: '2',
    title: 'Effortless Inventory',
    description:
      'Keep track of every box and item with our\nsmart digital inventory system',
    image: require('../../assets/images/onboarding2.jpg'),
  },
  {
    id: '3',
    title: 'Track & Store',
    description:
      'Monitor your shipment’s journey in real-time\nand manage secure storage inventory all in one place',
    image: require('../../assets/images/onboarding3.jpg'),
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <Image
        source={item.image}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  slide: {
    width,
    flex: 1,
  },

  backgroundImage: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: width * 0.99,
    height: height * 0.45,
  },

  content: {
    marginTop: height * 0.48 + 10,
    paddingHorizontal: 30,
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },

  description: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14, 
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 4,
    backgroundColor: '#DADADA',
    marginHorizontal: 5,
  },

  activeDot: {
    backgroundColor: '#C8A36A',
   
  },

  button: {
    backgroundColor: '#C8A36A',
    marginHorizontal: 30,
    marginBottom: 40,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
});
