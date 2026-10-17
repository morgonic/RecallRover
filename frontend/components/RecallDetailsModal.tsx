import { styles } from "@/app/styles"
import { useState } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"


interface RecallDetailsModalProps {
    setRecallDetailsModalVisible: (value: boolean) => void
    recallID: number | null
}

export function RecallDetailsModal(props: RecallDetailsModalProps) {
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    return (
            <View style={styles.modalContainer}>
                <ScrollView style={styles.modal}>
                    <Text style={styles.title}>
                        Recall Details
                    </Text>
                    {loading ? (
                        <ActivityIndicator size='large'/>
                    ) : (
                        <></>
                    )}
                    {error ? (
                        <Text style={styles.subtitleText}>{error}</Text>
                    ) : (
                        <></>
                    )}
                </ScrollView>
            </View>
    )
}