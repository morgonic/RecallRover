// Search screen

import { FlatList, Pressable, Text, TextInput, View, Image, ActivityIndicator, Modal } from 'react-native';
import { styles } from './styles';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { deleteToken, getGuest, getToken } from "./storage";
import Ionicons from '@react-native-vector-icons/ionicons';
import { RecallSummary } from '../../types/recall';
import { WatchedProductModal } from '../../components/WatchedProductModal';
import { WatchedProductInput } from '../../types/watched-products';
import { SaveConfirmationModal } from '../../components/SaveConfirmationModal';
import { NavBar } from '../../components/NavBar';
import { GuestAuthModal } from '../../components/GuestAuthModal';

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// function for formatting the date from iso to localdatestring
function formatDate(oldDate: string) {
    let newDate = new Date(oldDate)
    return newDate.toLocaleDateString()
}

export default function SearchScreen() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    const [productName, setProductName] = useState('')
    const [productBrand, setProductBrand] = useState('')
    const [productModel, setProductModel] = useState('')

    const [results, setResults] = useState<RecallSummary[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    const [watchedProductModalVisible, setWatchedProductModalVisible] = useState(false)
    const [saveConfirmationVisible, setSaveConfirmationVisible] = useState(false)
    const [guestAuthModalVisible, setGuestAuthModalVisible] = useState(false)

    const searchDisabled = (
        (productName == '') && (productBrand == '') && (productModel == '') ||
        (loading == true)
    )
    
    // onPress fucntion for search button
    async function onSearchButton() {
        setHasSearched(false)

        const searchParams = new URLSearchParams()
        if (productName != '') {
            searchParams.append('product_name', productName)
        }
        if (productBrand != '') {
            searchParams.append('product_brand', productBrand)
        }
        if (productModel != '') {
            searchParams.append('product_model', productModel)
        }

        setLoading(true)
        setError(null)
        setResults([])

        try {
            const response = await fetch(`${API_URL}/recalls/search?${searchParams.toString()}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            })
            const json = await response.json()

            if (!response.ok) {
                setError((json.detail).toString())
            }
            else {
                setResults(json)
                setHasSearched(true)
            }
        }
        catch (e: any) {
            console.error(e.message)
            setError(e.message)
        }
        finally {
            setLoading(false)
        }
    }

    async function onSaveWatchedProduct(product: WatchedProductInput) {
        setSaving(true)
        setSaveError(null)
        const token = await getToken()
        if (!token) {
            setSaveError('Please log in to watch products.')
            setSaving(false)
            setWatchedProductModalVisible(false)
            setGuestAuthModalVisible(true)
            console.log('Guest cannot watch products.')
            return
        }
        try {
            const response = await fetch(`${API_URL}/watched-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(product)
            })

            const json = await response.json()

            if (!response.ok) {
                setSaveError((json.detail).toString())
            }
            else {
                setWatchedProductModalVisible(false)
                setSaveConfirmationVisible(true)
            }
        }
        catch (e: any) {
            console.error(e.message)
            setSaveError(e.message)
        }
        finally {
            setSaving(false)
        }
    }

    // checking if logged in to swap Log In / Log Out button
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
              }
              else {
                console.log("Token validated, user is logged in.")
                setCheckingAuth(false);
                setLoggedIn(true);
              }
            }
            catch (e: any) {
              console.log("Couldn't validate token.")
              console.error(e.message)
            }
          }
          else {
            console.log("No access token, checking if guest.")
            const isGuest = await getGuest();
            if (!isGuest) {
              console.log("Not a guest.")
              setLoggedIn(false)
            }
            else {
              setCheckingAuth(false)
              console.log("Guest has access.")
              setLoggedIn(false)
            }
          }
        }
    
        checkAuth();
    }, [])

    return (
        <View style={styles.container}>
            <NavBar loggedIn={loggedIn}/>
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
                    style={[styles.textinput, {width: 220}]}
                    onChangeText={setProductBrand}
                    value={productBrand}
                    placeholder='Brand'
                    placeholderTextColor={'grey'}
                />
                <TextInput 
                    style={[styles.textinput, {width: 220}]}
                    onChangeText={setProductModel}
                    value={productModel}
                    placeholder='Model Number'
                    placeholderTextColor={'grey'}
                />
                <Pressable
                    style={({pressed}) =>
                        [styles.searchButton,
                        {backgroundColor: searchDisabled ? '#bfc0c0' : pressed ? '#25426e' : '#4175c4'}]
                    }
                    onPress={onSearchButton}
                    disabled={searchDisabled}
                >
                    <Ionicons name='search' size={40} color='white'/>
                </Pressable>
                <Pressable
                    style={({pressed}) =>
                        [styles.searchButton,
                        {backgroundColor: pressed ? '#25426e' : '#4175c4'}]}
                    onPress={() => {}}
                >
                    <Ionicons name='barcode-outline' size={40} color='white'/>
                </Pressable>
            </View>

            <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>

            {checkingAuth? (
                <ActivityIndicator size='large'/>
            ) : (!loading && (results.length > 0)) ? (
                <FlatList
                    data={results}
                    numColumns={3}
                    keyExtractor={(recall) => String(recall.RecallID)}
                    renderItem={({item}) => (
                        <View style={styles.resultsCard}>
                            <Text 
                                style={styles.resultsTitle}
                                numberOfLines={2}
                            >
                                {item.Title}
                            </Text>
                            <Text style={styles.resultsDate}>{formatDate(item.RecallDate!!)}</Text>
                            
                            {(item.Image != null) ? (
                                <Image 
                                    style={styles.resultsImage}
                                    source={{uri: item.Image}}
                                />
                            ) : (
                                <Image 
                                    style={styles.resultsImage}
                                    source={require('../../assets/images/No_Image_Available.jpg')}
                                />
                            )}
                            
                            <Text 
                                style={styles.resultsProductName}
                                numberOfLines={1}
                            >
                                {item.ProductName}
                            </Text>
                            <Text 
                                style={styles.resultsHazard}
                                numberOfLines={3}
                            >
                                {item.Hazard}
                            </Text>
                        </View>
                    )}
                />
            ) : (loading || saving) ? (
                <ActivityIndicator size='large'/>
            ) : error ? (
                <Text style={styles.subtitleText}>Error: {error}</Text>
            ) : saveError ? (
                <Text style={styles.subtitleText}>Error: {saveError}</Text>
            ) : hasSearched? (
                <>
                <Text style={styles.subtitleText}>No recalls found</Text>
                <Pressable
                    onPress={() => setWatchedProductModalVisible(true)}
                    style={styles.watchedProductButton}
                >
                    <Text style={styles.wpButtonText}>Watch Product</Text>
                </Pressable>
                </>
            ) : (
                <Text style={styles.subtitleText}>
                    Search for recalls by name, brand, or model.
                </Text>
            )}
            <Modal
                visible={watchedProductModalVisible}
            >
                <WatchedProductModal
                    onSaveWatchedProduct={onSaveWatchedProduct}
                    setWatchedProductModalVisible={setWatchedProductModalVisible}
                    disabled={saving}
                    productName={productName}
                    productBrand={productBrand}
                    productModel={productModel}
                    productUPC=''
                />
            </Modal>

            <Modal
                visible={saveConfirmationVisible}
            >
                <SaveConfirmationModal
                    setSaveConfirmationVisible={setSaveConfirmationVisible}
                />
            </Modal>

            <Modal
                visible={guestAuthModalVisible}
            >
                <GuestAuthModal
                    setGuestAuthModalVisible={setGuestAuthModalVisible} />
            </Modal>
        </View>
    )
}