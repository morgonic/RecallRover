import { Pressable, View, Text, TextInput, } from 'react-native';
import { useState } from 'react';
import { styles } from '../src/app/styles';
import { WatchedProductInput } from '../types/watched-products';

interface WatchedProductModalProps {
    onSaveWatchedProduct: (product: WatchedProductInput) => void
    setWatchedProductModalVisible: (value: boolean) => void
    disabled: boolean
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
    
    const saveDisabled = (props.disabled == true) || (
        (productName == '') &&
        (productBrand == '') &&
        (productModel == '') &&
        (productUPC == '')
    )

    return (
            <View style={styles.modalContainer}>
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
                            style={({pressed}) =>
                            [styles.button,
                            {backgroundColor: pressed ? '#25426e' : '#4175c4'}]}
                            onPress={() => props.setWatchedProductModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>
                                Cancel
                            </Text>
                        </Pressable>
                        <Pressable
                            style={({pressed}) =>
                            [styles.button,
                            {backgroundColor: saveDisabled ? '#bfc0c0' : pressed ? '#25426e' : '#4175c4'}]}
                            onPress={() => props.onSaveWatchedProduct({
                                product_name: productName,
                                product_brand: productBrand,
                                product_model: productModel,
                                product_upc: productUPC
                            })}
                            disabled={saveDisabled}
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