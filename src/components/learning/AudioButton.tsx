
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import {
  Pressable,
  StyleSheet,
  Text
} from 'react-native';

type AudioButtonProps = {
  audio: number;
  label?: string;
};

export default function AudioButton({
  audio,
  label = 'Listen to audio',
}: AudioButtonProps) {
  const player = useAudioPlayer(audio);
  const status = useAudioPlayerStatus(player);

  // ga tau karena code ini error
  // useEffect(() => {
  //   return () => {
  //     player.pause();
  //   };
  // }, [player]);

  async function putarAudio() {
    try {
      if (status.playing) {
        player.pause();
        return;
      }

      // Putar ulang dari awal jika audio sudah selesai.
      if (status.didJustFinish) {
        player.seekTo(0);
      }

      player.play();
    } catch (error) {
      console.error('Gagal memutar audio:', error);
    }
  }

  return (
    <Pressable
      onPress={putarAudio}
      accessibilityRole="button"
      accessibilityLabel={status.playing ? 'Pause audio' : label}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons
        name={status.playing ? 'pause-circle' : 'play-circle'}
        size={32}
        color="#FFFFFF"
      />

      <Text style={styles.buttonText}>
        {status.playing ? 'Pause Audio' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#2783D7',
    borderRadius: 16,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
