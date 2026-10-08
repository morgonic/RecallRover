import { Pressable, View, Text, TextInput, } from 'react-native';
import { useState } from 'react';
import { styles } from '../src/app/styles';

interface WatchedProductModalProps {
    onSaveWatchedProduct: () => void
    setWatchedProductModalVisible: (value: boolean) => void
    productName: string
    productBrand: string
    productModel: string
    productUPC: string
}

export function WatchedProductModal(props: WatchedProductModalProps) {
    
    const [productName, setProductName] = useState(props.productName)
    const [productBrand, setProductBrand] = useState(props.productBrand)
    const [productModel, setProductModel] = useState(props.productModel)
    const [productUPC, setProductUPC] = useState(props.productUPC)

    return (
        <View style={styles.container}>
            <View style={styles.modal}>
                <Text style={styles.title}>
                    Enter product details
                </Text>
                <View style={{flexDirection: 'row'}}>
                    <TextInput
                        style={styles.textinput}
                        onChangeText={setProductName}
                        value={productName}
                        placeholder='Product Name'
                        placeholderTextColor={'grey'}
                    />
                    <TextInput
                        style={[styles.textinput, {
                            width: 200
                        }]}
                        onChangeText={setProductBrand}
                        value={productBrand}
                        placeholder='Brand'
                        placeholderTextColor={'grey'}
                    />
                </View>
                <View style={{flexDirection: 'row'}}>
                    <TextInput
                        style={styles.textinput}
                        onChangeText={setProductModel}
                        value={productModel}
                        placeholder='Model Number'
                        placeholderTextColor={'grey'}
                    />
                    <TextInput
                        style={[styles.textinput, {
                            width: 200
                        }]}
                        onChangeText={setProductUPC}
                        value={productUPC}
                        placeholder='Barcode Number'
                        placeholderTextColor={'grey'}
                    />
                </View>
                <View style={{flexDirection: 'row'}}>
                    <Pressable
                        style={styles.button}
                        onPress={() => props.setWatchedProductModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable
                        style={styles.button}
                        onPress={() => {}}
                    >
                        <Text style={styles.buttonText}>
                            Save
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}