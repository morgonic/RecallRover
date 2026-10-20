// forgot password modal to display on login screen

import { styles } from "@/app/styles";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";


interface ForgotPasswordModalProps {
    setForgotPasswordModalVisible: (value: boolean) => void
}


export function ForgotPasswordModal(props: ForgotPasswordModalProps) {

    const [email, setEmail] = useState('')

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modal}>
                <Text style={styles.title}>
                    Forgot Password
                </Text>
                <Text style={styles.subtitleText}>
                    Enter your email to reset your password.
                </Text>

                <TextInput
                    style={[styles.textinput, {width: '95%', alignSelf: 'center'}]}
                    onChangeText={setEmail}
                    value={email}
                    placeholder='Email Address'
                    placeholderTextColor={'grey'}
                />

                <View style={{flexDirection: 'row'}}>
                    <Pressable
                        onPress={() => {
                            props.setForgotPasswordModalVisible(false)
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
                            props.setForgotPasswordModalVisible(false)
                        }}
                        style={({pressed}) =>
                            [styles.button,
                            {
                                backgroundColor: pressed ? '#25426e' : '#4175c4',
                                alignSelf: 'center'
                            }]}
                    >
                        <Text style={styles.buttonText}>Reset Password</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}