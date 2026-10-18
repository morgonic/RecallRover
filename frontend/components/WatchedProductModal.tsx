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

    const noRequiredFields = (
        (productName == '') &&
        (productBrand == '') &&
        (productModel == '')
    )
    
    const saveDisabled = (props.disabled == true) || noRequiredFields

    return (
            <View style={styles.modalContainer}>
                <View style={styles.modal}>
                    <Text style={styles.title}>
                        Enter product details
                    </Text>
                    {noRequiredFields && (
                        <Text style={[styles.smallSubtitleText, {
                            marginVertical: 0,
                            color: '#b10000'
                        }]}>
                            Enter at least one highlighted field.
                        </Text>
                    )}
                    <View style={{flexDirection: 'row'}}>
                        <TextInput
                            style={[styles.textinput, {
                                borderColor: noRequiredFields ? '#b10000' : 'black',
                                borderWidth: 2
                            }]}
                            onChangeText={setProductName}
                            value={productName}
                            placeholder='Product Name'
                            placeholderTextColor={'grey'}
                        />
                        <TextInput
                            style={[styles.textinput, {
                                width: 200,
                                borderColor: noRequiredFields ? '#b10000' : 'black',
                                borderWidth: 2
                            }]}
                            onChangeText={setProductBrand}
                            value={productBrand}
                            placeholder='Brand'
                            placeholderTextColor={'grey'}
                        />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput
                            style={[styles.textinput, {
                                borderColor: noRequiredFields ? '#b10000' : 'black',
                                borderWidth: 2
                            }]}
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