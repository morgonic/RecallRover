import { Text, View, ActivityIndicator, Pressable } from "react-native";
import { Link, router } from 'expo-router';
import { useEffect, useState } from "react";
import { deleteToken, getGuest, getToken } from "./storage";
import { styles } from './styles';
import { NavBar } from "../../components/NavBar";

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Index() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  async function onLogOut() {
      await deleteToken();
      setLoggedIn(false);
      router.replace('/login');
  }

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
        <NavBar loggedIn={loggedIn} />
        <Text style={styles.title}>Recall Feed</Text>
        <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>
        </>
      )}
      
    </View>
  );
}
