import { Colors, Gradients } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  title: string;
  style: 'left' | 'middle' | 'right';
};

const slides: Slide[] = [
  { title: 'All your records,\none secure place', style: 'left' },
  { title: 'AI-powered\nhealth insights', style: 'middle' },
  { title: 'Voice assistant,\nalways ready', style: 'right' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const scrollRef = useRef<FlatList<Slide>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentStep = Math.round(contentOffsetX / SCREEN_WIDTH);
    setStep(currentStep);
  };

  const handleNext = () => {
    if (step < 2) {
      scrollRef.current?.scrollToIndex({ index: step + 1, animated: true });
    } else {
      router.replace('/login');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      scrollRef.current?.scrollToIndex({ index: step - 1, animated: true });
    }
  };

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}> 
      <View style={styles.shapeOne} />
      <View style={styles.shapeTwo} />
      <View style={styles.shapeStar} />

      <Text style={[styles.logoMark, index !== 1 && styles.logoMarkMuted]}>◌</Text>

      {item.style === 'left' && (
        <>
          <View style={styles.firstReportWrap}>
            <Image source={require('../assets/images/reports1.png')} style={styles.firstReportImage} resizeMode="contain" />
          </View>

          <View style={styles.leftBottomGroup}>
            <View style={styles.leftBottomTextWrap}>
              <Text style={styles.heroTitle}>{item.title}</Text>
            </View>

            <TouchableOpacity style={styles.fabDark} activeOpacity={0.9} onPress={handleNext}>
              <Text style={styles.fabText}>»</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {item.style === 'middle' && (
        <>
          <View style={styles.middleTopCard}>
            <View style={styles.trendHeadRow}>
              <Text style={styles.trendTitle}>Glucose trend</Text>
              <View style={styles.trendPill}>
                <Text style={styles.trendPillText}>Rising ↑</Text>
              </View>
            </View>

            <View style={styles.trendBarsWrap}>
              <View style={[styles.trendBar, styles.trendBarMuted, { height: 78 }]} />
              <View style={[styles.trendBar, styles.trendBarMuted, { height: 92 }]} />
              <View style={[styles.trendBar, styles.trendBarMuted, { height: 84 }]} />
              <View style={[styles.trendBar, styles.trendBarMid, { height: 128 }]} />
              <View style={[styles.trendBar, styles.trendBarStrong, { height: 164 }]} />
            </View>

            <View style={styles.trendMonthRow}>
              <Text style={styles.trendMonth}>Nov</Text>
              <Text style={styles.trendMonth}>Dec</Text>
              <Text style={styles.trendMonth}>Jan</Text>
              <Text style={styles.trendMonth}>Feb</Text>
              <Text style={styles.trendMonthActive}>Mar</Text>
            </View>

            <View style={styles.trendInsightBox}>
              <Text style={styles.trendInsightIcon}>◷</Text>
              <Text style={styles.trendInsightText}>Glucose rising over 2 months - consider reducing sugar intake.</Text>
            </View>
          </View>

          <View style={styles.middleBottomGroup}>
            <View style={styles.middleBottomTextWrap}>
              <Text style={styles.heroTitle}>{item.title}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.middleNextButton} activeOpacity={0.9} onPress={handleNext}>
            <Text style={styles.fabText}>»</Text>
          </TouchableOpacity>
        </>
      )}

      {item.style === 'right' && (
        <>
          <View style={styles.rightHeaderWrap}>
            <Text style={styles.heroTitle}>{item.title}</Text>
          </View>

          <TouchableOpacity style={styles.rightStartButton} activeOpacity={0.92} onPress={() => router.replace('/login')}>
            <Text style={styles.rightStartButtonText}>Get started</Text>
          </TouchableOpacity>
        </>
      )}

    </View>
  );

  return (
    <LinearGradient colors={Gradients.default} style={styles.container}>
      <FlatList
        ref={scrollRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.style}
        horizontal
        pagingEnabled
        bounces={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.bottomWrap}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.pageDot, i === step ? styles.pageDotActive : styles.pageDotInactive]} />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 68,
    paddingBottom: 26,
    position: 'relative',
    overflow: 'hidden',
  },
  shapeOne: {
    position: 'absolute',
    top: 24,
    left: 54,
    width: 160,
    height: 160,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '42deg' }],
  },
  shapeTwo: {
    position: 'absolute',
    bottom: 164,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    transform: [{ rotate: '-18deg' }],
  },
  shapeStar: {
    position: 'absolute',
    top: 240,
    left: 115,
    width: 110,
    height: 110,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '45deg' }, { scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  logoMark: {
    color: Colors.cloud[100],
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  logoMarkMuted: {
    opacity: 0.85,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -1.8,
    fontWeight: '700',
  },
  firstReportWrap: {
    position: 'absolute',
    bottom: -40,
    right: -100,
    zIndex: 1,
  },
  firstReportImage: {
    width: 600,
    height: 500,
  },
  leftBottomGroup: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 4,
  },
  leftBottomTextWrap: {
    maxWidth: 260,
  },
  fabDark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gray[950],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 7,
  },
  fabText: {
    color: Colors.white,
    fontSize: 23,
    marginTop: -2,
    fontWeight: '700',
  },
  middleTopCard: {
    marginTop: 34,
    width: 318,
    alignSelf: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 28,
    padding: 14,
    transform: [{ rotate: '8deg' }],
    shadowColor: Colors.gray[950],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  trendHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendTitle: {
    color: Colors.gray[950],
    fontSize: 20,
    fontWeight: '800',
  },
  trendPill: {
    borderRadius: 20,
    backgroundColor: '#efe4cf',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  trendPillText: {
    color: '#8c6200',
    fontSize: 15,
    fontWeight: '700',
  },
  trendBarsWrap: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
  },
  trendBar: {
    width: 54,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  trendBarMuted: {
    backgroundColor: '#dbe4ef',
  },
  trendBarMid: {
    backgroundColor: '#74aee1',
  },
  trendBarStrong: {
    backgroundColor: Colors.cloud[600],
  },
  trendMonthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
  trendMonth: {
    color: '#8698b0',
    fontSize: 14,
    fontWeight: '500',
  },
  trendMonthActive: {
    color: Colors.cloud[600],
    fontSize: 14,
    fontWeight: '800',
  },
  trendInsightBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#78b8ff',
    backgroundColor: '#eaf2fb',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  trendInsightIcon: {
    color: Colors.cloud[600],
    fontSize: 20,
    fontWeight: '700',
  },
  trendInsightText: {
    flex: 1,
    color: '#1b4f8f',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  middleBottomGroup: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 78,
    alignItems: 'flex-start',
    zIndex: 4,
  },
  middleBottomTextWrap: {
    maxWidth: 240,
  },
  middleNextButton: {
    position: 'absolute',
    right: 22,
    bottom: 78,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gray[950],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 7,
    zIndex: 5,
  },
  rightStartButton: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 65,
    borderRadius: 34,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 7,
    zIndex: 5,
  },
  rightStartButtonText: {
    color: Colors.cloud[500],
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  rightHeaderWrap: {
    marginBottom: 26,
    maxWidth: 265,
  },
  connectionCard: {
    marginTop: 18,
    alignSelf: 'center',
    width: 250,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 18,
    transform: [{ rotate: '9deg' }],
    shadowColor: Colors.cloud[900],
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.17,
    shadowRadius: 26,
    elevation: 8,
  },
  connectionAvatars: {
    height: 90,
    marginBottom: 10,
    position: 'relative',
  },
  avatarDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.gray[200],
  },
  centerAvatar: {
    position: 'absolute',
    top: 28,
    left: '50%',
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cloud[300],
  },
  connectionText: {
    fontSize: 30,
    lineHeight: 28,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  actionRail: {
    marginTop: 'auto',
    marginBottom: 22,
    alignSelf: 'center',
    width: 270,
    borderRadius: 22,
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  railSideIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.cloud[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  railCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  railSideText: {
    color: Colors.cloud[600],
    fontSize: 16,
    fontWeight: '700',
  },
  railCenterText: {
    color: Colors.gray[950],
    fontSize: 20,
    fontWeight: '700',
  },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageDot: {
    borderRadius: 4,
  },
  pageDotActive: {
    width: 28,
    height: 8,
    backgroundColor: Colors.white,
  },
  pageDotInactive: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
