import { Pressable, View, Text, TextInput, } from 'react-native';
import { styles } from '../src/app/styles';

interface SaveConfirmationModalProps {
    setSaveConfirmationVisible: (value: boolean) => void
}

export function SaveConfirmationModal(props: SaveConfirmationModalProps) {
    
    return (
        <View style={styles.container}>
            <View style={styles.modal}>
                <Text style={styles.title}>
                    Product is being watched!
                </Text>
                <Text style={styles.subtitleText}>
                    You can view your watched products in the Watch List.
                </Text>
                <Pressable
                    onPress={() => props.setSaveConfirmationVisible(false)}
                    style={({pressed}) =>
                        [styles.button,
                        {
                            backgroundColor: pressed ? '#25426e' : '#4175c4',
                            alignSelf: 'center'
                        }]}
                >
                    <Text style={styles.buttonText}>OK</Text>
                </Pressable>
            </View>
        </View>
    )
}