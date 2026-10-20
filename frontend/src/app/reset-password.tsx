import { View, Text, TextInput, Pressable, Image } from "react-native";
import { styles } from "./styles";
import { useState } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";

// FastAPI url for fetch calls
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ResetPassword() {

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [securePass, setSecurePass] = useState(true)
    const [secureConfirmPass, setSecureConfirmPass] = useState(true)
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [passMatchError, setPassMatchError] = useState('')
    const [emptyPassword, setEmptyPassword] = useState(false)
    const [emptyPassError, setEmptyPassError] = useState('')
    const [emptyConfirmPass, setEmptyConfirmPass] = useState(false)
    const [emptyConfirmPassError, setEmptyConfirmPassError] = useState('')
    const [resetError, setResetError] = useState('')

    // read and set token with useLocalSearchParams
    const localSearchParams = useLocalSearchParams<{token?: string}>()
    const token = localSearchParams.token

    function onCancel() {
        router.replace('/login')
    }

    async function onResetPassword() {
        // reset useStates
        setPasswordsMatch(true)
        setPassMatchError('')
        setEmptyPassError('')
        setEmptyConfirmPassError('')
        setResetError('')
        // initialize error bool as false
        let hasError = false
        // if the token is empty/null, error
        if (!token) {
            setResetError('Reset link is invalid. Please request a new one.')
            hasError = true
        }
        // if passwords don't match, update error states
        if (password != confirmPassword) {
            setPasswordsMatch(false)
            hasError = true
            setPassMatchError('Passwords do not match.')
        }
        // if password is not empty, update state
        if (password != '') {
            setEmptyPassword(false)
        }
        // otherwise password is empty, set error states
        else {
            setEmptyPassword(true)
            hasError = true
            setEmptyPassError('Please enter a password.')
        }
        // if the confirm password textinput is not empty, update state
        if (confirmPassword != '') {
            setEmptyConfirmPass(false)
        }
        // otherwise confirm password is empty, set error states
        else {
            setEmptyConfirmPass(true)
            hasError = true
            setEmptyConfirmPassError('Please confirm your password.')
        }
        // if there are any errors, do not attempt to reset password
        if (hasError) {
            return
        }

        

        try {
            // attach token and password to request body
            const body = {
                'token': token,
                'password': password
            }

            // send request to /reset-password route
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                setResetError('Failed to reset password. Please request a new reset link.')
                return
            }
            else {
                router.replace('/login')
            }
        }
        catch (e: any) {
            setResetError(e.message)
        }
    }

    return (
         <View style={styles.authContainer}>
            <Image
                source={require('@/assets/images/logo.png')}
                style={{
                    width: 180, 
                    height: 180,
                    alignSelf: 'center',
                    resizeMode: 'contain'
                }}
            />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitleText}>Enter your new password twice to reset.</Text>
                <View style={{alignItems: 'flex-start', marginLeft: 30}}>
                <View style={{flexDirection: 'row'}}>
                    <TextInput 
                    style={styles.textinput}
                    onChangeText={setPassword}
                    value={password}
                    placeholder='Password'
                    placeholderTextColor={'grey'}
                    secureTextEntry={securePass}
                    />
                    <Pressable 
                        onPress={() => setSecurePass(!securePass)}
                        style={{alignSelf: 'center'}}
                    >
                        {/*change eye icon based on password visibility*/}
                        {securePass ? (
                            <Ionicons name="eye-off" size={30}/>
                        ) : (
                            <Ionicons name="eye" size={30}/>
                        )}

                    </Pressable> 
                </View>
                {emptyPassword ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {emptyPassError}
                    </Text>
                ) : !passwordsMatch ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {passMatchError}
                    </Text>
                ) : (
                    <View style={{height: 14}}/>
                )}
                <View style={{flexDirection: 'row'}}>
                    <TextInput 
                    style={styles.textinput}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    placeholder='Confirm password'
                    placeholderTextColor={'grey'}
                    secureTextEntry={secureConfirmPass}
                    />
                    <Pressable 
                        onPress={() => setSecureConfirmPass(!secureConfirmPass)}
                        style={{alignSelf: 'center'}}
                    >
                        {/*change eye icon based on password visibility*/}
                        {secureConfirmPass ? (
                            <Ionicons name="eye-off" size={30}/>
                        ) : (
                            <Ionicons name="eye" size={30}/>
                        )}

                    </Pressable> 
                </View>
                {emptyConfirmPass ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {emptyConfirmPassError}
                    </Text>
                ) : (resetError != '') ? (
                    <Text style={{fontSize: 12, color: '#b10000', marginLeft: 20}}>
                        {resetError}
                    </Text>
                ) : (
                    <View style={{height: 14}}/>
                )}
                <View style={{height: 14}}/>
                <View style={{flexDirection: 'row'}}>
                    <Pressable
                        onPress={onCancel}
                        style={({pressed}) =>
                            [styles.button,
                            {backgroundColor: pressed ? '#363a41' : '#69707c'}]
                        }
                    >
                        <Text style={styles.buttonText}>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={onResetPassword}
                        style={({pressed}) =>
                            [styles.button,
                            {backgroundColor: pressed ? '#25426e' : '#4175c4'}]
                        }
                    >
                        <Text style={styles.buttonText}>
                            Reset Password
                        </Text>
                    </Pressable>                    
                </View>                
            </View>
            <View>
                <Pressable
                    onPress={onCancel}
                >
                    <Text style={styles.buttonGuest}>
                        Go to Log In Screen
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}