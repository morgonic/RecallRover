import { styles } from "@/app/styles"
import { useEffect, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image, StatusBar, Linking, StyleSheet } from "react-native"
import { RecallDetails } from "../types/recall";
import Ionicons from "@react-native-vector-icons/ionicons";

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

    // function for formatting the date from iso to localdatestring
    function formatDate(oldDate: string) {
        let newDate = new Date(oldDate)
        return newDate.toLocaleDateString()
    }

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
                                                style={styles.resultsImage}
                                                source={{uri: img.URL}}
                                            />
                                            <Text style={styles.detailsText}>
                                                {img.Caption}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {(recall.Description && recall.Description.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Description:
                                    </Text>
                                    <Text style={styles.detailsText}>
                                        {recall.Description}
                                    </Text>
                                </>
                            )}
                            {(recall.Products && recall.Products.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Product Names:
                                    </Text>
                                    {recall.Products.map((product, index) => (
                                        <Text 
                                            key={index} 
                                            style={styles.detailsText}
                                        >
                                            {product.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {productsWithModels.length > 0 && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Models:
                                    </Text>
                                    {productsWithModels.map((product, index) => (
                                        <Text 
                                            key={index} 
                                            style={styles.detailsText}
                                        >
                                            {product.Model}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.ProductUPCs && recall.ProductUPCs.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Barcode Numbers:
                                    </Text>
                                    {recall.ProductUPCs.map((upc, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {upc.UPC}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.Hazards && recall.Hazards.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Hazards:
                                    </Text>
                                    {recall.Hazards.map((hazard, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {hazard.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.Injuries && recall.Injuries.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Injuries:
                                    </Text>
                                    {recall.Injuries.map((injury, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {injury.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.Remedies && recall.Remedies.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Remedies:
                                    </Text>
                                    {recall.Remedies.map((remedy, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {remedy.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.RemedyOptions && recall.RemedyOptions.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Remedy Options:
                                    </Text>
                                    {recall.RemedyOptions.map((option, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {option.Option}
                                        </Text>
                                    ))}
                                </>
                            )}
                            
                            {recall.ConsumerContact && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Consumer Contact:
                                    </Text>
                                    <Text style={styles.detailsText}>
                                        {recall.ConsumerContact}
                                    </Text>
                                </>
                            )}
                            {(recall.Manufacturers && recall.Manufacturers.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Manufacturers:
                                    </Text>
                                    {recall.Manufacturers.map((manuf, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {manuf.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.Retailers && recall.Retailers.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Retailers:
                                    </Text>
                                    {recall.Retailers.map((retailer, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {retailer.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.Importers && recall.Importers.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Importers:
                                    </Text>
                                    {recall.Importers.map((importer, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {importer.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
                            {(recall.Distributors && recall.Distributors.length > 0) && (
                                <>
                                    <Text style={styles.detailsHeader}>
                                        Distributors:
                                    </Text>
                                    {recall.Distributors.map((dist, index) => (
                                        <Text
                                            key={index}
                                            style={styles.detailsText}
                                        >
                                            {dist.Name}
                                        </Text>
                                    ))}
                                </>
                            )}
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