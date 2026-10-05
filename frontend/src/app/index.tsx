import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { Link, router } from 'expo-router';
import { useEffect, useState } from "react";
import { deleteToken, getToken } from "./storage";

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Index() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (token) {
        try {
          console.log("Validating token.")
          const response = await fetch(`${API_URL}/users/me`, {
          headers: {'Authorization': `Bearer ${token}` }
          })
          if (!response.ok) {
            await deleteToken();
            router.replace('/login')
          }
          else {
            console.log("Token validated, logging in.")
            setCheckingAuth(false);
            setLoggedIn(true);
          }
        }
        catch (e: any) {
          console.log("Couldn't validate token.")
          console.error(e.message)
          router.replace('/login')
        }
      }
      else {
        console.log("No access token, going back to login.")
        router.replace('/login')
      }
    }

    checkAuth();
  }, [])

  return (
    <View style={styles.container}>
      {checkingAuth ? (
        <ActivityIndicator size='large' />
      ) : (
        <>
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
              {loggedIn }
              Log In
            </Link>
          </View>

          <Text style={{marginTop: 20}}>View recalls here.</Text>
        </>
      )}
      
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
