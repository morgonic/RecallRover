// Search screen

import { FlatList, Pressable, Text, TextInput, View, Image, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import { styles } from './styles';
import { useEffect, useState } from 'react';
import { deleteToken, getGuest, getToken } from "./storage";
import Ionicons from '@react-native-vector-icons/ionicons';
import { RecallSummary } from '../../types/recall';
import { WatchedProductModal } from '../../components/WatchedProductModal';
import { WatchedProductInput } from '../../types/watched-products';
import { SaveConfirmationModal } from '../../components/SaveConfirmationModal';
import { NavBar } from '../../components/NavBar';
import { GuestAuthModal } from '../../components/GuestAuthModal';
import { RecallDetailsModal } from '../../components/RecallDetailsModal';
import { BarcodeScannerModal } from '../../components/BarcodeScannerModal';

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

    const windowWidth = useWindowDimensions().width

    // change flatlist numcolumns based on window width (cards are 300 width)
    const numberOfColumns = (
        (windowWidth <= 900) ? 2 :
        (windowWidth <= 1200) ? 3 : 
        (windowWidth <= 1500) ? 4 : 
        (windowWidth <= 1800) ? 5 : 
        6
    )

    const [productName, setProductName] = useState('')
    const [productBrand, setProductBrand] = useState('')
    const [productModel, setProductModel] = useState('')
    const [productUpc, setProductUpc] = useState('')

    const [results, setResults] = useState<RecallSummary[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    const [watchedProductModalVisible, setWatchedProductModalVisible] = useState(false)
    const [saveConfirmationVisible, setSaveConfirmationVisible] = useState(false)
    const [guestAuthModalVisible, setGuestAuthModalVisible] = useState(false)
    const [recallDetailsModalVisible, setRecallDetailsModalVisible] = useState(false)

    const [selectedRecall, setSelectedRecall] = useState<number | null>(null)

    const [cameraAccessMessage, setCameraAccessMessage] = useState<string | null>(null)
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
    const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false)

    const searchDisabled = (
        (productName == '') && (productBrand == '') && (productModel == '') ||
        (loading == true)
    )
    
    // onPress fucntion for search button
    async function onSearchButton() {
        setHasSearched(false)
        setCameraAccessMessage(null)

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

    async function onSearchByUPC(upc: string) {
        // close the barcode scanner modal and camera first
        onCloseBarcodeScanner()
        // start loading
        setLoading(true)
        // reset other states
        setError(null)
        setResults([])
        setHasSearched(false)

        // call upc search endpoint
        try {
            const response = await fetch(`${API_URL}/recalls/search/${upc}`)

            const json = await response.json()

            if (!response.ok) {
                setError((json.detail).toString())
            }
            else {
                setResults(json)
                setHasSearched(true)
                setProductUpc(upc)
            }
        }
        catch (e: any) {
            console.error(e.message)
            setError(e.message)
        }
        finally {
            // stop loading
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

    async function onScanBarcode() {
        // check for camera support
        if (navigator.mediaDevices == undefined) {
            setCameraAccessMessage('Camera not available on this device. Please search manually.')
            return
        }

        try {
            // request the back facing camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {facingMode: 'environment'}
            })
            // store the stream
            setCameraStream(stream)
            // reset access message
            setCameraAccessMessage(null)
            // show the scanner
            setBarcodeScannerVisible(true)
        }
        catch (e: any) {
            // set NotAllowedError message
            if (e.name == 'NotAllowedError') {
                setCameraAccessMessage('Camera access was denied. Please allow access or search manually.')
            }
            // set NotFoundError message
            else if (e.name == 'NotFoundError') {
                setCameraAccessMessage('Could not find the camera. Please search manually.')
            }
            // set generic error message
            else {
                setCameraAccessMessage('Failed to access camera. Please search manually.')
            }
        }
    }

    // function to call when closing barcode scanner
    function onCloseBarcodeScanner() {
        // get video tracks from camera stream
        const cameraStreamTracks = cameraStream?.getTracks() ?? []
        // stop each one to free up resources
        for (const track of cameraStreamTracks) {
            track.stop()
        }
        // close the modal
        setBarcodeScannerVisible(false)
        // set the stream to null
        setCameraStream(null)
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
            <NavBar 
                loggedIn={loggedIn} 
                onGuestWatchList={() => setGuestAuthModalVisible(true)}
            />
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
                    onPress={onScanBarcode}
                >
                    <Ionicons name='barcode-outline' size={40} color='white'/>
                </Pressable>
            </View>

            {/*camera access message*/}
            {cameraAccessMessage && (
                <Text style={{fontSize: 14, color: '#b10000', marginTop: 10}}>
                    {cameraAccessMessage}
                </Text>
            )}

            <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>

            {checkingAuth? (
                <ActivityIndicator size='large'/>
            ) : (!loading && (results.length > 0)) ? (
                <FlatList
                    data={results}
                    numColumns={numberOfColumns}
                    columnWrapperStyle={{justifyContent: 'center'}}
                    key={numberOfColumns.toString()}
                    keyExtractor={(recall) => String(recall.RecallID)}
                    renderItem={({item}) => (
                        <Pressable 
                            style={styles.resultsCard}
                            onPress={() => {
                                setSelectedRecall(item.RecallID)
                                setRecallDetailsModalVisible(true)
                            }}
                        >
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
                        </Pressable>
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
                transparent={true}
            >
                <WatchedProductModal
                    onSaveWatchedProduct={onSaveWatchedProduct}
                    setWatchedProductModalVisible={setWatchedProductModalVisible}
                    disabled={saving}
                    productName={productName}
                    productBrand={productBrand}
                    productModel={productModel}
                    productUPC={productUpc}
                />
            </Modal>

            <Modal
                visible={saveConfirmationVisible}
                transparent={true}
            >
                <SaveConfirmationModal
                    setSaveConfirmationVisible={setSaveConfirmationVisible}
                />
            </Modal>

            <Modal
                visible={guestAuthModalVisible}
                transparent={true}
            >
                <GuestAuthModal
                    setGuestAuthModalVisible={setGuestAuthModalVisible} />
            </Modal>

            <Modal
                visible={recallDetailsModalVisible}
                transparent={true}
            >
                <RecallDetailsModal
                    setRecallDetailsModalVisible={setRecallDetailsModalVisible} 
                    recallID={selectedRecall}
                />
            </Modal>

            <Modal
                visible={barcodeScannerVisible}
                transparent={true}
            >
                <BarcodeScannerModal
                    cameraStream={cameraStream}
                    onClose={onCloseBarcodeScanner}
                    onBarcodeScanned={onSearchByUPC}
                />
            </Modal>
        </View>
    )
}