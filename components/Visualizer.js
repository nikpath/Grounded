import React, {useRef} from 'react';
import {StyleSheet, Text, View, Dimensions, Animated} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const {width, height} = Dimensions.get('window');
const circleWidth = width / 2;
export default function Visualizer() {
  const move = new Animated.Value(0);
  const textOpacity = new Animated.Value(1);
  Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          delay: 100,
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          delay: 1000,
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ]),
  ).start();
  const translate = move.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circleWidth / 6],
  });
  const exhale = textOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          width: circleWidth,
          height: circleWidth,
          position: 'absolute',
          top: 40,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: textOpacity,
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
          }}>
          Inhale
        </Text>
      </Animated.View>
      <Animated.View
        style={{
          width: circleWidth,
          height: circleWidth,
          position: 'absolute',
          top: 40,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: exhale,
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
          }}>
          Exhale
        </Text>
      </Animated.View>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(item => {
        const rotation = move.interpolate({
          inputRange: [0, 1],
          outputRange: [`${item * 45}deg`, `${item * 45 + 180}deg`],
        });
        return (
          <Animated.View
            key={item}
            style={{
              opacity: 0.1,
              backgroundColor: '#7A891A',
              width: circleWidth,
              height: circleWidth,
              borderRadius: circleWidth / 2,
              position: 'absolute',
              top: 40,
              transform: [
                {
                  rotateZ: rotation,
                },
                {translateX: translate},
                {translateY: translate},
              ],
            }}></Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0EB98',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
