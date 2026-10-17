import { Text, View, ActivityIndicator, Modal, FlatList, Pressable, Image } from "react-native";
import { router } from 'expo-router';
import { useEffect, useState } from "react";
import { deleteToken, getGuest, getToken } from "./storage";
import { styles } from './styles';
import { NavBar } from "../../components/NavBar";
import { GuestAuthModal } from "../../components/GuestAuthModal";
import { RecallSummary } from "../../types/recall";
import { RecallDetailsModal } from "../../components/RecallDetailsModal";

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Index() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true)

  const [recalls, setRecalls] = useState<RecallSummary[]>([])
  const [selectedRecall, setSelectedRecall] = useState<number | null>(null)

  const [guestAuthModalVisible, setGuestAuthModalVisible] = useState(false);
  const [recallDetailsModalVisible, setRecallDetailsModalVisible] = useState(false);

  // function for formatting the date from iso to localdatestring
  function formatDate(oldDate: string) {
      let newDate = new Date(oldDate)
      return newDate.toLocaleDateString()
  }

  // function to load the recall feed using offset
  const loadFeed = async (offset: number) => {
    setError(null)

    // if the offset is the default 0, loadingFeed is true
    if (offset == 0) {
      setLoadingFeed(true)
    }
    // if not, it is loadingMore
    else {
      setLoadingMore(true)
    }
    
    // call the GET endpoint for recall feed using offset
    try {
        const response = await fetch(`${API_URL}/recalls/feed?offset=${offset}`)

        // set error if bad response
        if (!response.ok) {
          setError('Couldn\'t load recalls. Please try again.')
        }
        else {
          const json = await response.json()
          // if offset is the default 0 then setRecalls using the json response
          if (offset == 0) {
            setRecalls(json)
          }
          // if not, more has been loaded, so append the new json response to the old one
          // to make it a continuous scrollable list
          else {
            setRecalls(prev => [...prev, ...json])
          }
          // if the new json response is less than 20 recalls, it loaded the last
          // of the recalls that were in the db
          if (json.length < 20) {
            // so it does not have any more to be loaded
            setHasMore(false)
          }
        }
      }
      catch (e: any) {
        setError(e.message)
        console.log('Error', e.message)
      }
      finally {
        setLoadingFeed(false)
        setLoadingMore(false)
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

  useEffect(() => {
    loadFeed(0)
  }, [])



  return (
    <View style={styles.container}>
      {checkingAuth ? (
        <ActivityIndicator size='large' />
      ) : (
        <>
        <NavBar loggedIn={loggedIn} onGuestWatchList={() => setGuestAuthModalVisible(true)} />
        <Text style={styles.title}>Recall Feed</Text>
        <View style={{height: 14}}/>
        <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>
        
        {loadingFeed ? (
          <ActivityIndicator size='large'/>
        ) : error ? (
          <Text style={styles.subtitleText}>
            {error}
          </Text>
        ) : (recalls.length == 0) ? (
          <Text style={styles.subtitleText}>
            No recalls yet.
          </Text>
        ) : (
          <FlatList
            data={recalls}
            numColumns={3}
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
            ListFooterComponent={(
              <View style={styles.loadMoreView}>
                {loadingMore ? (
                  <ActivityIndicator size='large'/>
                ) : hasMore ? (
                  <Pressable
                    style={styles.detailsButton}
                    onPress={() => {
                      loadFeed(recalls.length)
                    }}
                    disabled={loadingMore}
                  >
                    <Text style={styles.detailsButtonText}>
                      Load More
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={styles.subtitleText}>
                    You have reached the end of the Recall Feed.
                  </Text>
                )}
              </View>
            )}
          />
        )}


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
        </>
      )}
      
    </View>
  );
}
