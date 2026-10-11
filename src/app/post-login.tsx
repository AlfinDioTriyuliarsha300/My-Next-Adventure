import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

type UserRole = 'teacher' | 'student';

type SlideItem = {
  id: string;
  image: any;
};

const { width: initialWidth } =
  Dimensions.get('window');

export default function PostLoginScreen() {
  const { role } =
    useLocalSearchParams<{
      role?: string;
    }>();

  const [width, setWidth] =
    useState(initialWidth);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const flatListRef =
    useRef<FlatList<SlideItem>>(null);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  // =========================
  // SLIDES
  // =========================

  const slides: SlideItem[] =
    Platform.OS === 'web'
      ? [
          {
            id: 'web-1',
            image: require('../../assets/images/post-login-web-1.png'),
          },
          {
            id: 'web-2',
            image: require('../../assets/images/post-login-web-2.png'),
          },
          {
            id: 'web-3',
            image: require('../../assets/images/post-login-web-3.png'),
          },
        ]
      : [
          {
            id: 'mobile-1',
            image: require('../../assets/images/post-login-mobile-1.png'),
          },
          {
            id: 'mobile-2',
            image: require('../../assets/images/post-login-mobile-2.png'),
          },
          {
            id: 'mobile-3',
            image: require('../../assets/images/post-login-mobile-3.png'),
          },
        ];

  // =========================
  // ROLE DESTINATION
  // =========================

  function goToHome() {
    const userRole: UserRole =
      role === 'teacher'
        ? 'teacher'
        : 'student';

    if (userRole === 'teacher') {
      router.replace('/teacher');
    } else {
      router.replace('/student');
    }
  }

  // =========================
  // STOP TIMER
  // =========================

  function stopAutoSlide() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // =========================
  // START TIMER
  // =========================

  function startAutoSlide() {
    stopAutoSlide();

    timerRef.current =
      setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex =
            prevIndex + 1;

          // Jika sudah melewati slide terakhir
          if (
            nextIndex >=
            slides.length
          ) {
            stopAutoSlide();
            goToHome();

            return prevIndex;
          }

          flatListRef.current?.scrollToOffset(
            {
              offset:
                nextIndex * width,
              animated: true,
            }
          );

          return nextIndex;
        });
      }, 3000);
  }

  // =========================
  // START AUTO SLIDE
  // =========================

  useEffect(() => {
    startAutoSlide();

    return () => {
      stopAutoSlide();
    };
  }, [width]);

  // =========================
  // SCREEN SIZE
  // =========================

  useEffect(() => {
    function handleResize() {
      const newWidth =
        Dimensions.get('window').width;

      setWidth(newWidth);
    }

    const subscription =
      Dimensions.addEventListener(
        'change',
        handleResize
      );

    return () => {
      subscription?.remove();
    };
  }, []);

  // =========================
  // HANDLE SWIPE
  // =========================

  function handleScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    const offsetX =
      event.nativeEvent.contentOffset.x;

    const newIndex = Math.round(
      offsetX / width
    );

    setCurrentIndex(newIndex);

    // Reset timer ketika user swipe
    startAutoSlide();
  }

  // =========================
  // NEXT
  // =========================

  function handleNext() {
    stopAutoSlide();

    const nextIndex =
      currentIndex + 1;

    if (
      nextIndex >=
      slides.length
    ) {
      goToHome();
      return;
    }

    flatListRef.current?.scrollToOffset(
      {
        offset:
          nextIndex * width,
        animated: true,
      }
    );

    setCurrentIndex(nextIndex);

    startAutoSlide();
  }

  // =========================
  // PREVIOUS
  // =========================

  function handlePrevious() {
    stopAutoSlide();

    const previousIndex =
      currentIndex - 1;

    if (previousIndex < 0) {
      startAutoSlide();
      return;
    }

    flatListRef.current?.scrollToOffset(
      {
        offset:
          previousIndex * width,
        animated: true,
      }
    );

    setCurrentIndex(
      previousIndex
    );

    startAutoSlide();
  }

  return (
    <View style={styles.container}>
      {/* =========================
          SLIDES
      ========================= */}

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) =>
          item.id
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={
          handleScrollEnd
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.slide,
              {
                width,
              },
            ]}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* =========================
          INDICATOR
      ========================= */}

      <View
        style={
          styles.indicatorContainer
        }
      >
        {slides.map(
          (_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index ===
                  currentIndex &&
                  styles.indicatorActive,
              ]}
            />
          )
        )}
      </View>

      {/* =========================
          WEB ARROWS
      ========================= */}

      {Platform.OS === 'web' && (
        <>
          {currentIndex > 0 && (
            <Pressable
              onPress={
                handlePrevious
              }
              style={[
                styles.arrowButton,
                styles.arrowLeft,
              ]}
            >
              <View
                style={
                  styles.arrowLeftIcon
                }
              />
            </Pressable>
          )}

          <Pressable
            onPress={handleNext}
            style={[
              styles.arrowButton,
              styles.arrowRight,
            ]}
          >
            <View
              style={
                styles.arrowRightIcon
              }
            />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },

  slide: {
    flex: 1,
    height: '100%',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  // =========================
  // INDICATOR
  // =========================

  indicatorContainer: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor:
      'rgba(255,255,255,0.45)',
  },

  indicatorActive: {
    width: 22,
    backgroundColor: '#FFFFFF',
  },

  // =========================
  // WEB ARROWS
  // =========================

  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowLeft: {
    left: 20,
  },

  arrowRight: {
    right: 20,
  },

  arrowLeftIcon: {
    width: 12,
    height: 12,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [
      {
        rotate: '45deg',
      },
    ],
    marginLeft: 5,
  },

  arrowRightIcon: {
    width: 12,
    height: 12,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: '#FFFFFF',
    transform: [
      {
        rotate: '45deg',
      },
    ],
    marginRight: 5,
  },
});