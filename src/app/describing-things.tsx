import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DescribingThingsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#172B4D" />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.levelLabel}>LEVEL 1</Text>
            <Text style={styles.title}>Describing Things</Text>
          </View>
        </View>

        {/* Learning Objectives Header */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={30} color="#FFC928" />
          </View>

          <Text style={styles.heroTitle}>LEARNING OBJECTIVES</Text>

          <Text style={styles.heroSubtitle}>
            What will you learn?
          </Text>

          <Text style={styles.heroDescription}>
            Tujuan Pembelajaran - Degree of Comparison, Grade 5
          </Text>
        </View>

        {/* By the end */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            By the end, students will be able to:
          </Text>

          <View style={styles.objectivesCard}>
            <ObjectiveItem
              number="1"
              text="Identify features of people, animals, and other things."
              icon="search"
            />

            <ObjectiveItem
              number="2"
              text="Use adjectives to describe people, animals, and things."
              icon="create"
            />

            <ObjectiveItem
              number="3"
              text="Use comparative adjectives to talk about people, animals, and things."
              icon="swap-horizontal"
            />

            <ObjectiveItem
              number="4"
              text="Use superlative adjectives to talk about people, animals, and things."
              icon="trophy"
            />
          </View>
        </View>

        {/* Profil Pelajar Pancasila */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Profil Pelajar Pancasila
          </Text>

          <View style={styles.profileCard}>
            <ProfileItem
              icon="person"
              title="Mandiri"
              english="Independent"
              description="Practicing on your own"
            />

            <ProfileItem
              icon="color-palette"
              title="Kreatif"
              english="Creative"
              description="Making your own sentences"
            />

            <ProfileItem
              icon="bulb"
              title="Berpikir Kritis"
              english="Critical Thinking"
              description="Choosing the correct answer"
            />

            <ProfileItem
              icon="people"
              title="Bergotong Royong"
              english="Collaborative"
              description="Practicing speaking with friends"
            />
          </View>
        </View>

        {/* Ready Section */}
        <View style={styles.readyCard}>
          <View style={styles.readyIcon}>
            <Ionicons name="rocket" size={28} color="#FFC928" />
          </View>

          <Text style={styles.readyTitle}>
            Ready to Learn?
          </Text>

          <Text style={styles.readyText}>
            Explore the lesson and practice your English skills!
          </Text>
        </View>

        {/* Start Level 1 */}
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() => router.push('/levels')}
        >
          <Text style={styles.startButtonText}>
            Start Level 1
          </Text>

          <Ionicons
            name="arrow-forward"
            size={22}
            color="#172B4D"
          />
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

function ObjectiveItem({
  number,
  text,
  icon,
}: {
  number: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.objectiveItem}>
      <View style={styles.numberCircle}>
        <Text style={styles.numberText}>{number}</Text>
      </View>

      <View style={styles.objectiveContent}>
        <Text style={styles.objectiveText}>{text}</Text>
      </View>

      <View style={styles.objectiveIcon}>
        <Ionicons name={icon} size={19} color="#2783D7" />
      </View>
    </View>
  );
}

function ProfileItem({
  icon,
  title,
  english,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  english: string;
  description: string;
}) {
  return (
    <View style={styles.profileItem}>
      <View style={styles.profileIcon}>
        <Ionicons name={icon} size={22} color="#172B4D" />
      </View>

      <View style={styles.profileContent}>
        <View style={styles.profileTitleRow}>
          <Text style={styles.profileTitle}>{title}</Text>

          <Text style={styles.profileEnglish}>
            {english}
          </Text>
        </View>

        <Text style={styles.profileDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 1,
    shadowColor: '#172B4D',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  headerText: {
    flex: 1,
  },

  levelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2783D7',
    letterSpacing: 1,
    marginBottom: 2,
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#172B4D',
  },

  /* Hero */

  heroCard: {
    backgroundColor: '#172B4D',
    borderRadius: 24,
    padding: 22,
    marginBottom: 26,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#263E60',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 7,
  },

  heroSubtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFC928',
    marginBottom: 8,
  },

  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#E6EDF5',
  },

  /* Section */

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#172B4D',
    marginBottom: 11,
  },

  /* Learning Objectives */

  objectivesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EDF5',
  },

  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },

  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF4C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  numberText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#172B4D',
  },

  objectiveContent: {
    flex: 1,
    paddingRight: 8,
  },

  objectiveText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
    fontWeight: '600',
  },

  objectiveIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F7FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Profil Pelajar Pancasila */

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EDF5',
  },

  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },

  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF4C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  profileContent: {
    flex: 1,
  },

  profileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
  },

  profileTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#172B4D',
    marginRight: 7,
  },

  profileEnglish: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2783D7',
  },

  profileDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  /* Ready */

  readyCard: {
    backgroundColor: '#FFF8D9',
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F6E39A',
    alignItems: 'center',
  },

  readyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#172B4D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  readyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#172B4D',
    marginBottom: 6,
  },

  readyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
    textAlign: 'center',
  },

  /* Start Button */

  startButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#FFC928',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 2,
    elevation: 2,
    shadowColor: '#172B4D',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  startButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#172B4D',
  },

  bottomSpace: {
    height: 30,
  },
});