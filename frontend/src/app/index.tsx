import { Text, View, ActivityIndicator } from "react-native";
import { Link, router } from 'expo-router';
import { useEffect, useState } from "react";
import { deleteToken, getGuest, getToken } from "./storage";
import { styles } from './styles';

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
        console.log("No access token, checking if guest.")
        const isGuest = await getGuest();
        if (!isGuest) {
          console.log("Not a guest, going to login.")
          router.replace('/login')
        }
        else {
          setCheckingAuth(false)
          console.log("Guest has access.")
        }
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
            <Link href="/search" style={styles.navButton}>
              Search
            </Link>
            <Link href="/" style={styles.navButton}>
              Recall Feed
            </Link>
            <Link href="/watch-list" style={styles.navButton}>
              Watch List
            </Link>
            <Link href="/login" style={styles.navButton}>
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
