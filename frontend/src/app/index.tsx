import { Text, View, ActivityIndicator, Modal, FlatList, Pressable, Image } from "react-native";
import { router } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { deleteToken, getGuest, getToken } from "./storage";
import { styles } from './styles';
import { NavBar } from "../../components/NavBar";
import { GuestAuthModal } from "../../components/GuestAuthModal";
import { RecallSummary } from "../../types/recall";
import { RecallDetailsModal } from "../../components/RecallDetailsModal";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Dropdown } from 'react-native-element-dropdown'
import { Category } from '../../types/recall'
import { FlatListColumns } from "../../components/FlatListColumns";

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Index() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const numberOfColumns = FlatListColumns()

  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true)

  const [recalls, setRecalls] = useState<RecallSummary[]>([])
  const [selectedRecall, setSelectedRecall] = useState<number | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredCategory, setFilteredCategory] = useState<string | null>(null)

  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [filteredStartDate, setFilteredStartDate] = useState<string | null>(null)
  const [filteredEndDate, setFilteredEndDate] = useState<string | null>(null)
  const startDateInput = useRef<HTMLInputElement>(null)
  const endDateInput = useRef<HTMLInputElement>(null)

  const [guestAuthModalVisible, setGuestAuthModalVisible] = useState(false);
  const [recallDetailsModalVisible, setRecallDetailsModalVisible] = useState(false);

  // function for formatting the date from iso to localdatestring
  function formatDate(oldDate: string) {
    let newDate = new Date(oldDate)
    return newDate.toLocaleDateString()
  }

  // function for formatting start/end date strings
  function formatFilterDate(filterDate: string) {
    // split up by -
    const dateParts = filterDate.split('-')
    // put split up parts in array
    const [year, month, day] = dateParts
    // format as month/day/year
    const formattedDate = `${month}/${day}/${year}`
    return formattedDate
  }

  // function to load the recall feed using offset
  const loadFeed = async (
    offset: number, 
    category_id: string | null, 
    start_date: string | null, 
    end_date: string | null
  ) => {
    setError(null)

    // if the offset is the default 0, loadingFeed is true, db hasMore recalls to load
    if (offset == 0) {
      setLoadingFeed(true)
      setHasMore(true)
    }
    // if not, it is loadingMore
    else {
      setLoadingMore(true)
    }
    
    // call the GET endpoint for recall feed using offset and filters
    try {
        //base url
        const fetchUrl = `${API_URL}/recalls/feed`
        // use URLSearchParams to build endpoint params
        const searchParams = new URLSearchParams()
        // always use offset
        searchParams.append('offset', offset.toString())
        // append category_id if applied
        if (category_id != null) {
          searchParams.append('category_id', category_id)
        }
        // append start_date if applied
        if (start_date != null) {
          searchParams.append('start_date', start_date)
        }
        // append end_date if applied
        if (end_date != null) {
          searchParams.append('end_date', end_date)
        }
        // call fetch with all params
        const response = await fetch(`${fetchUrl}?${searchParams.toString()}`)

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

  // function to call for Apply Filters button
  const applyFilters = async () => {
    setFilteredCategory(selectedCategory)
    setFilteredStartDate(startDate)
    setFilteredEndDate(endDate)
    loadFeed(0, selectedCategory, startDate, endDate)
  }

  // function to call for Clear Filters button
  const clearFilters = async () => {
    setFilteredCategory(null)
    setSelectedCategory(null)
    setStartDate(null)
    setFilteredStartDate(null)
    setEndDate(null)
    setFilteredEndDate(null)
    loadFeed(0, null, null, null)
  }

  // load categories from db
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/recalls/feed/categories`)

        if (!response.ok) {
          console.log('Could not fetch categories from DB.')
        }
        else {
          const json = await response.json()
          setCategories(json)
        }
      }
      catch (e: any) {
        console.error(e.message)
      }
    }

    loadCategories()
  }, [])

  // check user auth
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
    loadFeed(0, null, null, null)
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

        <View style={{flexDirection: 'row'}}>
          {/*category filter*/}
          <Dropdown
            style={styles.filterButton}
            autoScroll={false}
            labelField='product_type'
            valueField='category_id'
            data={categories}
            value={selectedCategory}
            onChange={(item) => setSelectedCategory(item.category_id)}
            placeholder='Category'
            placeholderStyle={styles.filterButtonText}
            selectedTextStyle={styles.filterButtonText}
            selectedTextProps={{numberOfLines: 1}}
            renderRightIcon={() => (
              <Ionicons 
                name='filter'
                size={20} 
                style={{alignSelf: 'center', marginLeft: 10}}
                color='white'
              />
            )}
          />

          {/*date range start date filter*/}
          <View style={{position: 'relative'}}>
            <Pressable
              style={styles.filterButton}
              onPress={() => startDateInput.current?.showPicker()}
            >
              <Text style={styles.filterButtonText}>
                {startDate ? formatFilterDate(startDate) : 'Start Date'}
                <Ionicons 
                  name='filter'
                  size={20} 
                  style={{alignSelf: 'center', marginLeft: 10}}
                  color='white'
                />
              </Text>
            </Pressable>
            <input
              type='date'
              ref={startDateInput}
              value={startDate ?? ''}
              onChange={(e) => setStartDate(e.target.value || null)}
              style={{
                opacity: 0,
                position: 'absolute',
                pointerEvents: 'none'
              }}
              max={endDate ?? ''}
            />
          </View>

          {/*date range end date filter*/}
          <View style={{position: 'relative'}}>
            <Pressable
              style={styles.filterButton}
              onPress={() => endDateInput.current?.showPicker()}
            >
              <Text style={styles.filterButtonText}>
                {endDate ? formatFilterDate(endDate) : 'End Date'}
                <Ionicons 
                  name='filter'
                  size={20} 
                  style={{alignSelf: 'center', marginLeft: 10}}
                  color='white'
                />
              </Text>
            </Pressable>
            <input
              type='date'
              ref={endDateInput}
              value={endDate ?? ''}
              onChange={(e) => setEndDate(e.target.value || null)}
              style={{
                opacity: 0, 
                position: 'absolute', 
                pointerEvents: 'none'
              }}
              min={startDate ?? ''}
            />
          </View>

          <Pressable
            style={styles.applyFilterButton}
            onPress={applyFilters}
          >
            <Text style={styles.detailsButtonText}>
              Apply Filters
            </Text>
          </Pressable>

          <Pressable
            style={styles.applyFilterButton}
            onPress={clearFilters}
          >
            <Text style={styles.detailsButtonText}>
              Clear Filters
            </Text>
          </Pressable>
        </View>

        <View style={{height: 2, width: '80%', backgroundColor: 'black', marginVertical: 14}}/>
        
        {loadingFeed ? (
          <ActivityIndicator size='large'/>
        ) : error ? (
          <Text style={styles.subtitleText}>
            {error}
          </Text>
        ) : (recalls.length == 0) ? (
          <>
          <Text style={styles.subtitleText}>
            No recalls found.
          </Text>
          {(filteredCategory || filteredStartDate || filteredEndDate) && (
            <Text style={styles.subtitleText}>
              Please clear the filters.
            </Text>
          )}
          </>
        ) : (
          <FlatList
            data={recalls}
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
                  <Text style={styles.viewMoreText}>
                      Click to view more details.
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
                    onPress={() => loadFeed(recalls.length, filteredCategory, filteredStartDate, filteredEndDate)}
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
