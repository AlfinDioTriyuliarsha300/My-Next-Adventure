// import { useState } from 'react';

// import {
//     ActivityIndicator,
//     Alert,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';

// import { signIn } from '../../services/auth/authService';

// export default function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function handleLogin() {
//     if (!email.trim() || !password) {
//       Alert.alert(
//         'Login',
//         'Email dan password wajib diisi.'
//       );

//       return;
//     }

//     try {
//       setLoading(true);

//       await signIn(
//         email.trim().toLowerCase(),
//         password
//       );

//       // Tidak perlu router.replace di sini.
//       //
//       // AuthProvider akan menerima perubahan session,
//       // kemudian _layout.tsx akan menentukan halaman
//       // berdasarkan role.
//     } catch (error: any) {
//       Alert.alert(
//         'Login gagal',
//         error?.message ?? 'Email atau password salah.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.logo}>SAVANA QUEST</Text>

//       <Text style={styles.title}>
//         Welcome Explorer
//       </Text>

//       <Text style={styles.subtitle}>
//         Login untuk melanjutkan petualanganmu.
//       </Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         placeholderTextColor="#8A8A8A"
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         autoCorrect={false}
//         keyboardType="email-address"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         placeholderTextColor="#8A8A8A"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#FFFFFF" />
//         ) : (
//           <Text style={styles.buttonText}>
//             Login
//           </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//     backgroundColor: '#F4E7C1',
//   },

//   logo: {
//     textAlign: 'center',
//     fontSize: 14,
//     fontWeight: '800',
//     letterSpacing: 3,
//     color: '#8A6A32',
//     marginBottom: 18,
//   },

//   title: {
//     textAlign: 'center',
//     fontSize: 30,
//     fontWeight: '800',
//     color: '#172B4D',
//   },

//   subtitle: {
//     textAlign: 'center',
//     marginTop: 10,
//     marginBottom: 30,
//     color: '#172B4D',
//   },

//   input: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     marginBottom: 12,
//     fontSize: 16,
//   },

//   button: {
//     marginTop: 8,
//     backgroundColor: '#172B4D',
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: 'center',
//   },

//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });

import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SAVANA QUEST</Text>
      <Text style={styles.subtitle}>Login Test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4E7C1',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172B4D',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#172B4D',
  },
});