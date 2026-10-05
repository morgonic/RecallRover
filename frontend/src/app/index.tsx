import { Text, View, StyleSheet } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        <Link href="/search" style={styles.button}>
          Search
        </Link>
        <Link href="/" style={styles.button}>
          Recall Feed
        </Link>
        <Link href="/watch-list" style={styles.button}>
          Watch List
        </Link>
        <Link href="/login" style={styles.button}>
          Log In
        </Link>
      </View>

      <Text style={{marginTop: 20}}>View recalls here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    fontSize: 18,
    textDecorationLine: 'underline',
    color: '#000',
    marginTop: 20,
    marginHorizontal: 10
  },
  navigationBar: {
    flexDirection: 'row'
  }
});
