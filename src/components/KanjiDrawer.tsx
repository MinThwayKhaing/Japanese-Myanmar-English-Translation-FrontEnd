import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity, Text, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Stroke = { x: number[]; y: number[]; t: number[] };

export default function KanjiDrawer({
  onRecognized,
}: {
  onRecognized: (text: string) => void;
}) {
  const [paths, setPaths] = useState<string[]>([]);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current = {
          x: [locationX],
          y: [locationY],
          t: [Date.now()],
        };
      },

      onPanResponderMove: (e) => {
        if (!current.current) return;
        const { locationX, locationY } = e.nativeEvent;

        current.current.x.push(locationX);
        current.current.y.push(locationY);
        current.current.t.push(Date.now());

        const d = current.current.x
          .map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${current.current!.y[i]}`)
          .join(' ');

        setPaths((p) => [...p.slice(0, -1), d]);
      },

      onPanResponderRelease: () => {
        if (!current.current) return;

        strokes.current.push(current.current);

        const d = current.current.x
          .map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${current.current!.y[i]}`)
          .join(' ');

        setPaths((p) => [...p, d]);
        current.current = null;
      },
    })
  ).current;

  const clear = () => {
    setPaths([]);
    strokes.current = [];
  };

  const recognize = async () => {
    if (strokes.current.length === 0) {
      Alert.alert('Draw Kanji first');
      return;
    }

    const ink = strokes.current.map((s) => [
      s.x.map(Math.round),
      s.y.map(Math.round),
      s.t.map((_, i) => i), // relative time
    ]);

    const payload = {
      input_type: 0,
      requests: [
        {
          language: 'ja',
          writing_guide: { width: 300, height: 300 },
          ink,
        },
      ],
    };

    try {
      const res = await fetch(
        'https://inputtools.google.com/request?itc=ja-t-i0-handwrit&app=handwriting',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      const result = json?.[1]?.[0]?.[1]?.[0];

      if (!result) {
        Alert.alert('Recognition failed', 'Try drawing larger characters');
        return;
      }

      onRecognized(result);
      clear();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Recognition error');
    }
  };

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers} style={styles.canvas}>
        <Svg width="100%" height="100%">
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke="#000" strokeWidth={5} fill="none" />
          ))}
        </Svg>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={clear}>
          <Text style={styles.btn}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={recognize}>
          <Text style={styles.btn}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 320, backgroundColor: '#fff', borderRadius: 12 },
  canvas: { flex: 1, backgroundColor: '#f1f1f1' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  btn: { fontSize: 16, fontWeight: 'bold', color: '#1A374D' },
});
