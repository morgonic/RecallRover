// Watch List screen

import { Text, View, StyleSheet, Modal, ActivityIndicator, FlatList } from 'react-native';
import { styles } from './styles';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { deleteToken, getGuest, getToken, setGuest } from './storage';
import { GuestAuthModal } from '../../components/GuestAuthModal';
import { WatchedProductRead } from '../../types/watched-products';

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function WatchListScreen() {
    
    const [checkingAuth, setCheckingAuth] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    const [error, setError] = useState<string | null>(null)

    const [guestAuthModalVisible, setGuestAuthModalVisible] = useState(false)

    const [watchedProducts, setWatchedProducts] = useState<WatchedProductRead[]>([])

    const statusLabelColor: Record<string, string> = {
        'Watching': '#09861e',
        'Recalled': '#860909',
        'Possible Recall': '#867e09'
    }

    async function getWatchedProducts(authToken: string) {
        try {
            const response = await fetch(`${API_URL}/watched-products`, {
                headers: {'Authorization': `Bearer ${authToken}`}
            })

            const json = await response.json()

            if (!response.ok) {
                setError((json.detail).toString())
            }
            else {
                setWatchedProducts(json)
            }
        }
        catch (e: any) {
            console.error(e.message)
            setError(e.message)
        }
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
                        setLoggedIn(false);
                        setGuestAuthModalVisible(true);
                    }
                    else {
                        console.log("Token validated, user is logged in.")
                        setCheckingAuth(false);
                        setLoggedIn(true);
                        getWatchedProducts(token);
                    }
                }
                catch (e: any) {
                    console.log("Couldn't validate token.")
                    console.error(e.message)
                    setGuestAuthModalVisible(true)
                }
            }
            else {
            console.log("No access token, checking if guest.")
            const isGuest = await getGuest();
            if (!isGuest) {
                console.log("Not a guest.")
                setLoggedIn(false)
                setGuestAuthModalVisible(true)
            }
            else {
                setCheckingAuth(false)
                console.log("Guest cannot have access to Watch List.")
                setLoggedIn(false)
                setGuestAuthModalVisible(true)
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
            <Text style={styles.title}>Watch List</Text>
            <View style={{height: 14}}/>
            <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>

            {(checkingAuth && !loggedIn) ? (
                <ActivityIndicator size='large'/>
            ) : (
                <FlatList
                    data={watchedProducts}
                    numColumns={3}
                    keyExtractor={(product) => String(product.id)}
                    renderItem={({ item }) => (
                        <View style={styles.resultsCard}>
                            <View style={{alignSelf: 'flex-end'}}>
                                <View style={[styles.statusLabel, {
                                    borderColor: statusLabelColor[item.status_label],
                                    backgroundColor: `${statusLabelColor[item.status_label]}50`
                                }]}>
                                    <Text style={styles.statusLabelText}>
                                        {item.status_label}
                                    </Text>
                                </View>
                            </View>
                            <Text
                                style={styles.resultsProductName}
                            >
                                {item.product_name}
                            </Text>

                            <Text
                                style={styles.resultsProductName}
                            >
                                {item.product_brand}
                            </Text>
                            <Text
                                style={styles.resultsProductName}
                            >
                                {item.product_model}
                            </Text>
                        </View>
                    )} 
                />
            )}

            <Modal
                visible={guestAuthModalVisible}
            >
                <GuestAuthModal
                    setGuestAuthModalVisible={setGuestAuthModalVisible} />
            </Modal>

        </View>
    )
}