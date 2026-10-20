import { Pressable, View, Text, } from 'react-native';
import { styles } from '../src/app/styles';

interface ForgotPasswordConfirmationProps {
    setForgotPasswordConfirmationModalVisible: (value: boolean) => void
}

export function ForgotPasswordConfirmationModal(props: ForgotPasswordConfirmationProps) {
    
    return (
        <View style={styles.modalContainer}>
            <View style={styles.modal}>
                <Text style={styles.title}>
                    Reset Password Confirmation
                </Text>
                <Text style={styles.subtitleText}>
                    If an account exists for the email you entered, a reset link has been sent.
                </Text>
                <Pressable
                    onPress={() => props.setForgotPasswordConfirmationModalVisible(false)}
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