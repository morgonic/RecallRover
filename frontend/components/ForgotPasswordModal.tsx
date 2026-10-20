// forgot password modal to display on login screen

import { styles } from "@/app/styles";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import validator from "validator";

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;


interface ForgotPasswordModalProps {
    setForgotPasswordModalVisible: (value: boolean) => void
    setForgotPasswordConfirmationModalVisible: (value: boolean) => void
}

export function ForgotPasswordModal(props: ForgotPasswordModalProps) {

    const [email, setEmail] = useState('')
    const [error, setError] = useState('')

    // function to call for Cancel button
    function onCancel() {
        setError('')
        props.setForgotPasswordModalVisible(false)
    }

    // function to call for Reset Password button
    async function onForgotPassword() {
        // clear error message
        setError('')

        // check for valid email format
        if (!validator.isEmail(email)) {
            // set error message if invalid format
            setError('Please enter a valid email address.')
            return
        }

        // call /forgot-password route using email from textinput
        try {
            const body = {'email': email.trim()}
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })

            // set error message for bad response
            if (!response.ok) {
                setError('Could not send reset link. Please try again.')
                return
            }
            else {
                // close this modal and open the confirmation modal
                props.setForgotPasswordModalVisible(false)
                props.setForgotPasswordConfirmationModalVisible(true)
            }
        }
        catch (e: any) {
            setError(e.message)
        }
    }

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

                {(error != '') && (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {error}
                    </Text>
                )}

                <View style={{flexDirection: 'row'}}>
                    <Pressable
                        onPress={onCancel}
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
                        onPress={onForgotPassword}
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