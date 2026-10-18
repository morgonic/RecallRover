// barcode scanner camera view

import { styles } from "@/app/styles"
import Ionicons from "@react-native-vector-icons/ionicons"
import { useEffect, useRef } from "react"
import { Pressable, View, Text } from "react-native"

interface BarcodeScannerProps {
    cameraStream: MediaStream | null
    onClose: () => void
}

export function BarcodeScannerModal(props: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current != null) {
            videoRef.current.srcObject = props.cameraStream
        }
    }, [props.cameraStream])

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modal}>
                <Pressable 
                    style={{alignSelf: 'flex-start'}}
                    onPress={props.onClose}
                >
                    <Ionicons name='close' size={40}/>
                </Pressable>
                <Text style={[styles.title, {textAlign: 'center'}]}>
                    Barcode Scan
                </Text>
                <Text style={[styles.smallSubtitleText, {textAlign: 'center', marginTop: 0}]}>
                    Scan a product's barcode to search.
                </Text>
                <video
                    style={{
                        width: '80%', 
                        maxWidth: 500, 
                        height: '80%', 
                        maxHeight: 500,
                        alignSelf: 'center',
                        marginBottom: 20
                    }}
                    autoPlay={true} 
                    playsInline={true} 
                    muted={true}
                    ref={videoRef}
                />

                <Pressable
                    style={({pressed}) =>
                        [styles.captureButton,
                        {
                            backgroundColor: pressed ? '#25426e' : '#4175c4',
                            borderColor: pressed ? '#4175c4' : '#25426e',
                            alignSelf: 'center'
                        }]
                    }
                    onPress={() => {}}
                >
                    <Ionicons 
                        name='camera-outline'
                        size={50}
                        style={{alignSelf: 'center'}}
                        color='white'
                    />
                </Pressable>
                
            </View>
        </View>
    )
}