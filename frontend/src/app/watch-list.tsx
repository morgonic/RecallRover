// Watch List screen

import { Text, View, StyleSheet, Modal, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { styles } from './styles';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { deleteToken, getGuest, getToken, setGuest } from './storage';
import { GuestAuthModal } from '../../components/GuestAuthModal';
import { WatchedProductInput, WatchedProductRead } from '../../types/watched-products';
import { WatchedProductModal } from '../../components/WatchedProductModal';
import { NavBar } from '../../components/NavBar';

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function WatchListScreen() {
    
    const [checkingAuth, setCheckingAuth] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    const [error, setError] = useState<string | null>(null)

    const [guestAuthModalVisible, setGuestAuthModalVisible] = useState(false)
    const [watchedProductModalVisible, setWatchedProductModalVisible] = useState(false)

    const [watchedProducts, setWatchedProducts] = useState<WatchedProductRead[]>([])
    const [productEditing, setProductEditing] = useState<WatchedProductRead>()

    const statusLabelColor: Record<string, string> = {
        'Watching': '#09861e',
        'Recalled': '#860909',
        'Possible Recall': '#867e09'
    }

    async function onLogOut() {
        await deleteToken();
        setLoggedIn(false);
        router.replace('/login');
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

    async function removeWatchedProduct(product_id: number) {
        const authToken = await getToken()
        if (authToken) {
            try {
                const response = await fetch(`${API_URL}/watched-products/${product_id}`, {
                    method: 'DELETE',
                    headers: {'Authorization': `Bearer ${authToken}`}
                })

                const json = await response.json()

                if (!response.ok) {
                    setError((json.detail).toString())
                }
                else {
                    getWatchedProducts((authToken)!.toString())
                }
            }
            catch (e: any) {
                console.error(e.message)
                setError(e.message)
            }
        }
        else {
            setLoggedIn(false)
            setGuestAuthModalVisible(true)
        }
    }

    async function editWatchedProduct(product_id: number, edits: WatchedProductInput) {
        const authToken = await getToken()
        if (authToken) {
            try {
                const response = await fetch(`${API_URL}/watched-products/${product_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(edits)
                })

                const json = await response.json()

                if (!response.ok) {
                    setError((json.detail).toString())
                }
                else {
                    getWatchedProducts((authToken)!.toString())
                    setWatchedProductModalVisible(false)
                }
            }
            catch (e: any) {
                console.error(e.message)
                setError(e.message)
            }
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
            <NavBar loggedIn={loggedIn}/>
            <Text style={styles.title}>Watch List</Text>
            <View style={{height: 14}}/>
            <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>

            {(checkingAuth && !loggedIn) ? (
                <ActivityIndicator size='large'/>
            ) : (watchedProducts.length == 0) ? (
                <>
                <Text style={styles.subtitleText}>You are not watching any products.</Text>
                <Text style={styles.smallSubtitleText}>To watch a product, search for recalls on the Search page and press the Watch Product button when no recalls are found.</Text>
                </>
            ) : (
                <FlatList
                    data={watchedProducts}
                    numColumns={3}
                    keyExtractor={(product) => String(product.id)}
                    renderItem={({ item }) => (
                        <View style={[styles.resultsCard, {
                            alignItems: 'center'
                        }]}>
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
                            <View style={{alignItems: 'flex-start'}}>
                                <Text
                                    style={styles.watchedProductName}
                                >
                                    {item.product_name}
                                </Text>

                                <Text
                                    style={styles.watchedBrandModel}
                                >
                                    {item.product_brand}
                                </Text>
                                <Text
                                    style={styles.watchedBrandModel}
                                >
                                    {item.product_model}
                                </Text>
                            </View>
                            <View style={{
                                flexDirection: 'row', 
                                flex: 1,
                                alignItems: 'flex-end'
                            }}>
                                <Pressable
                                    style={styles.removeButton}
                                    onPress={() => removeWatchedProduct(item.id)}
                                >
                                    <Text style={styles.buttonText}>
                                        Remove
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={styles.editButton}
                                    onPress={() => {
                                        setProductEditing(item)
                                        setWatchedProductModalVisible(true)
                                    }}
                                >
                                    <Text style={styles.buttonText}>
                                        Edit
                                    </Text>
                                </Pressable>
                            </View>
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

            {productEditing && (
            <Modal
                visible={watchedProductModalVisible}
            >
                <WatchedProductModal
                    onSaveWatchedProduct={(edits) => editWatchedProduct(productEditing.id, edits)}
                    setWatchedProductModalVisible={setWatchedProductModalVisible}
                    disabled={false}
                    productName={productEditing.product_name ?? ''}
                    productBrand={productEditing.product_brand ?? ''}
                    productModel={productEditing.product_model ?? ''}
                    productUPC=''
                />
            </Modal>
            )}

        </View>
    )
}