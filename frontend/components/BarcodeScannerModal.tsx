// barcode scanner camera view

import { styles } from "@/app/styles"
import Ionicons from "@react-native-vector-icons/ionicons"
import { useEffect, useRef, useState } from "react"
import { Pressable, View, Text, Image } from "react-native"
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType } from '@zxing/library'

interface BarcodeScannerProps {
    cameraStream: MediaStream | null
    onClose: () => void
    onBarcodeScanned: (upc: string) => void
}

export function BarcodeScannerModal(props: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // function called when image capture button is pressed
    async function onCaptureBarcodeImage() {
        // get the <video> element from useRef
        const video = videoRef.current
        // create new canvas element
        const canvas = document.createElement('canvas')
        // get 2d drawing context
        const context = canvas.getContext('2d')
        // hints for BrowserMultiFormatReader
        const hints = new Map()
        // add TRY_HARDER decode hint to make it inspect deeper for barcode
        hints.set(DecodeHintType.TRY_HARDER, true)
        // create barcode reader
        const codeReader = new BrowserMultiFormatReader(hints)
        // if video and context exist
        if (video && context) {
            // set canvas dimensions with video dimensions
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            // draw image onto canvas from video
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            // convert image to data url
            const image = canvas.toDataURL('image/png')
            // save image data url to state
            setCapturedImage(image)
            try {
                // decode upc
                const scannedCode = await codeReader.decodeFromImageUrl(image)
                const codeString = scannedCode.getText()
                // call prop function using decoded upc
                props.onBarcodeScanned(codeString)
                // logging for testing
                console.log(`UPC to search: ${codeString}`)
            }
            catch (e: any) {
                // set the error and log for testing
                setError(e.message)
                console.log(`Error: ${e.message}`)
            }
        }
    }

    useEffect(() => {
        if (videoRef.current != null) {
            videoRef.current.srcObject = props.cameraStream
        }
    }, [props.cameraStream])

    return (
        <View style={styles.modalContainer}>
            <View style={[styles.modal, {
                        width: '80%',
                        maxHeight: '80%',
                        maxWidth: 500
                }]}>
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
                    Take a photo of a product's barcode to search.
                </Text>
                <View style={{
                    width: '80%', 
                    maxWidth: 500,
                    aspectRatio: 4/3,
                    alignSelf: 'center',
                    marginBottom: 20
                }}>
                    <video
                        style={{ 
                            width: '100%',
                            height: '100%',
                            display: capturedImage ? 'none' : 'flex',
                            objectFit: 'contain'
                        }}
                        autoPlay={true} 
                        playsInline={true} 
                        muted={true}
                        ref={videoRef}
                    />

                    {capturedImage && (
                        <Image
                            style={{
                                width: '100%', 
                                height: '100%',
                                alignSelf: 'center',
                                resizeMode: 'contain'
                            }}
                            source={{uri: capturedImage}}
                        />
                    )}
                    
                </View>

                {error && (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontSize: 14, color: '#b10000', margin: 10, textAlign: 'center'}}>
                            Barcode not detected. Please try again or 
                            <Pressable
                                onPress={props.onClose}
                            >
                                <Text style={[styles.textLink, {
                                    fontSize: 14,
                                    marginLeft: 5
                                }]}>use manual search.</Text>
                            </Pressable>
                        </Text>
                    </View>
                )}

                <Pressable
                    style={({pressed}) =>
                        [styles.captureButton,
                        {
                            backgroundColor: pressed ? '#25426e' : '#4175c4',
                            borderColor: pressed ? '#4175c4' : '#25426e',
                            alignSelf: 'center'
                        }]
                    }
                    onPress={capturedImage ? () => {
                        setCapturedImage(null)
                        setError(null)
                    } : onCaptureBarcodeImage}
                >
                    <Ionicons 
                        name={capturedImage ? 'camera-reverse-outline' : 'camera-outline'}
                        size={50}
                        style={{alignSelf: 'center'}}
                        color='white'
                    />
                </Pressable>
                
            </View>
        </View>
    )
}