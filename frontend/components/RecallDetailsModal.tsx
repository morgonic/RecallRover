import { styles } from "@/app/styles"
import { useEffect, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image, StatusBar, Linking, StyleSheet } from "react-native"
import { RecallDetails } from "../types/recall";
import Ionicons from "@react-native-vector-icons/ionicons";
import { RecallDetailsSection } from "./RecallDetailsSection";
import { formatDate } from '../utils/helpers'

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;


interface RecallDetailsModalProps {
    setRecallDetailsModalVisible: (value: boolean) => void
    recallID: number | null
}

export function RecallDetailsModal(props: RecallDetailsModalProps) {
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [recall, setRecall] = useState<RecallDetails | null>(null)


    useEffect(() => {
        if (props.recallID == null) {
            return
        }
        
        const loadDetails = async () => {
            setLoading(true)
            setError(null)
            setRecall(null)
            try {
                const response = await fetch(`${API_URL}/recalls/${props.recallID}`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })

                if (response.status == 404) {
                    setError('Recall not found.')
                }
                else if (!response.ok) {
                    setError('Couldn\'t load this recall. Please try again.')
                }
                else {
                    const json = await response.json()
                    setRecall(json)
                }
                
            }
            catch (e: any) {
                setError(e.message)
                console.log('Error', e.message)
            }
            finally {
                setLoading(false)
            }
        }

        loadDetails()
        
    }, [props.recallID])

    const productsWithModels = (recall?.Products ?? []).filter((product) => product.Model)

    return (
            <View style={styles.modalContainer}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => props.setRecallDetailsModalVisible(false)}/>
                <View style={[styles.modal, {
                        width: '80%',
                        maxHeight: '80%',
                        maxWidth: 900
                }]}>
                    <Pressable 
                        style={{alignSelf: 'flex-start'}}
                        onPress={() => props.setRecallDetailsModalVisible(false)}
                    >
                        <Ionicons name='close' size={40}/>
                    </Pressable>
                    <ScrollView>
                        <Text style={styles.detailsTitle}>
                            Recall Details
                        </Text>
                        <View style={{
                            height: 2, 
                            width: '80%', 
                            backgroundColor: 'black', 
                            marginVertical: 14,
                            alignSelf: 'center'
                        }}/>
                        {loading ? (
                            <ActivityIndicator size='large'/>
                        ) : error ? (
                            <Text style={styles.detailsText}>{error}</Text>
                        ) : recall ? (
                            <>
                            <Text style={styles.recallTitle}>
                                {recall.Title}
                            </Text>
                            {recall.RecallDate && (
                                <Text style={[styles.detailsText, {marginTop: 10, marginBottom: 0}]}>
                                    {formatDate(recall.RecallDate)}
                                </Text>
                            )}
                            {(recall.Images && recall.Images.length > 0) && (
                                <View style={{
                                    flexDirection: 'row', 
                                    flexWrap: 'wrap', 
                                    justifyContent: 'center',
                                    gap: 10
                                }}>
                                    {recall.Images.map((img, index) => (
                                        <View 
                                            key={index}
                                            style={{
                                                flexDirection: 'column', 
                                                alignItems: 'center',
                                                width: '30%'
                                            }}
                                        >
                                            <Image
                                                style={styles.detailsImage}
                                                source={{uri: img.URL}}
                                            />
                                            <Text style={styles.detailsText}>
                                                {img.Caption}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <RecallDetailsSection 
                                heading='Description' 
                                details={[recall.Description]}                                
                            />
                            <RecallDetailsSection 
                                heading='Product Names' 
                                details={recall.Products?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Models' 
                                details={productsWithModels?.map((i) => i.Model)}                                
                            />
                            <RecallDetailsSection 
                                heading='Hazards' 
                                details={recall.Hazards?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Injuries' 
                                details={recall.Injuries?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Remedies' 
                                details={recall.Remedies?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Remedy Options' 
                                details={recall.RemedyOptions?.map((i) => i.Option)}                                
                            />
                            <RecallDetailsSection 
                                heading='Consumer Contact' 
                                details={[recall.ConsumerContact]}                                
                            />
                            <RecallDetailsSection 
                                heading='Manufacturers' 
                                details={recall.Manufacturers?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Retailers' 
                                details={recall.Retailers?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Importers' 
                                details={recall.Importers?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Distributors' 
                                details={recall.Distributors?.map((i) => i.Name)}                                
                            />
                            <RecallDetailsSection 
                                heading='Barcode Numbers' 
                                details={recall.ProductUPCs?.map((i) => i.UPC)}                                
                            />
                            {recall.URL && (
                                <Pressable
                                    onPress={() => {
                                        if (recall.URL != null) {
                                            Linking.openURL(recall.URL)
                                        }
                                    }}
                                >
                                    <Text style={styles.textLink}>
                                        Source: Official CPSC Recall Notice
                                    </Text>
                                </Pressable>
                            )}
                            
                            </>
                        ) : (
                            <></>
                        )}
                    </ScrollView>
                </View>
            </View>
    )
}