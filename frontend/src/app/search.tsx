// Search screen

import { Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './styles';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { deleteToken, getGuest, getToken } from "./storage";
import Ionicons from '@react-native-vector-icons/ionicons';

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SearchScreen() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    const [productName, setProductName] = useState('')
    const [productBrand, setProductBrand] = useState('')
    const [productModel, setProductModel] = useState('')
    
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
                    Log In
                </Link>
            </View>
            <Text style={styles.title}>Search Recalls</Text>
            <View style={{height: 14}}/>
            <View style={{flexDirection: 'row'}}>
                <TextInput 
                    style={styles.textinput}
                    onChangeText={setProductName}
                    value={productName}
                    placeholder='Product Name'
                    placeholderTextColor={'grey'}
                />
                <TextInput 
                    style={[styles.textinput, {width: 240}]}
                    onChangeText={setProductBrand}
                    value={productBrand}
                    placeholder='Brand'
                    placeholderTextColor={'grey'}
                />
                <TextInput 
                    style={[styles.textinput, {width: 240}]}
                    onChangeText={setProductModel}
                    value={productModel}
                    placeholder='Model Number'
                    placeholderTextColor={'grey'}
                />
                <Pressable
                    style={styles.searchButton}
                    onPress={() => {}}
                >
                    <Ionicons name='search' size={40} color='white'/>
                </Pressable>
                <Pressable
                    style={styles.searchButton}
                    onPress={() => {}}
                >
                    <Ionicons name='barcode-outline' size={40} color='white'/>
                </Pressable>
            </View>
            <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>
        </View>
    )
}