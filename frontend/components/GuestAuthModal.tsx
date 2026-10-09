import { Pressable, View, Text, } from 'react-native';
import { styles } from '../src/app/styles';
import { router } from 'expo-router';

interface GuestAuthModalProps {
    setGuestAuthModalVisible: (value: boolean) => void
}

export function GuestAuthModal(props: GuestAuthModalProps) {
    
    return (
        <View style={styles.modalContainer}>
            <View style={styles.modal}>
                <Text style={styles.title}>
                    Guest Access Denied
                </Text>
                <Text style={styles.subtitleText}>
                    Please log in to watch products and view your Watch List.
                </Text>
                <View style={{flexDirection: 'row'}}>
                    <Pressable
                        onPress={() => {
                            props.setGuestAuthModalVisible(false)
                        }}
                        style={({pressed}) =>
                            [styles.button,
                            {
                                backgroundColor: pressed ? '#363a41' : '#69707c',
                                alignSelf: 'center'
                            }]}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            props.setGuestAuthModalVisible(false)
                            router.replace('/login')
                        }}
                        style={({pressed}) =>
                            [styles.button,
                            {
                                backgroundColor: pressed ? '#25426e' : '#4175c4',
                                alignSelf: 'center'
                            }]}
                    >
                        <Text style={styles.buttonText}>Log In</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            props.setGuestAuthModalVisible(false)
                            router.replace('/create-account')
                        }}
                        style={({pressed}) =>
                            [styles.button,
                            {
                                backgroundColor: pressed ? '#25426e' : '#4175c4',
                                alignSelf: 'center'
                            }]}
                    >
                        <Text style={styles.buttonText}>Create Account</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}