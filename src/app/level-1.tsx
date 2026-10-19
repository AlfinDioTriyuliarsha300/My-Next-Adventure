
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// =====================================================
// KONFIGURASI LEVEL
// =====================================================

const LEVEL = 1;
const TOTAL_STARS = 3;

type SkillId = 'listening' | 'speaking' | 'reading' | 'writing';

type Skill = {
  id: SkillId;
  nama: string;
  ikon: keyof typeof MaterialCommunityIcons.glyphMap;
  warna: string;
};

const DAFTAR_SKILL: Skill[] = [
  {
    id: 'listening',
    nama: 'Listening',
    ikon: 'headphones',
    warna: '#333333',
  },
  {
    id: 'speaking',
    nama: 'Speaking',
    ikon: 'account-voice',
    warna: '#2783D7',
  },
  {
    id: 'reading',
    nama: 'Reading',
    ikon: 'book-open-page-variant',
    warna: '#E95C42',
  },
  {
    id: 'writing',
    nama: 'Writing',
    ikon: 'pencil',
    warna: '#F1A72A',
  },
];

// =====================================================
// HALAMAN LEVEL 1
// =====================================================

export default function LevelOneScreen() {
  // Status penyelesaian skill.
  // Untuk tampilan awal, seluruh skill belum diselesaikan.
  // =====================================================
  // BAGIAN BACKGROUND
  // =====================================================

  const backgroundImage = require(
    '../../assets/images/lessons/positive-degree-background.png'
  );
  const [skillSelesai] = useState<Record<SkillId, number>>({
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
  });

  // Kembali ke halaman daftar level.
  function kembaliKeLevel() {
    router.replace('/levels');
  }

  // Menampilkan informasi sementara karena soal belum dibuat.
    function bukaSkill(namaSkill: SkillId) {
    if (namaSkill === 'listening') {
      router.push('/listening');
      return;
    }
    Alert.alert(
    DAFTAR_SKILL.find((skill) => skill.id === namaSkill)?.nama ?? namaSkill,
    'Materi dan soal skill ini akan ditambahkan pada pengembangan berikutnya.'
  );
}

  return (
    <ImageBackground
    source={require('../../assets/images/lessons/positive-degree-background.png')}
    style={styles.halaman}
    resizeMode="cover"
  >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF5E6"
      />

      <ScrollView
      contentContainerStyle={styles.konten}
      showsVerticalScrollIndicator={false}
    >
        {/* =================================================
            BAGIAN HEADER DAN PROGRES
        ================================================== */}

        <View style={styles.headerAtas}>
          <Pressable
            onPress={kembaliKeLevel}
            style={styles.tombolKembali}
            accessibilityLabel="Kembali ke daftar level"
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color="#493D30"
            />
          </Pressable>

          <View style={styles.bilahProgres}>
            <View style={styles.progresTerisi} />
          </View>

          <View style={styles.poin}>
            <Ionicons name="star" size={14} color="#F3B51B" />
            <Text style={styles.teksPoin}>120</Text>
          </View>
        </View>

        {/* =================================================
            BAGIAN JUDUL LEVEL
        ================================================== */}

        <View style={styles.headerMateri}>
          <View style={styles.labelLevel}>
            <Text style={styles.teksLabelLevel}>
              LEVEL {LEVEL}
            </Text>
          </View>

          <Text style={styles.judulLevel}>
            Level 1: Positive Degree
          </Text>

          <Text style={styles.deskripsiLevel}>
            Describe one thing on its own
          </Text>
        </View>

        {/* =================================================
            BAGIAN MATERI
        ================================================== */}

        <View style={styles.kartuMateri}>
          <View style={styles.judulKartuMateri}>
            <MaterialCommunityIcons
              name="sprout"
              size={18}
              color="#34834B"
            />
            <Text style={styles.teksJudulMateri}>
              Positive Degree
            </Text>
          </View>

          {/* Rumus pertama */}
          <View style={styles.barisMateri}>
            <Text style={styles.teksMateri}>
              Subject + adjective
            </Text>
          </View>

          {/* Rumus kedua */}
          <View style={styles.barisMateri}>
            <Text style={styles.teksMateri}>
              Equal comparison: as + adjective + as
            </Text>
          </View>

          {/* Contoh pertama */}
          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              The giraffe is tall.
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={17}
              color="#64B8C9"
            />
          </View>

          {/* Contoh kedua */}
          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              My house is as big as your house.
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={17}
              color="#64B8C9"
            />
          </View>

          {/* Contoh ketiga */}
          <View style={styles.barisContoh}>
            <Text style={styles.teksMateri}>
              Pizza is as delicious as burger.
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={17}
              color="#64B8C9"
            />
          </View>

          {/* Catatan penting */}
          <View style={styles.catatanMateri}>
            <Ionicons
              name="warning"
              size={16}
              color="#98731B"
            />
            <Text style={styles.teksCatatan}>
              "As...as" shows that two things have the SAME
              degree of quality — it is always wrapped by two
              "as"!
            </Text>
          </View>
        </View>

        {/* =================================================
            BAGIAN DAFTAR SKILL
        ================================================== */}

        <View style={styles.bagianSkill}>
          <Text style={styles.judulSkill}>
            PRACTICE THE 4 SKILLS
          </Text>

          <View style={styles.gridSkill}>
            {DAFTAR_SKILL.map((skill) => (
              <KartuSkill
                key={skill.id}
                skill={skill}
                bintangEmas={skillSelesai[skill.id]}
                saatDitekan={() => bukaSkill(skill.id)}
              />
            ))}
          </View>
        </View>

        {/* =================================================
            BAGIAN TOMBOL LANJUTAN
        ================================================== */}

        <View style={styles.bagianBawah}>
          <Text style={styles.keteranganBawah}>
            Selesaikan latihan untuk mengumpulkan bintang.
          </Text>

          <Pressable
            disabled
            style={styles.tombolLanjut}
          >
            <Text style={styles.teksTombolLanjut}>
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// =====================================================
// KOMPONEN KARTU SKILL
// =====================================================

type KartuSkillProps = {
  skill: Skill;
  bintangEmas: number;
  saatDitekan: () => void;
};

function KartuSkill({
  skill,
  bintangEmas,
  saatDitekan,
}: KartuSkillProps) {
  return (
    <Pressable
      onPress={saatDitekan}
      style={({ pressed }) => [
        styles.kartuSkill,
        pressed && styles.kartuSkillDitekan,
      ]}
    >
      {/* Ikon skill */}
      <View style={styles.areaIkonSkill}>
        <MaterialCommunityIcons
          name={skill.ikon}
          size={29}
          color={skill.warna}
        />
      </View>

      {/* Nama skill */}
      <Text style={styles.namaSkill}>
        {skill.nama}
      </Text>

      {/* Bintang progres: hitam sebelum selesai, emas sesudahnya */}
      <View style={styles.daftarBintang}>
        {Array.from({ length: TOTAL_STARS }).map((_, index) => (
          <Ionicons
            key={`${skill.id}-bintang-${index}`}
            name="star"
            size={13}
            color={index < bintangEmas ? '#F2B51B' : '#222222'}
          />
        ))}
      </View>
    </Pressable>
  );
}

// =====================================================
// BAGIAN STYLE / CSS REACT NATIVE
// =====================================================

const styles = StyleSheet.create({
  halaman: {
  flex: 1,
  width: '100%',
},

konten: {
  flexGrow: 1,
  paddingHorizontal: 13,
  paddingTop: 12,
  paddingBottom: 25,
},

  // Header dan progres
  headerAtas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 15,
  },

  tombolKembali: {
    width: 18,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bilahProgres: {
    flex: 1,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#E7D5B4',
    overflow: 'hidden',
  },

  progresTerisi: {
    width: '0%',
    height: '100%',
    backgroundColor: '#66A66A',
  },

  poin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6D7B8',
  },

  teksPoin: {
    color: '#493D30',
    fontSize: 10,
    fontWeight: '800',
  },

  // Judul level
  headerMateri: {
    marginBottom: 13,
  },

  labelLevel: {
    alignSelf: 'flex-start',
    backgroundColor: '#65A879',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 7,
  },

  teksLabelLevel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  judulLevel: {
    color: '#293744',
    fontSize: 19,
    fontWeight: '900',
  },

  deskripsiLevel: {
    marginTop: 3,
    color: '#776B5E',
    fontSize: 11,
  },

  // Kartu materi
  kartuMateri: {
    backgroundColor: '#E9F4E9',
    borderColor: '#5DA875',
    borderWidth: 1.4,
    borderRadius: 15,
    padding: 9,
    marginBottom: 17,
  },

  judulKartuMateri: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 7,
  },

  teksJudulMateri: {
    color: '#367C4A',
    fontSize: 12,
    fontWeight: '900',
  },

  barisMateri: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 5,
  },

  teksMateri: {
    flex: 1,
    color: '#39434B',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
  },

  barisContoh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 5,
  },

  catatanMateri: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    backgroundColor: '#FFF1BD',
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
  },

  teksCatatan: {
    flex: 1,
    color: '#685321',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '600',
  },

  // Grid skill
  bagianSkill: {
    marginBottom: 13,
  },

  judulSkill: {
    color: '#76695A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  gridSkill: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },

  // Kartu skill
  kartuSkill: {
    width: '48.5%',
    minHeight: 96,
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#E7D4B3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 5,
  },

  kartuSkillDitekan: {
    backgroundColor: '#F4E8D4',
    transform: [{ scale: 0.98 }],
  },

  areaIkonSkill: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  namaSkill: {
    color: '#36404A',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 5,
  },

  daftarBintang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  // Bagian bawah
  bagianBawah: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 1,
  },

  keteranganBawah: {
    flex: 1,
    color: '#827665',
    fontSize: 9,
  },

  tombolLanjut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 9,
    backgroundColor: '#C9C9C9',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  teksTombolLanjut: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
