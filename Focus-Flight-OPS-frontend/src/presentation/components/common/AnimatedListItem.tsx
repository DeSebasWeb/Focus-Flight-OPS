import React, { useRef, useEffect, ReactNode } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedListItemProps {
  index: number;
  children: ReactNode;
  style?: ViewStyle;
}

export function AnimatedListItem({ index, children, style }: AnimatedListItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = Math.min(index * 50, 500);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
